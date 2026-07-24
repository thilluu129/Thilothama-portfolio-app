from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HeroContentView,
    ProjectViewSet,
    SkillViewSet,
    ContactMessageCreateView,
    ContactMessageListView,
    ContactMessageDeleteView,
)

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'skills',   SkillViewSet,   basename='skill')

urlpatterns = [
    path('', include(router.urls)),

    # Hero content (singleton — GET public, PUT/PATCH admin)
    path('hero/', HeroContentView.as_view(), name='hero'),

    # Contact: public submit, admin list + delete
    path('contact/',           ContactMessageCreateView.as_view(), name='contact'),
    path('messages/',          ContactMessageListView.as_view(),   name='messages-list'),
    path('messages/<int:pk>/', ContactMessageDeleteView.as_view(), name='message-delete'),
]
