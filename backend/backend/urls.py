from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("monitoring.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    data_dir = settings.BASE_DIR.parent / "data"
    if data_dir.exists():
        urlpatterns += static("/data/", document_root=data_dir)
