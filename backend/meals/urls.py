from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import MealRequestViewSet, MealRequestsSettingsView, MealRequestListView

router = DefaultRouter()
router.register(r'meal-requests', MealRequestViewSet)
urlpatterns = [
    path("meal-settings/", MealRequestsSettingsView.as_view()),
    path("meal-requests/list", MealRequestListView.as_view())
] + router.urls
