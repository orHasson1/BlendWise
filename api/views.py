from django.shortcuts import render
from rest_framework import viewsets, permissions, generics, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, get_user_model
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_200_OK, HTTP_201_CREATED
from .permissions import IsOwnerOrReadOnly, IsAdminOrReadOnly
from .models import EssentialOil, Blend, NoteType, AromaFamily, Vibe, UserOilRelation
from django.db import models
from .serializers import EssentialOilSerializer, BlendSerializer, UserSerializer, UserOilRelationSerializer
from .serializers import NoteTypeSerializer, AromaFamilySerializer, VibeSerializer

# --- Oils ---
class EssentialOilViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EssentialOil.objects.all()
    serializer_class = EssentialOilSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "notes__name", "aromas__name", "vibes__name"]
    permission_classes = [IsAdminOrReadOnly]


class NoteTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only endpoint for NoteType (used by the frontend filter UI)."""
    queryset = NoteType.objects.all()
    serializer_class = NoteTypeSerializer
    permission_classes = [IsAdminOrReadOnly]


class AromaFamilyViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only endpoint for AromaFamily (used by the frontend filter UI)."""
    queryset = AromaFamily.objects.all()
    serializer_class = AromaFamilySerializer
    permission_classes = [IsAdminOrReadOnly]


class VibeViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only endpoint for Vibe (used by the frontend filter UI)."""
    queryset = Vibe.objects.all()
    serializer_class = VibeSerializer
    permission_classes = [IsAdminOrReadOnly]

# --- Blends ---
class BlendViewSet(viewsets.ModelViewSet):
    serializer_class = BlendSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "description", "oils__name"]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            # Show all public blends and all blends owned by the user
            return Blend.objects.filter(models.Q(is_public=True) | models.Q(created_by=user)).distinct()
        else:
            # Only public blends for anonymous users
            return Blend.objects.filter(is_public=True)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class UserOilRelationViewSet(viewsets.ModelViewSet):
    """CRUD for user's wishlist / owned oils.

    POST with {"oil_id": <id>, "list_type": "wishlist"|"owned"}
    To move between lists, client can PATCH list_type.
    """
    serializer_class = UserOilRelationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserOilRelation.objects.filter(user=self.request.user).select_related("oil")

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        qs = self.get_queryset()
        wishlist_ids = list(qs.filter(list_type='wishlist').values_list('oil_id', flat=True))
        owned_ids = list(qs.filter(list_type='owned').values_list('oil_id', flat=True))
        return Response({"wishlist": wishlist_ids, "owned": owned_ids})

    @action(detail=False, methods=['delete'], url_path='by-oil')
    def delete_by_oil(self, request):
        oil_id = request.query_params.get('oil_id')
        list_type = request.query_params.get('list_type')
        if not oil_id or not list_type:
            return Response({"detail": "oil_id and list_type are required"}, status=400)
        rel = UserOilRelation.objects.filter(user=request.user, oil_id=oil_id, list_type=list_type).first()
        if not rel:
            return Response({"detail": "Relation not found"}, status=404)
        rel.delete()
        return Response(status=204)

    @action(detail=False, methods=['get'], url_path='wishlist')
    def wishlist(self, request):
        rels = self.get_queryset().filter(list_type='wishlist').select_related('oil')
        oils = [r.oil for r in rels]
        data = EssentialOilSerializer(oils, many=True).data
        return Response({"count": len(data), "oils": data})

    @action(detail=False, methods=['get'], url_path='owned')
    def owned(self, request):
        rels = self.get_queryset().filter(list_type='owned').select_related('oil')
        oils = [r.oil for r in rels]
        data = EssentialOilSerializer(oils, many=True).data
        return Response({"count": len(data), "oils": data})

User = get_user_model()

# --- User Registration ---
class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer  
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "message": "User created successfully"}, status=HTTP_201_CREATED)
    
# --- Login (token-based) ---
class LoginView(APIView):
    serializer_class = UserSerializer  
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        login_value = request.data.get("login")  # username or email
        password = request.data.get("password")

        # Try to find user by username first, then by email
        user = User.objects.filter(username=login_value).first() or User.objects.filter(email=login_value).first()

        if user and user.check_password(password):
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key}, status=HTTP_200_OK)

        return Response({"error": "Invalid credentials"}, status=HTTP_400_BAD_REQUEST)

