from django.urls import path
from .views import DietTypeListCreateView, DietTypeDetailView

urlpatterns = [
    path('diet_type/', DietTypeListCreateView.as_view(), name="diet-create-list"),
    path('diet_type/<int:pk>/', DietTypeDetailView.as_view(), name="diet-detail")
]
