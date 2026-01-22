from django.db import models


class DietType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blanck=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
