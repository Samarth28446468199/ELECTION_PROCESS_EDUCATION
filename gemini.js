// ══════════════════════════════════════════════════════════════════
// VoteIndia — Gemini AI Integration (Google AI/ML API)
// Uses: Google Gemini 1.5 Flash API for election Q&A
// ══════════════════════════════════════════════════════════════════

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
// Demo key — replace with real key from https://aistudio.google.com/app/apikey
const GEMINI_API_KEY = 'AIzaSyDemo_VoteIndia_Hackathon_2026_Key';

const ELECTION_CONTEXT = `You are VoteBot, an expert AI assistant on Indian Elections integrated into the VoteIndia educational platform. 
Answer ONLY about Indian elections, democracy, voting process, ECI, EVMs, political parties, constitution, voter rights, and related civic topics.
Keep answers concise (3-4 sentences max), factual, and educational. 
If asked about anything unrelated to Indian elections/democracy, politely redirect.
Always mention relevant ECI guidelines or constitutional articles when applicable.
Respond in a friendly, encouraging tone to promote civic participation.`;

const DEMO_RESPONSES = {
  default: [
    "India's elections are conducted by the **Election Commission of India (ECI)**, established under **Article 324** of the Constitution. It ensures free and fair elections across all 543 Lok Sabha constituencies. The ECI is fully autonomous from the government.",
    "An **Electronic Voting Machine (EVM)** is a standalone device not connected to any network, making it tamper-proof. After voting, the **VVPAT** displays a paper slip for 7 seconds confirming your choice. EVMs replaced paper ballots in all Indian elections since 2004.",
    "To register as a voter in India, you must be **18+ years old**, an Indian citizen, and not disqualified by any law. Fill **Form 6** on the NVSP portal (voters.eci.gov.in) or visit your local **Electoral Registration Officer (ERO)**. You'll receive your EPIC (Voter ID) card.",
    "The **Model Code of Conduct (MCC)** comes into effect the moment elections are announced. It prevents the ruling government from making policy decisions that could influence voters. Any violation can be reported to the ECI directly.",
    "India conducts **Lok Sabha elections every 5 years** for 543 seats. A party needs **272+ seats** (simple majority) to form the government. The largest party or coalition is invited by the President to form the government.",
  ],
  evm: "An **EVM (Electronic Voting Machine)** has two units: the **Control Unit** (with polling officer) and the **Balloting Unit** (with voters). It runs on a 6V alkaline battery, can store 2,000 votes, and is standalone — never connected to any network. The **VVPAT** provides a paper trail for verification.",
  vote: "To vote in India: 1) Verify your name in the electoral roll 2) Go to your assigned booth with ID proof 3) Get your finger inked 4) Press the EVM button next to your candidate. The whole process takes under 10 minutes!",
  register: "Register to vote via **Form 6** on voters.eci.gov.in. You need: proof of age (birth certificate/school certificate), proof of address, and a passport photo. The deadline is typically 7-10 days before election announcement. You can also self-nominate at ERO offices.",
  nota: "**NOTA (None of the Above)** was introduced in 2013 by Supreme Court order. In Lok Sabha elections, NOTA has no electoral impact — the candidate with most votes wins even if NOTA leads. However, it's a powerful democratic protest signal and the ECI tracks NOTA statistics.",
};

let chatHistory = [];
let isTyping = false;

/**
 * Send message to Gemini API with election context
 * @param {string} userMessage - User's question
 * @returns {Promise<string>} AI response
 */
async function askGemini(userMessage) {
  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: ELECTION_CONTEXT + '\n\nUser question: ' + userMessage }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 300,
      topP: 0.9,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ]
  };

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || getDemoResponse(userMessage);
  } catch (err) {
    console.log('Gemini API fallback (demo mode):', err.message);
    return getDemoResponse(userMessage);
  }
}

/**
 * Get contextual demo response when API is unavailable
 * @param {string} msg - User message
 * @returns {string} Demo response
 */
function getDemoResponse(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes('evm') || lower.includes('machine')) return DEMO_RESPONSES.evm;
  if (lower.includes('vote') || lower.includes('voting') || lower.includes('booth')) return DEMO_RESPONSES.vote;
  if (lower.includes('register') || lower.includes('enroll') || lower.includes('form 6')) return DEMO_RESPONSES.register;
  if (lower.includes('nota') || lower.includes('none')) return DEMO_RESPONSES.nota;
  return DEMO_RESPONSES.default[Math.floor(Math.random() * DEMO_RESPONSES.default.length)];
}

/**
 * Add message bubble to chat UI
 * @param {string} text - Message content
 * @param {'user'|'bot'} role - Who sent it
 */
function addChatMessage(text, role) {
  const chatBox = document.getElementById('chatMessages');
  if (!chatBox) return;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${role}`;
  bubble.setAttribute('role', 'listitem');
  // Convert **bold** markdown
  const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  bubble.innerHTML = `
    <div class="bubble-avatar">${role === 'bot' ? '🤖' : '👤'}</div>
    <div class="bubble-text" aria-label="${role === 'bot' ? 'VoteBot' : 'You'}: ${text.slice(0,50)}">${formatted}</div>`;
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
  chatHistory.push({ role, text });

  // Log to GA
  if (typeof logGAEvent === 'function') logGAEvent('chat_message', { role, length: text.length });
}

function showTyping() {
  const chatBox = document.getElementById('chatMessages');
  if (!chatBox) return;
  const el = document.createElement('div');
  el.className = 'chat-bubble bot typing-indicator';
  el.id = 'typingDots';
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-label', 'VoteBot is typing');
  el.innerHTML = '<div class="bubble-avatar">🤖</div><div class="bubble-text"><span></span><span></span><span></span></div>';
  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTyping() {
  document.getElementById('typingDots')?.remove();
}

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  if (!input || isTyping) return;
  const msg = input.value.trim();
  if (!msg) return;

  // Sanitize input
  const sanitized = msg.replace(/[<>]/g, '').slice(0, 500);
  input.value = '';
  isTyping = true;
  document.getElementById('chatSendBtn').disabled = true;

  addChatMessage(sanitized, 'user');
  showTyping();

  try {
    const reply = await askGemini(sanitized);
    hideTyping();
    addChatMessage(reply, 'bot');
  } catch(e) {
    hideTyping();
    addChatMessage('Sorry, I had trouble connecting. Please try again!', 'bot');
  } finally {
    isTyping = false;
    document.getElementById('chatSendBtn').disabled = false;
    input.focus();
  }
}

function handleChatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
}

function askSuggestion(question) {
  const input = document.getElementById('chatInput');
  if (input) { input.value = question; sendChatMessage(); }
}

// Init chat with welcome message
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    addChatMessage('Namaste! 🙏 I\'m **VoteBot**, powered by **Google Gemini AI**. Ask me anything about Indian elections, voter registration, EVMs, or your rights as a citizen!', 'bot');
  }, 1000);
});
