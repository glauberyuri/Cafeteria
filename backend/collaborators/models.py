
from django.db import models
from sectors.models import Sector
from django.utils.timezone import now


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

    CATEGORY_COMMON = "COMMON"
    CATEGORY_RESIDENT = "RESIDENT"

    CATEGORY_CHOICES = (
        (CATEGORY_COMMON, "Aluno Comum"),
        (CATEGORY_RESIDENT, "Residente"),
    )

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default=CATEGORY_COMMON
    )

    institution = models.CharField(max_length=150, null=True)
    course = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.institution


class Doctor(CollaboratorBase):
    crm = models.CharField(
        max_length=20,
        unique=True
    )
    specialty = models.CharField(
        max_length=100,
        null=True,
        blank=True
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


class AcademicAuthorization(models.Model):
    academic = models.ForeignKey(
        Academic,
        on_delete=models.CASCADE,
        related_name="authorizations"
    )

    sector = models.ForeignKey(
        Sector,
        on_delete=models.PROTECT
    )

    start_date = models.DateField()
    end_date = models.DateField()

    approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        "auth.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def approve(self, user):
        self.approved = True
        self.approved_at = now()
        self.approved_by = user
        self.save()
