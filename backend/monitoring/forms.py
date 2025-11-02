from django import forms

from .models import ProductionEntry, ToolIssue


class ProductionEntryForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._apply_bulma_styles()

    class Meta:
        model = ProductionEntry
        exclude = ("worker", "recorded_at")
        widgets = {
            "note": forms.Textarea(attrs={"rows": 3}),
            "detail_name": forms.TextInput(attrs={"placeholder": "Например, корпус редуктора"}),
        }

    def _apply_bulma_styles(self) -> None:
        for field in self.fields.values():
            widget = field.widget
            if isinstance(widget, forms.Textarea):
                widget.attrs.setdefault("class", "textarea")
            elif isinstance(widget, forms.Select):
                widget.attrs.setdefault("class", "")
            else:
                widget.attrs.setdefault("class", "input")


class ToolIssueForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            widget = field.widget
            if isinstance(widget, forms.Textarea):
                widget.attrs.setdefault("class", "textarea")
            else:
                widget.attrs.setdefault("class", "input")

    class Meta:
        model = ToolIssue
        fields = ("tool", "defective_count", "description")
        widgets = {"description": forms.Textarea(attrs={"rows": 3})}

