from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.authentication.urls')),
    path('api/v1/targets/', include('apps.vulnerable_service.urls')),
    path('api/v1/exercises/', include('apps.guided_exercises.urls')),
    path('api/v1/labs/', include('apps.guided_exercises.urls')),
    path('api/v1/oracle/', include('apps.oracle.urls')),
    path('api/v1/admin-console/', include('apps.admin_console.urls')),
    path('api/v1/ai/', include('apps.ai_assistant.urls')),
    path('api/v1/instructor/', include('apps.instructor_portal.urls')),
    path('api/v1/assessor/', include('apps.assessor_portal.urls')),
]
