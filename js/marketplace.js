const matchList = document.getElementById("matchList");
const addMatchForm = document.getElementById("addMatchForm");
const logoutBtn = document.getElementById("logoutBtn");

// --- Logout ---
logoutBtn?.addEventListener("click", () => {
    console.log("[LOGOUT] Logout button clicked");
    auth.signOut()
        .then(() => {
            console.log("[LOGOUT] Successfully signed out");
            window.location.href = "login.html";
        })
        .catch(err => {
            console.error("[LOGOUT] Error signing out:", err);
            alert("Error logging out: " + err.message);
        });
});

// --- Auth guard and main logic ---
auth.onAuthStateChanged(user => {
    console.log("[AUTH] Auth state changed:", user);
    if (!user) {
        console.warn("[AUTH] No user logged in, redirecting to login.html");
        window.location.href = "login.html";
        return;
    }

    console.log("[AUTH] User logged in:", user.uid, user.email);

    // Load matches
    loadMatches();

    // Add new match
    addMatchForm?.addEventListener("submit", async e => {
        e.preventDefault(); // STOP page reload
        console.log("[ADD MATCH] Form submitted");

        const sport = document.getElementById("matchSport")?.value.trim();
        const date = document.getElementById("matchDate")?.value;
        const time = document.getElementById("matchTime")?.value;
        const venue = document.getElementById("matchVenue")?.value.trim();

        if (!sport || !date || !time || !venue) {
            console.warn("[ADD MATCH] Missing form values", { sport, date, time, venue });
            alert("Please fill in all fields!");
            return;
        }

        console.log("[ADD MATCH] Values:", { sport, date, time, venue, user: user.uid });

        try {
            const docRef = await db.collection("match_requests").add({
                sport,
                date,
                time,
                venue,
                createdByUID: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: "open"
            });
            console.log("[ADD MATCH] Document added with ID:", docRef.id);
            addMatchForm.reset();
            alert("Match request added!");
        } catch (err) {
            console.error("[ADD MATCH] Error adding match:", err);
            alert("Error adding match: " + err.message);
        }
    });
});

// --- Load matches from Firestore ---
function loadMatches() {
    console.log("[LOAD MATCHES] Initializing match listener...");

    db.collection("match_requests")
        .orderBy("createdAt", "desc")
        .onSnapshot(snapshot => {
            console.log("[LOAD MATCHES] Snapshot received:", snapshot.size, "documents");
            matchList.innerHTML = ""; // clear

            if (snapshot.empty) {
                console.log("[LOAD MATCHES] No open matches found");
                matchList.innerHTML = "<p>No open matches yet.</p>";
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();
                console.log("[LOAD MATCHES] Processing doc:", doc.id, data);

                if (data.status === "open") {
                    const card = document.createElement("div");
                    card.className = "match-card";
                    card.innerHTML = `
                        <p><strong>Sport:</strong> ${data.sport}</p>
                        <p><strong>Date:</strong> ${data.date}</p>
                        <p><strong>Time:</strong> ${data.time}</p>
                        <p><strong>Venue:</strong> ${data.venue}</p>
                        <button class="btn-accept">Accept</button>
                    `;

                    const btn = card.querySelector(".btn-accept");
                    btn?.addEventListener("click", async () => {
                        console.log("[ACCEPT MATCH] Accept button clicked for doc:", doc.id);

                        if (!auth.currentUser) {
                            console.warn("[ACCEPT MATCH] No current user logged in!");
                            alert("You must be logged in to accept matches!");
                            return;
                        }

                        try {
                            await db.collection("match_requests").doc(doc.id).update({
                                status: "accepted",
                                acceptedByUID: auth.currentUser.uid,
                                acceptedAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                            console.log("[ACCEPT MATCH] Match accepted:", doc.id);
                            alert("Match accepted!");
                        } catch (err) {
                            console.error("[ACCEPT MATCH] Error accepting match:", err);
                            alert("Error accepting match: " + err.message);
                        }
                    });

                    matchList.appendChild(card);
                }
            });
        }, err => {
            console.error("[LOAD MATCHES] Snapshot listener error:", err);
            matchList.innerHTML = "<p>Error loading matches. Check console.</p>";
        });
}

// --- Debugging helper ---
console.log("[DEBUG] marketplace.js loaded, waiting for auth state change...");
firebase.firestore.setLogLevel('debug');
