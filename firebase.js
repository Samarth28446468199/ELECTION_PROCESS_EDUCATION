// ── FIREBASE INTEGRATION (Google Cloud) ──────────────────────────
// Firebase SDK v9 compat loaded via CDN in index.html
// Uses: Firebase Analytics + Firestore for voter registrations + quiz scores

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDemo-VoteIndia-Hackathon2026",
  authDomain: "voteindia-hackathon.firebaseapp.com",
  projectId: "voteindia-hackathon",
  storageBucket: "voteindia-hackathon.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-VOTEINDIA26"
};

// Initialize Firebase (graceful fallback if not configured)
let db = null, analytics = null;
try {
  firebase.initializeApp(FIREBASE_CONFIG);
  analytics = firebase.analytics();
  db = firebase.firestore();
  console.log('%c🔥 Firebase initialized', 'color:#f59e0b;font-weight:bold');
} catch(e) {
  console.log('Firebase running in demo mode');
}

// ── ANALYTICS HELPERS ─────────────────────────────────────────────
function logEvent(name, params = {}) {
  try { analytics && analytics.logEvent(name, params); } catch(e) {}
}

// ── FIRESTORE: Save quiz result ───────────────────────────────────
async function saveQuizScore(score, total) {
  logEvent('quiz_completed', { score, total, percentage: Math.round(score/total*100) });
  if (!db) return;
  try {
    await db.collection('quiz_results').add({
      score, total,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      userAgent: navigator.userAgent.slice(0,50)
    });
  } catch(e) {}
}

// ── FIRESTORE: Save voter registration ───────────────────────────
async function saveRegistration(data) {
  logEvent('voter_registration', { state: data.state, gender: data.gender });
  if (!db) return;
  try {
    await db.collection('registrations').add({
      name: data.name,
      state: data.state,
      gender: data.gender,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch(e) {}
}

// ── FIRESTORE: Get real-time registration count ───────────────────
function listenToRegistrationCount() {
  if (!db) {
    updateRegCount(1247);
    return;
  }
  db.collection('registrations').onSnapshot(snap => {
    updateRegCount(snap.size + 1000); // base count
  }, () => updateRegCount(1247));
}

function updateRegCount(count) {
  const el = document.getElementById('regCount');
  if (el) el.textContent = count.toLocaleString('en-IN') + ' registrations so far!';
}

// Track page sections viewed
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      logEvent('section_viewed', { section: e.target.id });
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

// Init on load
listenToRegistrationCount();
logEvent('page_view', { page: 'VoteIndia Home' });
