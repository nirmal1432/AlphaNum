
from flask import Flask, render_template, jsonify, request
import random
import string

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/new-question")
def new_question():
    mode = request.args.get("mode", "num")

    if mode not in ["num", "alpha", "mixed"]:
        return jsonify({"error": "Invalid mode"}), 400

    if mode == "mixed":
        mode = random.choice(["num", "alpha"])

    number = random.randint(1, 26)
    alphabet = string.ascii_uppercase[number - 1]

    question = number if mode == "num" else alphabet

    return jsonify({
        "question": question,
        "number": number,
        "mode": mode
    })


@app.route("/check-answer", methods=["POST"])
def check_answer():
    data = request.get_json(silent=True) or {}

    mode = data.get("mode")
    number = data.get("number")
    answer = str(data.get("answer", "")).strip().upper()

    if mode not in ["num", "alpha"]:
        return jsonify({"error": "Invalid mode"}), 400

    if not isinstance(number, int) or not 1 <= number <= 26:
        return jsonify({"error": "Invalid number"}), 400

    if mode == "num":
        expected = string.ascii_uppercase[number - 1]
    else:
        expected = str(number)

    correct = answer == expected

    return jsonify({
        "correct": correct,
        "expected": expected,
        "message": "Correct Answer!" if correct else "Wrong Answer!"
    })


if __name__ == "__main__":
    app.run(debug=True)
