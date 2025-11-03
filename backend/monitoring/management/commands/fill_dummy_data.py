from __future__ import annotations

import csv
from datetime import datetime
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from monitoring.models import Machine, ProductionEntry, Tool

User = get_user_model()


class Command(BaseCommand):
    help = "Загружает демо-данные из CSV и создаёт тестовые учётные записи."

    def add_arguments(self, parser) -> None:
        parser.add_argument(
            "--data-dir",
            type=str,
            default=str(Path(settings.BASE_DIR).parent / "data"),
            help="Папка с CSV-файлами (по умолчанию ../data).",
        )
        parser.add_argument(
            "--manager-password",
            type=str,
            default="manager123",
            help="Пароль для аккаунта руководителя.",
        )
        parser.add_argument(
            "--worker-password",
            type=str,
            default="worker123",
            help="Пароль, который получат все созданные сотрудники.",
        )

    def handle(self, *args, **options) -> None:
        data_dir = Path(options["data_dir"]).resolve()
        if not data_dir.exists():
            self.stderr.write(self.style.ERROR(f"Папка {data_dir} не найдена."))
            return

        employees_csv = data_dir / "employees.csv"
        inventory_csv = data_dir / "inventory.csv"
        demo_csv = data_dir / "demo_data.csv"

        missing_files = [
            path.name for path in (employees_csv, inventory_csv, demo_csv) if not path.exists()
        ]
        if missing_files:
            self.stderr.write(
                self.style.ERROR(f"Не найдены файлы: {', '.join(missing_files)} в {data_dir}")
            )
            return

        with transaction.atomic():
            self._ensure_manager(password=options["manager_password"])
            self._ensure_demo_worker(password=options["worker_password"])
            machines = self._load_machines(demo_csv)
            self._load_inventory(inventory_csv)
            self._load_employees(employees_csv, machines, options["worker_password"])

        self.stdout.write(self.style.SUCCESS("Демо-данные успешно загружены."))

    def _ensure_manager(self, password: str) -> None:
        manager, created = User.objects.get_or_create(
            username="manager",
            defaults={
                "role": User.Role.MANAGER,
                "first_name": "Главный",
                "last_name": "Инженер",
                "email": "manager@example.com",
                "is_staff": True,
                "is_superuser": False,
            },
        )
        if created:
            manager.set_password(password)
            manager.save()
            self.stdout.write("Создан руководитель: login=manager")
        else:
            self.stdout.write("Учётная запись руководителя уже существует.")
            manager.set_password(password)
            manager.save(update_fields=["password"])

    def _ensure_demo_worker(self, password: str) -> None:
        worker, created = User.objects.get_or_create(
            username="worker",
            defaults={
                "role": User.Role.WORKER,
                "first_name": "Тестовый",
                "last_name": "Сотрудник",
                "email": "worker@example.com",
                "is_staff": False,
                "is_superuser": False,
            },
        )
        worker.set_password(password)
        worker.save(update_fields=["password"])
        if created:
            self.stdout.write("Создан тестовый сотрудник: login=worker")
        else:
            self.stdout.write("Пароль тестового сотрудника обновлён.")

    def _load_machines(self, demo_csv: Path) -> list[Machine]:
        machines: list[Machine] = []
        seen: set[str] = set()
        with demo_csv.open(newline="", encoding="utf-8") as fp:
            reader = csv.DictReader(fp)
            for row in reader:
                machine_name = row.get("machine", "").strip()
                if not machine_name or machine_name in seen:
                    continue
                machine, _ = Machine.objects.get_or_create(name=machine_name)
                machines.append(machine)
                seen.add(machine_name)
        if not machines:
            default_machine, _ = Machine.objects.get_or_create(name="Не указан")
            machines.append(default_machine)
        self.stdout.write(f"Подготовлено станков: {len(machines)}")
        return machines

    def _load_inventory(self, inventory_csv: Path) -> None:
        with inventory_csv.open(newline="", encoding="utf-8") as fp:
            reader = csv.DictReader(fp)
            for row in reader:
                name = row.get("tool_name", "").strip()
                if not name:
                    continue
                tool, _ = Tool.objects.get_or_create(name=name)
                tool.stock = int(row.get("stock", 0) or 0)
                tool.min_threshold = int(row.get("min_threshold", 0) or 0)
                tool.location = row.get("location", "").strip()
                avg = row.get("avg_daily_outflow", "")
                tool.avg_daily_outflow = Decimal(avg.replace(",", ".") or "0") if avg else None
                tool.save()
        self.stdout.write("Инструменты обновлены.")

    def _load_employees(
        self, employees_csv: Path, machines: list[Machine], password: str
    ) -> None:
        if not machines:
            machines = [Machine.objects.get_or_create(name="Не указан")[0]]
        cycle_index = 0
        with employees_csv.open(newline="", encoding="utf-8") as fp:
            reader = csv.DictReader(fp)
            for row in reader:
                employee_id = row.get("id", "").strip()
                if not employee_id:
                    continue

                username = employee_id.lower()
                full_name = row.get("name", "").strip()
                shift = row.get("shift", "").strip()
                parts_made = int(row.get("parts_made", 0) or 0)
                defects = int(row.get("defects", 0) or 0)
                avg_temp = row.get("avg_temp", "")
                avg_vib = row.get("avg_vib", "")
                avg_wear = row.get("avg_wear", "")
                date_str = row.get("date", "")

                worker, created = User.objects.get_or_create(
                    username=username,
                    defaults={
                        "role": User.Role.WORKER,
                        "first_name": full_name,
                        "is_staff": False,
                        "is_superuser": False,
                    },
                )
                if created:
                    worker.set_password(password)
                    worker.save()

                machine = machines[cycle_index % len(machines)]
                cycle_index += 1

                detail_name = f"Деталь {employee_id}"
                recorded_at = datetime.fromisoformat(date_str) if date_str else datetime.now()
                if timezone.is_naive(recorded_at):
                    recorded_at = timezone.make_aware(recorded_at, timezone.get_current_timezone())

                entry_exists = ProductionEntry.objects.filter(
                    worker=worker,
                    detail_name=detail_name,
                    recorded_at__date=recorded_at.date(),
                ).exists()
                if entry_exists:
                    continue

                ProductionEntry.objects.create(
                    worker=worker,
                    machine=machine,
                    detail_name=detail_name,
                    parts_made=parts_made,
                    defective_parts=defects,
                    temperature_c=Decimal(str(avg_temp).replace(",", ".")) if avg_temp else None,
                    vibration_mm=Decimal(str(avg_vib).replace(",", ".")) if avg_vib else None,
                    tool_wear_percent=Decimal(str(avg_wear).replace(",", ".")) if avg_wear else None,
                    shift=shift,
                    note="Импортировано из CSV",
                    recorded_at=recorded_at,
                )
        self.stdout.write("Сотрудники и производственные записи загружены.")
