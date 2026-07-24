from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def root_api_index(request):
    return JsonResponse({
        'status': 'online',
        'app': 'V THILOTHAMA Portfolio API',
        'api_root': '/api/',
        'endpoints': {
            'hero': '/api/hero/',
            'projects': '/api/projects/',
            'skills': '/api/skills/',
            'contact': '/api/contact/',
            'messages': '/api/messages/',
        }
    })


urlpatterns = [
    path('', root_api_index, name='root-index'),
    path('admin/', admin.site.urls),
    path('api/', include('portfolio.urls')),
]
