from rest_framework import serializers
from .models import Academic, Doctor, Employee, EmployeeMealPreference


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(
        source="department.name",
        read_only=True
    )

    class Meta:
        model = Employee
        fields = [
            "id",
            "full_name",
            "email",
            "registration",
            "department",
            "department_name",
            "shift",
            "active",
            "created_at",
        ]


class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = [
            "id",
            "full_name",
            "email",
            "crm",
            "specialty",
            "active",
            "created_at",
        ]


class AcademicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Academic
        fields = [
            "id",
            "full_name",
            "email",
            "institution",
            "course",
            "active",
            "created_at",
        ]


class EmployeeMealPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeMealPreference
        fields = "__all__"
