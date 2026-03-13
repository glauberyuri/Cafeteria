from rest_framework import serializers
from .models import Academic, Doctor, Employee, EmployeeMealPreference, AcademicAuthorization


class CollaboratorSerializer(serializers.Serializer):

    id = serializers.IntegerField()
    type = serializers.CharField()
    full_name = serializers.CharField()
    identifier = serializers.CharField()
    sector = serializers.CharField()
    shift = serializers.CharField(required=False)
    active = serializers.BooleanField()


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
            data["start_date"] = None

        return data


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
            "identifier",
            "full_name",
            "email",
            "institution",

            "category",
            "active",
            "created_at",
        ]


class AcademicAuthorizationSerializer(serializers.ModelSerializer):
    academic_name = serializers.CharField(
        source="academic.full_name", read_only=True
    )
    sector_name = serializers.CharField(
        source="sector.name", read_only=True
    )
    identifier = serializers.CharField(
        source="academic.identifier", read_only=True
    )

    class Meta:
        model = AcademicAuthorization
        fields = "__all__"
        read_only_fields = (
            "approved",
            "approved_at",
            "approved_by",
            "start_date",
            "end_date",
        )
