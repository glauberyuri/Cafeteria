from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import MealRequest, MealRequestSettings
from .serializers import MealRequestSerializer, MealRequestSettingsSerializer


class MealRequestListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):

        identifier = request.query_params.get("identifier")
        today = timezone.now().date()

        queryset = MealRequest.objects.filter(date=today)

        if identifier:
            queryset = queryset.filter(identifier__icontains=identifier)

        serializer = MealRequestSerializer(queryset, many=True)

        return Response(serializer.data)


class MealRequestViewSet(viewsets.ModelViewSet):

    queryset = MealRequest.objects.all().order_by('-created_at')
    serializer_class = MealRequestSerializer

    def create(self, request, *args, **kwargs):

        settings = MealRequestSettings.objects.first()

        if not settings:
            return Response(
                {"detail": "Configuração do sistema não encontrada."},
                status=500
            )

        now = timezone.localtime().time()
        meal_type = request.data.get("meal_type")

        if meal_type == "LUNCH":
            if not (settings.lunch_start <= now <= settings.lunch_end):
                return Response(
                    {
                        "detail": f"Almoço pode ser solicitado entre "
                        f"{settings.lunch_start.strftime('%H:%M')} "
                        f"e {settings.lunch_end.strftime('%H:%M')}."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        if meal_type == "DINNER":
            if not (settings.dinner_start <= now <= settings.dinner_end):
                return Response(
                    {
                        "detail": f"Jantar pode ser solicitado entre "
                        f"{settings.dinner_start.strftime('%H:%M')} "
                        f"e {settings.dinner_end.strftime('%H:%M')}."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):

        instance = self.get_object()

        if instance.status in ['DELIVERED', 'CANCELLED']:
            return Response(
                {"detail": "Pedido não pode ser cancelado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        instance.status = 'CANCELLED'
        instance.save()

        return Response({"detail": "Pedido cancelado com sucesso."})


class MealRequestsSettingsView(APIView):

    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_object(self):
        obj, created = MealRequestSettings.objects.get_or_create(
            id=1,
            defaults={
                "employee_price": 15.00,
                "lunch_start": "06:00",
                "lunch_end": "09:00",
                "dinner_start": "15:00",
                "dinner_end": "18:00",
            }
        )
        return obj

    def get(self, request):
        instance = self.get_object()
        serializer = MealRequestSettingsSerializer(instance)
        return Response(serializer.data)

    def put(self, request):
        instance = self.get_object()
        serializer = MealRequestSettingsSerializer(
            instance,
            data=request.data
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request):
        instance = self.get_object()
        serializer = MealRequestSettingsSerializer(
            instance,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
