
let tasks = [
  { id: 1, text: 'Learn HTML & CSS',       done: true,  pri: 'low',  cat: 'study',    due: '' },
  { id: 2, text: 'Learn JavaScript',        done: true,  pri: 'low',  cat: 'study',    due: '' },
  { id: 3, text: 'Build this Todo App',     done: false, pri: 'high', cat: 'study',    due: getTodayStr() },
  { id: 4, text: 'Push project to GitHub',  done: false, pri: 'med',  cat: 'work',     due: getFutureStr(3) },
  { id: 5, text: 'Learn React next',        done: false, pri: 'high', cat: 'study',    due: getFutureStr(7) },
  { id: 6, text: 'Morning workout',         done: false, pri: 'med',  cat: 'health',   due: getTodayStr() },
  { id: 7, text: 'Buy groceries',           done: false, pri: 'low',  cat: 'shopping', due: getFutureStr(1) },
];

let nextId   = 8;
let filter   = 'all';
let selPri   = 'med';
let sortMode = 0;
let darkMode = false;

const sortModes = ['A–Z', 'Z–A', 'Priority', 'Due date', 'Newest'];



function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}
function getFutureStr(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}


// DARK MODE TOGGLE 
function toggleTheme() {
  darkMode = !darkMode;
  document.body.classList.toggle('dark', darkMode);
  document.getElementById('themeIcon').textContent = darkMode ? '☀️' : '🌙';
  // Save preference
  localStorage.setItem('taskflow-dark', darkMode ? '1' : '0');
}


// PRIORITY SELECTOR
function setPri(p) {
  selPri = p;
  // Update button styles
  ['high', 'med', 'low'].forEach(x => {
    const btn = document.getElementById('pri-' + x);
    if (x === p) {
      btn.classList.add('active-pri');
    } else {
      btn.classList.remove('active-pri');
    }
  });
}


// SORT CYCLE 
function cycleSort() {
  sortMode = (sortMode + 1) % sortModes.length;
  document.getElementById('sortLabel').textContent = 'Sort: ' + sortModes[sortMode];
  render();
}


// FILTER 
function setFilter(f, btn) {
  filter = f;
  document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}


// ADD TASK 
function addTask() {
  const input = document.getElementById('taskInput');
  const text  = input.value.trim();

  if (text === '') {
    // Shake the input to signal empty
    input.style.borderColor = '#ef4444';
    input.focus();
    setTimeout(() => { input.style.borderColor = ''; }, 1500);
    return;
  }

  const newTask = {
    id:   nextId++,
    text: text,
    done: false,
    pri:  selPri,
    cat:  document.getElementById('catSelect').value,
    due:  document.getElementById('dueDate').value,
  };

  tasks.unshift(newTask); // Add to top
  input.value = '';
  document.getElementById('dueDate').value = '';
  saveTasks();
  render();
}


// TOGGLE DONE 
function toggleTask(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  saveTasks();
  render();
}


// DELETE TASK 
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}


// CLEAR COMPLETED 
function clearDone() {
  const doneCount = tasks.filter(t => t.done).length;
  if (doneCount === 0) return;
  if (confirm('Remove all ' + doneCount + ' completed task(s)?')) {
    tasks = tasks.filter(t => !t.done);
    saveTasks();
    render();
  }
}


// GET FILTERED + SORTED LIST 
function getFilteredTasks() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();

  // 1. Filter
  let list = tasks.filter(t => {
    if (query && !t.text.toLowerCase().includes(query)) return false;
    if (filter === 'active')   return !t.done;
    if (filter === 'done')     return t.done;
    if (filter === 'high')     return t.pri === 'high' && !t.done;
    if (filter === 'work')     return t.cat === 'work';
    if (filter === 'personal') return t.cat === 'personal';
    if (filter === 'study')    return t.cat === 'study';
    if (filter === 'health')   return t.cat === 'health';
    return true;
  });

  // 2. Sort
  const priOrder = p => p === 'high' ? 0 : p === 'med' ? 1 : 2;

  if (sortMode === 0) list.sort((a, b) => a.text.localeCompare(b.text));
  if (sortMode === 1) list.sort((a, b) => b.text.localeCompare(a.text));
  if (sortMode === 2) list.sort((a, b) => priOrder(a.pri) - priOrder(b.pri));
  if (sortMode === 3) list.sort((a, b) => (a.due || '9999') > (b.due || '9999') ? 1 : -1);
  if (sortMode === 4) list.sort((a, b) => b.id - a.id);

  return list;
}


//FORMAT DUE DATE 
function formatDue(due) {
  if (!due) return null;
  const today = getTodayStr();
  if (due < today) return { label: '⚠️ Overdue: ' + due, cls: 'overdue' };
  if (due === today) return { label: '📅 Due today', cls: 'today' };
  return { label: '📅 ' + due, cls: '' };
}


// BUILD CATEGORY BADGE CLASS 
function catClass(cat) {
  const map = {
    work: 'cat-work', personal: 'cat-personal', study: 'cat-study',
    health: 'cat-health', shopping: 'cat-shopping', general: 'cat-general',
  };
  return map[cat] || 'cat-general';
}

function catEmoji(cat) {
  const map = {
    work: '💼', personal: '🙂', study: '📚',
    health: '❤️', shopping: '🛒', general: '📌',
  };
  return (map[cat] || '📌') + ' ' + cat;
}


//  MAIN RENDER FUNCTION 
function render() {
  // Stats
  const total   = tasks.length;
  const done    = tasks.filter(t => t.done).length;
  const high    = tasks.filter(t => t.pri === 'high' && !t.done).length;
  const pending = tasks.filter(t => !t.done).length;
  const pct     = total ? Math.round((done / total) * 100) : 0;

  document.getElementById('s-total').textContent   = total;
  document.getElementById('s-done').textContent    = done;
  document.getElementById('s-high').textContent    = high;
  document.getElementById('s-pending').textContent = pending;
  document.getElementById('prog').style.width      = pct + '%';
  document.getElementById('progPct').textContent   = pct + '%';

  // Task list
  const list = getFilteredTasks();
  const container = document.getElementById('todoList');
  const count = list.length;

  document.getElementById('listCount').textContent =
    count + ' task' + (count !== 1 ? 's' : '');

  if (count === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎉</div>
        <div class="empty-text">No tasks here!</div>
        <div class="empty-sub">Add a task above or try a different filter.</div>
      </div>
    `;
    return;
  }

  // Build HTML for each task
  container.innerHTML = list.map(task => {
    const dueInfo    = formatDue(task.due);
    const dueHTML    = dueInfo
      ? `<span class="badge-due ${dueInfo.cls}">${dueInfo.label}</span>`
      : '';

    const priLabel   = task.pri === 'high' ? 'High' : task.pri === 'med' ? 'Medium' : 'Low';
    const checkMark  = task.done ? '✓' : '';

    return `
      <div class="todo-card pri-${task.pri} ${task.done ? 'done-card' : ''}">

        <button
          class="check-btn ${task.done ? 'checked' : ''}"
          onclick="toggleTask(${task.id})"
          title="${task.done ? 'Mark undone' : 'Mark done'}"
        >${checkMark}</button>

        <div class="todo-body">
          <div class="todo-title">${escapeHTML(task.text)}</div>
          <div class="todo-meta">
            <span class="badge-pri badge-${task.pri}">${priLabel}</span>
            <span class="badge-cat ${catClass(task.cat)}">${catEmoji(task.cat)}</span>
            ${dueHTML}
          </div>
        </div>

        <div class="todo-actions">
          <button class="del-btn" onclick="deleteTask(${task.id})" title="Delete task">🗑️</button>
        </div>

      </div>
    `;
  }).join('');
}


// ESCAPE HTML (Security: prevent XSS) 
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


// SAVE & LOAD FROM LOCALSTORAGE 
function saveTasks() {
  localStorage.setItem('taskflow-tasks', JSON.stringify(tasks));
  localStorage.setItem('taskflow-nextid', nextId);
}

function loadTasks() {
  const saved = localStorage.getItem('taskflow-tasks');
  if (saved) {
    tasks  = JSON.parse(saved);
    nextId = parseInt(localStorage.getItem('taskflow-nextid') || nextId, 10);
  }
}


//SET DATE LABEL IN HEADER
function setDateLabel() {
  const now = new Date();
  const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  document.getElementById('dateLabel').textContent =
    now.toLocaleDateString('en-IN', opts);
}


// INIT APP ON PAGE LOAD 
function init() {
  // Load saved dark mode preference
  const savedDark = localStorage.getItem('taskflow-dark');
  if (savedDark === '1') {
    darkMode = true;
    document.body.classList.add('dark');
    document.getElementById('themeIcon').textContent = '☀️';
  }

  // Load saved tasks
  loadTasks();

  // Set date
  setDateLabel();

  // Set default priority selection
  setPri('med');

  // Render everything
  render();
}

// Run when page loads
init();