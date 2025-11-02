from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import Machine, ProductionEntry, Tool, ToolIssue, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("username", "first_name", "last_name", "email", "role", "is_staff")
    fieldsets = DjangoUserAdmin.fieldsets + (("Роль в системе", {"fields": ("role",)}),)
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (("Роль в системе", {"fields": ("role",)}),)
    list_filter = DjangoUserAdmin.list_filter + ("role",)
    search_fields = DjangoUserAdmin.search_fields + ("role",)


@admin.register(Machine)
class MachineAdmin(admin.ModelAdmin):
    list_display = ("name", "subdivision", "location_description")
    search_fields = ("name", "subdivision")


@admin.register(ProductionEntry)
class ProductionEntryAdmin(admin.ModelAdmin):
    list_display = (
        "recorded_at",
        "worker",
        "machine",
        "detail_name",
        "parts_made",
        "defective_parts",
    )
    list_filter = ("machine", "shift", "recorded_at")
    search_fields = ("detail_name", "worker__username", "worker__last_name")


@admin.register(Tool)
class ToolAdmin(admin.ModelAdmin):
    list_display = ("name", "stock", "defective_stock", "min_threshold", "location")
    search_fields = ("name",)


@admin.register(ToolIssue)
class ToolIssueAdmin(admin.ModelAdmin):
    list_display = ("recorded_at", "tool", "reported_by", "defective_count")
    list_filter = ("tool", "reported_by")
