// QUESTIONS - strictly official sports rules
const questions = [
  {
    question: "How many players are there in a cricket team on the field?",
    options: ["11", "10", "12", "9"],
    correct: "11"
  },
  {
    question: "In chess, how many squares are there on the board?",
    options: ["64", "72", "81", "100"],
    correct: "64"
  },
  {
    question: "How many players are on the field in a standard football (soccer) team?",
    options: ["10", "11", "12", "9"],
    correct: "11"
  },
  {
    question: "In volleyball, which player is mainly responsible for receiving attacks?",
    options: ["Libero", "Setter", "Attacker", "Receiver"],
    correct: "Libero"
  },
  {
    question: "Can you castle in chess if your king is in check?",
    options: ["Yes", "No", "Sometimes", "Only with rook"],
    correct: "No"
  },
  {
    question: "How many players are there in a Kho-Kho team on the field?",
    options: ["7", "8", "9", "11"],
    correct: "9"
  },
  {
    question: "In badminton, how many columns (court divisions) are there for singles play?",
    options: ["1", "2", "3", "4"],
    correct: "2"
  },
  {
    question: "In basketball, is it allowed to touch a player in the restricted area?",
    options: ["Yes, but not always", "No, never", "Always yes", "Depends on referee"],
    correct: "Yes, but not always"
  },
  {
    question: "How long is a standard football (soccer) match duration?",
    options: ["90 minutes", "80 minutes", "100 minutes", "60 minutes"],
    correct: "90 minutes"
  },
  {
    question: "In cricket, how many overs are there in a T20 match?",
    options: ["20", "10", "50", "15"],
    correct: "20"
  },
  {
    question: "How many sets must a player win to win a Grand Slam tennis match (men's singles)?",
    options: ["3", "2", "5", "4"],
    correct: "3"
  },
  {
    question: "In hockey, how many players are on the field per team excluding the goalkeeper?",
    options: ["10", "11", "9", "12"],
    correct: "10"
  },
  {
    question: "In football (soccer), what happens when a player commits a direct free kick foul inside their own penalty area?",
    options: ["Corner kick", "Penalty kick", "Indirect free kick", "Throw-in"],
    correct: "Penalty kick"
  },
  {
    question: "In volleyball, how many touches per team are allowed before sending the ball over the net?",
    options: ["3", "2", "4", "5"],
    correct: "3"
  },
  {
    question: "In basketball, how many points is a shot made from beyond the three-point line worth?",
    options: ["2", "3", "1", "4"],
    correct: "3"
  }
];

// ---------------------------
// DOM references
// ---------------------------
const quizContainer = document.getElementById("quizContainer");
const submitBtn = document.getElementById("submitQuizBtn");
const backBtn = document.getElementById("backBtn");

// ---------------------------
// Render quiz UI
// ---------------------------
function loadQuizUI() {
  quizContainer.innerHTML = ""; // clear

  // Render each question block
  questions.forEach((q, idx) => {
    const block = document.createElement("div");
    block.className = "question-block";
    block.style.marginBottom = "16px";
    block.style.padding = "8px";
    block.style.border = "1px solid #ddd";

    // Question text
    const qTitle = document.createElement("p");
    qTitle.innerHTML = `<strong>Q${idx + 1}:</strong> ${q.question}`;
    block.appendChild(qTitle);

    // Options
    q.options.forEach(opt => {
      const label = document.createElement("label");
      label.style.display = "block";
      label.style.cursor = "pointer";
      label.style.margin = "4px 0";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q${idx}`;
      input.value = opt;
      input.style.marginRight = "8px";

      label.appendChild(input);
      label.appendChild(document.createTextNode(opt));
      block.appendChild(label);
    });

    quizContainer.appendChild(block);
  });
}

// ---------------------------
// Submit handler
// ---------------------------
submitBtn.addEventListener("click", async () => {
  if (!auth.currentUser) return alert("You must be logged in to submit the quiz.");

  const responses = [];
  let correctCount = 0;

  questions.forEach((q, idx) => {
    const selected = document.querySelector(`input[name="q${idx}"]:checked`);
    const userAnswer = selected ? selected.value : null;
    const isCorrect = userAnswer !== null && userAnswer === q.correct;

    if (isCorrect) correctCount++;

    responses.push({
      question: q.question,
      userAnswer: userAnswer,
      correctAnswer: q.correct,
      isCorrect: isCorrect
    });
  });

  const totalQuestions = questions.length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  const payload = {
    quizId: "quiz1",
    totalQuestions: totalQuestions,
    correct: correctCount,
    scorePercent: scorePercent,
    responses: responses,
    completedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection("users")
      .doc(auth.currentUser.uid)
      .collection("quiz_history")
      .add(payload);

    alert(`Quiz submitted! Your score: ${scorePercent}% (${correctCount}/${totalQuestions})`);
    window.location.href = "quiz.html";
  } catch (err) {
    console.error("Error saving quiz result:", err);
    alert("Failed to save quiz result. Check console.");
  }
});

// Back button
backBtn.addEventListener("click", () => {
  window.location.href = "quiz.html";
});

// initial render
loadQuizUI();
