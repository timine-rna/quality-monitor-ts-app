from django.contrib.auth import views as auth_views
from django.urls import path

from . import views

urlpatterns = [
    path("login/", views.CustomLoginView.as_view(), name="login"),
    path("logout/", auth_views.LogoutView.as_view(), name="logout"),
    path("", views.dashboard, name="dashboard"),
    path("entries/new/", views.create_production_entry, name="create_production_entry"),
    path("tools/report/", views.report_tool_issue, name="report_tool_issue"),
    path("export/excel/", views.export_excel, name="export_excel"),
    path("api/manager/process/", views.api_process_rows, name="api_manager_process"),
    path("api/manager/employees/", views.api_employee_rows, name="api_manager_employees"),
    path("api/manager/inventory/", views.api_inventory_rows, name="api_manager_inventory"),
    path(
        "api/manager/inventory/<int:pk>/",
        views.api_inventory_update,
        name="api_manager_inventory_update",
    ),
]
