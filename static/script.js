
let currentNumber = 0;
let score = 0;
let wrong = 0;
let seconds = 0;
let timerInterval = null;
let gameRunning = false;
let currentMode = "num";
let submitting = false;

async function getQuestion() {

    const response = await fetch(
        `/new-question?mode=${currentMode}`
    );

    const data = await response.json();

    currentNumber = data.number;

    document.getElementById("number").textContent =
        data.question;

    document.getElementById("answer").value = "";
    document.getElementById("answer").focus();
}


function startGame() {

    score = 0;
    wrong = 0;
    seconds = 0;

    currentMode = document.getElementById("gameMode").value;

    gameRunning = true;

    document.getElementById("score").textContent = score;
    document.getElementById("wrong").textContent = wrong;
    document.getElementById("timer").textContent = "00:00";

    document.getElementById("gameMode").disabled = true;
    document.getElementById("finalResult").textContent = "";
    document.getElementById("startBtn").hidden = true;
    document.getElementById("submitBtn").hidden = false;
    document.getElementById("finishBtn").hidden = false;

    document.getElementById("answer").disabled = false;

    document.getElementById("instruction").textContent =
        currentMode === "num"
        ? "Enter the matching alphabet"
        : "Enter the matching number";

    document.getElementById("message").textContent =
        "Game started!";

    getQuestion();

    timerInterval = setInterval(() => {

        seconds++;

        let minutes = Math.floor(seconds / 60);
        let remaining = seconds % 60;

        document.getElementById("timer").textContent =
            String(minutes).padStart(2, "0") + ":" +
            String(remaining).padStart(2, "0");

    }, 1000);
}


async function submitAnswer() {

    if (!gameRunning || submitting) return;

    const answer = document.getElementById("answer").value.trim();

    if (!answer) {
        document.getElementById("message").textContent =
            "Please enter your answer!";
        return;
    }

    submitting = true;

    try {

        const response = await fetch("/check-answer", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                number: currentNumber,
                answer: answer,
                mode: currentMode
            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to check answer");
        }

        if (data.correct) {

            score++;

            document.getElementById("message").textContent =
                "Correct answer!";

        } else {

            wrong++;

            document.getElementById("message").textContent =
                "Wrong answer! Moving to next question.";

        }

        document.getElementById("score").textContent = score;
        document.getElementById("wrong").textContent = wrong;

        await getQuestion();

    } catch (error) {

        document.getElementById("message").textContent =
            error.message;

    } finally {

        submitting = false;

    }
}


function finishGame() {

    if (!gameRunning) return;

    gameRunning = false;

    clearInterval(timerInterval);

    const total = score + wrong;

    const accuracy = total > 0
        ? ((score / total) * 100).toFixed(1)
        : "0.0";

    const modeName = currentMode === "num"
        ? "Number → Alphabet"
        : "Alphabet → Number";

    document.getElementById("answer").disabled = true;
    document.getElementById("gameMode").disabled = false;

    document.getElementById("submitBtn").hidden = true;
    document.getElementById("finishBtn").hidden = true;
    document.getElementById("startBtn").hidden = false;

    document.getElementById("number").textContent = "-";

    document.getElementById("finalResult").innerHTML = `
        <h2>Game Completed!</h2>
        <p>Mode: ${modeName}</p>
        <p>Correct Answers: ${score}</p>
        <p>Wrong Answers: ${wrong}</p>
        <p>Total Attempts: ${total}</p>
        <p>Accuracy: ${accuracy}%</p>
        <p>Time Taken: ${
            document.getElementById("timer").textContent
        }</p>
    `;

    document.getElementById("message").textContent =
        "Great job! Play again?";
}


document.getElementById("answer").addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {
            submitAnswer();
        }

    }
);

window.startGame = startGame;
window.submitAnswer = submitAnswer;
window.finishGame = finishGame;