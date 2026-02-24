from rest_framework import serializers
from .models import WeeklyMenu, MenuItem


class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = "__all__"


class WeeklyMenuSerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = WeeklyMenu
        fields = "__all__"


class MenuItemBulkSerializer(serializers.Serializer):
    weekly_menu = serializers.PrimaryKeyRelatedField(
        queryset=WeeklyMenu.objects.all()
    )
    items = MenuItemSerializer(many=True)

    def create(self, validated_data):
        weekly_menu = validated_data["weekly_menu"]
        items = validated_data["items"]

        for item in items:
            MenuItem.objects.update_or_create(
                weekly_menu=weekly_menu,
                weekday=item["weekday"],
                meal_type=item["meal_type"],
                defaults={
                    "main": item["main"],
                    "side": item.get("side", ""),
                    "dessert": item.get("dessert", ""),
                }
            )

        return items
