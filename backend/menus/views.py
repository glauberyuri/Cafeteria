# menus/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import WeeklyMenu, MenuItem
from rest_framework import status
from django.db import transaction
from .serializers import WeeklyMenuSerializer, MenuItemBulkSerializer


class WeeklyMenuView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        menu = WeeklyMenu.objects.filter(active=True).first()
        if not menu:
            return Response(None)

        serializer = WeeklyMenuSerializer(menu)
        return Response(serializer.data)

    @transaction.atomic
    def post(self, request):
        # Desativa semanas anteriores
        WeeklyMenu.objects.filter(active=True).update(active=False)

        serializer = WeeklyMenuSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(active=True)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MenuItemBulkView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MenuItemBulkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"detail": "Itens salvos com sucesso."},
            status=status.HTTP_200_OK
        )

    def delete(self, request):
        weekly_menu_id = request.data.get("weekly_menu")

        if not weekly_menu_id:
            return Response(
                {"detail": "weekly_menu é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST
            )

        MenuItem.objects.filter(weekly_menu_id=weekly_menu_id).delete()

        return Response(
            {"detail": "Itens removidos com sucesso."},
            status=status.HTTP_200_OK
        )
