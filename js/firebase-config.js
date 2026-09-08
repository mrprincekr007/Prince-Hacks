// Prince Hacks Store - Firebase Setup (tumhara config - change mat karna)
const firebaseConfig = {
  apiKey: "AIzaSyD9hHDcTFh0a-3eSsXJ-sdD4_U78bsagYA",
  authDomain: "prince-hacks-test.firebaseapp.com",
  databaseURL: "https://prince-hacks-test-default-rtdb.firebaseio.com",
  projectId: "prince-hacks-test",
  storageBucket: "prince-hacks-test.firebasestorage.app",
  messagingSenderId: "1070897490445",
  appId: "1:1070897490445:web:17b1cb1461fd76bb888344",
  measurementId: "G-8HF61FHCWN"
};

// Firebase start karo (compat version - simple, lifetime chalega)
let db = null;
try {
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  db = firebase.database();
  try { firebase.analytics(); } catch(e) {}
  console.log("Firebase Connected ✅");
} catch(e) {
  console.log("Firebase offline, local mode chalega:", e.message);
}
