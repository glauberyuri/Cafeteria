from django.db import models


class Sector(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Sector name"
    )
    description = models.TextField(
        blank=True,
        verbose_name="Description"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Active"
    )
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["name"]
        verbose_name = "Sector"
        verbose_name_plural = "Sectors"

    def __str__(self):
        return self.name
