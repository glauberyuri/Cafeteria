from rest_framework.routers import DefaultRouter
from .views import MealRequestViewSet

router = DefaultRouter()
router.register(r'meal-requests', MealRequestViewSet)

urlpatterns = router.urls
