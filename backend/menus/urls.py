from django.urls import path
from .views import WeeklyMenuView, MenuItemBulkView

urlpatterns = [
    path("weekly-menu/", WeeklyMenuView.as_view()),
    path("weekly-menu-items/bulk/", MenuItemBulkView.as_view())
]
