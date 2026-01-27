from django.db import models
from .base import CollaboratorBase
from sectors.models import Sector


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
