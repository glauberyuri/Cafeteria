# models/academic.py
from django.db import models
from .base import CollaboratorBase


class Academic(CollaboratorBase):
    institution = models.CharField(max_length=150)
    course = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )
