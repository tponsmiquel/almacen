from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from django.contrib import admin
from inventory.views import authorize_exit

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('inventory.urls')),
    path('api/exits/authorize/<int:pk>/', authorize_exit, name='authorize-exit'),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
