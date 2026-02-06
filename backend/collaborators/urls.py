from django.urls import path
from .views import (
    EmployeeListCreateView,
    EmployeeDetailView,
    DoctorListCreateView,
    DoctorDetailView,
    AcademicListCreateView,
    AcademicDetailView,
    EmployeeMealPreferenceView,
)

urlpatterns = [
    # Employees
    path("employees/", EmployeeListCreateView.as_view()),
    path("employees/<int:pk>/", EmployeeDetailView.as_view()),

    # Doctors
    path("doctors/", DoctorListCreateView.as_view()),
    path("doctors/<int:pk>/", DoctorDetailView.as_view()),

    # Academics
    path("academics/", AcademicListCreateView.as_view()),
    path("academics/<int:pk>/", AcademicDetailView.as_view()),

    path(
        "employee-meal-preference/<str:registration>/",
        EmployeeMealPreferenceView.as_view()
    ),
    path(
        "employee-meal-preference/",
        EmployeeMealPreferenceView.as_view()
    ),
]
