from datetime import datetime

import pytest
from faker import Faker
from pydantic import ValidationError

from src.models.field import (
    DateField,
    DropdownField,
    EmailField,
    FieldType,
    MultiSelectField,
    NumberField,
    ParagraphField,
    SelectField,
    SelectionBase,
    TextBase,
    TextField,
    URLField,
)

fake = Faker()


class TestBaseField:
    def test_generate_field_tag_empty(self):
        """Tests tag generation when not provided."""
        text_field = TextField(label=fake.word())
        assert text_field.tag != ""
        assert len(text_field.tag.split("-")) == 2

        # Verify that the tag starts with the field type
        assert text_field.tag.startswith(FieldType.TEXT)

        url_field = URLField(label=fake.word())
        assert url_field.tag.startswith(FieldType.URL)

    def test_generate_field_tag_unique(self):
        """Tests that the generated tags are unique."""
        tags = set()
        for _ in range(100):
            field = TextField(label=fake.word())
            tags.add(field.tag)
        assert len(tags) == 100

    def test_generate_field_tag_with_existing_tag(self):
        """Tests that the existing tag is not overwritten."""
        tag = fake.word()
        field = TextField(label=fake.word(), tag=tag)
        assert field.tag == tag


class TestTextBase:
    def test_text_base_invalid_constraints(self):
        """Tests invalid constraints for text base."""
        with pytest.raises(ValidationError):
            TextBase(min_length=50, max_length=5)


class TestTextField:
    def test_text_field_default_constraints(self):
        """Tests default constraints for text field."""
        field = TextField(label=fake.word())
        assert field.min_length == 1
        assert field.max_length == 50

        valid_answer = fake.text(max_nb_chars=field.max_length)
        assert field.validate_answer(valid_answer) == valid_answer

        invalid_answer = "a" * (field.max_length + 1)
        with pytest.raises(ValueError):
            field.validate_answer(invalid_answer)

        invalid_answer = ""
        with pytest.raises(ValueError):
            field.validate_answer(invalid_answer)

    def test_text_field_custom_constraints(self):
        """Tests custom constraints for text field."""
        min_length = 5
        max_length = 10
        field = TextField(
            label=fake.word(), min_length=min_length, max_length=max_length
        )

        valid_answer = "a" * max_length
        assert field.validate_answer(valid_answer) == valid_answer

        invalid_answer = "a" * (max_length + 1)
        with pytest.raises(ValueError):
            field.validate_answer(invalid_answer)

        invalid_answer = "a" * (min_length - 1)
        with pytest.raises(ValueError):
            field.validate_answer(invalid_answer)


class TestParagraphField:
    def test_paragraph_field_default_constraints(self):
        """Tests default constraints for paragraph field."""
        field = ParagraphField(label=fake.word())
        assert field.min_length == 1
        assert field.max_length == 500

        valid_answer = fake.text(max_nb_chars=field.max_length)
        assert field.validate_answer(valid_answer) == valid_answer

        invalid_answer = "a" * (field.max_length + 1)
        with pytest.raises(ValueError):
            field.validate_answer(invalid_answer)

        invalid_answer = ""
        with pytest.raises(ValueError):
            field.validate_answer(invalid_answer)

    def test_paragraph_field_custom_constraints(self):
        """Tests custom constraints for paragraph field."""
        min_length = 5
        max_length = 10
        field = ParagraphField(
            label=fake.word(), min_length=min_length, max_length=max_length
        )

        valid_answer = "a" * max_length
        assert field.validate_answer(valid_answer) == valid_answer

        invalid_answer = "a" * (max_length + 1)
        with pytest.raises(ValueError):
            field.validate_answer(invalid_answer)

        invalid_answer = "a" * (min_length - 1)
        with pytest.raises(ValueError):
            field.validate_answer(invalid_answer)


class TestSelectionBase:
    @pytest.mark.parametrize(
        "options",
        (
            "Option1",
            ["Option1", ""],
            [],
            None,
        ),
        ids=["string", "empty-string", "empty-list", "none"],
    )
    def test_selection_base_invalid_options(self, options):
        """Tests invalid options raise ValidationError."""
        with pytest.raises(ValidationError):
            SelectionBase(options=options)

    def test_ensure_unique_options(self):
        """Tests that duplicate options are reduced to unique values."""
        base = SelectionBase(options=["Option1", "Option1"])
        assert base.options == ["Option1"]


class TestSelectField:
    def test_select_field_valid_answer(self):
        """Tests a valid selection."""
        field = SelectField(label=fake.word(), options=["Option1", "Option2"])
        assert field.validate_answer("Option1") == "Option1"

    @pytest.mark.parametrize(
        "answer",
        ("invalid-option", 1234, "", None),
        ids=["invalid", "int", "empty", "none"],
    )
    def test_select_field_invalid_answer(self, answer):
        """Tests an invalid selection."""
        field = SelectField(label=fake.word(), options=["Option1", "Option2"])
        with pytest.raises(ValueError):
            field.validate_answer(answer)


class TestDropdownField:
    def test_dropdown_field_valid_answer(self):
        """Tests a valid selection."""
        field = DropdownField(label=fake.word(), options=["Option1", "Option2"])
        assert field.validate_answer("Option1") == "Option1"

    @pytest.mark.parametrize(
        "answer",
        ("invalid-option", 1234, "", None),
        ids=["invalid", "int", "empty", "none"],
    )
    def test_dropdown_field_invalid_answer(self, answer):
        """Tests an invalid selection."""
        field = DropdownField(label=fake.word(), options=["Option1", "Option2"])
        with pytest.raises(ValueError):
            field.validate_answer(answer)


class TestMultiSelectField:
    def test_multi_select_field_valid_answer(self):
        """Tests a valid selection."""
        field = MultiSelectField(label=fake.word(), options=["Option1", "Option2"])
        assert field.validate_answer("Option1") == ["Option1"]

    @pytest.mark.parametrize(
        "answer",
        (["Option1", "invalid-option"], "invalid-option", [""], None),
        ids=["invalid", "invalid_string", "empty", "none"],
    )
    def test_multi_select_field_invalid_answer(self, answer):
        """Tests an invalid selection."""
        field = MultiSelectField(label=fake.word(), options=["Option1", "Option2"])
        with pytest.raises(ValueError):
            field.validate_answer(answer)


class TestDateField:
    def test_date_field_valid_answer(self):
        """Tests a valid date input."""
        field = DateField(label=fake.word())
        answer = fake.date()
        assert (
            field.validate_answer(answer)
            == datetime.strptime(answer, "%Y-%m-%d").date()
        )

        answer = fake.date_time().date()
        assert field.validate_answer(answer) == answer

    def test_date_field_invalid_answer(self):
        """Tests an invalid date input."""
        field = DateField(label=fake.word())
        with pytest.raises(ValueError):
            field.validate_answer("invalid-date")

        with pytest.raises(ValueError):
            field.validate_answer(1234)

    def test_date_field_valid_answer_with_constraints(self):
        """Tests a valid date input with constraints."""
        field = DateField(
            label=fake.word(),
            min_date=datetime(2020, 1, 1).date(),
            max_date=datetime(2020, 12, 31).date(),
        )
        answer = datetime(2020, 6, 15).date()
        assert field.validate_answer(answer) == answer

    def test_date_field_invalid_answer_with_constraints(self):
        """Tests an invalid date input with constraints."""
        field = DateField(
            label=fake.word(),
            min_date=datetime(2020, 1, 1).date(),
            max_date=datetime(2020, 12, 31).date(),
        )

        with pytest.raises(ValueError):
            field.validate_answer(datetime(2019, 12, 31).date())

        with pytest.raises(ValueError):
            field.validate_answer(datetime(2021, 1, 1).date())

    def test_date_field_invalid_constraints(self):
        """Tests invalid constraints."""
        with pytest.raises(ValidationError):
            DateField(
                label=fake.word(),
                min_date=datetime(2020, 12, 31).date(),
                max_date=datetime(2020, 1, 1).date(),
            )


class TestEmailField:
    def test_email_field_valid_answer(self):
        """Tests a valid email input."""
        field = EmailField(label=fake.word())
        answer = fake.email(domain="gmail.com")
        assert field.validate_answer(answer) == answer

    def test_email_field_invalid_answer(self):
        """Tests an invalid email input."""
        field = EmailField(label=fake.word())
        with pytest.raises(ValueError):
            field.validate_answer("invalid-email")


class TestNumberField:
    @pytest.mark.parametrize(
        "answer",
        [
            fake.pyint(),
            float(fake.pydecimal(right_digits=5)),
            str(fake.pydecimal(right_digits=5)),
        ],
        ids=["int", "float", "string"],
    )
    def test_number_field_valid_answer(self, answer):
        """Tests a valid number input."""
        field = NumberField(label=fake.word())
        validate_answer = field.validate_answer(answer)
        if isinstance(answer, str):
            assert validate_answer == round(float(answer), field.precision)
        else:
            assert field.validate_answer(answer) == round(answer, field.precision)

    @pytest.mark.parametrize(
        "answer",
        [
            fake.pyint(min_value=10, max_value=100),
            float(fake.pydecimal(min_value=10, max_value=100, right_digits=5)),
            str(fake.pydecimal(min_value=10, max_value=100, right_digits=5)),
        ],
        ids=["int", "float", "string"],
    )
    def test_number_field_valid_answer_with_constraints(self, answer):
        """Tests a valid number input with constraints."""
        field = NumberField(label=fake.word(), min_value=10, max_value=100, precision=4)
        validate_answer = field.validate_answer(answer)
        if isinstance(answer, str):
            assert validate_answer == round(float(answer), field.precision)
        else:
            assert field.validate_answer(answer) == round(answer, field.precision)

    @pytest.mark.parametrize(
        "answer",
        [
            fake.pyint(min_value=101),
            fake.pyint(max_value=9),
            float(fake.pydecimal(min_value=101)),
            float(fake.pydecimal(max_value=9)),
            str(fake.pydecimal(min_value=101)),
            str(fake.pydecimal(max_value=9)),
            "invalid-number",
        ],
        ids=[
            "int-min",
            "int-max",
            "float-min",
            "float-max",
            "string-min",
            "string-max",
            "invalid",
        ],
    )
    def test_number_field_invalid_answer(self, answer):
        """Tests an invalid number input."""
        field = NumberField(label=fake.word(), min_value=10, max_value=100)
        with pytest.raises(ValueError):
            field.validate_answer(answer)

    def test_number_field_invalid_constraints(self):
        """Tests invalid constraints."""
        with pytest.raises(ValidationError):
            NumberField(label=fake.word(), min_value=100, max_value=10)


class TestURLField:
    def test_url_field_valid_answer(self):
        """Tests a valid URL input."""
        field = URLField(label=fake.word())
        answer = fake.url()
        assert field.validate_answer(answer) == answer

    def test_url_field_invalid_answer(self):
        """Tests an invalid URL input."""
        field = URLField(label=fake.word())
        with pytest.raises(ValueError):
            field.validate_answer("invalid-url")
