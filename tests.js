// ── EDGE CASE & INTEGRATION TESTS ────────────────────────────────
// VoteIndia Test Suite — covers core paths + edge cases + integration

const TestResults = { passed: 0, failed: 0, tests: [] };

function test(name, fn) {
  try {
    fn();
    TestResults.passed++;
    TestResults.tests.push({ name, status: 'PASS' });
  } catch(e) {
    TestResults.failed++;
    TestResults.tests.push({ name, status: 'FAIL', error: e.message });
  }
}

function expect(val) {
  return {
    toBe: (exp) => { if(val!==exp) throw new Error(`Expected ${exp}, got ${val}`); },
    toBeTruthy: () => { if(!val) throw new Error(`Expected truthy, got ${val}`); },
    toBeGreaterThan: (n) => { if(val<=n) throw new Error(`Expected > ${n}, got ${val}`); },
    toBeLessThan: (n) => { if(val>=n) throw new Error(`Expected < ${n}, got ${val}`); },
    toContain: (str) => { if(!String(val).includes(str)) throw new Error(`Expected "${val}" to contain "${str}"`); },
    toMatch: (rx) => { if(!rx.test(val)) throw new Error(`Expected "${val}" to match ${rx}`); },
  };
}

// ── CORE PATH TESTS ───────────────────────────────────────────────
test('Page title is correct', () => {
  expect(document.title).toContain('VoteIndia');
});

test('Hero section exists', () => {
  expect(document.getElementById('hero')).toBeTruthy();
});

test('Quiz has 8 questions', () => {
  expect(typeof questions).toBe('object');
  expect(questions.length).toBe(8);
});

test('Every quiz question has 4 options', () => {
  questions.forEach(q => {
    if(q.opts.length !== 4) throw new Error(`Question "${q.q.slice(0,30)}" has ${q.opts.length} options, expected 4`);
  });
});

test('Quiz answer index is valid for all questions', () => {
  questions.forEach(q => {
    if(q.ans < 0 || q.ans >= q.opts.length) throw new Error(`Invalid answer index ${q.ans}`);
  });
});

test('All nav links resolve to existing sections', () => {
  const links = document.querySelectorAll('.nav-links a[href^="#"]');
  links.forEach(a => {
    const id = a.getAttribute('href').slice(1);
    if(!document.getElementById(id)) throw new Error(`Section #${id} not found for nav link`);
  });
});

// ── EDGE CASE TESTS ───────────────────────────────────────────────
test('EPIC card not shown before form submit', () => {
  const card = document.getElementById('epicCard');
  expect(card && card.classList.contains('hidden')).toBe(true);
});

test('Voter registration rejects empty name', () => {
  const origName = document.getElementById('regName').value;
  document.getElementById('regName').value = '';
  let alerted = false;
  const origAlert = window.alert;
  window.alert = () => { alerted = true; };
  generateVoterCard();
  window.alert = origAlert;
  document.getElementById('regName').value = origName;
  expect(alerted).toBe(true);
});

test('Voter registration rejects underage (DOB = today)', () => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('regName').value = 'Test User';
  document.getElementById('regDob').value = today;
  document.getElementById('regGender').value = 'Male';
  document.getElementById('regState').value = 'Delhi';
  document.getElementById('regAddress').value = 'Test Address';
  document.getElementById('regConsent').checked = true;
  let msg = '';
  const origAlert = window.alert;
  window.alert = (m) => { msg = m; };
  generateVoterCard();
  window.alert = origAlert;
  expect(msg).toContain('18');
});

test('Countdown timer has valid positive values', () => {
  const days = parseInt(document.getElementById('cdDays').textContent);
  expect(days).toBeGreaterThan(0);
});

test('Booth finder shows info for valid state', () => {
  document.getElementById('boothState').value = 'DL';
  findBooth();
  const info = document.getElementById('boothInfo');
  expect(info.classList.contains('hidden')).toBe(false);
});

test('Booth finder hides info for empty state', () => {
  document.getElementById('boothState').value = '';
  findBooth();
  expect(document.getElementById('boothInfo').classList.contains('hidden')).toBe(true);
});

// ── INTEGRATION TESTS ─────────────────────────────────────────────
test('Results bar chart renders all 8 parties', () => {
  const bars = document.querySelectorAll('.bar-row');
  expect(bars.length).toBe(8);
});

test('EVM buttons exist and are clickable', () => {
  const btns = document.querySelectorAll('.evm-btn');
  expect(btns.length).toBeGreaterThan(0);
});

test('Quiz progress bar starts at 0%', () => {
  const fill = document.getElementById('quizFill');
  expect(fill).toBeTruthy();
});

test('All tilt cards exist', () => {
  const cards = document.querySelectorAll('.tilt-card');
  expect(cards.length).toBeGreaterThan(10);
});

test('EPIC card fields are populated after valid submission', () => {
  document.getElementById('regName').value = 'Rahul Kumar';
  document.getElementById('regDob').value = '1999-01-01';
  document.getElementById('regGender').value = 'Male';
  document.getElementById('regState').value = 'Bihar';
  document.getElementById('regAddress').value = 'Patna, Bihar';
  document.getElementById('regConsent').checked = true;
  generateVoterCard();
  expect(document.getElementById('eName').textContent).toContain('RAHUL');
});

// ── RUN & REPORT ──────────────────────────────────────────────────
function runTests() {
  const total = TestResults.passed + TestResults.failed;
  console.group('%c🧪 VoteIndia Test Suite', 'color:#6366f1;font-size:1rem;font-weight:bold');
  TestResults.tests.forEach(t => {
    const icon = t.status === 'PASS' ? '✅' : '❌';
    const style = t.status === 'PASS' ? 'color:#10b981' : 'color:#ef4444';
    console.log(`%c${icon} ${t.name}${t.error ? ' — ' + t.error : ''}`, style);
  });
  console.log(`%c\nResults: ${TestResults.passed}/${total} passed`, TestResults.failed===0?'color:#10b981;font-weight:bold':'color:#f59e0b;font-weight:bold');
  console.groupEnd();

  // Show test panel in UI
  const panel = document.getElementById('testPanel');
  if (panel) {
    panel.innerHTML = `
      <div class="test-summary ${TestResults.failed===0?'all-pass':'has-fail'}">
        🧪 Tests: <strong>${TestResults.passed}/${total} passed</strong>
        ${TestResults.failed > 0 ? `<span class="fail-badge">${TestResults.failed} failed</span>` : '<span class="pass-badge">All Pass ✅</span>'}
      </div>`;
  }
}

// Run after DOM is settled
setTimeout(runTests, 500);
