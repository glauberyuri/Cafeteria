from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path("api/", include("sectors.urls")),
    path("api/", include("diet_types.urls")),
    path("api/", include("collaborators.urls")),
    path("api/", include("menus.urls")),
    path("api/", include("meals.urls"))
]
