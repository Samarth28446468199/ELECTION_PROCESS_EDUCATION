/* ── CURSOR ─────────────────────────────── */
const cursor=document.getElementById('cursor'),trail=document.getElementById('trail');
let mx=0,my=0,tx=0,ty=0;
document.addEventListener('mousemove',e=>{
  mx=e.clientX;my=e.clientY;
  cursor.style.transform=`translate(${mx-8}px,${my-8}px)`;
});
(function animTrail(){
  tx+=(mx-tx)*.12;ty+=(my-ty)*.12;
  trail.style.transform=`translate(${tx-20}px,${ty-20}px)`;
  requestAnimationFrame(animTrail);
})();

/* ── NAVBAR ─────────────────────────────── */
window.addEventListener('scroll',()=>{
  document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>60);
});
function toggleMenu(){
  document.getElementById('navLinks').classList.toggle('open');
}

/* ── SCROLL ANIMATIONS ──────────────────── */
const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});
},{threshold:0.15});
document.querySelectorAll('[data-aos]').forEach(el=>observer.observe(el));

/* ── TILT CARDS ─────────────────────────── */
document.querySelectorAll('.tilt-card').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const x=((e.clientX-r.left)/r.width-.5)*16;
    const y=((e.clientY-r.top)/r.height-.5)*16;
    card.style.transform=`perspective(800px) rotateY(${x}deg) rotateX(${-y}deg) scale(1.03)`;
  });
  card.addEventListener('mouseleave',()=>{card.style.transform='';});
});

/* ── HERO PARALLAX ──────────────────────── */
const heroVisual=document.getElementById('heroVisual');
document.addEventListener('mousemove',e=>{
  if(!heroVisual)return;
  const xo=(e.clientX/window.innerWidth-.5)*18;
  const yo=(e.clientY/window.innerHeight-.5)*12;
  heroVisual.style.transform=`perspective(900px) rotateY(${xo}deg) rotateX(${-yo}deg)`;
});

/* ── EVM DEMO ───────────────────────────── */
const candidates=['BJP','INC','SP','NOTA'];
function pressEVM(btn){
  const screen=document.getElementById('vvpatScreen');
  const name=btn.textContent.trim();
  btn.style.background='rgba(99,102,241,.3)';
  btn.style.borderColor='rgba(99,102,241,.7)';
  setTimeout(()=>{btn.style.background='';btn.style.borderColor='';},600);
  screen.textContent=`✅ Vote recorded: ${name}`;
  screen.style.color='#34d399';
  screen.style.borderColor='rgba(16,185,129,.5)';
  setTimeout(()=>{
    screen.textContent='Press a button →';
    screen.style.color='#fbbf24';
    screen.style.borderColor='rgba(245,158,11,.2)';
  },3000);
}

/* ── VOTER ELIGIBILITY CHECKER ──────────── */
let checkStep_num=1;
function checkStep(step,answer){
  if(answer==='no'){
    showCheckerResult(false,step);return;
  }
  checkStep_num=step+1;
  if(checkStep_num>3){showCheckerResult(true);return;}
  document.getElementById('step'+step).classList.remove('active');
  document.getElementById('step'+checkStep_num).classList.add('active');
}
function showCheckerResult(eligible,failStep){
  for(let i=1;i<=3;i++){
    const s=document.getElementById('step'+i);
    if(s)s.classList.remove('active');
  }
  const res=document.getElementById('checkerResult');
  const icon=document.getElementById('crIcon');
  const title=document.getElementById('crTitle');
  const msg=document.getElementById('crMsg');
  res.classList.remove('hidden');
  if(eligible){
    icon.textContent='🎉';
    title.textContent='You ARE eligible to vote in India!';
    msg.textContent='Register on the NVSP portal (voters.eci.gov.in) or visit your local Electoral Registration Officer office.';
  } else {
    icon.textContent='❌';
    title.textContent='You may not be eligible to vote.';
    const reasons=['','You must be an Indian citizen to vote.','You must be at least 18 years old on the qualifying date.','You must be of sound mind and not disqualified by a court.'];
    msg.textContent=reasons[failStep]||'Please check the official ECI website for more information.';
  }
}
function resetChecker(){
  checkStep_num=1;
  document.getElementById('checkerResult').classList.add('hidden');
  document.getElementById('step1').classList.add('active');
}

/* ── INDIA QUIZ ─────────────────────────── */
const questions=[
  {q:'Under which Article of the Indian Constitution is the Election Commission of India established?',opts:['Article 310','Article 315','Article 324','Article 356'],ans:2,exp:'Article 324 establishes the Election Commission of India.'},
  {q:'What is the minimum age to vote in India?',opts:['16 years','18 years','21 years','25 years'],ans:1,exp:'The voting age in India was lowered from 21 to 18 years in 1989 via the 61st Constitutional Amendment.'},
  {q:'How many seats does a party need for a majority in the Lok Sabha?',opts:['250','272','300','543'],ans:1,exp:'272 seats (out of 543) constitute a simple majority in the Lok Sabha.'},
  {q:'What does NOTA stand for?',opts:['No Official Tally Available','None of the Above','National Option for Transfer Agreement','Not On The Application'],ans:1,exp:'NOTA stands for "None of the Above" — introduced by Supreme Court order in 2013.'},
  {q:'Which body conducts Panchayat and Municipal elections in India?',opts:['Election Commission of India','State Election Commission','Ministry of Home Affairs','State Government'],ans:1,exp:'State Election Commissions (SECs), not the central ECI, conduct local body elections.'},
  {q:'How many phases were there in the 2024 Lok Sabha election?',opts:['5','6','7','8'],ans:2,exp:'The 2024 Lok Sabha elections were conducted in 7 phases from April 19 to June 1, 2024.'},
  {q:'What is the Model Code of Conduct (MCC)?',opts:['A code for candidates to memorize speeches','Guidelines restricting the government and parties during election period','A document candidates must sign','Rules for voting booth behavior'],ans:1,exp:'The MCC is a set of guidelines issued by ECI to regulate political parties and the government during election period.'},
  {q:'Which document introduced the NOTA option in Indian elections?',opts:['Parliament Act 2013','ECI Directive 2013','Supreme Court Order in PUCL vs Union of India case','Presidential Ordinance'],ans:2,exp:'The Supreme Court in the PUCL vs Union of India (2013) case directed ECI to include NOTA as an option on EVMs.'},
];

let cur=0,score=0;
const qText=document.getElementById('qText');
const qOpts=document.getElementById('qOpts');
const qCounter=document.getElementById('qCounter');
const qScore=document.getElementById('qScore');
const quizFill=document.getElementById('quizFill');
const quizCard=document.getElementById('quizCard');
const quizResult=document.getElementById('quizResult');

function loadQ(){
  const q=questions[cur];
  qText.textContent=q.q;
  qOpts.innerHTML='';
  qCounter.textContent=`Question ${cur+1} of ${questions.length}`;
  quizFill.style.width=`${(cur/questions.length)*100}%`;
  q.opts.forEach((o,i)=>{
    const b=document.createElement('button');
    b.className='quiz-opt';b.textContent=o;
    b.addEventListener('click',()=>answerQ(i,b));
    qOpts.appendChild(b);
  });
}

function answerQ(idx,btn){
  const q=questions[cur];
  qOpts.querySelectorAll('.quiz-opt').forEach(b=>b.disabled=true);
  if(idx===q.ans){btn.classList.add('correct');score++;qScore.textContent=`Score: ${score}`;}
  else{btn.classList.add('wrong');qOpts.querySelectorAll('.quiz-opt')[q.ans].classList.add('correct');}
  setTimeout(()=>{
    cur++;
    if(cur<questions.length)loadQ();
    else showResult();
  },1500);
}

function showResult(){
  quizFill.style.width='100%';
  quizCard.classList.add('hidden');
  quizResult.classList.remove('hidden');
  document.getElementById('rScore').textContent=score;
  const icon=document.getElementById('rIcon'),title=document.getElementById('rTitle');
  if(score>=7){icon.textContent='🏆';title.textContent='Civic Champion!';}
  else if(score>=5){icon.textContent='🎉';title.textContent='Well Done!';}
  else if(score>=3){icon.textContent='📚';title.textContent='Keep Learning!';}
  else{icon.textContent='🗳️';title.textContent='Let\'s Try Again!';}
}

function resetQuiz(){
  cur=0;score=0;
  qScore.textContent='Score: 0';
  quizCard.classList.remove('hidden');
  quizResult.classList.add('hidden');
  loadQ();
}

loadQ();

/* ── SMOOTH SCROLL ──────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    e.preventDefault();
    const t=document.querySelector(a.getAttribute('href'));
    if(t)t.scrollIntoView({behavior:'smooth',block:'start'});
    document.getElementById('navLinks').classList.remove('open');
  });
});

console.log('%c🇮🇳 VoteIndia | Election Process Education','color:#ff9933;font-size:1.2rem;font-weight:bold');
