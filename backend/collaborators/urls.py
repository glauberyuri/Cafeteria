from django.urls import path
from .views import (
    EmployeeListCreateView,
    EmployeeDetailView,
    DoctorListCreateView,
    DoctorDetailView,
    AcademicListCreateView,
    AcademicDetailView,
    EmployeeMealPreferenceView,
    AcademicAuthorizationApproveView,
    AcademicAuthorizationView,
    AcademicAuthorizationRejectView,
    AcademicAuthorizationApproveAllView,
    CollaboratorSearchView
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

    # Academic authorization
    path(
        "academic-authorizations/",
        AcademicAuthorizationView.as_view(),
        name="academic-authorization"
    ),
    path(
        "academic-authorizations/<int:pk>/approve/",
        AcademicAuthorizationApproveView.as_view(),
        name="academic-authorization-approve"
    ),
    path(
        "academic-authorizations/approve-all/",
        AcademicAuthorizationApproveAllView.as_view(),
        name="academic-authorization-approve-all"
    ),
    path(
        "academic-authorizations/<int:pk>/reject/",
        AcademicAuthorizationRejectView.as_view(),
        name="academic-authorization-reject"
    ),

    path(
        "employee-meal-preference/<str:registration>/",
        EmployeeMealPreferenceView.as_view()
    ),
    path(
        "employee-meal-preference/",
        EmployeeMealPreferenceView.as_view()
    ),
    path("collaborators/search/", CollaboratorSearchView.as_view()),

]
