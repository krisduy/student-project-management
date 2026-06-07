// =============================================
// reports.js – Báo cáo & thống kê
// =============================================

document.addEventListener('DOMContentLoaded', () => onFbuReady(() => {
  renderKPIs();
  renderCatBars();
  renderTopProjects();
  renderTeacherLoad();
  renderStatusSummary();
  renderClassBars();
}));

function renderKPIs() {
  const total    = FBU.projects.length;
  const done     = FBU.projects.filter(p=>p.status==='completed').length;
  const graded   = FBU.grades.length;
  const avgScore = graded ? (FBU.grades.reduce((s,g)=>s+g.final,0)/graded).toFixed(1) : '—';
  const rate     = total ? Math.round((done/total)*100) : 0;

  document.getElementById('kpiRow').innerHTML = [
    { val: total,    lbl: 'Tổng Đồ Án',     color: 'var(--accent)' },
    { val: `${rate}%`,lbl: 'Hoàn Thành',    color: 'var(--green)'  },
    { val: graded,   lbl: 'Đã Chấm Điểm',  color: 'var(--yellow)' },
    { val: avgScore, lbl: 'Điểm Trung Bình',color: 'var(--pink)'   },
  ].map(k => `
    <div class="kpi-box">
      <span class="kpi-val" style="color:${k.color}">${k.val}</span>
      <span class="kpi-lbl">${k.lbl}</span>
    </div>`).join('');
}

function renderCatBars() {
  const cats = {};
  FBU.projects.forEach(p => cats[p.category] = (cats[p.category]||0)+1);
  const max = Math.max(...Object.values(cats),1);
  const COLORS = ['#4F6EF7','#22C55E','#F59E0B','#EC4899','#7C3AED','#14B8A6','#EF4444'];
  const el = document.getElementById('catBars');
  el.innerHTML = Object.entries(cats).map(([cat,val],i) => `
    <div class="rep-bar-grp">
      <span class="rep-bar-val">${val}</span>
      <div class="rep-bar" style="height:${Math.round((val/max)*100)}px;background:${COLORS[i%COLORS.length]}"></div>
      <span class="rep-bar-lbl">${cat}</span>
    </div>`).join('');
}

function renderTopProjects() {
  const ranked = FBU.projects
    .filter(p => p.score !== null)
    .sort((a,b) => b.score - a.score)
    .slice(0, 5);
  const el = document.getElementById('topProjects');
  if (!ranked.length) { el.innerHTML = '<div style="color:var(--text2);font-size:13px;padding:20px 0">Chưa có đồ án nào được chấm điểm.</div>'; return; }
  const RANK = ['gold','silver','bronze','',''];
  el.innerHTML = ranked.map((p,i) => {
    const sv = p.students.map(id=>FBU.getStudent(id)).filter(Boolean).map(s=>s.name).join(', ');
    return `
      <div class="top-item">
        <div class="top-rank ${RANK[i]}">${i+1}</div>
        <div class="top-body">
          <div style="font-weight:600;font-size:13px;line-height:1.3">${p.title}</div>
          <div style="font-size:11px;color:var(--text2);margin-top:2px">${sv}</div>
        </div>
        <span class="top-score">${p.score.toFixed(1)}</span>
      </div>`;
  }).join('');
}

function renderTeacherLoad() {
  const el = document.getElementById('teacherLoad');
  const max = Math.max(...FBU.teachers.map(t => FBU.projects.filter(p=>p.teacherId===t.id).length), 1);
  el.innerHTML = FBU.teachers.map(t => {
    const cnt  = FBU.projects.filter(p=>p.teacherId===t.id).length;
    const done = FBU.projects.filter(p=>p.teacherId===t.id && p.status==='completed').length;
    return `
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
          <span>${t.name.split('.').pop().trim()}</span>
          <span style="color:var(--text2)">${cnt} ĐA · ${done} hoàn thành</span>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-track">
            <div class="progress-fill" style="width:${Math.round((cnt/max)*100)}%"></div>
          </div>
        </div>
      </div>`;
  }).join('');
}

function renderStatusSummary() {
  const el = document.getElementById('statusSummary');
  const statuses = ['completed','in-progress','pending','failed'];
  const total = FBU.projects.length || 1;
  el.innerHTML = statuses.map(s => {
    const cnt  = FBU.projects.filter(p=>p.status===s).length;
    const pct  = Math.round((cnt/total)*100);
    const info = FBU.statusLabel[s] || {};
    const colorMap = { completed:'var(--green)', 'in-progress':'var(--accent)', pending:'var(--yellow)', failed:'var(--red)' };
    return `
      <div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
          <span class="tag ${info.cls}">${info.label}</span>
          <span style="font-weight:700">${cnt} <span style="color:var(--text2);font-weight:400">(${pct}%)</span></span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${pct}%;background:${colorMap[s]}"></div>
        </div>
      </div>`;
  }).join('');
}

function renderClassBars() {
  const cls = {};
  FBU.classes.forEach(c => cls[c] = FBU.students.filter(s=>s.class===c).length);
  const max = Math.max(...Object.values(cls),1);
  const COLORS = ['#4F6EF7','#22C55E','#F59E0B','#EC4899','#7C3AED','#14B8A6'];
  const el = document.getElementById('classBars');
  el.innerHTML = Object.entries(cls).map(([c,val],i) => `
    <div class="rep-bar-grp">
      <span class="rep-bar-val">${val}</span>
      <div class="rep-bar" style="height:${Math.round((val/max)*120)}px;background:${COLORS[i%COLORS.length]}"></div>
      <span class="rep-bar-lbl">${c}</span>
    </div>`).join('');
}

// ---- EXPORT ----
function exportCSV() {
  const headers = ['Mã ĐA','Tên Đồ Án','Loại','Sinh Viên','GVHD','Bắt Đầu','Deadline','Trạng Thái','Điểm'];
  const rows = FBU.projects.map(p => [
    p.id, `"${p.title}"`,
    p.category,
    `"${p.students.map(id=>FBU.getStudent(id)?.name||id).join('; ')}"`,
    `"${FBU.getTeacher(p.teacherId)?.name||'—'}"`,
    p.startDate, p.deadline,
    FBU.statusLabel[p.status]?.label || p.status,
    p.score !== null ? p.score : '—'
  ]);
  downloadCSV([headers, ...rows], 'fbu_doan.csv');
}

function exportStudentCSV() {
  const headers = ['MSSV','Họ Tên','Lớp','Email','GPA','Trạng Thái','Đồ Án'];
  const rows = FBU.students.map(s => [
    s.id, `"${s.name}"`, s.class, s.email, s.gpa,
    FBU.studentStatusLabel[s.status]?.label || s.status,
    s.projectId ? `"${FBU.getProject(s.projectId)?.title||'—'}"` : '—'
  ]);
  downloadCSV([headers, ...rows], 'fbu_sinhvien.csv');
}

function downloadCSV(rows, filename) {
  const content = rows.map(r => r.join(',')).join('\n');
  const blob    = new Blob(['\uFEFF'+content], { type: 'text/csv;charset=utf-8;' });
  const url     = URL.createObjectURL(blob);
  const a       = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  showToast(`Đã xuất file ${filename}!`);
}