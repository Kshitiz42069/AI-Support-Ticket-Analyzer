import os
import json
import logging

from google import genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)


def analyze_ticket(title: str, description: str) -> dict:
    prompt = (
        "You are a support-ticket classifier. Analyze the ticket below and "
        "respond with JSON only, matching this exact schema:\n"
        "{\n"
        '  "priority": "low" | "medium" | "high" | "critical",\n'
        '  "tags": [string, ...],\n'
        '  "suggested_reply": string\n'
        "}\n\n"
        "Guidelines:\n"
        "- priority: pick one based on urgency and impact.\n"
        "- tags: 1-5 short lowercase keywords describing the issue category.\n"
        "- suggested_reply: a polite, helpful first-response message to the user.\n\n"
        f"Title: {title}\n"
        f"Description: {description}\n"
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt,
            config={"response_mime_type": "application/json"},
        )
        return json.loads(response.text)
    except Exception as e:
        logging.error(f"AI service failed: {e}")
        return {"priority": "medium", "tags": [], "suggested_reply": ""}
