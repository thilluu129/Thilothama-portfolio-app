from rest_framework import serializers
from .models import HeroContent, Project, Skill, ContactMessage


class HeroContentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = HeroContent
        fields = [
            'id', 'name', 'tagline', 'description',
            'badge_text', 'is_available',
            'github_url', 'linkedin_url', 'email', 'resume_url',
        ]


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Project
        fields = [
            'id', 'title', 'description', 'long_description',
            'tech_stack', 'category', 'github_url', 'live_url',
            'image_url', 'featured', 'order', 'created_at',
        ]


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Skill
        fields = ['id', 'name', 'category', 'level', 'icon', 'order']


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at', 'is_read']
        read_only_fields = ['id', 'created_at']
