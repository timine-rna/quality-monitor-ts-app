from __future__ import annotations

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    class Role(models.TextChoices):
        MANAGER = "manager", "Руководитель"
        WORKER = "worker", "Сотрудник"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.WORKER,
        help_text="Определяет интерфейс и доступные действия в системе.",
    )

    def is_manager(self) -> bool:
        return self.role == self.Role.MANAGER

    def is_worker(self) -> bool:
        return self.role == self.Role.WORKER


class Machine(models.Model):
    name = models.CharField(max_length=120, unique=True)
    subdivision = models.CharField(
        max_length=120,
        blank=True,
        help_text="Цех или участок, где расположен станок.",
    )
    location_description = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Станок"
        verbose_name_plural = "Станки"

    def __str__(self) -> str:
        return self.name


class ProductionEntry(models.Model):
    worker = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="production_entries",
        limit_choices_to={"role": User.Role.WORKER},
    )
    machine = models.ForeignKey(
        Machine,
        on_delete=models.PROTECT,
        related_name="production_entries",
    )
    detail_name = models.CharField(max_length=160)
    parts_made = models.PositiveIntegerField()
    defective_parts = models.PositiveIntegerField(default=0)
    temperature_c = models.DecimalField(
        "Температура (°C)",
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
    )
    vibration_mm = models.DecimalField(
        "Вибрация (мм/с)",
        max_digits=5,
        decimal_places=3,
        null=True,
        blank=True,
    )
    tool_wear_percent = models.DecimalField(
        "Износ инструмента (%)",
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
    )
    shift = models.CharField(max_length=40, blank=True)
    note = models.TextField(blank=True)
    recorded_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-recorded_at"]
        verbose_name = "Запись производства"
        verbose_name_plural = "Записи производства"

    def __str__(self) -> str:
        return f"{self.detail_name} — {self.worker.username} ({self.recorded_at:%Y-%m-%d})"


class Tool(models.Model):
    name = models.CharField(max_length=180, unique=True)
    stock = models.PositiveIntegerField(default=0)
    defective_stock = models.PositiveIntegerField(
        default=0,
        help_text="Количество инструмента с браком.",
    )
    min_threshold = models.PositiveIntegerField(default=0)
    location = models.CharField(max_length=160, blank=True)
    avg_daily_outflow = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
    )
    last_updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Инструмент"
        verbose_name_plural = "Инструменты"

    def __str__(self) -> str:
        return self.name


class ToolIssue(models.Model):
    tool = models.ForeignKey(Tool, on_delete=models.PROTECT, related_name="issues")
    reported_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="tool_issues",
        limit_choices_to={"role": User.Role.WORKER},
    )
    defective_count = models.PositiveIntegerField(default=1)
    description = models.TextField(blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-recorded_at"]
        verbose_name = "Сообщение об инструменте"
        verbose_name_plural = "Сообщения об инструменте"

    def __str__(self) -> str:
        return f"{self.tool.name} — {self.defective_count} шт."
