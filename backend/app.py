from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from google import genai
from google.genai import types
from dotenv import load_dotenv
import pdfkit
import os
import time

load_dotenv()

app = Flask(__name__)

# ✅ CORS setup for your deployed React app
CORS(app, resources={r"/*": {"origins": "https://prodraftify-4.onrender.com"}}, supports_credentials=True)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'https://prodraftify-4.onrender.com')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response

@app.route('/')
def home():
    return "✅ ProDraftify Flask API is running!"

# -----------------------------
# Utility functions
# -----------------------------

def build_prompt(data):
    language = data.get('language')
    category = data.get('category')
    tone = data.get('tone')
    topic = data.get('topic')
    recipient_title = data.get('recipientTitle')

    custom_fields = {
        "category": data.get('customCategory', '').strip(),
        "tone": data.get('customTone', '').strip(),
        "topic": data.get('customTopic', '').strip(),
        "recipientTitle": data.get('customRecipientTitle', '').strip()
    }

    missing_fields = [
        key for key, value in custom_fields.items()
        if data.get(key) == "Other" and not value
    ]
    if missing_fields:
        return None, f"Please provide a custom value for: {', '.join(missing_fields)}."

    final_category = custom_fields["category"] if category == "Other" else category
    final_tone = custom_fields["tone"] if tone == "Other" else tone
    final_topic = custom_fields["topic"] if topic == "Other" else topic
    final_recipient_title = custom_fields["recipientTitle"] if recipient_title == "Other" else recipient_title

    prompt = (
        f"Write a {final_tone} email in {language} under the category '{final_category}'. "
        f"The purpose is: {final_topic}. "
        f"The email should be addressed to {final_recipient_title}. "
        f"Format the email professionally with subject line, greeting, body, and closing."
    )

    custom_prompt = data.get("customPrompt", "").strip()
    if custom_prompt:
        prompt += f" Additional details: {custom_prompt}"

    return prompt, None

def generate_email_with_retry(prompt, retries=3):
    contents = [types.Content(role="user", parts=[types.Part(text=prompt)])]
    config = types.GenerateContentConfig(response_mime_type="text/plain")

    for attempt in range(retries):
        try:
            response = client.models.generate_content_stream(
                model="gemini-2.0-flash",
                contents=contents,
                config=config
            )
            email_text = ''.join(chunk.text for chunk in response)
            return email_text, None
        except Exception as e:
            error_str = str(e)
            if "503" in error_str or "UNAVAILABLE" in error_str:
                wait_time = 2 ** attempt
                print(f"503 error received. Retrying after {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                return None, error_str

    return None, "Service unavailable after retries. Please try again later."

def grammar_check_with_retry(text, retries=3):
    prompt = (
        f"Rewrite the following text into a complete, professional email in English. "
        f"Ensure it is well-formatted\n"
        f"- Properly separated paragraphs for each idea,\n"
        f"Use line breaks to separate each section.\n\n"
        f"After rewriting, also provide a brief explanation of the changes and improvements you made.\n\n"
        f"For each bullet, show the original phrase wrapped in <strong> and the new phrase wrapped in <em>."
        f"Original Text:\n\"{text}\""
    )

    contents = [types.Content(role="user", parts=[types.Part(text=prompt)])]
    config = types.GenerateContentConfig(response_mime_type="text/plain")

    for attempt in range(retries):
        try:
            response = client.models.generate_content_stream(
                model="gemini-2.0-flash",
                contents=contents,
                config=config
            )
            corrected_text = ''.join(chunk.text for chunk in response)
            return corrected_text.strip(), None
        except Exception as e:
            error_str = str(e)
            if "503" in error_str or "UNAVAILABLE" in error_str:
                wait_time = 2 ** attempt
                print(f"503 error received. Retrying after {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                return None, error_str

    return None, "Service unavailable after retries. Please try again later."

# -----------------------------
# Routes
# -----------------------------

@app.route('/generate-email', methods=['POST'])
def generate_email():
    try:
        data = request.get_json()
        prompt, error = build_prompt(data)
        if error:
            return jsonify({"error": error}), 400

        print("\n--- Prompt Sent to Gemini ---\n", prompt)

        email_text, gen_error = generate_email_with_retry(prompt)
        if gen_error:
            return jsonify({"error": gen_error}), 503

        print("\n--- Generated Email ---\n", email_text)
        return jsonify({"email": email_text}), 200
    except Exception as e:
        print("Error during email generation:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/grammar-check', methods=['POST'])
def grammar_check():
    try:
        data = request.get_json()
        input_text = data.get("text", "").strip()
        if not input_text:
            return jsonify({"error": "No text provided for grammar check."}), 400

        corrected_text, error = grammar_check_with_retry(input_text)
        if error:
            return jsonify({"error": error}), 503

        return jsonify({"correctedText": corrected_text}), 200
    except Exception as e:
        print("Error during grammar check:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/download-pdf', methods=['POST'])
def download_pdf():
    try:
        data = request.get_json()
        email_text = data.get("email", "").strip()
        if not email_text:
            return jsonify({"error": "Email content is missing"}), 400

        html = f"<pre style='font-family: Arial;'>{email_text}</pre>"
        pdf_file = "generated_email.pdf"
        pdfkit.from_string(html, pdf_file)

        return send_file(pdf_file, as_attachment=True, download_name="generated_email.pdf")
    except Exception as e:
        print("Error generating PDF:", e)
        return jsonify({"error": "Failed to generate PDF"}), 500

# -----------------------------
# Explicit OPTIONS handler for CORS preflight
# -----------------------------
@app.route('/generate-email', methods=['OPTIONS'])
@app.route('/grammar-check', methods=['OPTIONS'])
@app.route('/download-pdf', methods=['OPTIONS'])
def handle_options():
    response = jsonify({})
    response.headers.add('Access-Control-Allow-Origin', 'https://prodraftify-4.onrender.com')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    return response, 200

if __name__ == '__main__':
    app.run()
