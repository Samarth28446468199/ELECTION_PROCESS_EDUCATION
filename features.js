// ── COUNTDOWN TIMER ───────────────────────
const targetDate = new Date('2025-11-01T00:00:00');
function updateCountdown(){
  const now = new Date();
  const diff = targetDate - now;
  if(diff <= 0){ document.getElementById('countdownGrid').innerHTML='<div style="color:#10b981;font-weight:900;font-size:1.5rem">🗳️ Election Day is Here!</div>'; return; }
  const d = Math.floor(diff/864e5);
  const h = Math.floor((diff%864e5)/36e5);
  const m = Math.floor((diff%36e5)/6e4);
  const s = Math.floor((diff%6e4)/1e3);
  document.getElementById('cdDays').textContent  = String(d).padStart(3,'0');
  document.getElementById('cdHours').textContent = String(h).padStart(2,'0');
  document.getElementById('cdMins').textContent  = String(m).padStart(2,'0');
  document.getElementById('cdSecs').textContent  = String(s).padStart(2,'0');
}
setInterval(updateCountdown,1000);
updateCountdown();

// ── VOTER CARD GENERATOR ──────────────────
function generateVoterCard(){
  const name    = document.getElementById('regName').value.trim();
  const dob     = document.getElementById('regDob').value;
  const gender  = document.getElementById('regGender').value;
  const state   = document.getElementById('regState').value;
  const address = document.getElementById('regAddress').value.trim();
  const consent = document.getElementById('regConsent').checked;

  if(!name||!dob||!gender||!state||!address){
    alert('⚠️ Please fill all required fields (Name, DOB, Gender, State, Address)'); return;
  }
  if(!consent){ alert('⚠️ Please check the declaration checkbox'); return; }

  // Validate age
  const age = Math.floor((new Date()-new Date(dob))/315576e5);
  if(age<18){ alert('❌ You must be 18 or older to register to vote.'); return; }

  // Generate mock EPIC number
  const epic = state.slice(0,2).toUpperCase() + '/' + Math.random().toString(36).slice(2,7).toUpperCase() + '/' + Math.floor(Math.random()*90000+10000);
  const constituency = state + ' - " Constituency " ' + Math.floor(Math.random()*50+1);

  document.getElementById('eName').textContent    = name.toUpperCase();
  document.getElementById('eDob').textContent     = new Date(dob).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'});
  document.getElementById('eGender').textContent  = gender;
  document.getElementById('eAddress').textContent = address + ', ' + state;
  document.getElementById('eEpic').textContent    = epic;
  document.getElementById('eConst').textContent   = state + ' - AC No. ' + Math.floor(Math.random()*200+1);

  document.getElementById('epicPlaceholder').classList.add('hidden');
  document.getElementById('epicCard').classList.remove('hidden');
  document.getElementById('downloadBtn').style.display='flex';

  // Scroll to card
  document.getElementById('epicCard').scrollIntoView({behavior:'smooth',block:'center'});
}

function downloadCard(){
  // Simple download prompt since html2canvas not available
  alert('📥 To download:\n1. Right-click on the EPIC card\n2. Select "Save as image"\n\nFor official Voter ID, register at voters.eci.gov.in');
}

// ── ELECTION RESULTS BAR CHART ────────────
const results2024 = [
  {party:'BJP',   seats:240, color:'#ff9933', pct:44},
  {party:'INC',   seats:99,  color:'#0ea5e9', pct:18},
  {party:'SP',    seats:37,  color:'#ef4444', pct:7},
  {party:'TMC',   seats:29,  color:'#22c55e', pct:5},
  {party:'DMK',   seats:22,  color:'#f59e0b', pct:4},
  {party:'TDP',   seats:16,  color:'#fbbf24', pct:3},
  {party:'JDU',   seats:12,  color:'#10b981', pct:2},
  {party:'Others',seats:88,  color:'#94a3b8', pct:16},
];

const chartEl = document.getElementById('barChart');
if(chartEl){
  const maxSeats = 240;
  results2024.forEach(r=>{
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `
      <span class="bar-label">${r.party}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(r.seats/543)*100}%;background:${r.color};animation-delay:${results2024.indexOf(r)*0.1}s">${r.seats}</div>
      </div>
      <span class="bar-seats">${r.seats}</span>`;
    chartEl.appendChild(row);
  });
}

// ── BOOTH FINDER ──────────────────────────
const boothData = {
  UP:{ eroBodies:80, totalBooths:161500, searchUrl:'https://electoralsearch.eci.gov.in', sampleBooth:'Govt. Primary School, Sector 4, Lucknow — Booth #142', days:'7 AM – 6 PM' },
  MH:{ eroBodies:48, totalBooths:101000, searchUrl:'https://electoralsearch.eci.gov.in', sampleBooth:'Municipal School Hall, Dadar, Mumbai — Booth #87', days:'7 AM – 6 PM' },
  DL:{ eroBodies:11, totalBooths:13000,  searchUrl:'https://electoralsearch.eci.gov.in', sampleBooth:'MCD Primary School, Rajouri Garden, Delhi — Booth #34', days:'7 AM – 6 PM' },
  KA:{ eroBodies:28, totalBooths:58000,  searchUrl:'https://electoralsearch.eci.gov.in', sampleBooth:'Govt. High School, Jayanagar, Bengaluru — Booth #55', days:'7 AM – 6 PM' },
  TN:{ eroBodies:39, totalBooths:69000,  searchUrl:'https://electoralsearch.eci.gov.in', sampleBooth:'Corporation School, T. Nagar, Chennai — Booth #23', days:'7 AM – 6 PM' },
  WB:{ eroBodies:42, totalBooths:80000,  searchUrl:'https://electoralsearch.eci.gov.in', sampleBooth:'Netaji Vidyalaya, Howrah — Booth #99', days:'7 AM – 6 PM' },
  GJ:{ eroBodies:26, totalBooths:53000,  searchUrl:'https://electoralsearch.eci.gov.in', sampleBooth:'Govt. Primary School, Navrangpura, Ahmedabad — Booth #61', days:'7 AM – 5 PM' },
  RJ:{ eroBodies:25, totalBooths:52000,  searchUrl:'https://electoralsearch.eci.gov.in', sampleBooth:'Rajkiya Ucch Madhyamik Vidyalaya, Vaishali, Jaipur — Booth #77', days:'7 AM – 6 PM' },
};

function findBooth(){
  const state = document.getElementById('boothState').value;
  const infoEl = document.getElementById('boothInfo');
  if(!state){ infoEl.classList.add('hidden'); return; }
  const d = boothData[state];
  infoEl.classList.remove('hidden');
  infoEl.innerHTML = `
    <h4 style="font-weight:800;margin-bottom:1rem;font-size:1rem">📍 ${document.getElementById('boothState').options[document.getElementById('boothState').selectedIndex].text}</h4>
    <div style="display:flex;flex-direction:column;gap:.7rem">
      <div style="font-size:.85rem;color:var(--muted)">🏛️ <strong style="color:var(--text)">Total Booths:</strong> ${d.totalBooths.toLocaleString('en-IN')}</div>
      <div style="font-size:.85rem;color:var(--muted)">🗓️ <strong style="color:var(--text)">Polling Hours:</strong> ${d.days}</div>
      <div style="font-size:.82rem;color:var(--muted)">📋 <strong style="color:var(--text)">Sample Booth:</strong> ${d.sampleBooth}</div>
      <a href="${d.searchUrl}" target="_blank" class="btn-primary" style="margin-top:.5rem;font-size:.85rem;padding:.6rem 1.2rem">Find Your Exact Booth →</a>
    </div>`;
}
