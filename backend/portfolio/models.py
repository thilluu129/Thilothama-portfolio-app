from django.db import models


class HeroContent(models.Model):
    """Singleton — edit via admin dashboard. Only row with pk=1 is used."""
    name        = models.CharField(max_length=100, default='V THILOTHAMA')
    tagline     = models.CharField(max_length=200, default='Full-Stack Developer')
    description = models.TextField(
        default='A passionate Full-Stack Developer specializing in Python, Django, Java, '
                'and modern web technologies. I build clean, powerful, and aesthetically '
                'pleasing applications.'
    )
    badge_text   = models.CharField(max_length=100, default='Available for Hire')
    is_available = models.BooleanField(default=True)
    github_url   = models.URLField(blank=True, default='https://github.com/thilluu129')
    linkedin_url = models.URLField(blank=True, default='')
    email        = models.EmailField(blank=True, default='')
    resume_url   = models.URLField(blank=True, default='')

    class Meta:
        verbose_name        = 'Hero Content'
        verbose_name_plural = 'Hero Content'

    def __str__(self):
        return f'Hero: {self.name}'


class Project(models.Model):
    CATEGORY_CHOICES = [
        ('fullstack', 'Full-Stack'),
        ('frontend', 'Frontend'),
        ('backend', 'Backend'),
        ('data', 'Data / ML'),
        ('game', 'Game / Fun'),
    ]

    title            = models.CharField(max_length=200)
    description      = models.TextField()
    long_description = models.TextField(blank=True, default='')
    tech_stack       = models.JSONField(default=list)
    category         = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='fullstack')
    github_url       = models.URLField(blank=True, default='')
    live_url         = models.URLField(blank=True, default='')
    image_url        = models.URLField(blank=True, default='')
    featured         = models.BooleanField(default=False)
    order            = models.PositiveIntegerField(default=0)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title


class Skill(models.Model):
    CATEGORY_CHOICES = [
        ('language', 'Programming Languages'),
        ('frontend', 'Frontend'),
        ('backend', 'Backend'),
        ('database', 'Database'),
        ('tools', 'Tools & DevOps'),
    ]

    name     = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='backend')
    level    = models.PositiveIntegerField(default=75)
    icon     = models.CharField(max_length=10, blank=True, default='')
    order    = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['category', 'order']

    def __str__(self):
        return f"{self.name} ({self.category})"


class ContactMessage(models.Model):
    name       = models.CharField(max_length=150)
    email      = models.EmailField()
    subject    = models.CharField(max_length=200, blank=True, default='')
    message    = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read    = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Message from {self.name} <{self.email}>"
