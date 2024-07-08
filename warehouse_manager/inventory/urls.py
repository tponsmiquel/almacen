from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArticleViewSet, EntryViewSet, ExitViewSet, ClientViewSet

router = DefaultRouter()
router.register(r'articles', ArticleViewSet)
router.register(r'entries', EntryViewSet)
router.register(r'exits', ExitViewSet)
router.register(r'clients', ClientViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('exits/create_multiple/', ExitViewSet.as_view({'post': 'create_multiple'}), name='create_multiple_exits'),
]
