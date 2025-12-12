// QUESTIONS
const questions = [
  {
    question: "How many players are there in cricket?",
    options: ["24", "11.5", "15", "11"],
    correct: "11"                // d
  },
  {
    question: "Identify the Indian Chess Player",
    options: ["Praggnananda", "D. Gukesh", "Both a and b", "Magnus Carlson"],
    correct: "Both a and b"      // c
  },
  {
    question: "Largest sportsperson producing state in India",
    options: ["Haryana", "Uttar Pradesh", "Rajasthan", "Maharashtra"],
    correct: "Haryana"           // a )
  },
  {
    question: "Who is know as GOAT of Football",
    options: ["Ronaldo", "Messi", "Neymar", "Japneet Singh Kohli"],
    correct: "Messi"             // b
  },
  {
    question: "Can we castle after getting a check",
    options: ["Yes", "No", "Not Always", "None of the above"],
    correct: "No"                // b 
  },
  {
    question: "In volleyball What we call the player who mainly receives the ball",
    options: ["Receiver", "Libero", "Attacker", "Setter"],
    correct: "Libero"            // b
  },
  {
    question: "How many columns are there in badminton court",
    options: ["2000 units", "1500 units", "3000 units", "1000 units"],
    correct: "1000 units"        // d 
  },
  {
    question: "How many players are there in Kho-Kho",
    options: ["7", "8", "11", "9"],
    correct: "9"                 // d
  },
  {
    question: "Is it necessary to not to touch a player in red column after section D. [Hint basketball related]",
    options: ["Yes, but not always", "No, but not always", "Both a and b", "Yes, and always"],
    correct: "Yes, but not always" // a)
  },
  {
    question: "Which AI application in sports helps predict potential injuries or fracture game outcomes by analyzing historical data?",
    options: ["Expert Systems", "Predictive modelling/Analytics", "Generative AI", "Robotics"],
    correct: "Predictive modelling/Analytics" // b
  },
  {
    question: "Where was the world’s tennis tournament is last held",
    options: ["Italy", "Norway", "Australia", "Wimbledon"],
    correct: "Italy" // a
  },
  {
    question: "Which of the followings in an Indian sports",
    options: ["Poles", "Base Ball", "Cricket", "Chess"],
    correct: "Cricket"           // c
  },
  {
    question: "Which AI technology is commonly used to track player movements and ball trajectories in real time during a match.",
    options: ["NLP", "Computer Vision", "ML", "Expert Systems"],
    correct: "Computer Vision"   // b
  },
  {
    question: "Why do teams switch from a high press to a mid-block when facing a goalkeeper who is good at long–range distribution?",
    options: [
      "To avoid getting bypassed by long balls and losing defensive shape",
      "Because mid-block increases the number of offsides",
      "To force more throw-ins near the touchline",
      "Because high pressing is banned when the keeper steps outside the box"
    ],
    correct: "To avoid getting bypassed by long balls and losing defensive shape" // a
  },
  {
    question: "Why do captains often use a slip fielder early in the innings but remove slips during middle overs in ODIs/T20s?",
    options: [
      "Because the ball swings less later and batsmen start playing straighter",
      "Because field restrictions don’t allow slips after 10 overs",
      "Because slips get tired quickly",
      "Because umpires don’t allow close-in fielders after the powerplay"
    ],
    correct: "Because the ball swings less later and batsmen start playing straighter" // a
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
    //Radio so only one can be selected
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
// Submit handler - compute score & save to Firestore
// ---------------------------
submitBtn.addEventListener("click", async () => {
  // Ensure user logged in
  if (!auth.currentUser) return alert("You must be logged in to submit the quiz.");

  // Build responses, count correct
  const responses = [];
  let correctCount = 0;

  questions.forEach((q, idx) => {
    const selected = document.querySelector(`input[name="q${idx}"]:checked`);
    const userAnswer = selected ? selected.value : null;
    const isCorrect = userAnswer !== null && userAnswer === q.correct;

    if (isCorrect) correctCount++;

    //Push the responses
    responses.push({
      question: q.question,
      userAnswer: userAnswer,
      correctAnswer: q.correct,
      isCorrect: isCorrect
    });
  });

  // Calculate score %
  const totalQuestions = questions.length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  // Prepare payload to store in firebase
  const payload = {
    quizId: "quiz1",
    totalQuestions: totalQuestions,
    correct: correctCount,
    scorePercent: scorePercent,
    responses: responses,
    completedAt: firebase.firestore.FieldValue.serverTimestamp()
};

  // Save to Firestore under users/{uid}/quiz_history
  try {
    await db.collection("users")
      .doc(auth.currentUser.uid)
      .collection("quiz_history")
      .add(payload);

    alert(`Quiz submitted! Your score: ${scorePercent}% (${correctCount}/${totalQuestions})`);
    // redirect back to quiz dashboard
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
