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

    def validate(self, data):
        automation_type = data.get("automation_type")
        start_date = data.get("start_date")

        if automation_type == "ALTERNATE" and not start_date:
            raise serializers.ValidationError({
                "start_date": "Obrigatório para plantonista (dia sim / dia não)."
            })

        if automation_type == "WEEKDAYS":
            # garante que não bloqueia
            data["start_date"] = None

        return data
