// =============================================
// students_enhanced.js – Quản lý sinh viên nâng cao
// =============================================

let currentMStep  = 1;
let selectedProjId = null;
let csvImportData  = [];
let avatarDataUrl  = null;
let checkedIds     = new Set();

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => onFbuReady(() => {
  populateFilters();
  renderQuickStats();
  filterStudents();
}));

function populateFilters() {
  const sel = document.getElementById('filterClass');
  const fc  = document.getElementById('fClass');
  FBU.classes.forEach(c => {
    [sel, fc].forEach(el => { const o = document.createElement('option'); o.value = c; o.textContent = c; el.appendChild(o); });
  });
}

// ---- QUICK STATS ----
function renderQuickStats() {
  const total   = FBU.students.length;
  const active  = FBU.students.filter(s=>s.status==='active').length;
  const warning = FBU.students.filter(s=>s.status==='warning').length;
  const withP   = FBU.students.filter(s=>s.projectId).length;
  document.getElementById('quickStats').innerHTML = [
    { val: total,   lbl: 'Tổng Sinh Viên', color:'var(--accent)',  bg:'rgba(79,110,247,.15)',  icon:'fa-users' },
    { val: active,  lbl: 'Hoạt Động',      color:'var(--green)',   bg:'rgba(34,197,94,.15)',   icon:'fa-circle-check' },
    { val: warning, lbl: 'Cảnh Báo',       color:'var(--yellow)',  bg:'rgba(245,158,11,.15)',  icon:'fa-triangle-exclamation' },
    { val: withP,   lbl: 'Có Đồ Án',       color:'var(--pink)',    bg:'rgba(236,72,153,.15)',  icon:'fa-folder-open' },
  ].map(s => `
    <div class="qs-box">
      <div class="qs-icon" style="background:${s.bg};color:${s.color}"><i class="fa-solid ${s.icon}"></i></div>
      <div><span class="qs-val" style="color:${s.color}">${s.val}</span><span class="qs-lbl">${s.lbl}</span></div>
    </div>`).join('');
}

// ---- FILTER ----
function filterStudents() {
  const q      = document.getElementById('searchInput').value.toLowerCase();
  const cls    = document.getElementById('filterClass').value;
  const status = document.getElementById('filterStatus').value;
  const proj   = document.getElementById('filterProject').value;

  const result = FBU.students.filter(s =>
    (!q      || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || (s.email||'').toLowerCase().includes(q)) &&
    (!cls    || s.class === cls) &&
    (!status || s.status === status) &&
    (!proj   || (proj === 'yes' ? !!s.projectId : !s.projectId))
  );
  document.getElementById('resultCount').textContent = `${result.length} sinh viên`;
  renderTable(result);
}

// ---- RENDER TABLE ----
function renderTable(data) {
  const tbody = document.getElementById('studentBody');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:50px;color:var(--text2)">
      <i class="fa-solid fa-inbox" style="font-size:32px;display:block;margin-bottom:10px"></i>Không tìm thấy sinh viên nào</td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(s => {
    const st   = FBU.studentStatusLabel[s.status] || {};
    const proj = s.projectId ? FBU.getProject(s.projectId) : null;
    const gpaColor = s.gpa >= 3.5 ? 'var(--green)' : s.gpa >= 2.5 ? 'var(--yellow)' : s.gpa > 0 ? 'var(--red)' : 'var(--text3)';
    const initials = s.name ? s.name.split(' ').pop().charAt(0) : '?';
    const checked  = checkedIds.has(s.id);
    return `
      <tr>
        <td><input type="checkbox" class="row-check" value="${s.id}" ${checked?'checked':''} onchange="onCheck(this)"/></td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;overflow:hidden">
              ${s.avatar ? `<img src="${s.avatar}" style="width:100%;height:100%;object-fit:cover"/>` : initials}
            </div>
            <div>
              <div style="font-weight:600;font-size:13px">${s.name}</div>
              <div style="font-size:11px;color:var(--text3)">${s.id}</div>
            </div>
          </div>
        </td>
        <td><span class="tag tag-gray">${s.class}</span></td>
        <td style="font-size:12px;color:var(--text2)">${s.email || '—'}<br/><span style="color:var(--text3)">${s.phone||''}</span></td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-weight:700;color:${gpaColor};font-size:15px">${s.gpa ? s.gpa.toFixed(1) : '—'}</span>
            ${s.gpa ? `<div style="width:36px;height:4px;background:var(--bg3);border-radius:2px;overflow:hidden"><div style="width:${(s.gpa/4)*100}%;height:100%;background:${gpaColor};border-radius:2px"></div></div>` : ''}
          </div>
        </td>
        <td><span class="tag ${st.cls}">${st.label}</span></td>
        <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px">
          ${proj ? `<span title="${proj.title}" style="color:var(--accent)"><i class="fa-solid fa-folder" style="margin-right:4px"></i>${proj.title}</span>` : '<span style="color:var(--text3)">—</span>'}
        </td>
        <td>
          <div style="display:flex;gap:5px">
            <button class="btn-icon" style="width:30px;height:30px;border-radius:8px" title="Xem" onclick="viewStudent('${s.id}')"><i class="fa-regular fa-eye"></i></button>
            <button class="btn-icon" style="width:30px;height:30px;border-radius:8px" title="Sửa" onclick="editStudent('${s.id}')"><i class="fa-regular fa-pen-to-square"></i></button>
            <button class="btn-icon" style="width:30px;height:30px;border-radius:8px;color:var(--red)" title="Xóa" onclick="deleteStudent('${s.id}')"><i class="fa-regular fa-trash-can"></i></button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

// ---- OPEN MODAL ----
function openAddModal() {
  resetForm();
  document.getElementById('modalTitle').textContent = 'Thêm Sinh Viên Mới';
  document.getElementById('editId').value = '';
  renderProjectOptions(null);
  goMStep(1);
  openModal('modalStudent');
}

function closeAddModal() {
  closeModal('modalStudent');
}

// ---- MULTI-STEP ----
function goMStep(step) {
  currentMStep = step;
  document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
  document.getElementById('msec' + step).classList.add('active');
  document.querySelectorAll('.mstep-btn').forEach((b, i) => {
    b.classList.remove('active', 'done');
    if (i + 1 === step) b.classList.add('active');
    if (i + 1 < step)  b.classList.add('done');
  });
  if (step === 3) {
    document.getElementById('assignName').textContent = document.getElementById('fName').value.trim() || 'sinh viên này';
  }
}

function validateAndGoStep(step) {
  const name  = document.getElementById('fName').value.trim();
  const svId  = document.getElementById('fSvId').value.trim();
  const email = document.getElementById('fEmail').value.trim();
  if (!name)  { showToast('Vui lòng nhập họ tên!', 'error'); return; }
  if (!svId)  { showToast('Vui lòng nhập MSSV!', 'error'); return; }
  if (!email) { showToast('Vui lòng nhập email!', 'error'); return; }
  goMStep(step);
}

// ---- AVATAR ----
function updateInitials() {
  const name = document.getElementById('fName').value.trim();
  const initials = name ? name.split(' ').slice(-2).map(w=>w[0]).join('').toUpperCase() : '?';
  if (!avatarDataUrl) {
    document.getElementById('avatarInitials').textContent = initials;
  }
}

function handleAvatar(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    avatarDataUrl = ev.target.result;
    const circle = document.getElementById('avatarCircle');
    circle.style.backgroundImage = `url(${avatarDataUrl})`;
    circle.style.backgroundSize  = 'cover';
    circle.style.backgroundPosition = 'center';
    document.getElementById('avatarInitials').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// ---- GPA BAR ----
function updateGpaBar() {
  const gpa = parseFloat(document.getElementById('fGpa').value) || 0;
  const fill  = document.getElementById('gpaFill');
  const label = document.getElementById('gpaLabel');
  const pct   = Math.min((gpa / 4) * 100, 100);
  const color = gpa >= 3.5 ? 'var(--green)' : gpa >= 2.5 ? 'var(--yellow)' : gpa > 0 ? 'var(--red)' : 'var(--text3)';
  const rank  = gpa >= 3.6 ? '🏆 Xuất Sắc' : gpa >= 3.2 ? '⭐ Giỏi' : gpa >= 2.5 ? '✓ Khá' : gpa >= 2.0 ? '⚠ TB' : gpa > 0 ? '✗ Yếu' : '';
  fill.style.width      = pct + '%';
  fill.style.background = color;
  label.textContent     = rank;
  label.style.color     = color;
}

// ---- PROJECT OPTIONS ----
function renderProjectOptions(currentProjId) {
  selectedProjId = currentProjId || null;
  const el = document.getElementById('projectOptions');
  const noEl = document.getElementById('noProjectOpt');
  const available = FBU.projects.filter(p => p.status !== 'completed' && p.status !== 'failed');
  if (!available.length) { el.innerHTML = ''; noEl.style.display = 'block'; return; }
  noEl.style.display = 'none';
  el.innerHTML = available.map(p => {
    const teacher = FBU.getTeacher(p.teacherId);
    const st = FBU.statusLabel[p.status] || {};
    const isSel = p.id === selectedProjId;
    return `
      <div class="proj-option ${isSel?'selected':''}" onclick="selectProject('${p.id}',this)">
        <div style="width:32px;height:32px;border-radius:8px;background:rgba(79,110,247,.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="fa-solid fa-folder" style="color:var(--accent)"></i>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.title}</div>
          <div style="font-size:11px;color:var(--text2)">${teacher ? teacher.name.split('.').pop().trim() : '—'} · ${p.category}</div>
        </div>
        <span class="tag ${st.cls}" style="flex-shrink:0">${st.label}</span>
        <i class="fa-solid fa-circle-check" style="color:var(--accent);display:${isSel?'block':'none'}"></i>
      </div>`;
  }).join('') + `
    <div class="proj-option" onclick="selectProject(null,this)" style="${!selectedProjId?'border-color:var(--accent);background:rgba(79,110,247,.08)':''}">
      <i class="fa-solid fa-ban" style="color:var(--text3);font-size:18px"></i>
      <span style="color:var(--text2)">Chưa phân công đồ án</span>
    </div>`;
}

function selectProject(id, el) {
  selectedProjId = id;
  document.querySelectorAll('.proj-option').forEach(o => {
    o.classList.remove('selected');
    const icon = o.querySelector('.fa-circle-check');
    if (icon) icon.style.display = 'none';
  });
  el.classList.add('selected');
  const icon = el.querySelector('.fa-circle-check');
  if (icon) icon.style.display = 'block';
}

// ---- SAVE ----
function saveStudent() {
  const editId  = document.getElementById('editId').value;
  const name    = document.getElementById('fName').value.trim();
  const svId    = document.getElementById('fSvId').value.trim();
  const email   = document.getElementById('fEmail').value.trim();
  const cls     = document.getElementById('fClass').value;
  const gpa     = parseFloat(document.getElementById('fGpa').value) || 0;
  const status  = document.getElementById('fStatus').value;
  const gender  = document.getElementById('fGender').value;
  const dob     = document.getElementById('fDob').value;
  const phone   = document.getElementById('fPhone').value.trim();
  const cccd    = document.getElementById('fCccd').value.trim();
  const address = document.getElementById('fAddress').value.trim();
  const major   = document.getElementById('fMajor').value;
  const mode    = document.getElementById('fMode').value;
  const credits = parseInt(document.getElementById('fCredits').value) || 0;
  const note    = document.getElementById('fNote').value.trim();

  if (!name || !svId || !email || !cls) { showToast('Vui lòng điền đủ thông tin bắt buộc!', 'error'); return; }

  if (editId) {
    const s = FBU.getStudent(editId);
    // If projectId changed, update old project
    if (s.projectId && s.projectId !== selectedProjId) {
      const op = FBU.getProject(s.projectId);
      if (op) op.students = op.students.filter(x => x !== editId);
    }
    Object.assign(s, { name, email, class: cls, gpa, status, gender, dob, phone, cccd, address, major, mode, credits, note, avatar: avatarDataUrl || s.avatar, projectId: selectedProjId });
    if (selectedProjId) {
      const np = FBU.getProject(selectedProjId);
      if (np && !np.students.includes(editId)) np.students.push(editId);
    }
    showToast(`Đã cập nhật sinh viên ${name}`);
  } else {
    // Check duplicate MSSV
    if (FBU.getStudent(svId)) { showToast(`MSSV ${svId} đã tồn tại!`, 'error'); return; }
    const newSv = { id: svId, name, email, class: cls, gpa, status, gender, dob, phone, cccd, address, major, mode, credits, note, avatar: avatarDataUrl, projectId: selectedProjId, createdAt: new Date().toISOString().split('T')[0] };
    FBU.students.push(newSv);
    if (selectedProjId) {
      const p = FBU.getProject(selectedProjId);
      if (p && !p.students.includes(svId)) p.students.push(svId);
    }
    showToast(`Đã thêm sinh viên ${name}!`);
  }

  FBU.save();
  closeModal('modalStudent');
  renderQuickStats();
  filterStudents();
}

// ---- VIEW ----
function viewStudent(id) {
  const s    = FBU.getStudent(id);
  const proj = s.projectId ? FBU.getProject(s.projectId) : null;
  const t    = proj ? FBU.getTeacher(proj.teacherId) : null;
  const st   = FBU.studentStatusLabel[s.status] || {};
  const gpaColor = s.gpa >= 3.5 ? 'var(--green)' : s.gpa >= 2.5 ? 'var(--yellow)' : 'var(--red)';
  const initials = s.name.split(' ').pop().charAt(0);

  document.getElementById('detailContent').innerHTML = `
    <div style="background:linear-gradient(135deg,rgba(79,110,247,.12),rgba(124,58,237,.08));border:1px solid rgba(79,110,247,.2);border-radius:14px;padding:18px;display:flex;align-items:center;gap:16px;margin-bottom:20px">
      <div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;flex-shrink:0;overflow:hidden">
        ${s.avatar ? `<img src="${s.avatar}" style="width:100%;height:100%;object-fit:cover"/>` : initials}
      </div>
      <div style="flex:1">
        <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:700">${s.name}</div>
        <div style="font-size:12px;color:var(--text2)">${s.id} · ${s.class}</div>
        ${s.major ? `<div style="font-size:11px;color:var(--text3);margin-top:2px">${s.major}</div>` : ''}
      </div>
      <span class="tag ${st.cls}">${st.label}</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;margin-bottom:16px">
      <div><div style="color:var(--text2);font-size:11px;margin-bottom:3px">Email</div><strong>${s.email||'—'}</strong></div>
      <div><div style="color:var(--text2);font-size:11px;margin-bottom:3px">Điện Thoại</div><strong>${s.phone||'—'}</strong></div>
      <div><div style="color:var(--text2);font-size:11px;margin-bottom:3px">GPA</div><strong style="font-size:20px;color:${gpaColor}">${s.gpa ? s.gpa.toFixed(2) : '—'}</strong></div>
      <div><div style="color:var(--text2);font-size:11px;margin-bottom:3px">Tín Chỉ</div><strong>${s.credits||'—'}</strong></div>
      ${s.dob    ? `<div><div style="color:var(--text2);font-size:11px;margin-bottom:3px">Ngày Sinh</div><strong>${s.dob}</strong></div>` : ''}
      ${s.gender ? `<div><div style="color:var(--text2);font-size:11px;margin-bottom:3px">Giới Tính</div><strong>${s.gender}</strong></div>` : ''}
      ${s.cccd   ? `<div><div style="color:var(--text2);font-size:11px;margin-bottom:3px">CCCD</div><strong>${s.cccd}</strong></div>` : ''}
      ${s.mode   ? `<div><div style="color:var(--text2);font-size:11px;margin-bottom:3px">Hình Thức</div><strong>${s.mode}</strong></div>` : ''}
    </div>
    ${s.address ? `<div style="font-size:13px;margin-bottom:12px"><div style="color:var(--text2);font-size:11px;margin-bottom:3px">Địa Chỉ</div><strong>${s.address}</strong></div>` : ''}
    <div style="background:var(--bg3);border-radius:12px;padding:14px;font-size:13px">
      <div style="color:var(--text2);font-size:11px;margin-bottom:6px">Đồ Án</div>
      ${proj ? `
        <div style="font-weight:600;color:var(--accent)">${proj.title}</div>
        <div style="font-size:12px;color:var(--text2);margin-top:4px">GVHD: ${t ? t.name : '—'} · ${proj.category} · <span class="tag ${FBU.statusLabel[proj.status].cls}">${FBU.statusLabel[proj.status].label}</span></div>
      ` : '<span style="color:var(--text3)">Chưa được phân công đồ án</span>'}
    </div>
    ${s.note ? `<div style="font-size:12px;color:var(--text2);margin-top:12px;padding:10px;background:var(--bg3);border-radius:8px">📝 ${s.note}</div>` : ''}`;

  document.getElementById('editFromDetail').onclick = () => { closeModal('modalDetail'); editStudent(id); };
  openModal('modalDetail');
}

// ---- EDIT ----
function editStudent(id) {
  const s = FBU.getStudent(id);
  resetForm();
  document.getElementById('modalTitle').textContent = 'Chỉnh Sửa Sinh Viên';
  document.getElementById('editId').value  = s.id;
  document.getElementById('fName').value   = s.name;
  document.getElementById('fSvId').value   = s.id;
  document.getElementById('fSvId').disabled= true;
  document.getElementById('fEmail').value  = s.email || '';
  document.getElementById('fGender').value = s.gender || '';
  document.getElementById('fDob').value    = s.dob || '';
  document.getElementById('fPhone').value  = s.phone || '';
  document.getElementById('fCccd').value   = s.cccd || '';
  document.getElementById('fAddress').value= s.address || '';
  document.getElementById('fClass').value  = s.class;
  document.getElementById('fGpa').value    = s.gpa || '';
  document.getElementById('fStatus').value = s.status;
  document.getElementById('fMajor').value  = s.major || '';
  document.getElementById('fMode').value   = s.mode || 'Chính Quy';
  document.getElementById('fCredits').value= s.credits || '';
  document.getElementById('fNote').value   = s.note || '';
  if (s.avatar) {
    avatarDataUrl = s.avatar;
    const circle = document.getElementById('avatarCircle');
    circle.style.backgroundImage = `url(${s.avatar})`;
    circle.style.backgroundSize  = 'cover';
    document.getElementById('avatarInitials').style.display = 'none';
  } else {
    updateInitials();
  }
  updateGpaBar();
  renderProjectOptions(s.projectId);
  goMStep(1);
  openModal('modalStudent');
}

// ---- DELETE ----
function deleteStudent(id) {
  const s = FBU.getStudent(id);
  if (!confirm(`Xóa sinh viên "${s.name}"?\nHành động này không thể hoàn tác.`)) return;
  if (s.projectId) {
    const p = FBU.getProject(s.projectId);
    if (p) p.students = p.students.filter(x => x !== id);
  }
  FBU.students = FBU.students.filter(sv => sv.id !== id);
  checkedIds.delete(id);
  FBU.save(); showToast(`Đã xóa sinh viên ${s.name}`, 'error');
  renderQuickStats(); filterStudents();
}

// ---- RESET FORM ----
function resetForm() {
  document.getElementById('editId').value = '';
  document.getElementById('fSvId').disabled = false;
  avatarDataUrl = null;
  const circle = document.getElementById('avatarCircle');
  circle.style.backgroundImage = 'none';
  document.getElementById('avatarInitials').style.display = '';
  document.getElementById('avatarInitials').textContent = '?';
  ['fName','fSvId','fEmail','fGender','fDob','fPhone','fCccd','fAddress','fGpa','fCredits','fNote'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('fStatus').value = 'active';
  document.getElementById('fMode').value   = 'Chính Quy';
  selectedProjId = null;
  const gFill = document.getElementById('gpaFill');
  if (gFill) { gFill.style.width='0'; }
  const gLabel = document.getElementById('gpaLabel');
  if (gLabel) gLabel.textContent = '';
}

// ---- BULK ACTIONS ----
function toggleAll(cb) {
  document.querySelectorAll('.row-check').forEach(c => {
    c.checked = cb.checked;
    if (cb.checked) checkedIds.add(c.value); else checkedIds.delete(c.value);
  });
  updateBulkBar();
}
function onCheck(cb) {
  if (cb.checked) checkedIds.add(cb.value); else checkedIds.delete(cb.value);
  updateBulkBar();
}
function updateBulkBar() {
  const bar = document.getElementById('bulkBar');
  const cnt = document.getElementById('bulkCount');
  if (checkedIds.size > 0) {
    bar.style.display = 'flex';
    cnt.textContent = `Đã chọn ${checkedIds.size} sinh viên`;
  } else {
    bar.style.display = 'none';
  }
}
function bulkAction(action) {
  if (!checkedIds.size) return;
  if (action === 'delete') {
    if (!confirm(`Xóa ${checkedIds.size} sinh viên đã chọn?`)) return;
    checkedIds.forEach(id => {
      const s = FBU.getStudent(id);
      if (s?.projectId) { const p = FBU.getProject(s.projectId); if (p) p.students = p.students.filter(x=>x!==id); }
      FBU.students = FBU.students.filter(sv => sv.id !== id);
    });
    showToast(`Đã xóa ${checkedIds.size} sinh viên`, 'error');
  } else {
    checkedIds.forEach(id => { const s = FBU.getStudent(id); if (s) s.status = action; });
    showToast(`Đã cập nhật trạng thái cho ${checkedIds.size} sinh viên`);
  }
  checkedIds.clear();
  FBU.save(); renderQuickStats(); filterStudents();
}

// ---- CSV IMPORT ----
function handleCSV(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const lines = ev.target.result.trim().split('\n').filter(l=>l.trim());
    csvImportData = lines.map(line => {
      const cols = line.split(',').map(c=>c.trim());
      return { id: cols[0], name: cols[1], class: cols[2], email: cols[3], gpa: parseFloat(cols[4])||0 };
    }).filter(r => r.id && r.name);

    document.getElementById('previewCount').textContent = `${csvImportData.length} sinh viên sẽ được import`;
    document.getElementById('previewBody').innerHTML = csvImportData.slice(0, 8).map(r => `
      <tr><td>${r.id}</td><td>${r.name}</td><td>${r.class||'—'}</td><td>${r.email||'—'}</td><td>${r.gpa||'—'}</td></tr>`).join('') +
      (csvImportData.length > 8 ? `<tr><td colspan="5" style="text-align:center;color:var(--text2)">...và ${csvImportData.length-8} dòng nữa</td></tr>` : '');
    document.getElementById('bulkPreview').style.display = 'block';
    document.getElementById('importBtn').style.display   = 'inline-flex';
  };
  reader.readAsText(file, 'utf-8');
}

function doImport() {
  let added = 0, skipped = 0;
  csvImportData.forEach(r => {
    if (FBU.getStudent(r.id)) { skipped++; return; }
    FBU.students.push({ id: r.id, name: r.name, class: r.class, email: r.email, gpa: r.gpa, status: 'active', projectId: null });
    added++;
  });
  FBU.save();
  showToast(`Import xong! Đã thêm ${added} sinh viên${skipped ? `, bỏ qua ${skipped} (trùng MSSV)` : ''}`);
  closeModal('modalImport');
  csvImportData = [];
  document.getElementById('bulkPreview').style.display = 'none';
  document.getElementById('importBtn').style.display   = 'none';
  renderQuickStats(); filterStudents();
}

// ---- EXPORT CSV ----
function exportStudentCSV() {
  const headers = ['MSSV','Họ Tên','Lớp','Email','GPA','Trạng Thái','Đồ Án','Ngày Sinh','SĐT'];
  const rows = FBU.students.map(s => [
    s.id, `"${s.name}"`, s.class, s.email||'', s.gpa||'',
    FBU.studentStatusLabel[s.status]?.label || s.status,
    s.projectId ? `"${FBU.getProject(s.projectId)?.title||'—'}"` : '—',
    s.dob||'', s.phone||''
  ]);
  const content = [headers, ...rows].map(r=>r.join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+content], { type:'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'fbu_sinhvien.csv'; a.click();
  showToast('Đã xuất file CSV!');
}