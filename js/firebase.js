const firebaseConfig = {
    apiKey: "AIzaSyCCrYIPcm8Xdh1Ior7gJ9mAtTPSCWmfw3o",
    authDomain: "hackathon-1e5db.firebaseapp.com",
    projectId: "hackathon-1e5db",
    storageBucket: "hackathon-1e5db.firebasestorage.app",
    messagingSenderId: "503999748840",
    appId: "1:503999748840:web:91e150913d21bacfeac75d"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
