
let selectedMode = "num";
let currentMode = "num";

let currentNumber = 0;
let questionCount = 0;

let correct = 0;
let wrong = 0;
let seconds = 0;

let timerInterval = null;
let gameRunning = false;
let answered = false;
let loadingQuestion = false;


// PAGE CONTROL

function showPage(pageId) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.add("hidden");
    });

    document.getElementById(pageId).classList.remove("hidden");

    window.scrollTo(0, 0);
}


// WELCOME SCREEN

window.addEventListener("load", () => {

    setTimeout(() => {
        showPage("modePage");
    }, 2300);

});


// MODE SELECTION

document.querySelectorAll(".mode-card").forEach(card => {

    card.addEventListener("click", () => {

        document.querySelectorAll(".mode-card").forEach(item => {
            item.classList.remove("active");
        });

        card.classList.add("active");

        selectedMode = card.dataset.mode;

    });

});


// START GAME

document.getElementById("startGameBtn").addEventListener("click", async () => {

    correct = 0;
    wrong = 0;
    seconds = 0;
    questionCount = 0;

    gameRunning = true;
    answered = false;

    document.getElementById("correctCount").textContent = "0";
    document.getElementById("wrongCount").textContent = "0";
    document.getElementById("totalCount").textContent = "0";

    document.getElementById("timer").textContent = "00:00";

    document.getElementById("finishBtn").disabled = false;

    showPage("gamePage");

    await nextQuestion();

});


// TIMER

function startTimer() {

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {

        if (!gameRunning) return;

        seconds++;

        const minutes = Math.floor(seconds / 60);
        const remaining = seconds % 60;

        document.getElementById("timer").textContent =
            String(minutes).padStart(2, "0") + ":" +
            String(remaining).padStart(2, "0");

    }, 1000);

}


function pauseTimer() {

    clearInterval(timerInterval);

    timerInterval = null;

}


// GET NEXT QUESTION

async function nextQuestion() {

    if (!gameRunning || loadingQuestion) return;

    loadingQuestion = true;

    try {

        const response = await fetch(
            `/new-question?mode=${selectedMode}`
        );

        if (!response.ok) {
            throw new Error("Unable to load question");
        }

        const data = await response.json();

        currentNumber = data.number;
        currentMode = data.mode;

        questionCount++;

        answered = false;

        document.getElementById("question").textContent =
            data.question;

        document.getElementById("questionCount").textContent =
            "QUESTION " + String(questionCount).padStart(2, "0");

        document.getElementById("currentMode").textContent =
            currentMode === "num"
            ? "Number → Alphabet"
            : currentMode === "alpha"
            ? "Alphabet → Number"
            : "Mixed Challenge";

        document.getElementById("questionTitle").textContent =
            currentMode === "num"
            ? "What is the alphabet?"
            : "What is the number?";

        document.getElementById("questionHint").textContent =
            currentMode === "num"
            ? "Enter the matching alphabet"
            : "Enter the matching number";

        document.getElementById("answerInput").value = "";
        document.getElementById("answerInput").disabled = false;

        document.getElementById("checkBtn").disabled = false;
        document.getElementById("checkBtn").hidden = false;

        document.getElementById("feedback").className = "feedback hidden";
        document.getElementById("nextBtn").classList.add("hidden");

        updateScore();

        document.getElementById("answerInput").focus();

        startTimer();

    } catch (error) {

        alert(error.message);

        gameRunning = false;
        pauseTimer();

        showPage("modePage");

    } finally {

        loadingQuestion = false;

    }

}


// CHECK ANSWER

document.getElementById("answerForm").addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!gameRunning || answered || loadingQuestion) return;

    const answer = document.getElementById("answerInput").value.trim();

    if (!answer) return;

    pauseTimer();

    answered = true;

    document.getElementById("answerInput").disabled = true;
    document.getElementById("checkBtn").disabled = true;

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

        if (!response.ok) {
            throw new Error("Unable to check answer");
        }

        const data = await response.json();

        const feedback = document.getElementById("feedback");

        feedback.classList.remove("hidden");

        if (data.correct) {

            correct++;

            feedback.className = "feedback correct";

            feedback.textContent = "✓ Correct Answer! Excellent!";

        } else {

            wrong++;

            feedback.className = "feedback wrong";

            feedback.textContent =
                "✕ Wrong Answer! Correct answer is " + data.expected;

        }

        updateScore();

        document.getElementById("checkBtn").hidden = true;

        document.getElementById("nextBtn").classList.remove("hidden");

    } catch (error) {

        answered = false;

        document.getElementById("answerInput").disabled = false;
        document.getElementById("checkBtn").disabled = false;

        startTimer();

        alert(error.message);

    }

});


// NEXT QUESTION BUTTON

document.getElementById("nextBtn").addEventListener("click", async () => {

    if (!answered || loadingQuestion) return;

    await nextQuestion();

});


// SCORE UPDATE

function updateScore() {

    document.getElementById("correctCount").textContent = correct;

    document.getElementById("wrongCount").textContent = wrong;

    document.getElementById("totalCount").textContent =
        correct + wrong;

}


// FINISH GAME

document.getElementById("finishBtn").addEventListener("click", finishGame);


function finishGame() {

    if (!gameRunning) return;

    gameRunning = false;

    pauseTimer();

    const total = correct + wrong;

    const accuracy = total > 0
        ? Math.round((correct / total) * 100)
        : 0;

    const timeText = document.getElementById("timer").textContent;

    document.getElementById("accuracy").textContent =
        accuracy + "%";

    document.getElementById("finalCorrect").textContent = correct;

    document.getElementById("finalWrong").textContent = wrong;

    document.getElementById("finalTotal").textContent = total;

    document.getElementById("finalTime").textContent = timeText;

    document.getElementById("finalMode").textContent =
        "Selected Mode: " +
        (selectedMode === "num"
            ? "Number → Alphabet"
            : selectedMode === "alpha"
            ? "Alphabet → Number"
            : "Mixed Challenge");

    showPage("resultPage");

}


// PLAY AGAIN

document.getElementById("playAgainBtn").addEventListener("click", () => {

    showPage("modePage");

});


// BACK HOME

document.getElementById("homeBtn").addEventListener("click", () => {

    window.location.reload();

});
