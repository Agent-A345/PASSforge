/* ═══════════════════════════════════════
   PASSFORGE — script.js
   All password generation logic
   ═══════════════════════════════════════ */

'use strict';

/* ── Character Sets ── */
const CHARSET = {
  upper:  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower:  'abcdefghijklmnopqrstuvwxyz',
  num:    '0123456789',
  sym:    '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

/* ── Diceware-style word list (500 common words; expanded inline) ── */
const WORDS = [
  'apple','brave','cloud','dance','eagle','flame','grace','honey','ivory','joker',
  'karma','lemon','magic','noble','ocean','pearl','quest','river','stone','tiger',
  'ultra','valor','witch','xenon','yacht','zebra','amber','blaze','cedar','delta',
  'ember','frost','globe','haste','inlet','jewel','knack','lunar','maple','nerve',
  'orbit','piano','quart','radar','sigma','thorn','ultra','viola','waltz','xylem',
  'yield','zonal','acorn','birch','crane','drift','elbow','forge','glide','haven',
  'indigo','junto','knife','lance','micro','nexus','ozone','pixel','quill','raven',
  'solar','track','unity','vault','woven','xenon','yearn','zilch','agile','bound',
  'crisp','dwell','elite','facet','grail','hover','irony','jaunt','kiosk','lymph',
  'mirth','notch','optic','prism','quirk','rhyme','swift','tapir','unwed','vivid',
  'whirl','xylem','yeoman','zest','algae','boast','cleft','dowel','expel','fjord',
  'gnome','hinge','infer','joust','knoll','libel','moult','nymph','onset','pivot',
  'quota','rivet','squid','triad','usurp','venom','walrus','xeric','yokel','zinnia',
  'abyss','blunt','craft','depot','epoch','fiber','graft','humid','igloo','jelly',
  'kayak','latch','mocha','nadir','olive','plume','quake','resin','scout','topaz',
  'umbra','verve','wrist','xylan','yodel','zonal','adept','boxer','crumb','dingo',
  'envoy','frond','guava','hippo','inbox','jumbo','krill','llama','mango','ninja',
  'onion','panda','quaff','rhino','skunk','tulip','upend','viper','wader','xebec',
  'yucca','zorro','atlas','blurt','cubic','duchy','erode','flint','growl','helix',
  'imply','jumpy','kylix','lyric','motif','nitro','opine','plaid','qualm','rebut',
  'skimp','taxon','unify','vouch','wring','xeric','yeild','zappy','avian','balmy',
  'cacao','dirge','epoch','frisk','guile','heron','icier','jazzy','knave','lemur',
  'mogul','notch','oxide','psalm','query','rebel','snare','twill','utile','vital',
  'winch','xylum','yawl','zilch','acrid','basin','comet','drawl','edify','fable',
  'grout','hyena','igloo','jabot','knead','libra','merch','novel','offal','prude',
  'qualm','reign','shrew','truce','uncle','vague','whole','xanax','yearn','zippy',
  'admin','brine','cider','dwarf','evoke','finch','groan','hyper','index','jewel',
  'karat','liver','melon','nippy','oaken','plumb','queen','roost','snout','tuber',
  'ultra','vogue','weave','xenon','young','zloty','amuse','broth','copal','datum',
  'erupt','frank','gripe','hydra','image','joker','knelt','lycan','marsh','nonce',
  'orbit','plunk','quoth','reach','salvo','titan','untie','vexed','wider','xeric',
  'yuppy','zooid','angel','brake','cubic','dover','elegy','fetch','grove','herbs',
  'inlay','jiffy','khaki','lingo','minim','nerve','octet','perch','quire','recto',
  'smear','trawl','unwed','vigor','waste','xeric','yodel','zippo','ashen','bloop',
  'chant','dodge','ethos','flick','gusto','haste','irked','jokey','karma','libel',
  'maxim','nabob','occur','prank','quite','raspy','skald','tulle','usher','verge',
  'wider','xylol','young','zebu','abbot','booth','clasp','dirge','exact','flute',
  'gripe','harsh','icing','jingo','ketch','lathe','moose','nifty','outdo','plaza',
  'quest','rebus','spine','tepid','urban','vicar','windy','xenic','youth','zonal'
];

/* ── State ── */
const state = {
  password:    '',
  masked:      true,
  passphrase:  false,
  historyOpen: false
};

/* ── DOM Elements ── */
const $ = id => document.getElementById(id);

const els = {
  passwordDisplay:  $('passwordDisplay'),
  passwordBox:      $('passwordBox'),
  revealBtn:        $('revealBtn'),
  eyeIcon:          $('eyeIcon'),
  eyeOffIcon:       $('eyeOffIcon'),
  copyBtn:          $('copyBtn'),
  lengthSlider:     $('lengthSlider'),
  lengthBadge:      $('lengthBadge'),
  sliderTrackFill:  $('sliderTrackFill'),
  upperToggle:      $('upperToggle'),
  lowerToggle:      $('lowerToggle'),
  numToggle:        $('numToggle'),
  symToggle:        $('symToggle'),
  passphraseToggle: $('passphraseToggle'),
  passphraseOptions:$('passphraseOptions'),
  wordCountSlider:  $('wordCountSlider'),
  wordBadge:        $('wordBadge'),
  wordTrackFill:    $('wordTrackFill'),
  generateBtn:      $('generateBtn'),
  warningMsg:       $('warningMsg'),
  strengthFill:     $('strengthFill'),
  strengthLabel:    $('strengthLabel'),
  crackTime:        $('crackTime'),
  entropyFill:      $('entropyFill'),
  entropyGlow:      $('entropyGlow'),
  entropyValue:     $('entropyValue'),
  historyList:      $('historyList'),
  clearHistoryBtn:  $('clearHistoryBtn'),
  smartModeBtn:     $('smartModeBtn'),
  tipsToggle:       $('tipsToggle'),
  tipsBody:         $('tipsBody'),
  tipsChevron:      $('tipsChevron'),
  toast:            $('toast'),
  toastText:        $('toastText')
};

/* ════════════════════════════
   PASSWORD GENERATION
════════════════════════════ */

function getCharPool() {
  let pool = '';
  if (els.upperToggle.checked) pool += CHARSET.upper;
  if (els.lowerToggle.checked) pool += CHARSET.lower;
  if (els.numToggle.checked)   pool += CHARSET.num;
  if (els.symToggle.checked)   pool += CHARSET.sym;
  return pool;
}

function generatePassword() {
  const length = parseInt(els.lengthSlider.value, 10);
  const pool   = getCharPool();
  if (!pool) return '';

  // Use crypto.getRandomValues for true randomness
  const arr  = new Uint32Array(length);
  crypto.getRandomValues(arr);

  let pw = '';
  for (let i = 0; i < length; i++) {
    pw += pool[arr[i] % pool.length];
  }

  // Guarantee at least one char from each selected type
  let required = [];
  if (els.upperToggle.checked) required.push(randomChar(CHARSET.upper));
  if (els.lowerToggle.checked) required.push(randomChar(CHARSET.lower));
  if (els.numToggle.checked)   required.push(randomChar(CHARSET.num));
  if (els.symToggle.checked)   required.push(randomChar(CHARSET.sym));

  // Replace random positions
  const positions = shuffleArray([...Array(length).keys()]).slice(0, required.length);
  const pwArr = pw.split('');
  positions.forEach((pos, idx) => { pwArr[pos] = required[idx]; });
  return pwArr.join('');
}

function generatePassphrase() {
  const count = parseInt(els.wordCountSlider.value, 10);
  const arr   = new Uint32Array(count);
  crypto.getRandomValues(arr);
  const words = Array.from(arr).map(n => WORDS[n % WORDS.length]);
  return words.join('-');
}

function randomChar(set) {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return set[arr[0] % set.length];
}

function shuffleArray(arr) {
  const a = [...arr];
  const rand = new Uint32Array(a.length);
  crypto.getRandomValues(rand);
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand[i] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ════════════════════════════
   STRENGTH ANALYSIS
════════════════════════════ */

function countActiveTypes() {
  return [els.upperToggle, els.lowerToggle, els.numToggle, els.symToggle]
    .filter(t => t.checked).length;
}

function getPoolSize() {
  let size = 0;
  if (els.upperToggle.checked) size += 26;
  if (els.lowerToggle.checked) size += 26;
  if (els.numToggle.checked)   size += 10;
  if (els.symToggle.checked)   size += CHARSET.sym.length;
  return size;
}

function calcEntropy(length, poolSize) {
  if (poolSize === 0) return 0;
  return length * Math.log2(poolSize);
}

function calcCrackTime(bits) {
  if (bits === 0) return '—';
  // Assume 10^12 guesses/second (modern hardware)
  const guesses    = Math.pow(2, bits);
  const perSecond  = 1e12;
  const seconds    = guesses / perSecond;
  const minutes    = seconds / 60;
  const hours      = minutes / 60;
  const days       = hours   / 24;
  const years      = days    / 365.25;

  if (years > 1e18) return 'Heat death of universe';
  if (years > 1e12) return `~${toSI(years)} trillion years`;
  if (years > 1e9)  return `~${toSI(years / 1e9)} billion years`;
  if (years > 1e6)  return `~${toSI(years / 1e6)} million years`;
  if (years > 1000) return `~${Math.round(years / 1000)}k years`;
  if (years > 1)    return `~${Math.round(years)} years`;
  if (days  > 1)    return `~${Math.round(days)} days`;
  if (hours > 1)    return `~${Math.round(hours)} hours`;
  if (minutes > 1)  return `~${Math.round(minutes)} minutes`;
  return 'Instantly';
}

function toSI(n) {
  if (n >= 1e15) return (n / 1e15).toFixed(1) + 'e15';
  return parseFloat(n.toPrecision(3)).toString();
}

function getStrengthData(pw, passphrase) {
  if (!pw) return { level: 0, label: '—', class: '', fillClass: '', pct: 0 };

  if (passphrase) {
    const wordCount = pw.split('-').length;
    const bits      = wordCount * Math.log2(WORDS.length);
    const level     = wordCount >= 6 ? 3 : wordCount >= 5 ? 2 : 1;
    return {
      level, bits,
      label:     ['—', 'WEAK', 'MEDIUM', 'STRONG'][level],
      class:     ['', 'strength-weak', 'strength-medium', 'strength-strong'][level],
      fillClass: ['', 'fill-weak', 'fill-medium', 'fill-strong'][level],
      pct:       [0, 25, 55, 90][level]
    };
  }

  const len   = pw.length;
  const types = countActiveTypes();
  let level;

  if (len >= 20 && types === 4)       level = 3;
  else if (len >= 12 && types >= 2)   level = 2;
  else                                 level = 1;

  return {
    level, bits: 0,
    label:     ['—', 'WEAK', 'MEDIUM', 'STRONG'][level],
    class:     ['', 'strength-weak', 'strength-medium', 'strength-strong'][level],
    fillClass: ['', 'fill-weak', 'fill-medium', 'fill-strong'][level],
    pct:       [0, 25, 55, 90][level]
  };
}

/* ════════════════════════════
   UI UPDATES
════════════════════════════ */

function renderPassword(pw) {
  const display = els.passwordDisplay;
  display.innerHTML = '';

  if (!pw) {
    display.innerHTML = '<span class="pw-placeholder">Click GENERATE to create password</span>';
    display.classList.remove('masked');
    return;
  }

  if (state.masked) {
    display.textContent = '•'.repeat(Math.min(pw.length, 32));
    display.classList.add('masked');
  } else {
    display.textContent = pw;
    display.classList.remove('masked');
  }
}

function updateStrength(pw) {
  const data = getStrengthData(pw, state.passphrase);

  // Remove old classes
  els.strengthLabel.className = 'strength-label';
  els.strengthFill.className  = 'strength-fill';

  els.strengthLabel.classList.add(data.class);
  els.strengthFill.classList.add(data.fillClass);
  els.strengthLabel.textContent = data.label;
  els.strengthFill.style.width  = data.pct + '%';

  // Crack time
  if (pw && !state.passphrase) {
    const poolSize = getPoolSize();
    const len      = pw.length;
    const bits     = calcEntropy(len, poolSize);
    els.crackTime.textContent = calcCrackTime(bits);
  } else if (pw && state.passphrase) {
    const bits = pw.split('-').length * Math.log2(WORDS.length);
    els.crackTime.textContent = calcCrackTime(bits);
  } else {
    els.crackTime.textContent = '—';
  }
}

function updateEntropy(pw) {
  if (!pw) {
    els.entropyValue.textContent = '0 bits';
    els.entropyFill.style.width  = '0%';
    els.entropyGlow.style.right  = '100%';
    return;
  }

  let bits;
  if (state.passphrase) {
    bits = pw.split('-').length * Math.log2(WORDS.length);
  } else {
    bits = calcEntropy(pw.length, getPoolSize());
  }

  const maxBits = 256;
  const pct     = Math.min((bits / maxBits) * 100, 100);

  els.entropyValue.textContent = `${Math.round(bits)} bits`;
  els.entropyFill.style.width  = pct + '%';
  els.entropyGlow.style.right  = (100 - pct) + '%';
}

function updateSliderFill(slider, fillEl) {
  const min = parseInt(slider.min, 10);
  const max = parseInt(slider.max, 10);
  const val = parseInt(slider.value, 10);
  const pct = ((val - min) / (max - min)) * 100;
  fillEl.style.width = pct + '%';
}

function updateValidation() {
  if (state.passphrase) {
    els.warningMsg.classList.add('hidden');
    els.generateBtn.disabled = false;
    return;
  }

  const hasType = [els.upperToggle, els.lowerToggle, els.numToggle, els.symToggle]
    .some(t => t.checked);

  if (!hasType) {
    els.warningMsg.classList.remove('hidden');
    els.generateBtn.disabled = true;
  } else {
    els.warningMsg.classList.add('hidden');
    els.generateBtn.disabled = false;
  }
}

/* ════════════════════════════
   HISTORY
════════════════════════════ */

const MAX_HISTORY = 5;

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem('passforge_history') || '[]');
  } catch { return []; }
}

function saveHistory(history) {
  try {
    localStorage.setItem('passforge_history', JSON.stringify(history));
  } catch {}
}

function addToHistory(pw) {
  if (!pw) return;
  let history = loadHistory();
  history = history.filter(p => p !== pw);  // no dupes
  history.unshift(pw);
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
  saveHistory(history);
  renderHistory();
}

function renderHistory() {
  const history = loadHistory();
  const list    = els.historyList;
  list.innerHTML = '';

  if (!history.length) {
    list.innerHTML = '<div class="history-empty">No passwords generated yet.</div>';
    return;
  }

  history.forEach((pw, idx) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <span class="history-num">${String(idx + 1).padStart(2, '0')}</span>
      <span class="history-pw" title="${escapeHtml(pw)}">${escapeHtml(pw)}</span>
      <button class="history-copy" aria-label="Copy password" data-pw="${escapeHtml(pw)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
        </svg>
      </button>
    `;

    item.querySelector('.history-copy').addEventListener('click', (e) => {
      e.stopPropagation();
      const password = e.currentTarget.getAttribute('data-pw');
      copyToClipboard(password, 'Copied from history!');
    });

    list.appendChild(item);
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ════════════════════════════
   CLIPBOARD
════════════════════════════ */

function copyToClipboard(text, message = 'Copied!') {
  if (!text) return;

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => showToast(message));
  } else {
    // Fallback
    const ta       = document.createElement('textarea');
    ta.value       = text;
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(message);
    } catch {}
    document.body.removeChild(ta);
  }
}

let toastTimer;
function showToast(msg = 'Copied!') {
  els.toastText.textContent = msg;
  els.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.classList.remove('show');
  }, 2000);
}

/* ════════════════════════════
   MAIN GENERATE FLOW
════════════════════════════ */

function generate(silent = false) {
  updateValidation();
  if (els.generateBtn.disabled && !state.passphrase) return;

  const pw = state.passphrase ? generatePassphrase() : generatePassword();
  state.password = pw;

  renderPassword(pw);
  updateStrength(pw);
  updateEntropy(pw);

  if (!silent) {
    addToHistory(pw);
    // Flash animation on password box
    els.passwordBox.style.boxShadow = '0 0 30px rgba(0,255,128,0.3)';
    setTimeout(() => { els.passwordBox.style.boxShadow = ''; }, 400);
  }
}

/* ════════════════════════════
   EVENT LISTENERS
════════════════════════════ */

// Generate
els.generateBtn.addEventListener('click', () => generate());

// Length slider
els.lengthSlider.addEventListener('input', () => {
  const val = els.lengthSlider.value;
  els.lengthBadge.textContent = val;
  updateSliderFill(els.lengthSlider, els.sliderTrackFill);
  if (state.password) generate(true);
});

// Word count slider
els.wordCountSlider.addEventListener('input', () => {
  const val = els.wordCountSlider.value;
  els.wordBadge.textContent = val + ' words';
  updateSliderFill(els.wordCountSlider, els.wordTrackFill);
  if (state.password) generate(true);
});

// Character type toggles — regenerate on change
[els.upperToggle, els.lowerToggle, els.numToggle, els.symToggle].forEach(toggle => {
  toggle.addEventListener('change', () => {
    updateValidation();
    if (state.password && !els.generateBtn.disabled) generate(true);
  });
});

// Passphrase toggle
els.passphraseToggle.addEventListener('change', () => {
  state.passphrase = els.passphraseToggle.checked;

  if (state.passphrase) {
    els.passphraseOptions.classList.remove('hidden');
    // Disable other toggles visually
    [els.upperToggle, els.lowerToggle, els.numToggle, els.symToggle].forEach(t => {
      t.parentElement.closest('.toggle-row').style.opacity = '0.4';
      t.parentElement.closest('.toggle-row').style.pointerEvents = 'none';
    });
    els.lengthSlider.closest('.control-card').style.opacity = '0.4';
    els.lengthSlider.closest('.control-card').style.pointerEvents = 'none';
    els.warningMsg.classList.add('hidden');
    els.generateBtn.disabled = false;
  } else {
    els.passphraseOptions.classList.add('hidden');
    [els.upperToggle, els.lowerToggle, els.numToggle, els.symToggle].forEach(t => {
      t.parentElement.closest('.toggle-row').style.opacity = '';
      t.parentElement.closest('.toggle-row').style.pointerEvents = '';
    });
    els.lengthSlider.closest('.control-card').style.opacity = '';
    els.lengthSlider.closest('.control-card').style.pointerEvents = '';
    updateValidation();
  }

  if (state.password) generate(true);
});

// Reveal / mask
els.revealBtn.addEventListener('click', () => {
  state.masked = !state.masked;
  els.eyeIcon.classList.toggle('hidden', !state.masked);
  els.eyeOffIcon.classList.toggle('hidden', state.masked);
  renderPassword(state.password);
});

// Copy
els.copyBtn.addEventListener('click', () => {
  if (!state.password) return;
  copyToClipboard(state.password, 'Password copied!');
  els.copyBtn.classList.add('copied');
  setTimeout(() => els.copyBtn.classList.remove('copied'), 1500);
});

// Smart Mode
els.smartModeBtn.addEventListener('click', () => {
  // Auto-select strong settings
  state.passphrase = false;
  els.passphraseToggle.checked = false;
  els.passphraseOptions.classList.add('hidden');
  [els.upperToggle, els.lowerToggle, els.numToggle, els.symToggle].forEach(t => {
    t.parentElement.closest('.toggle-row').style.opacity = '';
    t.parentElement.closest('.toggle-row').style.pointerEvents = '';
    t.checked = true;
  });
  els.lengthSlider.closest('.control-card').style.opacity = '';
  els.lengthSlider.closest('.control-card').style.pointerEvents = '';

  els.lengthSlider.value = '24';
  els.lengthBadge.textContent = '24';
  updateSliderFill(els.lengthSlider, els.sliderTrackFill);

  els.smartModeBtn.style.background = 'rgba(0,255,128,0.15)';
  els.smartModeBtn.style.boxShadow  = '0 0 20px rgba(0,255,128,0.3)';
  setTimeout(() => {
    els.smartModeBtn.style.background = '';
    els.smartModeBtn.style.boxShadow  = '';
  }, 800);

  updateValidation();
  generate();
  showToast('⚡ Smart Mode activated!');
});

// Clear history
els.clearHistoryBtn.addEventListener('click', () => {
  try { localStorage.removeItem('passforge_history'); } catch {}
  renderHistory();
  showToast('History cleared');
});

// Tips toggle
els.tipsToggle.addEventListener('click', () => {
  const isOpen = !els.tipsBody.classList.contains('hidden');
  els.tipsBody.classList.toggle('hidden', isOpen);
  els.tipsChevron.classList.toggle('open', !isOpen);
  els.tipsToggle.setAttribute('aria-expanded', String(!isOpen));
});

// Keyboard shortcut: Ctrl/Cmd + G to generate, Ctrl/Cmd + C to copy
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
    e.preventDefault();
    generate();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement === document.body) {
    if (state.password) {
      copyToClipboard(state.password, 'Password copied!');
    }
  }
});

/* ════════════════════════════
   INIT
════════════════════════════ */

function init() {
  // Slider fills
  updateSliderFill(els.lengthSlider, els.sliderTrackFill);
  updateSliderFill(els.wordCountSlider, els.wordTrackFill);

  // Initial badge
  els.lengthBadge.textContent  = els.lengthSlider.value;
  els.wordBadge.textContent    = els.wordCountSlider.value + ' words';

  // Render history
  renderHistory();

  // Validation state
  updateValidation();

  // Eye state: start masked
  els.eyeIcon.classList.remove('hidden');
  els.eyeOffIcon.classList.add('hidden');

  // Generate initial password
  generate();
}

init();
