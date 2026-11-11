import { VitaminTracker, STORAGE_PREFIX } from './tracker.mjs';

let storage;
try { storage = window.localStorage; }
catch { storage = { getItem() { throw Error('unavailable'); }, setItem() { throw Error('unavailable'); }, removeItem() { throw Error('unavailable'); } }; }
const tracker = new VitaminTracker(storage);
const names = ['Fish Oil', 'Vitamin C'];
const buttons = names.map((_, index) => document.getElementById(`vitamin-${index}`));
const formatTime = value => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
let midnightTimer;

function render() {
  const state = tracker.snapshot();
  const history = tracker.history();
  const count = state.taken.filter(Boolean).length;
  const date = new Date(`${state.date}T12:00:00`);
  document.getElementById('todayDate').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).format(date);
  document.getElementById('count').textContent = `${count} of 2 taken`;
  document.getElementById('count').classList.toggle('complete', count === 2);
  buttons.forEach((button, index) => {
    const taken = state.taken[index];
    button.setAttribute('aria-pressed', String(Boolean(taken)));
    button.setAttribute('aria-label', `${names[index]}, ${taken ? 'taken at ' + formatTime(taken) + '. Tap to undo.' : 'not marked taken. Tap to mark taken.'}`);
    document.getElementById(`status-${index}`).textContent = taken ? `Taken at ${formatTime(taken)}` : 'Tap once you’ve taken it';
    document.getElementById(`action-${index}`).innerHTML = taken ? 'Taken · tap to undo <span aria-hidden="true">✓</span>' : 'Mark as taken <span aria-hidden="true">↗</span>';
  });
  const message = document.getElementById('dailyMessage');
  message.classList.toggle('complete', count === 2);
  message.querySelector('.message-icon').textContent = count === 2 ? '✓' : '○';
  document.getElementById('messageTitle').textContent = ['Your check-in is waiting.', 'One down. One to go.', 'All taken. All done.'][count];
  document.getElementById('messageDetail').textContent = count === 2 ? 'Both vitamins recorded for today. See you tomorrow.' : 'Mark each vitamin after you’ve taken it.';
  const warning = document.getElementById('storageWarning');
  warning.textContent = state.warning;
  warning.hidden = !state.warning;
  document.getElementById('saveNote').textContent = state.warning ? 'Resets at 00:00 · Storage needs attention' : 'Resets at 00:00 · Saved on this device';
  document.getElementById('week').replaceChildren(...history.map(day => {
    const date = new Date(`${day.date}T12:00:00`);
    const element = document.createElement('div');
    element.className = `day${day.date === state.date ? ' current' : ''}`;
    const shortDay = new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date);
    element.setAttribute('aria-label', `${shortDay}, ${day.date}: ${day.taken.filter(Boolean).length} of 2 recorded`);
    if (day.date === state.date) element.setAttribute('aria-current', 'date');
    element.innerHTML = `<span class="day-label">${shortDay}</span><span class="day-number">${date.getDate()}</span><span class="dots" aria-hidden="true">${day.taken.map(taken => `<span class="dot${taken ? ' filled' : ''}"></span>`).join('')}</span>`;
    return element;
  }));
  clearTimeout(midnightTimer);
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  midnightTimer = setTimeout(render, Math.max(1, midnight.getTime() - now.getTime()));
}

buttons.forEach((button, index) => button.addEventListener('click', () => {
  tracker.toggle(index);
  render();
}));
window.addEventListener('storage', event => { if (!event.key || event.key.startsWith(STORAGE_PREFIX)) render(); });
window.addEventListener('focus', render);
window.addEventListener('pageshow', render);
document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
// Recheck when the page stays open across midnight, as well as after phone sleep.
setInterval(render, 30_000);
render();
