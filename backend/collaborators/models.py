
from django.db import models
from sectors.models import Sector


class CollaboratorBase(models.Model):
    full_name = models.CharField(max_length=150)
    active = models.BooleanField(default=True)
    email = models.EmailField(
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.full_name


class Academic(CollaboratorBase):
    institution = models.CharField(max_length=150)
    course = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    def __str__(self):
        return self.institution


class Doctor(CollaboratorBase):
    crm = models.CharField(
        max_length=20,
        unique=True
    )
    specialty = models.CharField(
        max_length=100
    )

    def __str__(self):
        return f"{self.full_name} - CRM {self.crm}"


class Employee(CollaboratorBase):
    SHIFT_DAY = "DAY"
    SHIFT_NIGHT = "NIGHT"

    SHIFT_CHOICES = (
        (SHIFT_DAY, "Dia"),
        (SHIFT_NIGHT, "Noite"),
    )

    registration = models.CharField(
        "Matrícula",
        max_length=30,
        unique=True
    )

    department = models.ForeignKey(
        Sector,
        on_delete=models.PROTECT,
        related_name="employees"
    )

    shift = models.CharField(
        max_length=10,
        choices=SHIFT_CHOICES
    )

    def __str__(self):
        return self.registration


class EmployeeMealPreference(models.Model):
    AUTOMATION_WEEKDAYS = "WEEKDAYS"
    AUTOMATION_ALTERNATE = "ALTERNATE"

    AUTOMATION_TYPE_CHOICES = (
        (AUTOMATION_WEEKDAYS, "Segunda a Sexta"),
        (AUTOMATION_ALTERNATE, "Plantonista (dia sim / dia não)"),
    )

    MEAL_TYPE_CHOICES = (
        ("LUNCH", "Almoço"),
        ("DINNER", "Janta"),
    )

    employee_registration = models.CharField(
        max_length=30,
        unique=True
    )

    automation_type = models.CharField(
        max_length=15,
        choices=AUTOMATION_TYPE_CHOICES,
        null=True,
        blank=True,
        help_text="Null = sem automação"
    )

    default_meal_type = models.CharField(
        max_length=10,
        choices=MEAL_TYPE_CHOICES,
        null=True,
        blank=True
    )

    start_date = models.DateField(
        null=True,
        blank=True,
        help_text="Obrigatório para plantonista"
    )

    active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.default_meal_type
