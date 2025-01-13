import os
from flask import Flask, request, jsonify
from openai import OpenAI
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Initialize the OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.json
        text = data.get("text", "")

        if not text:
            return jsonify({"error": "No text provided"}), 400

        # Updated API call for v1.0.0+
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are an assistant for analyzing project data."},
                {"role": "user", "content": text}
            ],
            model="gpt-4o"
        )

        # Extract and return the response content
        analysis = response.choices[0].message["content"]
        return jsonify({"response": analysis})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
