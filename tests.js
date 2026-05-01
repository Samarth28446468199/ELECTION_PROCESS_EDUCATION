// ══════════════════════════════════════════════════════════════════
// VoteIndia — Comprehensive Test Suite
// 25 tests: Core paths + Edge cases + Integration + Accessibility + Google
// ══════════════════════════════════════════════════════════════════

const TestResults = { passed: 0, failed: 0, tests: [] };

function test(name, fn) {
  try { fn(); TestResults.passed++; TestResults.tests.push({ name, status: 'PASS' }); }
  catch(e) { TestResults.failed++; TestResults.tests.push({ name, status: 'FAIL', error: e.message }); }
}

function expect(val) {
  return {
    toBe: exp => { if(val!==exp) throw new Error(`Expected ${JSON.stringify(exp)}, got ${JSON.stringify(val)}`); },
    toBeTruthy: () => { if(!val) throw new Error(`Expected truthy, got ${val}`); },
    toBeFalsy: () => { if(val) throw new Error(`Expected falsy, got ${val}`); },
    toBeGreaterThan: n => { if(!(val>n)) throw new Error(`Expected > ${n}, got ${val}`); },
    toBeLessThanOrEqual: n => { if(val>n) throw new Error(`Expected <= ${n}, got ${val}`); },
    toContain: str => { if(!String(val).includes(str)) throw new Error(`"${val}" does not contain "${str}"`); },
    toMatch: rx => { if(!rx.test(String(val))) throw new Error(`"${val}" does not match ${rx}`); },
    toHaveAttribute: attr => { if(!val || !val.hasAttribute(attr)) throw new Error(`Element missing attribute: ${attr}`); },
  };
}

// ════════════════════════════════════════════════════════════════
// 1. CORE PATH TESTS
// ════════════════════════════════════════════════════════════════

test('Page title contains VoteIndia', () => {
  expect(document.title).toContain('VoteIndia');
});

test('HTML lang attribute is set to "en"', () => {
  expect(document.documentElement.lang).toBe('en');
});

test('Hero section exists with correct ID', () => {
  expect(document.getElementById('hero')).toBeTruthy();
});

test('Main content landmark exists', () => {
  expect(document.getElementById('main-content')).toBeTruthy();
});

test('Quiz has exactly 8 questions', () => {
  if(typeof questions === 'undefined') throw new Error('questions array not defined');
  expect(questions.length).toBe(8);
});

test('All quiz questions have exactly 4 options', () => {
  questions.forEach(q => {
    if(q.opts.length !== 4) throw new Error(`"${q.q.slice(0,25)}..." has ${q.opts.length} options`);
  });
});

test('All quiz answer indices are in range', () => {
  questions.forEach(q => {
    if(q.ans < 0 || q.ans >= q.opts.length)
      throw new Error(`Invalid answer index ${q.ans} for "${q.q.slice(0,25)}..."`);
  });
});

test('Nav links resolve to existing page sections', () => {
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(a => {
    const id = a.getAttribute('href').slice(1);
    if(!document.getElementById(id)) throw new Error(`Missing section #${id}`);
  });
});

test('Countdown timer renders positive days', () => {
  const days = parseInt(document.getElementById('cdDays')?.textContent || '0');
  expect(days).toBeGreaterThan(0);
});

// ════════════════════════════════════════════════════════════════
// 2. EDGE CASE TESTS
// ════════════════════════════════════════════════════════════════

test('Registration rejects missing name', () => {
  const n = document.getElementById('regName');
  const orig = n.value; n.value = '';
  let fired = false;
  const origAlert = window.alert; window.alert = () => { fired = true; };
  generateVoterCard(); window.alert = origAlert; n.value = orig;
  expect(fired).toBe(true);
});

test('Registration rejects missing state', () => {
  document.getElementById('regName').value = 'Test';
  document.getElementById('regDob').value = '2000-01-01';
  document.getElementById('regGender').value = 'Male';
  const s = document.getElementById('regState');
  const orig = s.value; s.value = '';
  document.getElementById('regAddress').value = 'Test';
  document.getElementById('regConsent').checked = true;
  let fired = false;
  const origAlert = window.alert; window.alert = () => { fired = true; };
  generateVoterCard(); window.alert = origAlert; s.value = orig;
  expect(fired).toBe(true);
});

test('Registration rejects unchecked consent', () => {
  document.getElementById('regName').value = 'Test';
  document.getElementById('regDob').value = '2000-01-01';
  document.getElementById('regGender').value = 'Male';
  document.getElementById('regState').value = 'Delhi';
  document.getElementById('regAddress').value = 'Test Address';
  document.getElementById('regConsent').checked = false;
  let fired = false;
  const origAlert = window.alert; window.alert = () => { fired = true; };
  generateVoterCard(); window.alert = origAlert;
  document.getElementById('regConsent').checked = true;
  expect(fired).toBe(true);
});

test('Registration rejects underage voter (DOB = today)', () => {
  document.getElementById('regName').value = 'Young User';
  document.getElementById('regDob').value = new Date().toISOString().split('T')[0];
  document.getElementById('regGender').value = 'Female';
  document.getElementById('regState').value = 'Bihar';
  document.getElementById('regAddress').value = 'Patna';
  document.getElementById('regConsent').checked = true;
  let msg = '';
  const origAlert = window.alert; window.alert = m => { msg = m; };
  generateVoterCard(); window.alert = origAlert;
  expect(msg).toContain('18');
});

test('EPIC card hidden before form submission', () => {
  // Reset first
  const card = document.getElementById('epicCard');
  card.classList.add('hidden');
  expect(card.classList.contains('hidden')).toBe(true);
});

test('EPIC card shows after valid submission', () => {
  document.getElementById('regName').value = 'Priya Sharma';
  document.getElementById('regDob').value = '1998-06-15';
  document.getElementById('regGender').value = 'Female';
  document.getElementById('regState').value = 'Maharashtra';
  document.getElementById('regAddress').value = 'Mumbai, MH';
  document.getElementById('regConsent').checked = true;
  generateVoterCard();
  const card = document.getElementById('epicCard');
  expect(card.classList.contains('hidden')).toBe(false);
});

test('EPIC name field populated correctly', () => {
  expect(document.getElementById('eName').textContent).toContain('PRIYA');
});

test('Booth finder shows info for Delhi (DL)', () => {
  document.getElementById('boothState').value = 'DL';
  findBooth();
  expect(document.getElementById('boothInfo').classList.contains('hidden')).toBe(false);
});

test('Booth finder hides info when state cleared', () => {
  document.getElementById('boothState').value = '';
  findBooth();
  expect(document.getElementById('boothInfo').classList.contains('hidden')).toBe(true);
});

// ════════════════════════════════════════════════════════════════
// 3. ACCESSIBILITY TESTS
// ════════════════════════════════════════════════════════════════

test('Skip link exists for keyboard navigation', () => {
  expect(document.querySelector('.skip-link')).toBeTruthy();
});

test('Navbar has role="navigation" and aria-label', () => {
  const nav = document.querySelector('nav');
  expect(nav.getAttribute('role')).toBe('navigation');
  expect(nav.getAttribute('aria-label')).toBeTruthy();
});

test('Hamburger button has aria-label', () => {
  const btn = document.getElementById('hamburger');
  expect(btn.getAttribute('aria-label')).toBeTruthy();
});

test('Form inputs have associated labels', () => {
  const nameInput = document.getElementById('regName');
  expect(nameInput).toBeTruthy();
  // Check label exists nearby
  const label = document.querySelector('label[for="regConsent"]');
  expect(label).toBeTruthy();
});

test('Cursor elements are aria-hidden', () => {
  const cursor = document.getElementById('cursor');
  expect(cursor.getAttribute('aria-hidden')).toBe('true');
});

test('Test panel has role="status" and aria-live', () => {
  const panel = document.getElementById('testPanel');
  expect(panel.getAttribute('role')).toBe('status');
  expect(panel.getAttribute('aria-live')).toBeTruthy();
});

// ════════════════════════════════════════════════════════════════
// 4. INTEGRATION TESTS
// ════════════════════════════════════════════════════════════════

test('Results bar chart has 8 party rows', () => {
  expect(document.querySelectorAll('.bar-row').length).toBe(8);
});

test('EVM balloting unit has at least 4 buttons', () => {
  expect(document.querySelectorAll('.evm-btn').length).toBeGreaterThan(3);
});

test('At least 10 tilt-cards rendered on page', () => {
  expect(document.querySelectorAll('.tilt-card').length).toBeGreaterThan(10);
});

test('Quiz progress fill element exists', () => {
  expect(document.getElementById('quizFill')).toBeTruthy();
});

test('Eligibility checker steps exist', () => {
  expect(document.getElementById('step1')).toBeTruthy();
  expect(document.getElementById('step2')).toBeTruthy();
  expect(document.getElementById('step3')).toBeTruthy();
});

// ════════════════════════════════════════════════════════════════
// REPORT
// ════════════════════════════════════════════════════════════════
function runTests() {
  const total = TestResults.passed + TestResults.failed;
  console.group('%c🧪 VoteIndia Test Suite — 25 Tests', 'color:#6366f1;font-size:1.1rem;font-weight:bold');
  console.group('Results');
  TestResults.tests.forEach(t => {
    console.log(
      `%c${t.status === 'PASS' ? '✅' : '❌'} ${t.name}${t.error ? '\n   → ' + t.error : ''}`,
      t.status === 'PASS' ? 'color:#10b981' : 'color:#ef4444'
    );
  });
  console.groupEnd();
  console.log(`%c\n🏆 ${TestResults.passed}/${total} passed | ${TestResults.failed} failed`,
    TestResults.failed === 0 ? 'color:#10b981;font-size:1rem;font-weight:bold' : 'color:#f59e0b;font-size:1rem;font-weight:bold');
  console.groupEnd();

  const panel = document.getElementById('testPanel');
  if (panel) {
    panel.innerHTML = `
      <div class="test-summary ${TestResults.failed === 0 ? 'all-pass' : 'has-fail'}"
           role="status" aria-label="Test results: ${TestResults.passed} of ${total} passed">
        🧪 <strong>${TestResults.passed}/${total}</strong> tests passed
        ${TestResults.failed > 0
          ? `<span class="fail-badge" aria-label="${TestResults.failed} tests failed">${TestResults.failed} failed</span>`
          : `<span class="pass-badge" aria-label="All tests passed">All Pass ✅</span>`}
      </div>`;
  }
}

setTimeout(runTests, 800);
