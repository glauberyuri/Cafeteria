from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.db.models import Count, Q, Sum
from datetime import datetime
from django.utils import timezone
import csv

from .models import MealRequest, MealRequestSettings
from collaborators.models import AcademicAuthorization
from .serializers import MealRequestSerializer, MealRequestSettingsSerializer


class MealRequestListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        identifier = request.query_params.get("identifier")
        date = request.query_params.get("date")

        queryset = MealRequest.objects.select_related("sector").all()

        if date:
            queryset = queryset.filter(date=date)

        if identifier:
            queryset = queryset.filter(identifier__icontains=identifier)

        serializer = MealRequestSerializer(queryset, many=True)
        return Response(serializer.data)


class MealRequestViewSet(viewsets.ModelViewSet):
    queryset = MealRequest.objects.select_related(
        "sector").all().order_by("-created_at")
    serializer_class = MealRequestSerializer

    def create(self, request, *args, **kwargs):
        settings = MealRequestSettings.objects.first()

        if not settings:
            return Response(
                {"detail": "Configuração do sistema não encontrada."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        now = timezone.localtime().time()
        today = timezone.localtime().date()

        meal_type = request.data.get("meal_type")
        collaborator_type = request.data.get("collaborator_type")
        identifier = request.data.get("identifier")

        if meal_type == "LUNCH":
            if not (settings.lunch_start <= now <= settings.lunch_end):
                return Response(
                    {
                        "detail": (
                            f"Almoço pode ser solicitado entre "
                            f"{settings.lunch_start.strftime('%H:%M')} "
                            f"e {settings.lunch_end.strftime('%H:%M')}."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        if meal_type == "DINNER":
            if not (settings.dinner_start <= now <= settings.dinner_end):
                return Response(
                    {
                        "detail": (
                            f"Jantar pode ser solicitado entre "
                            f"{settings.dinner_start.strftime('%H:%M')} "
                            f"e {settings.dinner_end.strftime('%H:%M')}."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        if collaborator_type == "student":
            authorized = AcademicAuthorization.objects.filter(
                academic__identifier=identifier,
                approved=True,
                start_date__lte=today,
                end_date__gte=today
            ).exists()

            if not authorized:
                return Response(
                    {"detail": "Acadêmico não autorizado para refeição. Procure a nutrição."},
                    status=status.HTTP_403_FORBIDDEN
                )

        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=["patch"])
    def cancel(self, request, pk=None):
        instance = self.get_object()

        if instance.status in ["DELIVERED", "CANCELLED"]:
            return Response(
                {"detail": "Pedido não pode ser cancelado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        instance.status = "CANCELLED"
        instance.save()

        return Response({"detail": "Pedido cancelado com sucesso."})

    @action(detail=True, methods=["post"])
    def deliver(self, request, pk=None):
        meal = self.get_object()
        meal.status = "DELIVERED"
        meal.save()

        return Response({"detail": "Refeição entregue"})

    @action(detail=False, methods=["post"])
    def deliver_all(self, request):
        today = timezone.localtime().date()

        updated = MealRequest.objects.filter(
            status="PENDING",
            date=today
        ).update(status="DELIVERED")

        return Response({
            "updated": updated,
            "detail": f"{updated} refeições entregues"
        })

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def today(self, request):
        today = timezone.localtime().date()
        qs = MealRequest.objects.select_related("sector").filter(date=today)
        serializer = MealRequestSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def diet_stats(self, request):
        today = timezone.localtime().date()

        qs = (
            MealRequest.objects
            .filter(date=today)
            .values("diet_type")
            .annotate(total=Count("id"))
            .order_by("-total")
        )

        total = sum(item["total"] for item in qs) or 1

        return Response([
            {
                "name": item["diet_type"],
                "value": item["total"],
                "percentage": round((item["total"] / total) * 100, 1)
            }
            for item in qs
        ])

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def sector_stats(self, request):
        today = timezone.localtime().date()

        qs = (
            MealRequest.objects
            .filter(date=today)
            .values("sector__name")
            .annotate(
                pending=Count("id", filter=Q(status="PENDING")),
                delivered=Count("id", filter=Q(status="DELIVERED")),
                cancelled=Count("id", filter=Q(status="CANCELLED")),
                total=Count("id"),
            )
            .order_by("-total")
        )

        total_all = sum(item["total"] for item in qs) or 1

        return Response([
            {
                "sector": item["sector__name"] or "-",
                "pending": item["pending"],
                "delivered": item["delivered"],
                "cancelled": item["cancelled"],
                "total": item["total"],
                "percentage": round((item["total"] / total_all) * 100, 1)
            }
            for item in qs
        ])

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def daily_report(self, request):
        month = request.query_params.get("month")

        if not month:
            return Response({"detail": "month é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            month_date = datetime.strptime(month, "%Y-%m")
        except ValueError:
            return Response({"detail": "Formato inválido. Use YYYY-MM"}, status=status.HTTP_400_BAD_REQUEST)

        qs = (
            MealRequest.objects
            .filter(
                date__year=month_date.year,
                date__month=month_date.month,
                status="DELIVERED"
            )
            .values("date")
            .annotate(
                almoco=Count("id", filter=Q(meal_type="LUNCH")),
                jantar=Count("id", filter=Q(meal_type="DINNER")),
                total=Count("id")
            )
            .order_by("date")
        )

        day_names = {
            "Monday": "Segunda-feira",
            "Tuesday": "Terça-feira",
            "Wednesday": "Quarta-feira",
            "Thursday": "Quinta-feira",
            "Friday": "Sexta-feira",
            "Saturday": "Sábado",
            "Sunday": "Domingo",
        }

        data = []
        for item in qs:
            english_day = item["date"].strftime("%A")
            data.append({
                "date": item["date"].strftime("%d/%m"),
                "fullDate": item["date"],
                "dayName": day_names.get(english_day, english_day),
                "almoco": item["almoco"],
                "jantar": item["jantar"],
                "total": item["total"],
            })

        return Response(data)

    @action(detail=False, methods=["get"])
    def monthly_report(self, request):
        month = request.query_params.get("month")
        search = request.query_params.get("search", "").strip()
        collaborator_type = request.query_params.get(
            "collaborator_type", "").strip()

        queryset = MealRequest.objects.select_related("sector").all()

        if month:
            try:
                year, month_number = map(int, month.split("-"))
                queryset = queryset.filter(
                    date__year=year, date__month=month_number)
            except ValueError:
                return Response(
                    {"detail": "Parâmetro month inválido. Use YYYY-MM."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if search:
            queryset = queryset.filter(
                Q(collaborator_name__icontains=search) |
                Q(identifier__icontains=search)
            )

        if collaborator_type:
            queryset = queryset.filter(collaborator_type=collaborator_type)

        report = (
            queryset.values(
                "collaborator_name",
                "collaborator_type",
                "identifier",
                "sector__name",
            )
            .annotate(
                lunches=Count("id", filter=Q(meal_type="LUNCH")),
                dinners=Count("id", filter=Q(meal_type="DINNER")),
                total=Count("id"),
                amount=Sum("price"),
            )
            .order_by("collaborator_name")
        )

        formatted_report = [
            {
                "name": item["collaborator_name"],
                "type": item["collaborator_type"],
                "identifier": item["identifier"],
                "sector_name": item["sector__name"],
                "lunches": item["lunches"],
                "dinners": item["dinners"],
                "total": item["total"],
                "amount": item["amount"],
            }
            for item in report
        ]

        return Response(formatted_report)

    @action(detail=False, methods=["get"])
    def monthly_details(self, request):
        month = request.query_params.get("month")
        search = request.query_params.get("search", "").strip()

        queryset = MealRequest.objects.select_related("sector").all()

        if month:
            try:
                year, month_number = map(int, month.split("-"))
                queryset = queryset.filter(
                    date__year=year, date__month=month_number)
            except ValueError:
                return Response(
                    {"detail": "Parâmetro month inválido. Use YYYY-MM."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if search:
            queryset = queryset.filter(
                Q(collaborator_name__icontains=search) |
                Q(identifier__icontains=search)
            )

        report = (
            queryset.values(
                "collaborator_name",
                "identifier",
                "sector__name",
                "meal_type",
                "diet_type",
            )
            .annotate(
                total_meals=Count("id"),
                total_amount=Sum("price")
            )
            .order_by("collaborator_name", "meal_type", "diet_type")
        )

        formatted_report = [
            {
                "collaborator_name": item["collaborator_name"],
                "identifier": item["identifier"],
                "sector_name": item["sector__name"],
                "meal_type": item["meal_type"],
                "meal_type_label": "Almoço" if item["meal_type"] == "LUNCH" else "Jantar",
                "diet_type": item["diet_type"],
                "total_meals": item["total_meals"],
                "total_amount": item["total_amount"],
            }
            for item in report
        ]

        return Response(formatted_report)

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def monthly_csv(self, request):
        month = request.query_params.get("month")
        search = request.query_params.get("search", "").strip()

        queryset = MealRequest.objects.select_related("sector").all()

        if month:
            try:
                year, month_number = map(int, month.split("-"))
                queryset = queryset.filter(
                    date__year=year, date__month=month_number)
            except ValueError:
                return Response(
                    {"detail": "Parâmetro month inválido. Use YYYY-MM."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if search:
            queryset = queryset.filter(
                Q(collaborator_name__icontains=search) |
                Q(identifier__icontains=search)
            )

        report = (
            queryset.values(
                "collaborator_name",
                "identifier",
                "sector__name",
            )
            .annotate(
                lunches=Count("id", filter=Q(meal_type="LUNCH")),
                dinners=Count("id", filter=Q(meal_type="DINNER")),
                total=Count("id"),
                amount=Sum("price"),
            )
            .order_by("collaborator_name")
        )

        http_response = HttpResponse(content_type="text/csv; charset=utf-8")
        http_response[
            "Content-Disposition"] = f'attachment; filename="relatorio_{month or "geral"}.csv"'

        http_response.write("\ufeff")

        writer = csv.writer(http_response)
        writer.writerow(["Nome", "Matrícula", "Setor",
                        "Almoços", "Jantares", "Total", "Valor (R$)"])

        for item in report:
            writer.writerow([
                item["collaborator_name"],
                item["identifier"],
                item["sector__name"] or "-",
                item["lunches"],
                item["dinners"],
                item["total"],
                item["amount"],
            ])

        return http_response


class MealRequestsSettingsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_object(self):
        obj, created = MealRequestSettings.objects.get_or_create(
            id=1,
            defaults={
                "employee_price": 5.00,
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
        serializer = MealRequestSettingsSerializer(instance, data=request.data)
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
