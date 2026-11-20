
const $ = id => document.getElementById(id);

const esc = s => String(s).replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

let T = [];

try {
  T = JSON.parse(localStorage.getItem('todos') || '[]');
  if (!Array.isArray(T)) T = [];
} catch {
  T = [];
}

const save = () => {
  localStorage.setItem('todos', JSON.stringify(T));
  render();
};

// Add task

$('f').onsubmit = e => {
  e.preventDefault();

  const task = $('t').value.trim();

  if (!task) return;

  T.push({
    id: Date.now(),
    t: task,
    d: $('d').value,
    p: $('p').value,
    done: false
  });

  e.target.reset();
  $('p').value = 'Medium';

  save();
};

// Search and filter

$('q').oninput = render;
$('fl').onchange = render;

// Edit, complete and delete

$('l').onclick = e => {
  const b = e.target.closest('button[data-a]');

  if (!b) return;

  const id = Number(b.dataset.i);
  const x = T.find(x => x.id === id);

  if (!x) return;

  if (b.dataset.a === 'x') {
    T = T.filter(y => y.id !== id);
  }

  if (b.dataset.a === 'e') {
    const n = prompt('Edit task', x.t);

    if (n !== null && n.trim()) {
      x.t = n.trim();
    }
  }

  save();
};

$('l').onchange = e => {
  const b = e.target;

  if (b.dataset.a !== 'c') return;

  const id = Number(b.dataset.i);
  const x = T.find(x => x.id === id);

  if (!x) return;

  x.done = b.checked;

  save();
};

// Render everything

function render() {
  const q = $('q').value.toLowerCase();
  const fl = $('fl').value;

  const completed = T.filter(x => x.done).length;
  const pending = T.length - completed;
  const high = T.filter(x => x.p === 'High' && !x.done).length;

  // Update statistics

  $('completed-count').textContent = completed;
  $('pending-count').textContent = pending;
  $('priority-count').textContent = high;
  $('total-count').textContent = T.length;

  // Filter tasks

  const v = T.filter(x =>
    x.t.toLowerCase().includes(q) &&
    (
      fl === 'All' ||
      (fl === 'Completed' && x.done) ||
      (fl === 'Pending' && !x.done)
    )
  );

  $('n').textContent = `${v.length} of ${T.length} tasks`;

  // Display tasks

  $('l').innerHTML = v.map(x => `
    <li class="card ${x.done ? 'done' : ''}">

      <input
        type="checkbox"
        data-a="c"
        data-i="${x.id}"
        ${x.done ? 'checked' : ''}
        aria-label="Complete ${esc(x.t)}"
      >

      <span>
        ${esc(x.t)}
        <small>${x.d ? '📅 Due ' + esc(x.d) : 'No deadline'}</small>
      </span>

      <b class="pr ${['High', 'Medium', 'Low'].includes(x.p) ? x.p : 'Medium'}">
        ${esc(x.p)}
      </b>

      <button class="ghost" data-a="e" data-i="${x.id}">
        Edit
      </button>

      <button class="ghost" data-a="x" data-i="${x.id}">
        Delete
      </button>

    </li>
  `).join('');

  // Empty state

  if (!v.length) {
    $('l').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">☑</div>
        <h3>${T.length ? 'No matching tasks!' : 'No tasks yet!'}</h3>
        <p>
          ${T.length
            ? 'Try another search or filter.'
            : 'Add your first task and start being productive.'}
        </p>
      </div>
    `;
  }
}

render();
