from django.db import models


class CollaboratorBase(models.Model):
    name = models.CharField(max_length=150)
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
