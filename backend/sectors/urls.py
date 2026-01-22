from django.urls import path
from .views import SectorListCreateView, SectorDetailView

urlpatterns = [
    path("sectors/", SectorListCreateView.as_view(), name="sector-list-create"),
    path("sectors/<int:pk>/", SectorDetailView.as_view(), name="sector-detail"),
]
