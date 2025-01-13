import os
from flask import Flask, request, jsonify
import openai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Fetch the OpenAI API key from the environment
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {
                    "role": "user",
                    "content": f"""
                    Analyze the following data:

                    {text}

                    Provide:
                    1. A high-level executive summary.
                    2. Total impact (number of projects, statistics, amount of money raised).
                    3. Project notes (summarize each project briefly).
                    4. Key risks or attention-needed areas.
                    5. Citations for each output (mention where the data was stated in the PDF).
                    """
                }
            ]
        )
        return jsonify({"response": response['choices'][0]['message']['content']})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

if not openai.api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set!")

