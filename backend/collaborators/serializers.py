# collaborators/serializers/employee.py
from rest_framework import serializers
from collaborators.models.employee import Employee


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(
        source="department.name",
        read_only=True
    )

    class Meta:
        model = Employee
        fields = "__all__"
