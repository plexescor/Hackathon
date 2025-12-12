// DOM refs
const totalQuizzesSpan = document.getElementById("totalQuizzes");
const perfectQuizzesSpan = document.getElementById("perfectQuizzes");
const totalQuestionsSpan = document.getElementById("totalQuestions");

const startQuizBtns = document.querySelectorAll(".startQuizBtn");
const marketBtn = document.getElementById("marketBtn");
const dashboardBtn = document.getElementById("dashboardBtn");


// User stats
let userStats = {
    totalQuizzes: 0,
    perfectQuizzes: 0,
    totalQuestions: 0
};

// ------------------------------
// Render Stats
// ------------------------------
function renderStats() {
    totalQuizzesSpan.textContent = userStats.totalQuizzes;
    perfectQuizzesSpan.textContent = userStats.perfectQuizzes;
    totalQuestionsSpan.textContent = userStats.totalQuestions;
}

// ------------------------------
// Firebase Auth Guard + Load Stats
// ------------------------------
auth.onAuthStateChanged(async (user) => {
    if (!user) return window.location.href = "login.html";

    const uid = user.uid;

    db.collection("users")
      .doc(uid)
      .collection("quiz_history")
      .onSnapshot(snapshot => {

        // Reset stats before adding
        userStats.totalQuizzes = 0;
        userStats.perfectQuizzes = 0;
        userStats.totalQuestions = 0;

        // Track completed quizzes
        const completed = new Set();

        snapshot.forEach(doc => {
            const quiz = doc.data();
            completed.add(quiz.quizId);

            userStats.totalQuizzes += 1;
            userStats.totalQuestions += quiz.totalQuestions;

            if (quiz.scorePercent === 100) {
                userStats.perfectQuizzes += 1;
            }
        });

        // Mark completed quiz cards
        document.querySelectorAll(".quiz-card").forEach(card => {
            const quizId = card.dataset.quiz;

            if (completed.has(quizId)) {
            const btn = card.querySelector(".startQuizBtn");
            btn.remove(); // remove the start button completely

            const tag = document.createElement("div");
            tag.className = "completed-tag";
            tag.textContent = "✔ Completed";
            tag.style.color = "#4caf50";
            tag.style.fontWeight = "bold";
            tag.style.marginTop = "10px";

            card.appendChild(tag);
        }
        });

        renderStats();
    });
});

// ------------------------------
// Start Quiz Button
// ------------------------------
startQuizBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        const quizCard = e.target.closest(".quiz-card");
        const quizId = quizCard.dataset.quiz;
        window.location.href = `${quizId}.html`;
    });
});

// ------------------------------
// Marketplace
// ------------------------------
marketBtn?.addEventListener("click", () => {
    window.location.href = "marketplace.html";
});

// ------------------------------
// Dashboard Button
// ------------------------------
dashboardBtn?.addEventListener("click", () => {
    window.location.href = "dashboard.html"; // or whatever your dashboard page is
});

// Initial UI render
renderStats();
