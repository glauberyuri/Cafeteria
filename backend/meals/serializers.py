from rest_framework import serializers
from .models import MealRequest, MealRequestSettings
from django.utils import timezone


from rest_framework import serializers
from django.utils import timezone
from .models import MealRequest, MealRequestSettings


class MealRequestSerializer(serializers.ModelSerializer):

    class Meta:
        model = MealRequest
        fields = "__all__"
        read_only_fields = ("price", "date", "status", "meal_type")

    def create(self, validated_data):

        settings = MealRequestSettings.objects.first()

        if not settings:
            raise serializers.ValidationError(
                "Configuração de refeições não encontrada."
            )

        collaborator_type = validated_data["collaborator_type"]

        # definir preço
        if collaborator_type == "employee":
            price = settings.employee_price
        else:
            price = 0

        validated_data["price"] = price

        # definir data
        validated_data["date"] = timezone.now().date()

        # detectar tipo de refeição automaticamente
        now = timezone.localtime().time()

        if settings.lunch_start <= now <= settings.lunch_end:
            meal_type = "LUNCH"

        elif settings.dinner_start <= now <= settings.dinner_end:
            meal_type = "DINNER"

        else:
            raise serializers.ValidationError({
                "detail": "Fora do horário de solicitação."
            })

        validated_data["meal_type"] = meal_type

        return super().create(validated_data)


class MealRequestSettingsSerializer(serializers.ModelSerializer):

    class Meta:
        model = MealRequestSettings
        fields = "__all__"

    def validate(self, data):

        if data["lunch_start"] >= data["lunch_end"]:
            raise serializers.ValidationError(
                "Horário do almoço inválido."
            )

        if data["dinner_start"] >= data["dinner_end"]:
            raise serializers.ValidationError(
                "Horário do jantar inválido."
            )

        if data["employee_price"] < 0:
            raise serializers.ValidationError(
                "Preço inválido."
            )

        return data
