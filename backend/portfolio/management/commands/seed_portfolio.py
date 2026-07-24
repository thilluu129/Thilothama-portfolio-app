from django.core.management.base import BaseCommand
from portfolio.models import HeroContent, Project, Skill


PROJECTS = [
    {
        "title": "Student Management System",
        "description": "Java application to manage student records using MySQL and JDBC.",
        "long_description": "A robust Student Management System built with Java and JDBC. It allows performing full CRUD operations on student records directly connected to a MySQL database.",
        "tech_stack": ["Java", "MySQL", "JDBC"],
        "category": "backend",
        "github_url": "https://github.com/thilluu129/student-management-system",
        "live_url": "https://student-sys.vthilothama.dev",
        "featured": True,
        "order": 1,
    },
    {
        "title": "Online Quiz System",
        "description": "Full Stack Online Quiz Application using Spring Boot, Thymeleaf and MySQL.",
        "long_description": "A comprehensive web-based quiz system where users can take timed quizzes. The backend is powered by Java Spring Boot and MySQL, while the frontend uses Thymeleaf templates and Bootstrap.",
        "tech_stack": ["Java", "Spring Boot", "Thymeleaf", "MySQL", "HTML/CSS"],
        "category": "fullstack",
        "github_url": "https://github.com/thilluu129/online-quiz-system",
        "live_url": "https://quiz-app.vthilothama.dev",
        "featured": True,
        "order": 2,
    },
    {
        "title": "Portfolio Website",
        "description": "Responsive personal portfolio website built using HTML and CSS, integrated with a Django REST API.",
        "long_description": "My personal portfolio featuring dynamic data loading. Skills and projects are fetched from a backend database, allowing seamless updates.",
        "tech_stack": ["HTML", "CSS", "JavaScript", "Django API"],
        "category": "frontend",
        "github_url": "https://github.com/thilluu129/Thilothama-porfolio-app",
        "live_url": "https://vthilothama.dev",
        "featured": False,
        "order": 3,
    },
    {
        "title": "E-Commerce Web Application",
        "description": "Full stack e-commerce platform built with Spring Boot, Angular, and Spring Security.",
        "long_description": "A secure online retail application featuring product searching, user authentication, JWT-based security, cart persistence, and stripe-like mock payment integration.",
        "tech_stack": ["Java", "Spring Boot", "Angular", "Spring Security", "MySQL", "Docker"],
        "category": "fullstack",
        "github_url": "https://github.com/thilluu129/spring-boot-ecommerce",
        "live_url": "https://ecommerce-demo.vthilothama.dev",
        "featured": True,
        "order": 4,
    },
    {
        "title": "Real-time Chat & Collaboration Tool",
        "description": "WebSocket-based live chat application utilizing Java Spring Boot WebSockets and JavaScript.",
        "long_description": "An interactive messaging platform supporting direct messaging, chat channels, online/offline status, typing indicators, and historical message logging.",
        "tech_stack": ["Java", "Spring Boot", "WebSockets", "JavaScript", "HTML5", "CSS3"],
        "category": "fullstack",
        "github_url": "https://github.com/thilluu129/springboot-websocket-chat",
        "live_url": "https://chat-demo.vthilothama.dev",
        "featured": False,
        "order": 5,
    },
    {
        "title": "RESTful Task Manager API",
        "description": "High-performance task management API built with Django REST Framework (DRF) and SQLite.",
        "long_description": "A backend API featuring user signup, token-based authentication, task assignments, categories, priority levels, and scheduled tasks using Celery and Redis.",
        "tech_stack": ["Python", "Django", "DRF", "SQLite", "Celery", "Redis"],
        "category": "backend",
        "github_url": "https://github.com/thilluu129/django-task-manager",
        "live_url": "https://task-api.vthilothama.dev/docs/",
        "featured": False,
        "order": 6,
    }
]

SKILLS = [
    {"name": "Java", "category": "language", "level": 90, "icon": "☕", "order": 1},
    {"name": "Python", "category": "language", "level": 85, "icon": "🐍", "order": 2},
    {"name": "JavaScript", "category": "language", "level": 85, "icon": "⚡", "order": 3},
    {"name": "HTML5", "category": "frontend", "level": 90, "icon": "🌐", "order": 4},
    {"name": "CSS3", "category": "frontend", "level": 85, "icon": "🎨", "order": 5},
    {"name": "Spring Boot", "category": "backend", "level": 85, "icon": "🍃", "order": 6},
    {"name": "Django", "category": "backend", "level": 80, "icon": "🦄", "order": 7},
    {"name": "MySQL", "category": "database", "level": 80, "icon": "🗄️", "order": 8},
    {"name": "PostgreSQL", "category": "database", "level": 75, "icon": "🐘", "order": 9},
    {"name": "Git & GitHub", "category": "tools", "level": 85, "icon": "🐙", "order": 10},
    {"name": "Docker", "category": "tools", "level": 70, "icon": "🐳", "order": 11},
]


class Command(BaseCommand):
    help = 'Seed the database with portfolio projects, skills, and hero content'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Clearing existing portfolio data...'))
        Project.objects.all().delete()
        Skill.objects.all().delete()

        # Hero content — create or update the singleton row
        self.stdout.write(self.style.MIGRATE_HEADING('Seeding hero content...'))
        HeroContent.objects.update_or_create(
            pk=1,
            defaults={
                'name': 'V THILOTHAMA',
                'tagline': 'Full-Stack Developer',
                'description': (
                    'A passionate Full-Stack Developer specializing in Python, Django, '
                    'Java, and modern web technologies. I build clean, powerful, and '
                    'aesthetically pleasing applications.'
                ),
                'badge_text': 'Available for Hire',
                'is_available': True,
                'github_url': 'https://github.com/thilluu129',
                'linkedin_url': '',
                'email': '',
                'resume_url': '',
            }
        )
        self.stdout.write('  - Hero content seeded')

        self.stdout.write(self.style.MIGRATE_HEADING('Seeding projects...'))
        for data in PROJECTS:
            Project.objects.create(**data)
            self.stdout.write(f"  - Created project: {data['title']}")

        self.stdout.write(self.style.MIGRATE_HEADING('Seeding skills...'))
        for data in SKILLS:
            Skill.objects.create(**data)
            self.stdout.write(f"  - Created skill: {data['name']}")

        self.stdout.write(self.style.SUCCESS(
            f'\nDone! Seeded hero content, {len(PROJECTS)} projects and {len(SKILLS)} skills.'
        ))
