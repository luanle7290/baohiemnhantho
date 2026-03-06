/* ================================================================
   BảoHiểmNhânThọ — App Logic
   ================================================================ */

// ─── STATE ──────────────────────────────────────────────────────
const state = {
  data: null,
  activeCompany: 'all',   // 'all' or company id
  activeCategory: 'back-office',
  search: '',
  cityFilter: 'all',
};

// ─── ELEMENTS ───────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const companyNav   = $('companyNav');
const content      = $('content');
const lastUpdated  = $('lastUpdated');
const searchInput  = $('searchInput');
const cityFilter   = $('cityFilter');

// ─── LOAD DATA ──────────────────────────────────────────────────
async function loadData() {
  try {
    const res = await fetch('data/jobs.json');
    state.data = await res.json();
    init();
  } catch (e) {
    content.innerHTML = `<div class="empty-state">
      <div class="empty-icon">⚠️</div>
      <div class="empty-text">Không thể tải dữ liệu</div>
      <div class="empty-sub">Vui lòng mở file qua web server hoặc kiểm tra file data/jobs.json</div>
    </div>`;
  }
}

// ─── INIT ───────────────────────────────────────────────────────
function init() {
  const d = state.data;
  lastUpdated.textContent = formatDate(d.lastUpdated);
  buildSidebar();
  render();
  bindEvents();
}

// ─── SIDEBAR ────────────────────────────────────────────────────
function buildSidebar() {
  const d = state.data;
  const totalBack = d.companies.reduce((s, c) =>
    s + c.jobs.filter(j => j.category === 'back-office').length, 0);

  // "Tổng quát" item
  const allItem = makeNavItem('all', null, 'Tổng quát', totalBack, true);
  companyNav.appendChild(allItem);

  // Company items
  d.companies.forEach(co => {
    const count = co.jobs.filter(j => j.category === state.activeCategory).length;
    const item = makeNavItem(co.id, co.color, co.name, count, false);
    companyNav.appendChild(item);
  });
}

function makeNavItem(id, color, name, count, isActive) {
  const el = document.createElement('div');
  el.className = 'nav-item' + (isActive ? ' active' : '');
  el.dataset.company = id;

  const dot = color
    ? `<div class="company-dot" style="background:${color}"></div>`
    : `<div class="company-dot" style="background:rgba(255,255,255,0.3)"></div>`;

  el.innerHTML = `${dot}<span class="nav-label">${name}</span><span class="nav-badge">${count}</span>`;
  return el;
}

function updateSidebarCounts() {
  const items = companyNav.querySelectorAll('.nav-item');
  items.forEach(item => {
    const id = item.dataset.company;
    const badge = item.querySelector('.nav-badge');
    if (!badge) return;
    if (id === 'all') {
      const total = state.data.companies.reduce((s, c) =>
        s + c.jobs.filter(j => j.category === state.activeCategory).length, 0);
      badge.textContent = total;
    } else {
      const co = state.data.companies.find(c => c.id === id);
      if (co) badge.textContent = co.jobs.filter(j => j.category === state.activeCategory).length;
    }
  });
}

// ─── RENDER ─────────────────────────────────────────────────────
function render() {
  if (!state.data) return;

  if (state.activeCategory === 'tvv') {
    renderTVV();
    return;
  }

  if (state.activeCompany === 'all') {
    renderOverview();
  } else {
    renderCompany(state.activeCompany);
  }
}

// Overview: stats + company cards
function renderOverview() {
  const d = state.data;
  const companies = d.companies;

  const totalJobs = companies.reduce((s, c) =>
    s + c.jobs.filter(j => j.category === 'back-office').length, 0);
  const topCo = [...companies].sort((a, b) =>
    b.jobs.filter(j=>j.category==='back-office').length -
    a.jobs.filter(j=>j.category==='back-office').length)[0];
  const hanoiJobs = companies.reduce((s, c) =>
    s + c.jobs.filter(j => j.category==='back-office' && isHanoi(j.location)).length, 0);

  // Filter companies by search
  const sq = state.search.toLowerCase();
  const filteredCos = companies.filter(co => {
    if (!sq) return true;
    return co.jobs.some(j =>
      j.category === 'back-office' && j.title.toLowerCase().includes(sq));
  });

  content.innerHTML = `
    <div class="overview-header">
      <div class="overview-title">Tổng quan tuyển dụng Khối Văn Phòng</div>
      <div class="overview-sub">Dữ liệu cập nhất ${formatDate(d.lastUpdated)} • Nguồn: trang career chính thức</div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-num">${totalJobs}</div>
        <div class="stat-label">Tổng vị trí</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${companies.length}</div>
        <div class="stat-label">Công ty</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${topCo.jobs.filter(j=>j.category==='back-office').length}</div>
        <div class="stat-label">${topCo.name} (nhiều nhất)</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${hanoiJobs}</div>
        <div class="stat-label">Tại Hà Nội</div>
      </div>
    </div>

    <div class="company-grid">
      ${filteredCos.map(co => renderCompanyCard(co)).join('')}
    </div>
  `;

  // Bind card clicks
  content.querySelectorAll('.company-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.tagName === 'A') return;
      selectCompany(card.dataset.company);
    });
  });
}

function renderCompanyCard(co) {
  const jobs = co.jobs.filter(j => j.category === 'back-office');
  const hcmCount = jobs.filter(j => isHCM(j.location)).length;
  const hanoiCount = jobs.filter(j => isHanoi(j.location)).length;
  const otherCount = jobs.length - hcmCount - hanoiCount;

  const cityPills = [
    hcmCount ? `<span class="city-pill">🏙️ HCM: ${hcmCount}</span>` : '',
    hanoiCount ? `<span class="city-pill" style="background:rgba(52,211,153,0.15);color:#6ee7b7">🌿 Hà Nội: ${hanoiCount}</span>` : '',
    otherCount ? `<span class="city-pill" style="background:rgba(139,92,246,0.15);color:#c4b5fd">📍 Tỉnh khác: ${otherCount}</span>` : '',
  ].filter(Boolean).join('');

  const initials = co.name.split(' ').map(w=>w[0]).join('').slice(0,3).toUpperCase();
  const applyLabel = co.applyEmail ? ` ️ ${co.applyEmail}` : '🔗 Xem tất cả vị trí';
  const applyHref = co.applyEmail ? `mailto:${co.applyEmail}` : co.careerUrl;

  return `
    <div class="company-card" data-company="${co.id}">
      <div class="company-card-header">
        <div class="company-logo" style="background:${co.color}">${initials}</div>
        <div>
          <div class="company-card-name">${co.name}</div>
          <div class="company-card-url">${co.careerUrl.replace('https://','').split('/')[0]}</div>
        </div>
      </div>
      <div class="company-card-stats">
        <div class="cstat">
          <div class="cstat-num">${jobs.length}</div>
          <div class="cstat-label">Vị trí</div>
        </div>
      </div>
      <div class="city-pills">${cityPills || '<span class="city-pill">—</span>'}</div>
      <div class="company-card-cta">
        <span>Click để xem chi tiết </span>
        <a class="cta-link" href="${applyHref}" target="_blank" onclick="event.stopPropagation()">${applyLabel}</a>
      </div>
    </div>
  `;
}

// Company detail: job table
function renderCompany(companyId) {
  const co = state.data.companies.find(c => c.id === companyId);
  if (!co) return;

  const sq = state.search.toLowerCase();
  const cf = state.cityFilter;

  let jobs = co.jobs.filter(j => j.category === 'back-office');

  // Apply city filter
  if (cf === 'hcm') jobs = jobs.filter(j => isHCM(j.location));
  else if (cf === 'hanoi') jobs = jobs.filter(j => isHanoi(j.location));
  else if (cf === 'other') jobs = jobs.filter(j => !isHCM(j.location) && !isHanoi(j.location));

  // Apply search
  let filteredJobs = jobs;
  if (sq) {
    filteredJobs = jobs.filter(j => j.title.toLowerCase().includes(sq));
  }

  const initials = co.name.split(' ').map(w=>w[0]).join('').slice(0,3).toUpperCase();
  const applyLabel = co.applyEmail ? ` ️ G���ni CV qua Email` : '🔗 Trang tuyển dụng';
  const applyHref = co.applyEmail ? `mailto:${co.applyEmail}` : co.careerUrl;

  const tableRows = filteredJobs.length > 0
    ? filteredJobs.map((j, i) => {
        const locClass = isHanoi(j.location) ? 'hanoi' : (!isHCM(j.location) ? 'other' : '');
        const titleHl = sq
          ? j.title.replace(new RegExp(`(${escapeRe(sq)})`, 'gi'), '<mark>$1</mark>')
          : j.title;
        return `
          <tr>
            <td class="job-num">${i+1}</td>
            <td class="job-title">${titleHl}</td>
            <td class="job-location"><span class="location-badge ${locClass}">📏 ${j.location}</span></td>
            <td clas="job-posted">${j.posted}</td>
            <td><a class="job-apply-link" href="${co.careerUrl}" target="_blank">Ứng tuyển </a></td>
          </tr>`;
      }).join('')
    : `<tr><td colspan="5">
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-text">Không tìm thấy vị trí nào</div>
          <div class="empty-sub">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</div>
        </div>
       </td></tr>`;

  content.innerHTML = `
    <div class="company-header">
      <div class="company-header-logo" style="background:${co.color}">${initials}</div>
      <div class="company-header-info">
        <div class="company-header-name">${co.name} Vietnam</div>
        <div class="company-header-meta">${jobs.length} vị trí Khối Văn Phòng đang tuyển — ${co.careerUrl.replace('https://','').split('/')[0]}</div>
      </div>
      <div class="company-header-cta">
        <a class="btn-apply btn-primary" href="${applyHref}" target="_blank">${applyLabel}</a>
      </div>
    </div>

    <div class="results-count">Hiện thị ${filteredJobs.length} / ${jobs.length} vị trí${sq ? ` cho từ khóa "<strong>${sq}</strong>"` : ''}</div>

    <div class="job-table-wrap">
      <table class="job-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Vị trí tuyển dụng</th>
            <th>Địa điểm</th>
            <th>Đăng</th>
            <th>Ứng tuyển</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  `;
}

function renderTVV() {
  content.innerHTML = `
    <div class="coming-soon">
      <div class="coming-soon-icon">👥</div>
      <div class="coming-soon-title">Đội ngũ TVV — Sắp ra mắt</div>
      <div class="coming-soon-sub">
        Mục Tuyển dụng Tư vấn viên (TVV) đang được xây dựng.
        Vui lòng quay lại sau hoặc liên hệ trực tiếp trang tuyển dụng của từng công ty.
      </div>
    </div>
  `;
}

// ─── EVENTS ─────────────────────────────────────────────────────
function bindEvents() {
  // Sidebar company nav
  companyNav.addEventListener('click', e => {
    const item = e.target.closest('.nav-item');
    if (!item) return;
    selectCompany(item.dataset.company);
  });

  // Category tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.activeCategory = tab.dataset.cat;
      updateSidebarCounts();
      render();
    });
  });

  // Search
  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = searchInput.value.trim();
      render();
    }, 200);
  });

  // City filter
  cityFilter.addEventListener('change', () => {
    state.cityFilter = cityFilter.value;
    render();
  });
}

function selectCompany(id) {
  state.activeCompany = id;
  // Update active nav item
  companyNav.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.company === id);
  });
  render();
}

// ─── HELPERS ────────────────────────────────────────────────────
function isHCM(loc) {
  if (!loc) return false;
  const l = loc.toLowerCase();
  return l.includes('hồ chí minh') || l.includes('hcm') || l.includes('ho chi minh');
}

function isHanoi(loc) {
  if (!loc) return false;
  const l = loc.toLowerCase();
  return l.includes('hẌ�nội') || l.includes('hanoi') || l.includes('ha noi');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  } catch { return dateStr; }
}

function escapeRe(str) {
  return str.replace(/[.*+t?^${}()|[\]\\]/g, '\\$&');
}

// ─── BOOT ───────────────────────────────────────────────────────
loadData();
