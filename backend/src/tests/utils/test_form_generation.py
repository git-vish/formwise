from datetime import datetime
from unittest import mock

import pytest
from faker import Faker

from src.utils.form_generation import FormGenerator

fake = Faker()


class TestFormGenerator:
    @mock.patch("src.utils.form_generation.ChatGroq")
    @mock.patch("src.utils.form_generation.logger.error")
    def test_form_generator_init_error(self, mock_logger_error, mock_chat_groq):
        """Tests that an error is logged and raised during initialization."""
        error_message = fake.sentence()
        mock_chat_groq.side_effect = Exception(error_message)

        with pytest.raises(Exception, match=error_message):
            FormGenerator()

        mock_logger_error.assert_called_once()

    @pytest.mark.anyio
    async def test_form_generator_generate_form(self):
        """Tests that generate_form invokes the chain with correct arguments."""
        form_generator = FormGenerator()
        mock_chain = mock.Mock()
        mock_chain.ainvoke = mock.AsyncMock()
        form_generator._chain = mock_chain

        description = fake.sentence()
        today = str(datetime.now().date())
        await form_generator.generate_form(description)

        mock_chain.ainvoke.assert_called_once_with(
            {"user_input": description, "today": today}
        )
