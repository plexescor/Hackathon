const acceptedMatchesDiv = document.getElementById("acceptedMatches");
const pendingCountSpan = document.getElementById("pendingCount");
const wonCountSpan = document.getElementById("wonCount");
const lostCountSpan = document.getElementById("lostCount");
const drawCountSpan = document.getElementById("drawCount");

// Auth guard
auth.onAuthStateChanged(user => {
    if (!user) return window.location.href = "login.html";

    loadAcceptedMatches(user.uid);
});

function loadAcceptedMatches(uid) {
    db.collection("users")
      .doc(uid)
      .collection("accepted_matches")
      .orderBy("acceptedAt", "desc")
      .onSnapshot(snapshot => {
          acceptedMatchesDiv.innerHTML = "";

          let pending = 0, won = 0, lost = 0, draw = 0;

          snapshot.forEach(doc => {
              const match = doc.data();
              const result = match.result || "pending";
              const updatedAt = match.resultUpdatedAt ? match.resultUpdatedAt.toDate() : null;

              // Update counts
              if (result === "pending") pending++;
              else if (result === "win") won++;
              else if (result === "lost") lost++;
              else if (result === "draw") draw++;

              // Create match card
              const card = document.createElement("div");
              card.style.border = "1px solid #000";
              card.style.padding = "10px";
              card.style.marginBottom = "10px";

              let playersList = "";
              if (match.players && match.players.length > 0) {
                  playersList = match.players.map(p => `${p.name} | Age: ${p.age || "-"} | Skill: ${p.skill || 0}%`).join("<br>");
              }

              card.innerHTML = `
                  <p><strong>Sport:</strong> ${match.sport}</p>
                  <p><strong>Date:</strong> ${match.date}</p>
                  <p><strong>Time:</strong> ${match.time}</p>
                  <p><strong>Venue:</strong> ${match.venue}</p>
                  <p><strong>Players:</strong><br>${playersList || "No players"}</p>
                  <label>Set Result:
                      <select class="resultSelect">
                          <option value="pending" ${result==="pending"?"selected":""}>Pending</option>
                          <option value="win" ${result==="win"?"selected":""}>Win</option>
                          <option value="lost" ${result==="lost"?"selected":""}>Lost</option>
                          <option value="draw" ${result==="draw"?"selected":""}>Draw</option>
                      </select>
                  </label>
                  ${updatedAt ? `<p><small>Result updated at: ${updatedAt.toLocaleString()}</small></p>` : ""}
              `;

              // Handle result change
              const select = card.querySelector(".resultSelect");
              select.addEventListener("change", async () => {
                  const newResult = select.value;
                  try {
                      await db.collection("users")
                              .doc(uid)
                              .collection("accepted_matches")
                              .doc(doc.id)
                              .update({ 
                                  result: newResult,
                                  resultUpdatedAt: firebase.firestore.FieldValue.serverTimestamp() 
                              });

                      loadAcceptedMatches(uid); // refresh counts
                  } catch (err) {
                      console.error("Error updating result:", err);
                      alert("Failed to update result");
                  }
              });

              acceptedMatchesDiv.appendChild(card);
          });

          // Update ribbon
          pendingCountSpan.textContent = `Pending: ${pending}`;
          wonCountSpan.textContent = `Won: ${won}`;
          lostCountSpan.textContent = `Lost: ${lost}`;
          drawCountSpan.textContent = `Draw: ${draw}`;
      });
}

document.getElementById("marketplaceBtn").addEventListener("click", () => {
    window.location.href = "marketplace.html";
});
