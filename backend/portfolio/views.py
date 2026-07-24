from rest_framework import viewsets, generics, filters
from rest_framework.response import Response
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend
from .models import HeroContent, Project, Skill, ContactMessage
from .serializers import HeroContentSerializer, ProjectSerializer, SkillSerializer, ContactMessageSerializer
from .permissions import IsAdminOrReadOnly, IsAdminUser


# ── Hero Content (singleton) ──────────────────────────────────────────────────
class HeroContentView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/hero/ — public read (used by the portfolio homepage)
    PUT  /api/hero/ — admin update (requires X-Admin-Password header)
    PATCH /api/hero/ — admin partial update
    """
    serializer_class   = HeroContentSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_object(self):
        obj, _ = HeroContent.objects.get_or_create(pk=1)
        return obj


# ── Projects ──────────────────────────────────────────────────────────────────
class ProjectViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for portfolio projects.
    GET is public; POST/PUT/PATCH/DELETE require X-Admin-Password.
    Supports filtering: ?category=fullstack  ?featured=true
    """
    queryset           = Project.objects.all()
    serializer_class   = ProjectSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['category', 'featured']
    search_fields      = ['title', 'description', 'tech_stack']
    ordering_fields    = ['order', 'created_at']


# ── Skills ────────────────────────────────────────────────────────────────────
class SkillViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for skills.
    GET is public; write operations require X-Admin-Password.
    """
    queryset           = Skill.objects.all()
    serializer_class   = SkillSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends    = [DjangoFilterBackend]
    filterset_fields   = ['category']


# ── Contact Messages ──────────────────────────────────────────────────────────
class ContactMessageCreateView(generics.CreateAPIView):
    """
    POST /api/contact/ — public: submit a contact message.
    """
    queryset         = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'success': True, 'message': 'Your message has been received! I will get back to you soon.'},
                status=status.HTTP_201_CREATED
            )
        return Response(
            {'success': False, 'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


class ContactMessageListView(generics.ListAPIView):
    """
    GET /api/messages/ — admin only: list all received contact messages.
    Requires X-Admin-Password header.
    """
    queryset           = ContactMessage.objects.all()
    serializer_class   = ContactMessageSerializer
    permission_classes = [IsAdminUser]


class ContactMessageDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/messages/<pk>/ — admin only: delete a contact message.
    Requires X-Admin-Password header.
    """
    queryset           = ContactMessage.objects.all()
    serializer_class   = ContactMessageSerializer
    permission_classes = [IsAdminUser]
