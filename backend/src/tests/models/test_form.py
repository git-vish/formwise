from src.models.form import FormCreate
from src.tests.helpers import load_json_data


class TestFormCreate:
    def test_ensure_unique_field_tags(self):
        """Tests that field tags in a form are unique after validation."""
        form_data = load_json_data("forms/form_duplicate_field_tags.json")
        form = FormCreate.model_validate(form_data)

        tags = {field.tag for field in form.fields}
        assert len(tags) == len(form.fields)
