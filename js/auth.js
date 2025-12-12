// SIGNUP
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("signupName").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value;

        try {
            // Create account
            const res = await auth.createUserWithEmailAndPassword(email, password);
            const user = res.user;

            // Save user data in Firestore
            await db.collection("users").doc(user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            alert("Account created!");
            window.location.href = "marketplace.html"; // redirect
        } catch (error) {
            alert(error.message);
        }
    });
}
// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        try {
            await auth.signInWithEmailAndPassword(email, password);

            alert("Logged in!");
            window.location.href = "marketplace.html"; // redirect
        } catch (error) {
            alert(error.message);
        }
    });
}
// LOGOUT
const logoutButton = document.getElementById("logoutBtn");

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            await auth.signOut();
            alert("Logged out!");
            window.location.href = "login.html"; // redirect to login
        } catch (error) {
            alert(error.message);
        }
    });
}
//UNABLE TO ACCESS MARKET PLACE OR DASHBOARD IF NOT !user
// Protect pages
const protectedPages = ["marketplace.html", "dashboard.html", "quiz.html"];
const currentPage = window.location.pathname.split("/").pop();

auth.onAuthStateChanged(user => {
    if (protectedPages.includes(currentPage)) {
        // Protected pages → must be logged in
        if (!user) {
            window.location.href = "login.html";
        }
    } else if (currentPage === "login.html" || currentPage === "signup.html") {
        // Login/Signup pages → redirect logged-in users
        if (user) {
            window.location.href = "marketplace.html";
        }
    }
});
