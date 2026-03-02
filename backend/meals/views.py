from .models import MealSettings
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import MealRequest
from .serializers import MealRequestSerializer


class MealRequestViewSet(viewsets.ModelViewSet):

    queryset = MealRequest.objects.all().order_by('-created_at')
    serializer_class = MealRequestSerializer

    def create(self, request, *args, **kwargs):

        settings = MealSettings.objects.first()

        now = timezone.localtime().time()
        meal_type = request.data.get("meal_type")

        if meal_type == "LUNCH" and now >= settings.lunch_deadline:
            return Response(
                {"detail": "Prazo para almoço encerrado."},
                status=400
            )

        if meal_type == "DINNER" and now >= settings.dinner_deadline:
            return Response(
                {"detail": "Prazo para jantar encerrado."},
                status=400
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
