from rest_framework import serializers
from .models import DietType


class DietTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietType
        fields = ['id', 'name', 'description', 'is_active']
