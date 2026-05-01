/* ── CURSOR ─────────────────────────────── */
const cursor = document.getElementById('cursor');
const trail  = document.getElementById('cursorTrail');
let mx=0,my=0,tx=0,ty=0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.transform = `translate(${mx-8}px,${my-8}px)`;
});
(function animTrail(){
  tx += (mx-tx)*.12; ty += (my-ty)*.12;
  trail.style.transform = `translate(${tx-20}px,${ty-20}px)`;
  requestAnimationFrame(animTrail);
})();
document.querySelectorAll('a,button,.quiz-opt').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cursor.style.transform+=` scale(2)`;cursor.style.opacity='.5'});
  el.addEventListener('mouseleave',()=>{cursor.style.opacity='1'});
});

/* ── NAVBAR SCROLL ──────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll',()=>{
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ── SCROLL ANIMATIONS ──────────────────── */
const aosEls = document.querySelectorAll('[data-aos]');
const observer = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
},{threshold:0.15});
aosEls.forEach(el=>observer.observe(el));

/* ── MOUSE TILT ─────────────────────────── */
document.querySelectorAll('.tilt-card').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r = card.getBoundingClientRect();
    const x = ((e.clientX-r.left)/r.width -.5)*18;
    const y = ((e.clientY-r.top)/r.height-.5)*18;
    card.style.transform=`perspective(800px) rotateY(${x}deg) rotateX(${-y}deg) scale(1.03)`;
  });
  card.addEventListener('mouseleave',()=>{card.style.transform='';});
});

/* ── HERO PARALLAX ──────────────────────── */
const heroVisual = document.getElementById('heroVisual');
document.addEventListener('mousemove',e=>{
  if(!heroVisual) return;
  const xOff = (e.clientX/window.innerWidth-.5)*18;
  const yOff = (e.clientY/window.innerHeight-.5)*12;
  heroVisual.style.transform=`perspective(900px) rotateY(${xOff}deg) rotateX(${-yOff}deg)`;
});

/* ── QUIZ ───────────────────────────────── */
const questions = [
  { q:"What is the minimum age to vote in most democracies?",
    opts:["16","18","21","25"], ans:1,
    exp:"Most countries set the voting age at 18, though some (e.g. Scotland) allow 16." },
  { q:"What does 'FPTP' stand for in voting systems?",
    opts:["First Past The Post","Federal Party Transfer Protocol","Fair Poll Tally Process","Final Public Tally Poll"], ans:0,
    exp:"First Past the Post — the candidate with the most votes wins, even without a majority." },
  { q:"Which document guarantees citizens the right to vote?",
    opts:["Tax code","Constitution","Budget bill","Trade agreement"], ans:1,
    exp:"The Constitution (or equivalent supreme law) protects voting rights in democracies." },
  { q:"What is a 'by-election'?",
    opts:["An election held by companies","A local school vote","An election to fill a vacant seat mid-term","An election for vice-president only"], ans:2,
    exp:"A by-election fills a seat that becomes vacant between regular elections." },
  { q:"Which voting system lets voters rank candidates 1, 2, 3...?",
    opts:["First Past the Post","Two-Round System","Ranked-Choice Voting","Block Voting"], ans:2,
    exp:"Ranked-Choice Voting (also called Instant Runoff) lets voters rank preferences." },
  { q:"What is the purpose of a 'secret ballot'?",
    opts:["To hide election results","To protect voters from coercion","To speed up counting","To reduce voter turnout"], ans:1,
    exp:"The secret ballot ensures no one can see how you voted, protecting you from pressure or retaliation." },
];

let current=0, score=0;
const qEl   = document.getElementById('quizQuestion');
const optsEl = document.getElementById('quizOptions');
const counterEl = document.getElementById('quizCounter');
const scoreEl   = document.getElementById('quizScore');
const progressEl= document.getElementById('quizProgressFill');
const cardEl    = document.getElementById('quizCard');
const resultEl  = document.getElementById('quizResult');

function loadQuestion(){
  const q = questions[current];
  qEl.textContent = q.q;
  optsEl.innerHTML='';
  counterEl.textContent=`Question ${current+1} of ${questions.length}`;
  progressEl.style.width=`${(current/questions.length)*100}%`;
  q.opts.forEach((opt,i)=>{
    const btn=document.createElement('button');
    btn.className='quiz-opt'; btn.textContent=opt;
    btn.addEventListener('click',()=>selectAnswer(i,btn));
    optsEl.appendChild(btn);
  });
}

function selectAnswer(idx,btn){
  const q=questions[current];
  const btns=optsEl.querySelectorAll('.quiz-opt');
  btns.forEach(b=>b.disabled=true);
  if(idx===q.ans){ btn.classList.add('correct'); score++; scoreEl.textContent=`Score: ${score}`; }
  else { btn.classList.add('wrong'); btns[q.ans].classList.add('correct'); }
  setTimeout(()=>{
    current++;
    if(current<questions.length) loadQuestion();
    else showResult();
  },1400);
}

function showResult(){
  progressEl.style.width='100%';
  cardEl.classList.add('hidden');
  resultEl.classList.remove('hidden');
  const ri=document.getElementById('resultIcon');
  const rt=document.getElementById('resultTitle');
  const rd=document.getElementById('resultDesc');
  document.getElementById('finalScore').textContent=score;
  if(score===6){ri.textContent='🏆';rt.textContent='Perfect Score!';}
  else if(score>=4){ri.textContent='🎉';rt.textContent='Great Job!';}
  else if(score>=2){ri.textContent='📚';rt.textContent='Keep Learning!';}
  else{ri.textContent='🗳️';rt.textContent='Let\'s Try Again!';}
}

function resetQuiz(){
  current=0;score=0;
  scoreEl.textContent='Score: 0';
  cardEl.classList.remove('hidden');
  resultEl.classList.add('hidden');
  loadQuestion();
}

loadQuestion();

/* ── COUNTER ANIMATION ──────────────────── */
function animateCounters(){
  document.querySelectorAll('.stat span').forEach(el=>{
    const txt=el.textContent;
    if(!isNaN(parseFloat(txt))) return; // skip already animated
    el.setAttribute('data-target',txt);
  });
}
animateCounters();

/* ── SMOOTH SCROLL FOR NAV ──────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    e.preventDefault();
    const target=document.querySelector(a.getAttribute('href'));
    if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
  });
});

console.log('%c🗳️ VoteWise | Election Process Education','color:#6366f1;font-size:1.2rem;font-weight:bold');
console.log('%cBuilt for Hackathon 2026 — Civic Tech Track','color:#94a3b8;font-size:.9rem');
