from django.db import models
from .base import CollaboratorBase


class Doctor(CollaboratorBase):
    crm = models.CharField(
        max_length=20,
        unique=True
    )
    specialty = models.CharField(
        max_length=100
    )
