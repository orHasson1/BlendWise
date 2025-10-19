from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EssentialOilViewSet, BlendViewSet, RegisterView, LoginView, NoteTypeViewSet, AromaFamilyViewSet, VibeViewSet, UserOilRelationViewSet

router = DefaultRouter()
router.register(r'oils', EssentialOilViewSet, basename='oils')
router.register(r'blends', BlendViewSet, basename='blends')
router.register(r'notes', NoteTypeViewSet, basename='notes')
router.register(r'aromas', AromaFamilyViewSet, basename='aromas')
router.register(r'vibes', VibeViewSet, basename='vibes')
router.register(r'oil-relations', UserOilRelationViewSet, basename='oil-relations')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
]
