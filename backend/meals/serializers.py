from rest_framework import serializers
from .models import MealRequest
from django.utils import timezone


class MealRequestSerializer(serializers.ModelSerializer):

    class Meta:
        model = MealRequest
        fields = '__all__'
        read_only_fields = ['status', 'created_at']

    def validate(self, data):
        today = timezone.now().date()

        if data['date'] != today:
            raise serializers.ValidationError(
                "Só é permitido pedir para o dia atual.")

        return data
