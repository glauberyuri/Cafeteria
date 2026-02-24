from django.db import models


class WeeklyMenu(models.Model):
    reference_date = models.DateField(
        help_text="Data da semana (ex: segunda-feira)"
    )

    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-reference_date"]

    def __str__(self):
        return f"Cardápio semana {self.reference_date}"


class MenuItem(models.Model):
    MEAL_TYPE_CHOICES = (
        ("LUNCH", "Almoço"),
        ("DINNER", "Jantar"),
    )

    WEEKDAY_CHOICES = (
        (0, "Segunda"),
        (1, "Terça"),
        (2, "Quarta"),
        (3, "Quinta"),
        (4, "Sexta"),
        (5, "Sábado"),
        (6, "Domingo"),
    )

    weekly_menu = models.ForeignKey(
        WeeklyMenu,
        on_delete=models.CASCADE,
        related_name="items"
    )

    weekday = models.IntegerField(choices=WEEKDAY_CHOICES)
    meal_type = models.CharField(max_length=10, choices=MEAL_TYPE_CHOICES)

    main = models.CharField("Prato principal", max_length=150)
    side = models.CharField("Acompanhamentos", max_length=200, blank=True)
    dessert = models.CharField("Sobremesa", max_length=100, blank=True)

    class Meta:
        unique_together = ("weekly_menu", "weekday", "meal_type")

    def __str__(self):
        return f"{self.get_weekday_display()} - {self.get_meal_type_display()}"
