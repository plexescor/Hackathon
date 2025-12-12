// Get DOM elements
const totalQuizzesSpan = document.getElementById("totalQuizzes");
const perfectQuizzesSpan = document.getElementById("perfectQuizzes");
const totalQuestionsSpan = document.getElementById("totalQuestions");

const startQuizBtns = document.querySelectorAll(".startQuizBtn");
const marketBtn = document.getElementById("marketBtn");
const dashboardBtn = document.getElementById("dashboardBtn");

// Placeholder data for now
let userStats = {
    totalQuizzes: 0,
    perfectQuizzes: 0,
    totalQuestions: 0
};

// --- Render stats ---
function renderStats() {
    totalQuizzesSpan.textContent = userStats.totalQuizzes;
    perfectQuizzesSpan.textContent = userStats.perfectQuizzes;
    totalQuestionsSpan.textContent = userStats.totalQuestions;
}

// --- Start Quiz Button ---
startQuizBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        const quizCard = e.target.closest(".quiz-card");
        const quizId = quizCard.dataset.quiz;

        // Redirect to quiz page (currently only quiz1.html)
        window.location.href = `${quizId}.html`;
    });
});

// --- Logout ---
marketBtn?.addEventListener("click", () => {
    window.location.href = "marketplace.html";
});

// --- Dashboard button ---

// --- Initial render ---
renderStats();
