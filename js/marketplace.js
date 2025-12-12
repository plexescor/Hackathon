//DOM refs
const matchList = document.getElementById("matchList");
const addMatchForm = document.getElementById("addMatchForm");
const logoutBtn = document.getElementById("logoutBtn");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const playersContainer = document.getElementById("playersContainer");
const dashboardBtn = document.getElementById("dashboardBtn");
const quizBtn = document.getElementById("quizBtn");


// --- Navigate to dashboard ---
dashboardBtn?.addEventListener("click", () => {
    window.location.href = "dashboard.html";
});

// Navigate to quiz page
quizBtn?.addEventListener("click", () => {
    window.location.href = "quiz.html";
});

// --- Logout ---
logoutBtn?.addEventListener("click", () => {
    auth.signOut()
        .then(() => window.location.href = "login.html")
        .catch(err => alert("Error logging out: " + err.message));
});

// --- Add new player row dynamically ---
addPlayerBtn?.addEventListener("click", () => {
    const row = document.createElement("div");
    row.className = "player-row";
    row.innerHTML = `
        <input type="text" placeholder="Player Name" class="playerName" />
        <input type="number" placeholder="Age" min="1" class="playerAge" />
        <input type="number" placeholder="Skill %" min="0" max="100" class="playerSkill" />
        <button type="button" class="btn-small removePlayerBtn">x</button>
    `;
    playersContainer.appendChild(row);

    //Remove the player
    row.querySelector(".removePlayerBtn").addEventListener("click", () => row.remove());
});

// --- Auth guard & main logic ---
auth.onAuthStateChanged(user => {
    //if not logged in, redirect to login
    if (!user) return window.location.href = "login.html";

    loadMatches(); //load matches for marketplace

    // --- Handle add match form submission ---
    addMatchForm?.addEventListener("submit", async e => {
        e.preventDefault();

        const sport = document.getElementById("matchSport")?.value.trim();
        const date = document.getElementById("matchDate")?.value;
        const time = document.getElementById("matchTime")?.value;
        const venue = document.getElementById("matchVenue")?.value.trim();
        // Basic validation
        if (!sport || !date || !time || !venue) return alert("Please fill all match fields!");

        try {
            // Add match
            const docRef = await db.collection("match_requests").add({
                sport, date, time, venue,
                createdByUID: auth.currentUser.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: "open"
            });

            // Add all players
            const playerRows = document.querySelectorAll(".player-row");
            for (const row of playerRows) {
                const name = row.querySelector(".playerName").value.trim();
                const age = Number(row.querySelector(".playerAge").value) || null;
                const skill = Number(row.querySelector(".playerSkill").value) || 0;

                // Only add if name is provided
                if (name) {
                    await db.collection("match_requests")
                        .doc(docRef.id)
                        .collection("players")
                        .add({ name, age, skill });
                }
            }
            // Reset form
            addMatchForm.reset();
            playersContainer.innerHTML = `<div class="player-row">
                <input type="text" placeholder="Player Name" class="playerName" />
                <input type="number" placeholder="Age" min="1" class="playerAge" />
                <input type="number" placeholder="Skill %" min="0" max="100" class="playerSkill" />
            </div>`;
            alert("Match request with players added!");
        } catch (err) { //Catch errors
            console.error("Error adding match:", err);
            alert("Error: " + err.message);
        }
    });
});

// --- Load matches & players ---
function loadMatches() {
    db.collection("match_requests")
        .orderBy("createdAt", "desc")
        .onSnapshot(snapshot => {
            matchList.innerHTML = "";
            // No matches
            if (snapshot.empty) {
                matchList.innerHTML = "<p>No open matches yet.</p>";
                return;
            }

            // Render each match
            snapshot.forEach(async doc => {
                const data = doc.data();
                if (data.status !== "open") return;

                const card = document.createElement("div");
                card.className = "match-card";
                card.innerHTML = `
                    <p><strong>Sport:</strong> ${data.sport}</p>
                    <p><strong>Date:</strong> ${data.date}</p>
                    <p><strong>Time:</strong> ${data.time}</p>
                    <p><strong>Venue:</strong> ${data.venue}</p>
                    <button class="btn-accept">Accept</button>
                    <button class="btn-view-players">View Players</button>
                    <div class="player-list" style="display:none; margin-top:5px;"></div>
                `;

                // Accept with storing under user and redirect
                card.querySelector(".btn-accept").addEventListener("click", async () => {
                    if (!auth.currentUser) return alert("Login first!");
                    try {
                        // Update match status
                        await db.collection("match_requests").doc(doc.id).update({
                            status: "accepted",
                            acceptedByUID: auth.currentUser.uid,
                            acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });

                        // Fetch players of this match
                        const playersSnap = await db.collection("match_requests")
                            .doc(doc.id)
                            .collection("players")
                            .get();

                        const players = [];
                        playersSnap.forEach(pDoc => {
                            players.push(pDoc.data());
                        });

                        // Store accepted match info under current user
                        await db.collection("users")
                            .doc(auth.currentUser.uid)
                            .collection("accepted_matches")
                            .doc(doc.id)
                            .set({
                                ...data,
                                acceptedAt: firebase.firestore.FieldValue.serverTimestamp(),
                                players: players
                            });

                        // Redirect after storing
                        window.location.href = "dashboard.html";
                    } catch (err) {
                        console.error("Error accepting match:", err);
                        alert("Error: " + err.message);
                    }
                });

                // View players
                const btnView = card.querySelector(".btn-view-players");
                const playerListDiv = card.querySelector(".player-list");

                // Toggle player list display & load players
                btnView.addEventListener("click", async () => {
                    if (playerListDiv.style.display === "block") {
                        playerListDiv.style.display = "none";
                        return;
                    }
                    playerListDiv.style.display = "block";
                    playerListDiv.innerHTML = "Loading players...";

                    // Fetch players
                    const playersSnap = await db.collection("match_requests")
                        .doc(doc.id)
                        .collection("players")
                        .get();
                    // No players
                    if (playersSnap.empty) {
                        playerListDiv.innerHTML = "<p>No players added yet.</p>";
                    } else {
                        playerListDiv.innerHTML = "";
                        playersSnap.forEach(playerDoc => {
                            const p = playerDoc.data();
                            const div = document.createElement("div");
                            div.textContent = `${p.name} | Age: ${p.age || "-"} | Skill: ${p.skill || 0}%`;
                            playerListDiv.appendChild(div);
                        });
                    }
                });
                // Append match card
                matchList.appendChild(card);
            });
        });
}
