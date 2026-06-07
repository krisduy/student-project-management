// =============================================
// dashboard.js – Dashboard page logic
// =============================================

document.addEventListener('DOMContentLoaded', () => onFbuReady(() => {
  renderStats();
  renderDonut();
  renderRecent();
  renderBars();
  renderDeadlines();
  animateCounters();
}));

function renderStats() {
  document.getElementById('s-students').textContent = FBU.students.length;
  document.getElementById('s-projects').textContent = FBU.projects.length;
  document.getElementById('s-teachers').textContent = FBU.teachers.length;
  document.getElementById('s-done').textContent = FBU.projects.filter(p=>p.status==='completed').length;
}

function animateCounters() {
  document.querySelectorAll('.stat-value').forEach(el => {
    const target = parseInt(el.textContent, 10);
    if (isNaN(target)) return;
    let cur = 0; const step = Math.ceil(target / 40);
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = cur;
      if (cur >= target) clearInterval(t);
    }, 20);
  });
}

function renderDonut() {
  const canvas = document.getElementById('statusChart');
  const ctx = canvas.getContext('2d');
  const data = [
    { label: 'Hoàn Thành',       value: FBU.projects.filter(p=>p.status==='completed').length,   color: '#22C55E' },
    { label: 'Đang Thực Hiện',   value: FBU.projects.filter(p=>p.status==='in-progress').length, color: '#4F6EF7' },
    { label: 'Chờ Duyệt',        value: FBU.projects.filter(p=>p.status==='pending').length,     color: '#F59E0B' },
    { label: 'Không Đạt',        value: FBU.projects.filter(p=>p.status==='failed').length,      color: '#EF4444' },
  ].filter(d => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 110, cy = 110, r = 85, inner = 55;
  let angle = -Math.PI / 2;

  ctx.clearRect(0, 0, 220, 220);
  data.forEach(d => {
    const slice = (d.value / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = d.color;
    ctx.fill();
    angle += slice;
  });

  // Inner hole
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, 2 * Math.PI);
  ctx.fillStyle = '#141720';
  ctx.fill();

  // Center text
  ctx.fillStyle = '#E8EAF0';
  ctx.font = 'bold 28px Syne, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(total, cx, cy - 8);
  ctx.font = '11px DM Sans, sans-serif';
  ctx.fillStyle = '#8B90A0';
  ctx.fillText('Tổng đồ án', cx, cy + 14);

  // Legend
  const legend = document.getElementById('donutLegend');
  legend.innerHTML = data.map(d => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${d.color}"></span>
      <span class="legend-label">${d.label}</span>
      <span class="legend-val">${d.value}</span>
    </div>
  `).join('');
}

function renderRecent() {
  const el = document.getElementById('recentProjects');
  const recent = [...FBU.projects].slice(-5).reverse();
  el.innerHTML = recent.map(p => {
    const teacher = FBU.getTeacher(p.teacherId);
    const s = FBU.statusLabel[p.status] || {};
    return `
      <div class="recent-item" onclick="location.href='projects.html'">
        <div class="ri-icon"><i class="fa-solid fa-folder"></i></div>
        <div class="ri-body">
          <div class="ri-title">${p.title}</div>
          <div class="ri-sub">${teacher ? teacher.name : '—'} &middot; ${p.category}</div>
        </div>
        <div class="ri-right">
          <span class="tag ${s.cls}">${s.label}</span>
          <div class="ri-date" style="margin-top:4px">${p.deadline}</div>
        </div>
      </div>`;
  }).join('');
}

function renderBars() {
  const cats = {};
  FBU.projects.forEach(p => { cats[p.category] = (cats[p.category]||0)+1; });
  const max = Math.max(...Object.values(cats), 1);
  const HEIGHT = 110;
  const el = document.getElementById('barChart');
  el.innerHTML = Object.entries(cats).map(([cat, val], i) => `
    <div class="bar-group">
      <span class="bar-val">${val}</span>
      <div class="bar-fill ${i%2===1?'alt':''}" style="height:${Math.round((val/max)*HEIGHT)}px"></div>
      <span class="bar-label">${cat}</span>
    </div>
  `).join('');
}

function renderDeadlines() {
  const el = document.getElementById('deadlineList');
  const today = new Date();
  const sorted = FBU.projects
    .filter(p => p.status !== 'completed')
    .map(p => ({ ...p, daysLeft: Math.ceil((new Date(p.deadline) - today) / 86400000) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 4);

  el.innerHTML = sorted.map(p => {
    const d = new Date(p.deadline);
    const urgent = p.daysLeft <= 7;
    return `
      <div class="dl-item ${urgent?'dl-urgent':''}">
        <div class="dl-date">
          <span class="dl-day">${d.getDate()}</span>
          <span class="dl-mon">${d.toLocaleString('vi',{month:'short'})}</span>
        </div>
        <div class="dl-body">
          <div class="dl-title">${p.title}</div>
          <div class="dl-sub">${p.daysLeft > 0 ? `Còn ${p.daysLeft} ngày` : 'Đã quá hạn'} &middot; ${p.category}</div>
        </div>
        ${urgent ? '<span class="tag tag-red">Gấp</span>' : ''}
      </div>`;
  }).join('');
}