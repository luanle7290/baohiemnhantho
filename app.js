/* ================================================================
   BảoHiểmNhânThọ — App Logic
   ================================================================ */

// ─── ROLE CATEGORIES ─────────────────────────────────────────────
const CATEGORIES = {
  actuarial: {
    label: '📊 Tài chính & Actuarial',
    kws: ['actuar', 'finance', 'financial', 'tài chính', 'kế toán', 'accounting',
          'investment', 'đầu tư', 'risk', 'rủi ro', 'underwr', 'claim', 'bồi thường',
          'pricing', 'reserving', 'audit', 'kiểm toán', 'tax', 'treasury', 'reporting',
          'ifrs', 'bác sĩ thẩm định', 'thẩm định']
  },
  tech: {
    label: '💻 Công nghệ & IT',
    kws: ['developer', 'engineer', 'software', 'data ', 'digital', 'system',
          'network', 'security', 'cloud', 'devops', 'database', 'web ', 'mobile',
          'machine learning', 'lập trình', 'hệ thống', 'transformation', 'technology',
          'infrastructure', 'architect', 'it specialist', 'it manager', 'analytics',
          'business analyst', 'business analysis', 'phân tích nghiệp vụ',
          'khoa học dữ liệu', 'tự động hóa', 'it service', 'it business', 'bi/',
          'quản lý dự án công nghệ']
  },
  sales: {
    label: '🤝 Kinh doanh & Sales',
    kws: ['sales', 'business development', 'kinh doanh', 'agent', 'broker',
          'distribution', 'bán hàng', 'phân phối', 'bancassurance', 'agency',
          'relationship manager', 'account manager', 'business manager',
          'regional manager', 'territory', 'mdrt', 'gama', 'partnership',
          'phát triển đối tác', 'account management', 'head of account',
          'area director', 'client services', 'new business']
  },
  hr: {
    label: '👥 Nhân sự & Đào tạo',
    kws: ['human resource', 'nhân sự', 'nhân lực', 'training', 'đào tạo', 'learning',
          'talent', 'recruit', 'tuyển dụng', 'compensation', 'payroll', 'hrbp',
          'people partner', ' hr ', 'instructional', 'elearning', 'pd trainer',
          'future leader']
  },
  marketing: {
    label: '📣 Marketing & Khách hàng',
    kws: ['marketing', 'brand', 'thương hiệu', 'communication', 'truyền thông',
          'content', 'media', 'event ', 'crm', 'customer experience',
          'customer engagement', 'digital marketing', 'campaign', 'creative',
          'design manager', 'graphic design', 'designer', 'thiết kế sản phẩm',
          'proposition', 'product proposition', 'chief product', 'phát triển sản phẩm',
          'khách hàng', 'customer']
  },
  strategy: {
    label: '🎯 Chiến lược & Dự án',
    kws: ['chiến lược', 'strategy', 'dự án', 'project', 'program']
  },
  legal: {
    label: '⚖️ Pháp lý & Tuân thủ',
    kws: ['legal', 'pháp lý', 'compliance', 'tuân thủ', 'regulatory', 'governance',
          'anti-money', 'aml', 'fraud', 'internal control', 'law', 'attorney',
          'government relation']
  },
  operations: {
    label: '⚙️ Vận hành',
    kws: ['operation', 'vận hành', 'admin', 'hành chính', 'facility',
          'customer service', 'chăm sóc khách hàng', 'support', 'back office',
          'policy', 'procurement', 'supply chain', 'office manager', 'corporate',
          'intern', 'contact center', 'call center', 'dịch vụ khách hàng',
          'trợ lý', 'personal assistant', 'interpreter', 'phiên dịch',
          'business planning', 'pd business', 'builder']
  }
};

function getCategory(title) {
  if (!title) return '';
  const t = title.toLowerCase();
  for (const [cat, { kws }] of Object.entries(CATEGORIES)) {
    if (kws.some(kw => t.includes(kw))) return cat;
  }
  return '';
}

// ─── STATE ──────────────────────────────────────────────────────
const state = {
  data: null,
  prevJobs: null,         // Set<"coId:::title"> from prev.json snapshot
  activeCompany: 'all',   // 'all', 'saved', or company id
  search: '',
  cityFilter: 'all',
  categoryFilter: 'all',
};

// ─── BOOKMARKS (localStorage) ───────────────────────────────────
let bookmarks = new Set(JSON.parse(localStorage.getItem('bhnt_bookmarks') || '[]'));

function jobKey(companyId, job) {
  return `${companyId}:::${job.title || ''}:::${job.location || ''}`;
}

function saveBookmarks() {
  localStorage.setItem('bhnt_bookmarks', JSON.stringify([...bookmarks]));
  const badge = document.querySelector('.nav-item[data-company="saved"] .nav-badge');
  if (badge) badge.textContent = bookmarks.size;
}

function toggleBookmark(key) {
  if (bookmarks.has(key)) bookmarks.delete(key);
  else bookmarks.add(key);
  saveBookmarks();
}

// ─── NEW-JOB DETECTION ──────────────────────────────────────────
function isNewJob(coId, title) {
  if (!state.prevJobs) return false;
  return !state.prevJobs.has(`${coId}:::${title}`);
}

function countNewJobs() {
  if (!state.data || !state.prevJobs) return 0;
  let count = 0;
  for (const co of state.data.companies) {
    for (const j of co.jobs) {
      if (isNewJob(co.id, j.title)) count++;
    }
  }
  return count;
}

// ─── URL STATE ──────────────────────────────────────────────────
function pushURL() {
  const params = new URLSearchParams();
  if (state.activeCompany === 'saved') params.set('view', 'saved');
  else if (state.activeCompany !== 'all') params.set('company', state.activeCompany);
  if (state.cityFilter !== 'all') params.set('city', state.cityFilter);
  if (state.categoryFilter !== 'all') params.set('cat', state.categoryFilter);
  if (state.search) params.set('q', state.search);
  const str = params.toString();
  history.replaceState(null, '', str ? `?${str}` : window.location.pathname);
}

function readURLState() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('view') === 'saved') state.activeCompany = 'saved';
  else state.activeCompany = params.get('company') || 'all';
  state.cityFilter = params.get('city') || 'all';
  state.categoryFilter = params.get('cat') || 'all';
  state.search = params.get('q') || '';
}

// ─── ELEMENTS ───────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const companyNav     = $('companyNav');
const content        = $('content');
const lastUpdated    = $('lastUpdated');
const searchInput    = $('searchInput');
const cityFilter     = $('cityFilter');
const categoryFilter = $('categoryFilter');

// ─── LOAD DATA ──────────────────────────────────────────────────
async function loadData() {
  try {
    const [jobsRes, prevRes] = await Promise.all([
      fetch('data/jobs.json'),
      fetch('data/prev.json').catch(() => null),
    ]);
    state.data = await jobsRes.json();

    if (prevRes && prevRes.ok) {
      const prev = await prevRes.json();
      state.prevJobs = new Set();
      for (const [coId, titles] of Object.entries(prev.jobs || {})) {
        for (const title of titles) {
          state.prevJobs.add(`${coId}:::${title}`);
        }
      }
    }

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
  readURLState();
  buildSidebar();
  // Sync UI controls with URL state
  if (state.search) searchInput.value = state.search;
  if (state.cityFilter !== 'all') cityFilter.value = state.cityFilter;
  if (state.categoryFilter !== 'all') categoryFilter.value = state.categoryFilter;
  render();
  bindEvents();
}

// ─── SIDEBAR ────────────────────────────────────────────────────
function buildSidebar() {
  const d = state.data;
  const total = d.companies.reduce((s, c) => s + c.jobs.length, 0);

  // "Tổng quát" item
  companyNav.appendChild(makeNavItem('all', null, 'Tổng quát', total, state.activeCompany === 'all'));

  // "Đã lưu" item
  companyNav.appendChild(makeNavItem('saved', null, '⭐ Đã lưu', bookmarks.size, state.activeCompany === 'saved'));

  // Separator
  const sep = document.createElement('div');
  sep.className = 'nav-separator-label';
  sep.textContent = 'DANH SÁCH CÔNG TY';
  companyNav.appendChild(sep);

  // Company items
  d.companies.forEach(co => {
    companyNav.appendChild(makeNavItem(co.id, co.color, co.name, co.jobs.length, state.activeCompany === co.id));
  });
}

function makeNavItem(id, color, name, count, isActive) {
  const el = document.createElement('div');
  el.className = 'nav-item' + (isActive ? ' active' : '');
  el.dataset.company = id;

  const dot = color
    ? `<div class="company-dot" style="background:${color}"></div>`
    : `<div class="company-dot" style="background:rgba(255,255,255,0.3)"></div>`;

  el.innerHTML = `${dot}<span class="nav-label">${escapeHtml(name)}</span><span class="nav-badge">${count}</span>`;
  return el;
}

// ─── FILTER HELPERS ──────────────────────────────────────────────
function applyFilters(jobs) {
  const sq = state.search.toLowerCase();
  const cf = state.cityFilter;
  const cat = state.categoryFilter;

  return jobs.filter(j => {
    if (cf === 'hcm' && !isHCM(j.location)) return false;
    if (cf === 'hanoi' && !isHanoi(j.location)) return false;
    if (cf === 'other' && (isHCM(j.location) || isHanoi(j.location))) return false;
    if (cat !== 'all' && getCategory(j.title) !== cat) return false;
    if (sq && !(j.title && j.title.toLowerCase().includes(sq))) return false;
    return true;
  });
}

// ─── RENDER ─────────────────────────────────────────────────────
function render() {
  if (!state.data) return;

  if (state.activeCompany === 'all') {
    renderOverview();
  } else if (state.activeCompany === 'saved') {
    renderBookmarks();
  } else {
    renderCompany(state.activeCompany);
  }
}

// Overview: stats + company cards
function renderOverview() {
  const d = state.data;
  const companies = d.companies;

  const totalJobs = companies.reduce((s, c) => s + c.jobs.length, 0);
  const hanoiJobs = companies.reduce((s, c) =>
    s + c.jobs.filter(j => isHanoi(j.location)).length, 0);
  const hcmJobs = companies.reduce((s, c) =>
    s + c.jobs.filter(j => isHCM(j.location)).length, 0);
  const newJobCount = countNewJobs();

  const sq = state.search.toLowerCase();
  const cat = state.categoryFilter;

  const filteredCos = companies.filter(co => {
    if (!sq && cat === 'all') return true;
    return co.jobs.some(j =>
      (cat === 'all' || getCategory(j.title) === cat) &&
      (!sq || (j.title && j.title.toLowerCase().includes(sq)))
    );
  });

  const newBadgeRow = newJobCount > 0
    ? `<div class="stat-card stat-card--new">
        <div class="stat-num stat-num--new">${newJobCount}</div>
        <div class="stat-label">Mới tuần này 🆕</div>
      </div>`
    : '';

  content.innerHTML = `
    <div class="overview-header">
      <div class="overview-title">Tổng quan tuyển dụng</div>
      <div class="overview-sub">Dữ liệu cập nhật ${formatDate(d.lastUpdated)} • Nguồn: Tại website chính thức của các công ty. Thông tin được cập nhật hàng tuần.</div>
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
        <div class="stat-num">${hcmJobs}</div>
        <div class="stat-label">Tại TP. Hồ Chí Minh</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${hanoiJobs}</div>
        <div class="stat-label">Tại Hà Nội</div>
      </div>
      ${newBadgeRow}
    </div>

    <div class="company-grid">
      ${filteredCos.map(co => renderCompanyCard(co)).join('')}
    </div>
  `;

  content.querySelectorAll('.company-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.tagName === 'A') return;
      selectCompany(card.dataset.company);
    });
  });
}

function renderCompanyCard(co) {
  const jobs = co.jobs;
  const hcmCount = jobs.filter(j => isHCM(j.location)).length;
  const hanoiCount = jobs.filter(j => isHanoi(j.location)).length;
  const otherCount = jobs.length - hcmCount - hanoiCount;
  const newCount = jobs.filter(j => isNewJob(co.id, j.title)).length;

  const cityPills = [
    hcmCount ? `<span class="city-pill">🏙️ HCM: ${hcmCount}</span>` : '',
    hanoiCount ? `<span class="city-pill" style="background:rgba(52,211,153,0.15);color:#6ee7b7">🌿 Hà Nội: ${hanoiCount}</span>` : '',
    otherCount ? `<span class="city-pill" style="background:rgba(139,92,246,0.15);color:#c4b5fd">📍 Tỉnh khác: ${otherCount}</span>` : '',
    newCount ? `<span class="city-pill city-pill--new">🆕 ${newCount} mới</span>` : '',
  ].filter(Boolean).join('');

  const initials = co.name.split(' ').map(w=>w[0]).join('').slice(0,3).toUpperCase();
  const applyLabel = co.applyEmail ? `✉️ ${co.applyEmail}` : '🔗 Xem tất cả vị trí';
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
      <div class="city-pills">${jobs.length === 0 ? '<span class="city-pill" style="color:var(--text-3);font-style:italic">Chưa có vị trí</span>' : (cityPills || '<span class="city-pill">—</span>')}</div>
      <div class="company-card-cta">
        <span>Click để xem chi tiết →</span>
        <a class="cta-link" href="${applyHref}" target="_blank" onclick="event.stopPropagation()">${applyLabel}</a>
      </div>
    </div>
  `;
}

// Saved jobs view
function renderBookmarks() {
  if (bookmarks.size === 0) {
    content.innerHTML = `
      <div class="overview-header">
        <div class="overview-title">⭐ Việc làm đã lưu</div>
        <div class="overview-sub">Lưu các vị trí bạn quan tâm để xem lại sau.</div>
      </div>
      <div class="empty-state" style="margin-top:40px">
        <div class="empty-icon">🔖</div>
        <div class="empty-text">Chưa có việc làm nào được lưu</div>
        <div class="empty-sub">Nhấn ★ trên bất kỳ vị trí nào để lưu vào đây.</div>
      </div>`;
    return;
  }

  // Collect bookmarked jobs grouped by company
  const groups = [];
  for (const co of state.data.companies) {
    const saved = co.jobs.filter(j => bookmarks.has(jobKey(co.id, j)));
    if (saved.length > 0) groups.push({ co, jobs: saved });
  }

  const groupsHtml = groups.map(({ co, jobs }) => {
    const initials = co.name.split(' ').map(w=>w[0]).join('').slice(0,3).toUpperCase();
    const rows = jobs.map((j, i) => {
      const key = jobKey(co.id, j);
      const locClass = isHanoi(j.location) ? 'hanoi' : (!isHCM(j.location) ? 'other' : '');
      const newBadge = isNewJob(co.id, j.title) ? '<span class="new-badge">🆕 Mới</span>' : '';
      return `
        <tr>
          <td class="job-num">${i+1}</td>
          <td class="job-title">
            <span class="job-title-text">${escapeHtml(j.title || '')}${newBadge}</span>
            <button class="job-bookmark-btn active" data-key="${escapeHtml(key)}" title="Bỏ lưu">★</button>
          </td>
          <td class="job-location"><span class="location-badge ${locClass}">📍 ${escapeHtml(j.location || '')}</span></td>
          <td class="job-posted">${escapeHtml(j.posted || '')}</td>
          <td class="job-actions">
            <div class="job-actions-inner">
              <a class="job-apply-link" href="${co.careerUrl}" target="_blank">Ứng tuyển →</a>
              <button class="job-share-btn" data-company-id="${co.id}" data-company-name="${escapeHtml(co.name)}" data-title="${escapeHtml(j.title || '')}" data-location="${escapeHtml(j.location || '')}" title="Chia sẻ">↗</button>
            </div>
          </td>
        </tr>`;
    }).join('');
    return `
      <div class="saved-company-group">
        <div class="saved-company-label">
          <div class="saved-company-dot" style="background:${co.color}">${initials}</div>
          <span>${escapeHtml(co.name)}</span>
        </div>
        <div class="job-table-wrap" style="margin-bottom:16px">
          <table class="job-table">
            <thead><tr><th>#</th><th>Vị trí tuyển dụng</th><th>Địa điểm</th><th>Đăng</th><th>Hành động</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`;
  }).join('');

  content.innerHTML = `
    <div class="overview-header">
      <div class="overview-title">⭐ Việc làm đã lưu <span style="font-size:16px;font-weight:500;color:var(--text-2)">(${bookmarks.size})</span></div>
      <div class="overview-sub">Được lưu trong trình duyệt này — không cần đăng nhập.</div>
    </div>
    ${groupsHtml}
  `;

  bindTableEvents(content);
}

// Company detail: job table
function renderCompany(companyId) {
  const co = state.data.companies.find(c => c.id === companyId);
  if (!co) { selectCompany('all'); return; }

  const sq = state.search.toLowerCase();
  const filteredJobs = applyFilters(co.jobs);
  // City-only filtered for count display
  const cityJobs = co.jobs.filter(j => {
    const cf = state.cityFilter;
    if (cf === 'hcm') return isHCM(j.location);
    if (cf === 'hanoi') return isHanoi(j.location);
    if (cf === 'other') return !isHCM(j.location) && !isHanoi(j.location);
    return true;
  });

  const initials = co.name.split(' ').map(w=>w[0]).join('').slice(0,3).toUpperCase();
  const applyLabel = co.applyEmail ? `✉️ Gửi CV qua Email` : '🔗 Trang tuyển dụng';
  const applyHref = co.applyEmail ? `mailto:${co.applyEmail}` : co.careerUrl;

  const backBtn = `<button class="btn-back mobile-only" onclick="selectCompany('all')">← Quay lại</button>`;

  if (co.jobs.length === 0) {
    content.innerHTML = `
      ${backBtn}
      <div class="company-header">
        <div class="company-header-logo" style="background:${co.color}">${initials}</div>
        <div class="company-header-info">
          <div class="company-header-name">${co.name} Vietnam</div>
          <div class="company-header-meta">Chưa có vị trí tuyển dụng • ${co.careerUrl.replace('https://','').split('/')[0]}</div>
        </div>
        <div class="company-header-cta">
          <a class="btn-apply btn-primary" href="${applyHref}" target="_blank">${applyLabel}</a>
        </div>
      </div>
      <div class="empty-state" style="margin-top:40px">
        <div class="empty-icon">📋</div>
        <div class="empty-text">Hiện chưa có vị trí đăng tuyển</div>
        <div class="empty-sub">Vui lòng theo dõi trang tuyển dụng để cập nhật thông tin mới nhất.</div>
      </div>`;
    return;
  }

  // Category breakdown chips (shown when no category filter active)
  const catChips = state.categoryFilter === 'all'
    ? buildCategoryChips(co.id, co.jobs)
    : '';

  const sqSafe = escapeHtml(sq);
  const tableRows = filteredJobs.length > 0
    ? filteredJobs.map((j, i) => {
        const key = jobKey(co.id, j);
        const isBookmarked = bookmarks.has(key);
        const locClass = isHanoi(j.location) ? 'hanoi' : (!isHCM(j.location) ? 'other' : '');
        const safeTitle = escapeHtml(j.title || '');
        const titleHl = sqSafe
          ? safeTitle.replace(new RegExp(`(${escapeRe(sqSafe)})`, 'gi'), '<mark>$1</mark>')
          : safeTitle;
        const newBadge = isNewJob(co.id, j.title) ? '<span class="new-badge">🆕 Mới</span>' : '';
        const catTag = buildCategoryTag(j.title);
        return `
          <tr>
            <td class="job-num">${i+1}</td>
            <td class="job-title">
              <span class="job-title-text">${titleHl}${newBadge}</span>
              <button class="job-bookmark-btn ${isBookmarked ? 'active' : ''}" data-key="${escapeHtml(key)}" title="${isBookmarked ? 'Bỏ lưu' : 'Lưu việc làm'}">★</button>
            </td>
            <td class="job-location"><span class="location-badge ${locClass}">📍 ${escapeHtml(j.location || '')}</span></td>
            <td class="job-category">${catTag}</td>
            <td class="job-posted">${escapeHtml(j.posted || '')}</td>
            <td class="job-actions">
              <div class="job-actions-inner">
                <a class="job-apply-link" href="${co.careerUrl}" target="_blank">Ứng tuyển →</a>
                <button class="job-share-btn" data-company-id="${co.id}" data-company-name="${escapeHtml(co.name)}" data-title="${escapeHtml(j.title || '')}" data-location="${escapeHtml(j.location || '')}" title="Chia sẻ">↗</button>
              </div>
            </td>
          </tr>`;
      }).join('')
    : `<tr><td colspan="6">
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-text">Không tìm thấy vị trí nào</div>
          <div class="empty-sub">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</div>
        </div>
       </td></tr>`;

  const activeFilters = [];
  if (state.categoryFilter !== 'all') activeFilters.push(`bộ phận: <strong>${CATEGORIES[state.categoryFilter]?.label || state.categoryFilter}</strong>`);
  if (sq) activeFilters.push(`từ khóa: "<strong>${sqSafe}</strong>"`);
  const filterNote = activeFilters.length ? ` · Lọc theo ${activeFilters.join(', ')}` : '';

  content.innerHTML = `
    ${backBtn}
    <div class="company-header">
      <div class="company-header-logo" style="background:${co.color}">${initials}</div>
      <div class="company-header-info">
        <div class="company-header-name">${co.name} Vietnam</div>
        <div class="company-header-meta">${co.jobs.length} vị trí đang tuyển • ${co.careerUrl.replace('https://','').split('/')[0]}</div>
      </div>
      <div class="company-header-cta">
        <a class="btn-apply btn-primary" href="${applyHref}" target="_blank">${applyLabel}</a>
      </div>
    </div>

    ${catChips}

    <div class="results-count">Hiển thị ${filteredJobs.length} / ${co.jobs.length} vị trí${filterNote}</div>

    <div class="job-table-wrap">
      <table class="job-table">
        <thead>
          <tr>
            <th class="job-num">#</th>
            <th>Vị trí tuyển dụng</th>
            <th class="job-location">Địa điểm</th>
            <th class="job-category">Bộ Phận</th>
            <th class="job-posted">Đăng</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  `;

  bindTableEvents(content);

  // Wire up category chip clicks
  content.querySelectorAll('.cat-chip[data-cat]').forEach(chip => {
    chip.addEventListener('click', () => {
      const cat = chip.dataset.cat;
      state.categoryFilter = (state.categoryFilter === cat) ? 'all' : cat;
      categoryFilter.value = state.categoryFilter;
      pushURL();
      render();
    });
  });
}

// Build category chips for company header
function buildCategoryChips(coId, jobs) {
  const counts = {};
  for (const j of jobs) {
    const cat = getCategory(j.title) || 'other';
    counts[cat] = (counts[cat] || 0) + 1;
  }
  const chips = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => {
      const label = CATEGORIES[cat]?.label || '⚙️ Khác';
      const isActive = state.categoryFilter === cat;
      return `<button class="cat-chip ${isActive ? 'active' : ''}" data-cat="${cat}">${label} <span class="cat-chip-count">${count}</span></button>`;
    }).join('');
  return chips ? `<div class="cat-chips">${chips}</div>` : '';
}

// Build single category tag for table cell
function buildCategoryTag(title) {
  const cat = getCategory(title);
  if (!cat) return '<span class="cat-tag cat-tag--other">—</span>';
  const info = CATEGORIES[cat];
  return `<span class="cat-tag cat-tag--${cat}">${info.label.split(' ').slice(0,3).join(' ')}</span>`;
}

// ─── TABLE EVENT DELEGATION ──────────────────────────────────────
function bindTableEvents(container) {
  container.addEventListener('click', e => {
    // Bookmark toggle
    const bBtn = e.target.closest('.job-bookmark-btn');
    if (bBtn) {
      const key = bBtn.dataset.key;
      toggleBookmark(key);
      bBtn.classList.toggle('active', bookmarks.has(key));
      bBtn.title = bookmarks.has(key) ? 'Bỏ lưu' : 'Lưu việc làm';
      if (state.activeCompany === 'saved') render();
      return;
    }
    // Share button
    const sBtn = e.target.closest('.job-share-btn');
    if (sBtn) {
      const { companyId, companyName, title, location } = sBtn.dataset;
      shareJob(companyId, companyName, title, location);
    }
  });
}

// ─── SHARE ──────────────────────────────────────────────────────
function shareJob(companyId, companyName, title, location) {
  const base = window.location.origin + window.location.pathname;
  const url = `${base}?company=${encodeURIComponent(companyId)}`;
  const text = `💼 ${title}\n🏢 ${companyName}\n📍 ${location}\n\n👉 Xem thêm: ${url}`;

  if (navigator.share) {
    navigator.share({ title, text, url }).catch(() => {});
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }
}

// ─── EVENTS ─────────────────────────────────────────────────────
function bindEvents() {
  companyNav.addEventListener('click', e => {
    const item = e.target.closest('.nav-item');
    if (!item) return;
    selectCompany(item.dataset.company);
  });

  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = searchInput.value.trim();
      pushURL();
      render();
    }, 200);
  });

  cityFilter.addEventListener('change', () => {
    state.cityFilter = cityFilter.value;
    pushURL();
    render();
  });

  categoryFilter.addEventListener('change', () => {
    state.categoryFilter = categoryFilter.value;
    pushURL();
    render();
  });
}

function selectCompany(id) {
  state.activeCompany = id;
  companyNav.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.company === id);
  });
  pushURL();
  render();
}

// ─── HELPERS ────────────────────────────────────────────────────
function isHCM(loc) {
  if (!loc) return false;
  const l = loc.toLowerCase();
  return l.includes('hồ chí minh') || l.includes('hcm') || l.includes('ho chi minh')
      || l.includes('saigon') || l.includes('sài gòn');
}

function isHanoi(loc) {
  if (!loc) return false;
  const l = loc.toLowerCase();
  return l.includes('hà nội') || l.includes('hanoi') || l.includes('ha noi');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  } catch { return dateStr; }
}

function escapeRe(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── BOOT ───────────────────────────────────────────────────────
loadData();
