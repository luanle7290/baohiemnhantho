/* ================================================================
   Báº£oHiá»mNhÃ¢nThá» â App Logic
   ================================================================ */

// âââ STATE ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const state = {
  data: null,
  activeCompany: 'all',   // 'all' or company id
  activeCategory: 'back-office',
  search: '',
  cityFilter: 'all',
};

// âââ ELEMENTS âââââââââââââââââââââââââââââââââââââââââââââââââââ
const $ = id => document.getElementById(id);
const companyNav   = $('companyNav');
const content      = $('content');
const lastUpdated  = $('lastUpdated');
const searchInput  = $('searchInput');
const cityFilter   = $('cityFilter');

// âââ LOAD DATA ââââââââââââââââââââââââââââââââââââââââââââââââââ
async function loadData() {
  try {
    const res = await fetch('data/jobs.json');
    state.data = await res.json();
    init();
  } catch (e) {
    content.innerHTML = `<div class="empty-state">
      <div class="empty-icon">â ï¸</div>
      <div class="empty-text">KhÃ´ng thá» táº£i dá»¯ liá»u</div>
      <div class="empty-sub">Vui lÃ²ng má» file qua web server hoáº·c kiá»m tra file data/jobs.json</div>
    </div>`;
  }
}

// âââ INIT âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function init() {
  const d = state.data;
  lastUpdated.textContent = formatDate(d.lastUpdated);
  buildSidebar();
  render();
  bindEvents();
}

// âââ SIDEBAR ââââââââââââââââââââââââââââââââââââââââââââââââââââ
function buildSidebar() {
  const d = state.data;
  const totalBack = d.companies.reduce((s, c) =>
    s + c.jobs.filter(j => j.category === 'back-office').length, 0);

  // "Tá»ng quÃ¡t" item
  const allItem = makeNavItem('all', null, 'Tá»ng quÃ¡t', totalBack, true);
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

// âââ RENDER âââââââââââââââââââââââââââââââââââââââââââââââââââââ
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
      <div class="overview-title">Tá»ng quan tuyá»n dá»¥ng Back Office</div>
      <div class="overview-sub">Dá»¯ liá»u cáº­p nháº­t ${formatDate(d.lastUpdated)} â¢ Nguá»n: trang career chÃ­nh thá»©c</div>
    </div>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-num">${totalJobs}</div>
        <div class="stat-label">Tá»ng vá» trÃ­</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${companies.length}</div>
        <div class="stat-label">CÃ´ng ty</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${topCo.jobs.filter(j=>j.category==='back-office').length}</div>
        <div class="stat-label">${topCo.name} (nhiá»u nháº¥t)</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${hanoiJobs}</div>
        <div class="stat-label">Táº¡i HÃ  Ná»i</div>
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
    hcmCount ? `<span class="city-pill">ðï¸ HCM: ${hcmCount}</span>` : '',
    hanoiCount ? `<span class="city-pill" style="background:rgba(52,211,153,0.15);color:#6ee7b7">ð¿ HÃ  Ná»i: ${hanoiCount}</span>` : '',
    otherCount ? `<span class="city-pill" style="background:rgba(139,92,246,0.15);color:#c4b5fd">ð Tá»nh khÃ¡c: ${otherCount}</span>` : '',
  ].filter(Boolean).join('');

  const initials = co.name.split(' ').map(w=>w[0]).join('').slice(0,3).toUpperCase();
  const applyLabel = co.applyEmail ? `âï¸ ${co.applyEmail}` : 'ð Xem táº¥t cáº£ vá» trÃ­';
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
          <div class="cstat-label">Vá» trÃ­</div>
        </div>
      </div>
      <div class="city-pills">${jobs.length === 0 ? '<span class="city-pill" style="color:var(--text-3);font-style:italic">ChÆ°a cÃ³ vá» trÃ­</span>' : (cityPills || '<span class="city-pill">â</span>')}</div>
      <div class="company-card-cta">
        <span>Click Äá» xem chi tiáº¿t â</span>
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
  const applyLabel = co.applyEmail ? `âï¸ Gá»­i CV qua Email` : 'ð Trang tuyá»n dá»¥ng';
  const applyHref = co.applyEmail ? `mailto:${co.applyEmail}` : co.careerUrl;

  // If company has no jobs at all, show "no positions" notice
  if (co.jobs.length === 0) {
    content.innerHTML = `
      <div class="company-header">
        <div class="company-header-logo" style="background:${co.color}">${initials}</div>
        <div class="company-header-info">
          <div class="company-header-name">${co.name} Vietnam</div>
          <div class="company-header-meta">ChÆ°a cÃ³ vá» trÃ­ tuyá»n dá»¥ng â¢ ${co.careerUrl.replace('https://','').split('/')[0]}</div>
        </div>
        <div class="company-header-cta">
          <a class="btn-apply btn-primary" href="${applyHref}" target="_blank">${applyLabel}</a>
        </div>
      </div>
      <div class="empty-state" style="margin-top:40px">
        <div class="empty-icon">ð</div>
        <div class="empty-text">Hiá»n chÆ°a cÃ³ vá» trÃ­ ÄÄng tuyá»n</div>
        <div class="empty-sub">Vui lÃ²ng theo dÃµi trang tuyá»n dá»¥ng Äá» cáº­p nháº­t thÃ´ng tin má»i nháº¥t.</div>
      </div>`;
    return;
  }

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
            <td class="job-location"><span class="location-badge ${locClass}">ð ${j.location}</span></td>
            <td class="job-posted">${j.posted}</td>
            <td><a class="job-apply-link" href="${co.careerUrl}" target="_blank">á»¨ng tuyá»n â</a></td>
          </tr>`;
      }).join('')
    : `<tr><td colspan="5">
        <div class="empty-state">
          <div class="empty-icon">ð</div>
          <div class="empty-text">KhÃ´ng tÃ¬m tháº¥y vá» trÃ­ nÃ o</div>
          <div class="empty-sub">Thá»­ thay Äá»i bá» lá»c hoáº·c tá»« khÃ³a tÃ¬m kiáº¿m</div>
        </div>
       </td></tr>`;

  content.innerHTML = `
    <div class="company-header">
      <div class="company-header-logo" style="background:${co.color}">${initials}</div>
      <div class="company-header-info">
        <div class="company-header-name">${co.name} Vietnam</div>
        <div class="company-header-meta">${jobs.length} vá» trÃ­ Back Office Äang tuyá»n â¢ ${co.careerUrl.replace('https://','').split('/')[0]}</div>
      </div>
      <div class="company-header-cta">
        <a class="btn-apply btn-primary" href="${applyHref}" target="_blank">${applyLabel}</a>
      </div>
    </div>

    <div class="results-count">Hiá»n thá» ${filteredJobs.length} / ${jobs.length} vá» trÃ­${sq ? ` cho tá»« khÃ³a "<strong>${sq}</strong>"` : ''}</div>

    <div class="job-table-wrap">
      <table class="job-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Vá» trÃ­ tuyá»n dá»¥ng</th>
            <th>Äá»a Äiá»m</th>
            <th>ÄÄng</th>
            <th>á»¨ng tuyá»n</th>
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
      <div class="coming-soon-icon">ð¥</div>
      <div class="coming-soon-title">Äá»i ngÅ© TVV â Sáº¯p ra máº¯t</div>
      <div class="coming-soon-sub">
        Má»¥c Tuyá»n dá»¥ng TÆ° váº¥n viÃªn (TVV) Äang ÄÆ°á»£c xã¢y dá»±ng.
        Vui lÃ²ng quay láº¡i sau hoáº·c liÃªn há» trá»±c tiáº¿p trang tuyá»n dá»¥ng cá»§a tá»«ng cÃ´ng ty.
      </div>
    </div>
  `;
}

// âââ EVENTS âââââââââââââââââââââââââââââââââââââââââââââââââââââ
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

// âââ HELPERS ââââââââââââââââââââââââââââââââââââââââââââââââââââ
function isHCM(loc) {
  if (!loc) return false;
  const l = loc.toLowerCase();
  return l.includes('há» chÃ­ minh') || l.includes('hcm') || l.includes('ho chi minh');
}

function isHanoi(loc) {
  if (!loc) return false;
  const l = loc.toLowerCase();
  return l.includes('hÃ  ná»i') || l.includes('hanoi') || l.includes('ha noi');
}

function formatDate(dateStr) {
  if (!dateStr) return 'â';
  try {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  } catch { return dateStr; }
}

function escapeRe(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// âââ BOOT âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
loadData();
