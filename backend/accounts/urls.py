from django.urls import path
from .views import Register, Login
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', Register),
    path('login/', Login),
    path('token/refresh/', TokenRefreshView.as_view()),
]
