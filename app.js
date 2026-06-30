// IIM Lucknow VMS Prototype — in-memory state, no persistence

export const VISITOR_TYPES = [
  'Recruiter / Company Professional',
  'Guest Faculty',
  'Parent / Family Visitor',
  'Vendor / Contractor (single-day)',
];

export const GATES = ['Gate 1', 'Gate 2'];

function todayISO() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return [
    dt.getFullYear(),
    String(dt.getMonth() + 1).padStart(2, '0'),
    String(dt.getDate()).padStart(2, '0'),
  ].join('-');
}

function uid() {
  return 'v-' + Math.random().toString(36).slice(2, 9);
}

function formatTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function seedVisitors() {
  const today = todayISO();
  return [
    {
      id: 'v-seed-1',
      name: 'Priya Sharma',
      visitorType: 'Recruiter / Company Professional',
      hostName: 'Placement Committee',
      company: 'Goldman Sachs',
      purpose: 'Pre-placement talk & campus interviews',
      expectedDate: today,
      expectedTime: '09:30',
      gate: 'Gate 1',
      origin: 'pre-registered',
      status: 'expected',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'v-seed-2',
      name: 'Rahul Mehta',
      visitorType: 'Recruiter / Company Professional',
      hostName: 'Placement Committee',
      company: 'McKinsey & Company',
      purpose: 'On-campus interviews — Day 2',
      expectedDate: today,
      expectedTime: '10:00',
      gate: 'Gate 1',
      origin: 'pre-registered',
      status: 'expected',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'v-seed-3',
      name: 'Dr. Ananya Rao',
      visitorType: 'Guest Faculty',
      hostName: 'Prof. Vikram Singh',
      company: '',
      purpose: 'Case discussion — Operations Management',
      expectedDate: today,
      expectedTime: '14:00',
      gate: 'Gate 2',
      origin: 'pre-registered',
      status: 'expected',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'v-seed-4',
      name: 'Amit Verma',
      visitorType: 'Recruiter / Company Professional',
      hostName: 'Placement Committee',
      company: 'Amazon',
      purpose: 'Technical interviews — SDE roles',
      expectedDate: addDays(today, 1),
      expectedTime: '09:00',
      gate: 'Gate 1',
      origin: 'pre-registered',
      status: 'expected',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'v-seed-5',
      name: 'Sunita Devi',
      visitorType: 'Parent / Family Visitor',
      hostName: 'Rohan Kapoor (MBA 2025)',
      company: '',
      purpose: 'Family visit — hostel',
      expectedDate: today,
      expectedTime: '16:00',
      gate: 'Gate 2',
      origin: 'pre-registered',
      status: 'expected',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'v-seed-6',
      name: 'Vikram Singh',
      visitorType: 'Vendor / Contractor (single-day)',
      hostName: 'Campus Maintenance',
      company: 'CoolAir Services',
      purpose: 'AC repair — Admin Block',
      expectedDate: today,
      expectedTime: '08:15',
      gate: 'Gate 1',
      origin: 'walk-in',
      status: 'checked-in',
      checkedInAt: new Date(new Date().setHours(8, 18, 0, 0)).toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 'v-seed-7',
      name: 'Meera Patel',
      visitorType: 'Parent / Family Visitor',
      hostName: 'Ananya Iyer (MBA 2026)',
      company: '',
      purpose: 'Parent visit — dropped off belongings',
      expectedDate: today,
      expectedTime: '07:45',
      gate: 'Gate 2',
      origin: 'walk-in',
      status: 'checked-out',
      checkedInAt: new Date(new Date().setHours(7, 50, 0, 0)).toISOString(),
      checkedOutAt: new Date(new Date().setHours(9, 15, 0, 0)).toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];
}

// --- State ---
let visitors = seedVisitors();
let currentRole = 'security';
let securitySearch = '';
let adminFilters = { search: '', date: '', visitorType: '', status: '' };
let batchRows = [emptyBatchRow(), emptyBatchRow(), emptyBatchRow()];
let sharedMeta = { hostName: 'Placement Committee', expectedDate: todayISO(), expectedTime: '10:00', gate: 'Gate 1', purpose: '', company: '' };
let walkinForm = { name: '', visitorType: VISITOR_TYPES[0], hostName: '', purpose: '', gate: 'Gate 1' };
let modal = null;

function emptyBatchRow() {
  return { name: '', visitorType: 'Recruiter / Company Professional' };
}

function showToast(msg) {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function originBadge(origin) {
  if (origin === 'walk-in') {
    return '<span class="badge badge-origin-walkin">Walk-in</span>';
  }
  return '<span class="badge badge-origin-expected">Expected</span>';
}

function statusBadge(status) {
  const map = {
    expected: ['badge-expected', 'Expected'],
    'checked-in': ['badge-checked-in', 'Checked In'],
    'checked-out': ['badge-checked-out', 'Checked Out'],
  };
  const [cls, label] = map[status] || ['badge-expected', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

function visitorTypeOptions(selected) {
  return VISITOR_TYPES.map(
    (t) => `<option value="${t}"${t === selected ? ' selected' : ''}>${t}</option>`
  ).join('');
}

function gateOptions(selected) {
  return GATES.map(
    (g) => `<option value="${g}"${g === selected ? ' selected' : ''}>${g}</option>`
  ).join('');
}

// --- Actions ---
function addBatchVisitors() {
  const valid = batchRows.filter((r) => r.name.trim());
  if (!valid.length) {
    showToast('Add at least one visitor name to the batch.');
    return;
  }
  if (!sharedMeta.hostName.trim()) {
    showToast('Host name is required.');
    return;
  }

  valid.forEach((row) => {
    visitors.push({
      id: uid(),
      name: row.name.trim(),
      visitorType: row.visitorType,
      hostName: sharedMeta.hostName.trim(),
      company: sharedMeta.company.trim(),
      purpose: sharedMeta.purpose.trim() || 'Campus visit',
      expectedDate: sharedMeta.expectedDate,
      expectedTime: sharedMeta.expectedTime,
      gate: sharedMeta.gate,
      origin: 'pre-registered',
      status: 'expected',
      createdAt: new Date().toISOString(),
    });
  });

  showToast(`${valid.length} visitor(s) pre-registered successfully.`);
  batchRows = [emptyBatchRow(), emptyBatchRow(), emptyBatchRow()];
  render();
}

function checkInVisitor(id) {
  const v = visitors.find((x) => x.id === id);
  if (!v || v.status !== 'expected') return;
  v.status = 'checked-in';
  v.checkedInAt = new Date().toISOString();
  showToast(`${v.name} checked in at ${v.gate}.`);
  render();
}

function checkOutVisitor(id) {
  const v = visitors.find((x) => x.id === id);
  if (!v || v.status !== 'checked-in') return;
  v.status = 'checked-out';
  v.checkedOutAt = new Date().toISOString();
  showToast(`${v.name} checked out.`);
  render();
}

function logWalkin() {
  if (!walkinForm.name.trim() || !walkinForm.hostName.trim()) {
    showToast('Visitor name and host name are required.');
    return;
  }
  visitors.push({
    id: uid(),
    name: walkinForm.name.trim(),
    visitorType: walkinForm.visitorType,
    hostName: walkinForm.hostName.trim(),
    company: '',
    purpose: walkinForm.purpose.trim() || 'Walk-in visit',
    expectedDate: todayISO(),
    expectedTime: new Date().toTimeString().slice(0, 5),
    gate: walkinForm.gate,
    origin: 'walk-in',
    status: 'checked-in',
    checkedInAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });
  showToast(`Walk-in logged: ${walkinForm.name.trim()}`);
  walkinForm = { name: '', visitorType: VISITOR_TYPES[0], hostName: '', purpose: '', gate: 'Gate 1' };
  render();
}

// --- Views ---
function renderCoordinator() {
  const rowsHtml = batchRows
    .map(
      (row, i) => `
    <tr>
      <td><input type="text" data-batch-name="${i}" placeholder="Full name" value="${esc(row.name)}" /></td>
      <td><select data-batch-type="${i}">${visitorTypeOptions(row.visitorType)}</select></td>
      <td><button class="btn-remove-row" data-remove-row="${i}" title="Remove row">&times;</button></td>
    </tr>`
    )
    .join('');

  return `
    <div class="page-header">
      <h2>Pre-Register Visitors</h2>
      <p>Add expected visitors in advance — ideal for placement week recruiter batches.</p>
    </div>

    <div class="card">
      <div class="card-title">Shared visit details</div>
      <div class="form-grid">
        <div class="form-group">
          <label>Host name</label>
          <input type="text" id="meta-host" value="${esc(sharedMeta.hostName)}" placeholder="e.g. Placement Committee" />
        </div>
        <div class="form-group">
          <label>Company / organization</label>
          <input type="text" id="meta-company" value="${esc(sharedMeta.company)}" placeholder="e.g. Goldman Sachs (for recruiters)" />
        </div>
        <div class="form-group">
          <label>Expected date</label>
          <input type="date" id="meta-date" value="${sharedMeta.expectedDate}" />
        </div>
        <div class="form-group">
          <label>Expected time</label>
          <input type="time" id="meta-time" value="${sharedMeta.expectedTime}" />
        </div>
        <div class="form-group">
          <label>Gate</label>
          <select id="meta-gate">${gateOptions(sharedMeta.gate)}</select>
        </div>
        <div class="form-group full-width">
          <label>Purpose of visit</label>
          <textarea id="meta-purpose" placeholder="e.g. Pre-placement talk & campus interviews">${esc(sharedMeta.purpose)}</textarea>
        </div>
      </div>

      <div class="batch-section">
        <div class="batch-toolbar">
          <h3>Visitor batch — add multiple names at once</h3>
          <button class="btn btn-secondary btn-sm" id="add-batch-row">+ Add row</button>
        </div>
        <div class="batch-table-wrap">
          <table class="batch-table">
            <thead>
              <tr>
                <th>Visitor name</th>
                <th>Visitor type</th>
                <th></th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary" id="submit-batch">Pre-register batch</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Recently pre-registered (${visitors.filter((v) => v.origin === 'pre-registered').length} total)</div>
      <div class="visitor-list">
        ${visitors
          .filter((v) => v.origin === 'pre-registered')
          .slice(-5)
          .reverse()
          .map(
            (v) => `
          <div class="visitor-card">
            <div class="visitor-info">
              <h4>${esc(v.name)}${v.company ? ` · ${esc(v.company)}` : ''}</h4>
              <p>${esc(v.visitorType)} · Host: ${esc(v.hostName)}</p>
              <div class="visitor-meta">
                ${originBadge(v.origin)}
                ${statusBadge(v.status)}
                <span class="badge badge-expected">${formatDate(v.expectedDate)} ${v.expectedTime}</span>
              </div>
            </div>
          </div>`
          )
          .join('')}
      </div>
    </div>`;
}

function renderVisitorCard(v, q) {
  const canCheckIn = v.status === 'expected';
  const canCheckOut = v.status === 'checked-in';
  return `
    <div class="visitor-card${q && v.name.toLowerCase().includes(q) ? ' highlight' : ''}">
      <div class="visitor-info">
        <h4>${esc(v.name)}${v.company ? ` · ${esc(v.company)}` : ''}</h4>
        <p>${esc(v.visitorType)} · ${esc(v.purpose)}</p>
        <p style="margin-top:0.1rem">Host: ${esc(v.hostName)} · ${v.gate} · ${v.expectedTime}</p>
        <div class="visitor-meta">
          ${originBadge(v.origin)}
          ${statusBadge(v.status)}
        </div>
      </div>
      <div class="visitor-actions">
        ${canCheckIn ? `<button class="btn btn-success btn-sm" data-checkin="${v.id}">Check In</button>` : ''}
        ${canCheckOut ? `<button class="btn btn-outline btn-sm" data-checkout="${v.id}">Check Out</button>` : ''}
      </div>
    </div>`;
}

function renderSecurity() {
  const today = todayISO();
  const todayVisitors = visitors.filter((v) => v.expectedDate === today);
  const expectedToday = todayVisitors.filter((v) => v.origin === 'pre-registered');
  const walkinToday = todayVisitors.filter((v) => v.origin === 'walk-in');
  const awaitingArrival = expectedToday.filter((v) => v.status === 'expected');
  const activeToday = todayVisitors.filter((v) => v.status === 'checked-in');

  const q = securitySearch.toLowerCase().trim();
  const matchesSearch = (v) =>
    !q ||
    v.name.toLowerCase().includes(q) ||
    (v.company && v.company.toLowerCase().includes(q)) ||
    v.hostName.toLowerCase().includes(q);

  const filteredExpected = expectedToday.filter(matchesSearch);
  const filteredWalkin = walkinToday.filter(matchesSearch);
  const hasResults = filteredExpected.length > 0 || filteredWalkin.length > 0;

  const listHtml = !hasResults
    ? `<div class="empty-state"><strong>No visitors found</strong>${q ? ' Try a different search term.' : ' No entries for today yet.'}</div>`
    : `
      <div class="visitor-section">
        <div class="section-label">Expected arrivals — pre-registered (${filteredExpected.length})</div>
        ${filteredExpected.length
          ? filteredExpected.map((v) => renderVisitorCard(v, q)).join('')
          : '<div class="section-empty">No expected visitors match this search.</div>'}
      </div>
      <div class="visitor-section walkin-section">
        <div class="section-label">Walk-ins logged today (${filteredWalkin.length})</div>
        ${filteredWalkin.length
          ? filteredWalkin.map((v) => renderVisitorCard(v, q)).join('')
          : '<div class="section-empty">No walk-ins logged yet today.</div>'}
      </div>`;

  return `
    <div class="page-header">
      <h2>Gate Check-In</h2>
      <p>Confirm pre-registered visitors or log walk-ins — ${formatDate(today)}</p>
    </div>

    <div class="legend">
      <div class="legend-item">${originBadge('pre-registered')} Pre-registered in advance by a host</div>
      <div class="legend-item">${originBadge('walk-in')} Logged manually at the gate (no prior registration)</div>
    </div>

    <div class="security-layout">
      <div>
        <div class="card">
          <div class="card-title">Today's gate log (${awaitingArrival.length} awaiting · ${activeToday.length} on campus)</div>
          <div class="search-bar">
            <input type="search" id="security-search" placeholder="Search by name, company, or host…" value="${esc(securitySearch)}" />
          </div>
          <div class="visitor-list">${listHtml}</div>
        </div>
      </div>

      <div class="walkin-panel">
        <div class="card-title">Log a Walk-in</div>
        <p style="font-size:0.82rem;color:var(--gray-700);margin-bottom:1rem">
          Use when a visitor has no pre-registration. They'll be tagged <strong>Walk-in</strong> — visually distinct from expected visitors.
        </p>
        <div class="form-group" style="margin-bottom:0.75rem">
          <label>Visitor name</label>
          <input type="text" id="walkin-name" value="${esc(walkinForm.name)}" placeholder="Full name" />
        </div>
        <div class="form-group" style="margin-bottom:0.75rem">
          <label>Visitor type</label>
          <select id="walkin-type">${visitorTypeOptions(walkinForm.visitorType)}</select>
        </div>
        <div class="form-group" style="margin-bottom:0.75rem">
          <label>Host / visiting whom</label>
          <input type="text" id="walkin-host" value="${esc(walkinForm.hostName)}" placeholder="e.g. Prof. Sharma" />
        </div>
        <div class="form-group" style="margin-bottom:0.75rem">
          <label>Purpose</label>
          <input type="text" id="walkin-purpose" value="${esc(walkinForm.purpose)}" placeholder="Purpose of visit" />
        </div>
        <div class="form-group" style="margin-bottom:1rem">
          <label>Gate</label>
          <select id="walkin-gate">${gateOptions(walkinForm.gate)}</select>
        </div>
        <button class="btn btn-walkin" id="submit-walkin" style="width:100%">Log Walk-in & Check In</button>
      </div>
    </div>`;
}

function renderAdmin() {
  let filtered = [...visitors];

  if (adminFilters.date) {
    filtered = filtered.filter((v) => v.expectedDate === adminFilters.date);
  }
  if (adminFilters.visitorType) {
    filtered = filtered.filter((v) => v.visitorType === adminFilters.visitorType);
  }
  if (adminFilters.status) {
    filtered = filtered.filter((v) => v.status === adminFilters.status);
  }
  if (adminFilters.search.trim()) {
    const q = adminFilters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.hostName.toLowerCase().includes(q) ||
        (v.company && v.company.toLowerCase().includes(q)) ||
        v.purpose.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => {
    const da = a.expectedDate + a.expectedTime;
    const db = b.expectedDate + b.expectedTime;
    return db.localeCompare(da);
  });

  const stats = {
    total: visitors.length,
    expected: visitors.filter((v) => v.status === 'expected').length,
    onCampus: visitors.filter((v) => v.status === 'checked-in').length,
    walkins: visitors.filter((v) => v.origin === 'walk-in').length,
  };

  const tableRows =
    filtered.length === 0
      ? `<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--gray-500)">No records match your filters.</td></tr>`
      : filtered
          .map(
            (v) => `
      <tr>
        <td><strong>${esc(v.name)}</strong>${v.company ? `<br><span style="color:var(--gray-500);font-size:0.78rem">${esc(v.company)}</span>` : ''}</td>
        <td style="font-size:0.8rem">${esc(v.visitorType)}</td>
        <td>${esc(v.hostName)}</td>
        <td style="font-size:0.8rem;max-width:180px">${esc(v.purpose)}</td>
        <td>${formatDate(v.expectedDate)}<br><span style="color:var(--gray-500);font-size:0.78rem">${v.expectedTime}</span></td>
        <td>${v.gate}</td>
        <td>${originBadge(v.origin)}</td>
        <td>${statusBadge(v.status)}</td>
        <td style="font-size:0.78rem;color:var(--gray-500)">${v.checkedInAt ? formatTime(v.checkedInAt) : '—'}${v.checkedOutAt ? '<br>Out: ' + formatTime(v.checkedOutAt) : ''}</td>
      </tr>`
          )
          .join('');

  return `
    <div class="page-header">
      <h2>Visitor Log</h2>
      <p>Searchable record of all gate entries — pre-registered and walk-in.</p>
    </div>

    <div class="stats-row">
      <div class="stat-card"><div class="stat-value">${stats.total}</div><div class="stat-label">Total records</div></div>
      <div class="stat-card"><div class="stat-value">${stats.expected}</div><div class="stat-label">Awaiting arrival</div></div>
      <div class="stat-card"><div class="stat-value">${stats.onCampus}</div><div class="stat-label">Currently on campus</div></div>
      <div class="stat-card"><div class="stat-value">${stats.walkins}</div><div class="stat-label">Walk-in entries</div></div>
    </div>

    <div class="card">
      <div class="filter-bar">
        <div class="form-group" style="flex:1;min-width:200px">
          <label>Search</label>
          <input type="search" id="admin-search" placeholder="Name, host, company, purpose…" value="${esc(adminFilters.search)}" />
        </div>
        <div class="form-group">
          <label>Date</label>
          <input type="date" id="admin-date" value="${adminFilters.date}" />
        </div>
        <div class="form-group">
          <label>Visitor type</label>
          <select id="admin-type">
            <option value="">All types</option>
            ${visitorTypeOptions(adminFilters.visitorType)}
          </select>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select id="admin-status">
            <option value="">All statuses</option>
            <option value="expected"${adminFilters.status === 'expected' ? ' selected' : ''}>Expected</option>
            <option value="checked-in"${adminFilters.status === 'checked-in' ? ' selected' : ''}>Checked In</option>
            <option value="checked-out"${adminFilters.status === 'checked-out' ? ' selected' : ''}>Checked Out</option>
          </select>
        </div>
        <button class="btn btn-secondary btn-sm" id="clear-filters" style="align-self:flex-end">Clear filters</button>
      </div>

      <div class="result-count">Showing ${filtered.length} of ${visitors.length} records</div>

      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Visitor</th>
              <th>Type</th>
              <th>Host</th>
              <th>Purpose</th>
              <th>Date / Time</th>
              <th>Gate</th>
              <th>Origin</th>
              <th>Status</th>
              <th>Check-in/out</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </div>`;
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let focusAfterRender = null;

function render() {
  const main = document.getElementById('main-content');
  const roleSelect = document.getElementById('role-select');
  roleSelect.value = currentRole;

  if (currentRole === 'coordinator') main.innerHTML = renderCoordinator();
  else if (currentRole === 'security') main.innerHTML = renderSecurity();
  else main.innerHTML = renderAdmin();

  bindEvents();

  if (focusAfterRender) {
    const el = document.getElementById(focusAfterRender.id);
    if (el) {
      el.focus();
      if (focusAfterRender.pos != null && el.setSelectionRange) {
        el.setSelectionRange(focusAfterRender.pos, focusAfterRender.pos);
      }
    }
    focusAfterRender = null;
  }
}

function bindEvents() {
  document.getElementById('role-select').onchange = (e) => {
    currentRole = e.target.value;
    render();
  };

  // Coordinator
  if (currentRole === 'coordinator') {
    document.getElementById('meta-host')?.addEventListener('input', (e) => (sharedMeta.hostName = e.target.value));
    document.getElementById('meta-company')?.addEventListener('input', (e) => (sharedMeta.company = e.target.value));
    document.getElementById('meta-date')?.addEventListener('change', (e) => (sharedMeta.expectedDate = e.target.value));
    document.getElementById('meta-time')?.addEventListener('change', (e) => (sharedMeta.expectedTime = e.target.value));
    document.getElementById('meta-gate')?.addEventListener('change', (e) => (sharedMeta.gate = e.target.value));
    document.getElementById('meta-purpose')?.addEventListener('input', (e) => (sharedMeta.purpose = e.target.value));

    document.querySelectorAll('[data-batch-name]').forEach((el) => {
      el.addEventListener('input', (e) => {
        batchRows[+e.target.dataset.batchName].name = e.target.value;
      });
    });
    document.querySelectorAll('[data-batch-type]').forEach((el) => {
      el.addEventListener('change', (e) => {
        batchRows[+e.target.dataset.batchType].visitorType = e.target.value;
      });
    });
    document.querySelectorAll('[data-remove-row]').forEach((el) => {
      el.addEventListener('click', () => {
        const i = +el.dataset.removeRow;
        if (batchRows.length > 1) {
          batchRows.splice(i, 1);
          render();
        }
      });
    });
    document.getElementById('add-batch-row')?.addEventListener('click', () => {
      batchRows.push(emptyBatchRow());
      render();
    });
    document.getElementById('submit-batch')?.addEventListener('click', addBatchVisitors);
  }

  // Security
  if (currentRole === 'security') {
    const searchEl = document.getElementById('security-search');
    searchEl?.addEventListener('input', (e) => {
      securitySearch = e.target.value;
      focusAfterRender = { id: 'security-search', pos: e.target.selectionStart };
      render();
    });

    document.querySelectorAll('[data-checkin]').forEach((el) => {
      el.addEventListener('click', () => checkInVisitor(el.dataset.checkin));
    });
    document.querySelectorAll('[data-checkout]').forEach((el) => {
      el.addEventListener('click', () => checkOutVisitor(el.dataset.checkout));
    });

    document.getElementById('walkin-name')?.addEventListener('input', (e) => (walkinForm.name = e.target.value));
    document.getElementById('walkin-type')?.addEventListener('change', (e) => (walkinForm.visitorType = e.target.value));
    document.getElementById('walkin-host')?.addEventListener('input', (e) => (walkinForm.hostName = e.target.value));
    document.getElementById('walkin-purpose')?.addEventListener('input', (e) => (walkinForm.purpose = e.target.value));
    document.getElementById('walkin-gate')?.addEventListener('change', (e) => (walkinForm.gate = e.target.value));
    document.getElementById('submit-walkin')?.addEventListener('click', logWalkin);
  }

  // Admin
  if (currentRole === 'admin') {
    document.getElementById('admin-search')?.addEventListener('input', (e) => {
      adminFilters.search = e.target.value;
      focusAfterRender = { id: 'admin-search', pos: e.target.selectionStart };
      render();
    });
    document.getElementById('admin-date')?.addEventListener('change', (e) => {
      adminFilters.date = e.target.value;
      render();
    });
    document.getElementById('admin-type')?.addEventListener('change', (e) => {
      adminFilters.visitorType = e.target.value;
      render();
    });
    document.getElementById('admin-status')?.addEventListener('change', (e) => {
      adminFilters.status = e.target.value;
      render();
    });
    document.getElementById('clear-filters')?.addEventListener('click', () => {
      adminFilters = { search: '', date: '', visitorType: '', status: '' };
      render();
    });
  }
}

// Init
render();
