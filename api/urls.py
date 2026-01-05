from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EssentialOilViewSet, BlendViewSet, RegisterView, LoginView, NoteTypeViewSet, AromaFamilyViewSet, VibeViewSet, UserOilRelationViewSet, UserBlendFavoriteViewSet

router = DefaultRouter()
router.register(r'essential-oils', EssentialOilViewSet, basename='essential-oils')
router.register(r'blends', BlendViewSet, basename='blends')
router.register(r'notes', NoteTypeViewSet, basename='notes')
router.register(r'aromas', AromaFamilyViewSet, basename='aromas')
router.register(r'vibes', VibeViewSet, basename='vibes')
router.register(r'oil-relations', UserOilRelationViewSet, basename='oil-relations')
router.register(r'blend-favorites', UserBlendFavoriteViewSet, basename='blend-favorites')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
]
