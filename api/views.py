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
from .models import EssentialOil, Blend, NoteType, AromaFamily, Vibe, UserOilRelation, UserBlendFavorite
from django.db import models
from .serializers import EssentialOilSerializer, BlendSerializer, UserSerializer, UserOilRelationSerializer, UserBlendFavoriteSerializer
from .serializers import NoteTypeSerializer, AromaFamilySerializer, VibeSerializer, BlendSummarySerializer

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
    queryset = Blend.objects.all().select_related('created_by')
    serializer_class = BlendSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.is_authenticated:
            return qs.filter(models.Q(is_public=True) | models.Q(created_by=user)).distinct()
        return qs.filter(is_public=True)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='mine')
    def mine(self, request):
        """Return only blends created by the authenticated user.

        Frontend page /blends/my-blends consumes this endpoint.
        """
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=401)
        qs = Blend.objects.filter(created_by=request.user).order_by('-id')
        page = self.paginate_queryset(qs)
        if page is not None:
            ser = self.get_serializer(page, many=True)
            return self.get_paginated_response(ser.data)
        ser = self.get_serializer(qs, many=True)
        return Response(ser.data)

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """Return lightweight summaries for blends accessible to the current user.

        Supports same search filtering as the main list view (applies filter_backends).
        """
        blends = self.get_queryset().prefetch_related(
            'blendingredient_set__note',
            'blendingredient_set__oil__vibes',  # prefetch vibes for performance
            'favorited_by'
        ).select_related('created_by')
        page = self.paginate_queryset(blends)
        ctx = {'request': request}
        if page is not None:
            serializer = BlendSummarySerializer(page, many=True, context=ctx)
            return self.get_paginated_response(serializer.data)
        serializer = BlendSummarySerializer(blends, many=True, context=ctx)
        return Response(serializer.data)


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
        """Return oils the user marked as owned."""
        rels = self.get_queryset().filter(list_type='owned').select_related('oil')
        oils = [r.oil for r in rels]
        data = EssentialOilSerializer(oils, many=True).data
        return Response({"count": len(data), "oils": data})

class UserBlendFavoriteViewSet(viewsets.ModelViewSet):
    """Manage user's favorite (liked) blends.

    POST {"blend_id": <id>} to favorite a blend.
    DELETE /blend-favorites/by-blend/?blend_id=<id> to remove favorite.
    GET /blend-favorites/ returns serialized blends.
    GET /blend-favorites/summary/ returns only IDs.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserBlendFavoriteSerializer

    def get_queryset(self):
        return UserBlendFavorite.objects.filter(user=self.request.user).select_related('blend', 'blend__created_by')

    def list(self, request, *args, **kwargs):
        # Return list of Blend objects (full serializer) for convenience
        favs = self.get_queryset()
        blends = [f.blend for f in favs]
        ser = BlendSerializer(blends, many=True, context={'request': request})
        return Response(ser.data)

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        ids = list(self.get_queryset().values_list('blend_id', flat=True))
        return Response({'favorites': ids})

    @action(detail=False, methods=['delete'], url_path='by-blend')
    def delete_by_blend(self, request):
        blend_id = request.query_params.get('blend_id')
        if not blend_id:
            return Response({'detail': 'blend_id is required'}, status=400)
        fav = UserBlendFavorite.objects.filter(user=request.user, blend_id=blend_id).first()
        if not fav:
            return Response({'detail': 'Favorite not found'}, status=404)
        fav.delete()
        return Response(status=204)

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
        login_value = (request.data.get("login") or "").strip()
        password = request.data.get("password") or ""

        if not login_value or not password:
            return Response({"error": "login and password are required"}, status=HTTP_400_BAD_REQUEST)

        # Case-insensitive lookup by username, then email
        user = User.objects.filter(username__iexact=login_value).first() or User.objects.filter(email__iexact=login_value).first()

        if user and user.check_password(password):
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key}, status=HTTP_200_OK)

        # Avoid leaking which field failed
        return Response({"error": "Invalid credentials"}, status=HTTP_400_BAD_REQUEST)

