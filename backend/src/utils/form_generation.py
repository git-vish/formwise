import logging
from datetime import datetime

from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

from src.config import settings
from src.models.form import FormCreate

logger = logging.getLogger(__name__)

_SYSTEM_PROMPT = """You are an expert in designing intuitive, user-friendly forms tailored to the user's input and context.
Your task is to interpret the user’s intent, infer additional requirements, and generate a precise structured form definition.

Guidelines:
1. Understanding User Input:
- Analyze the purpose, intent, and objectives from the user’s input.
- Infer relevant details where necessary, ensuring logical consistency.

2. Adaptability to Scenarios:
- If the user provides a vague description of the form’s purpose, infer necessary fields based on context and provide justifications for each inferred field.
- If the user specifies fields, include only the fields mentioned and strictly adhere to any instructions provided.
- If no field information is provided, create a logically consistent form aligned with the stated purpose.

Design Principles:
- Use simple, concise language for titles, labels, and instructions.
- Choose intuitive field types and labels to enhance user experience.
"""  # noqa: E501

_USER_PROMPT = """Based on the user input, generate a structured form definition.

<USER_INPUT>
{user_input}
</USER_INPUT>

Field Guidelines:
1. Field Types:
- Use text fields for shorter responses.
- Use paragraph fields for longer-form responses like descriptions, addresses, comments, etc.
- Use specific field types such as email, numbers, dates, and url when applicable.
- For predetermined options, use below field types:
    - "select" for radio button-like choices.
    - "dropdown" for long single-select lists.
    - "multi-select" for multiple-choice options.
- In case of more than 5 single choice options, use "dropdown" instead of "select".
- In case of rating scales, use "select" with string options like "good", "fair", "poor" etc. appropriately, DO NOT use numbers.

2. Field Labels:
- Ensure labels are clear, concise.
- Avoid technical or overly verbose phrasing.
- Avoid adding (optional) tag to field labels if field is not required.
- Correct examples:
    1. Email
    2. Name
    3. Comments
    4. Date of Birth
    5. Shipping Address
- Incorrect examples:
    1. Email (for follow-up)
    2. Name (required)
    3. Comments (max 500 words)
    4. Date of Birth (MM/DD/YYYY)
    5. Shipping Address (optional)

3. Help Text:
- Add help text if and only if additional context is necessary.
- Ensure help text is brief and informative if added.

4. Validation and Constraints:
- Make fields required only when the information is essential.
- Add appropriate constraints only when it enhances data quality, such as:
    - Min/Max lengths for text fields.
    - Min/Max values for number and date fields.

5. Options for Select field types:
- Provide meaningful and comprehensive options for all select fields.
- DO NOT ADD "other" AS AN OPTION.

Notes:
- Avoid redundancy in labels, help text, and field definitions.
- Field tags will be generated automatically; omit them in the form definition.
- Today's date: {today}
"""  # noqa: E501


class FormGenerator:
    """Class for generating forms using a language model."""

    def __init__(self):
        try:
            llm = ChatGroq(
                model=settings.GROQ_MODEL, temperature=settings.GROQ_TEMPERATURE
            )

            prompt = ChatPromptTemplate.from_messages(
                [
                    ("system", _SYSTEM_PROMPT),
                    ("user", _USER_PROMPT),
                ]
            )

            self._chain = prompt | llm.with_structured_output(FormCreate)
        except Exception as err:
            logger.error("Failed to initialize FormGenerator: %s", err)
            raise

    async def generate_form(self, description: str) -> FormCreate:
        """Asynchronously generates a form based on the given description.

        Args:
            description (str): The description of the form.

        Returns:
            FormCreate: The generated form.
        """
        today = str(datetime.now().date())

        return await self._chain.ainvoke({"user_input": description, "today": today})
