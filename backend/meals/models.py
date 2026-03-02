from django.db import models
from django.utils import timezone


class MealSettings(models.Model):

    lunch_deadline = models.TimeField(default="10:00")
    dinner_deadline = models.TimeField(default="17:00")

    employee_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=0)
    doctor_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=0)
    student_price = models.DecimalField(
        max_digits=8, decimal_places=2, default=0)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Configuração Global de Refeições"

    class Meta:
        verbose_name = "Configuração de Refeição"
        verbose_name_plural = "Configurações de Refeição"


class MealRequest(models.Model):

    STATUS_CHOICES = [
        ('PENDING', 'Pendente'),
        ('DELIVERED', 'Entregue'),
        ('CANCELLED', 'Cancelado'),
    ]

    MEAL_TYPE_CHOICES = [
        ('LUNCH', 'Almoço'),
        ('DINNER', 'Jantar'),
    ]

    collaborator_type = models.CharField(max_length=20)
    collaborator_name = models.CharField(max_length=200)

    identifier = models.CharField(max_length=50)
    sector = models.CharField(max_length=100)

    meal_type = models.CharField(max_length=20, choices=MEAL_TYPE_CHOICES)
    diet_type = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2)

    date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('identifier', 'meal_type', 'date')

    def __str__(self):
        return f"{self.collaborator_name} - {self.meal_type} - {self.date}"
