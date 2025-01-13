from flask import Flask, request, jsonify
import openai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from your frontend

# Set your OpenAI API key
openai.api_key = "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"

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
