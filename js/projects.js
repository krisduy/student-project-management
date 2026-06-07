// =============================================
// projects.js – Quản lý đồ án
// =============================================

let viewMode = 'grid';

document.addEventListener('DOMContentLoaded', () => onFbuReady(() => {
  populateFilters();
  filterProjects();
}));

function populateFilters() {
  const catSel = document.getElementById('filterCat');
  FBU.categories.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; catSel.appendChild(o); });

  const fCat = document.getElementById('fCategory');
  FBU.categories.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; fCat.appendChild(o); });

  const fT = document.getElementById('fTeacher');
  FBU.teachers.forEach(t => { const o = document.createElement('option'); o.value = t.id; o.textContent = t.name; fT.appendChild(o); });
}

function filterProjects() {
  const q      = document.getElementById('searchInput').value.toLowerCase();
  const status = document.getElementById('filterStatus').value;
  const cat    = document.getElementById('filterCat').value;

  const result = FBU.projects.filter(p =>
    (!q      || p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) &&
    (!status || p.status === status) &&
    (!cat    || p.category === cat)
  );
  document.getElementById('resultCount').textContent = `${result.length} đồ án`;
  renderGrid(result);
  renderList(result);
}

function setView(v) {
  viewMode = v;
  document.getElementById('projectGrid').style.display = v === 'grid' ? 'grid' : 'none';
  document.getElementById('projectList').style.display = v === 'list' ? 'block' : 'none';
  document.getElementById('btnGrid').classList.toggle('active', v === 'grid');
  document.getElementById('btnList').classList.toggle('active', v === 'list');
}

function renderGrid(data) {
  const el = document.getElementById('projectGrid');
  if (!data.length) {
    el.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text2)"><i class="fa-solid fa-inbox" style="font-size:36px;display:block;margin-bottom:12px"></i>Không có đồ án nào</div>`;
    return;
  }
  el.innerHTML = data.map(p => {
    const teacher = FBU.getTeacher(p.teacherId);
    const sv = p.students.map(id => FBU.getStudent(id)).filter(Boolean);
    const st = FBU.statusLabel[p.status] || {};
    const daysLeft = Math.ceil((new Date(p.deadline) - new Date()) / 86400000);
    const deadlineColor = daysLeft <= 7 ? 'var(--red)' : daysLeft <= 30 ? 'var(--yellow)' : 'var(--text2)';
    return `
      <div class="proj-card" onclick="viewProject('${p.id}')">
        <div class="proj-card-top">
          <div class="proj-title">${p.title}</div>
          <span class="proj-cat">${p.category}</span>
        </div>
        <div class="proj-desc">${p.desc || 'Không có mô tả.'}</div>
        <div class="proj-meta">
          <span><i class="fa-solid fa-chalkboard-user"></i>${teacher ? teacher.name.split('.').pop().trim() : '—'}</span>
          <span><i class="fa-solid fa-users"></i>${sv.length} SV</span>
          <span style="color:${deadlineColor}"><i class="fa-regular fa-calendar"></i>${p.deadline}</span>
        </div>
        <div class="proj-footer">
          <span class="tag ${st.cls}">${st.label}</span>
          ${p.score !== null ? `<span class="score-badge">${p.score.toFixed(1)}<span style="font-size:13px;color:var(--text2)">/10</span></span>` : '<span style="font-size:12px;color:var(--text3)">Chưa chấm</span>'}
        </div>
      </div>`;
  }).join('');
}

function renderList(data) {
  const tbody = document.getElementById('projectListBody');
  tbody.innerHTML = data.map(p => {
    const teacher = FBU.getTeacher(p.teacherId);
    const sv = p.students.map(id => FBU.getStudent(id)).filter(Boolean).map(s => s.name).join(', ');
    const st = FBU.statusLabel[p.status] || {};
    return `
      <tr onclick="viewProject('${p.id}')" style="cursor:pointer">
        <td><code style="font-size:12px;color:var(--accent)">${p.id}</code></td>
        <td style="font-weight:500;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.title}</td>
        <td><span class="tag tag-gray">${p.category}</span></td>
        <td style="font-size:12px;color:var(--text2);max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${sv || '—'}</td>
        <td style="font-size:12px">${teacher ? teacher.name.split('.').pop().trim() : '—'}</td>
        <td style="font-size:12px;color:var(--text2)">${p.deadline}</td>
        <td><span class="tag ${st.cls}">${st.label}</span></td>
        <td style="font-weight:700;color:var(--green)">${p.score !== null ? p.score.toFixed(1) : '—'}</td>
        <td onclick="event.stopPropagation()">
          <div style="display:flex;gap:6px">
            <button class="btn-icon" style="width:30px;height:30px;border-radius:8px" onclick="editProject('${p.id}')"><i class="fa-regular fa-pen-to-square"></i></button>
            <button class="btn-icon" style="width:30px;height:30px;border-radius:8px;color:var(--red)" onclick="deleteProject('${p.id}')"><i class="fa-regular fa-trash-can"></i></button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function viewProject(id) {
  const p = FBU.getProject(id);
  const teacher = FBU.getTeacher(p.teacherId);
  const sv = p.students.map(sid => FBU.getStudent(sid)).filter(Boolean);
  const st = FBU.statusLabel[p.status] || {};
  document.getElementById('detailContent').innerHTML = `
    <div style="background:var(--bg3);border-radius:12px;padding:16px;margin-bottom:16px">
      <div style="font-family:'Syne',sans-serif;font-size:17px;font-weight:700;margin-bottom:8px">${p.title}</div>
      <div style="font-size:12px;color:var(--text2)">${p.desc || 'Không có mô tả.'}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">
      <div><span style="color:var(--text2)">Mã ĐA:</span><br><strong>${p.id}</strong></div>
      <div><span style="color:var(--text2)">Loại:</span><br><span class="tag tag-gray">${p.category}</span></div>
      <div><span style="color:var(--text2)">GVHD:</span><br><strong>${teacher ? teacher.name : '—'}</strong></div>
      <div><span style="color:var(--text2)">Trạng Thái:</span><br><span class="tag ${st.cls}">${st.label}</span></div>
      <div><span style="color:var(--text2)">Bắt Đầu:</span><br><strong>${p.startDate}</strong></div>
      <div><span style="color:var(--text2)">Deadline:</span><br><strong>${p.deadline}</strong></div>
      <div><span style="color:var(--text2)">Điểm Số:</span><br><strong style="font-size:20px;color:var(--green)">${p.score !== null ? p.score.toFixed(1)+'/10' : '—'}</strong></div>
      <div><span style="color:var(--text2)">Sinh Viên:</span><br>${sv.map(s=>`<div style="margin-top:4px">${s.name} <span style="color:var(--text3)">(${s.id})</span></div>`).join('')}</div>
    </div>`;
  document.getElementById('editFromDetail').onclick = () => { closeModal('modalDetail'); editProject(id); };
  openModal('modalDetail');
}

function editProject(id) {
  const p = FBU.getProject(id);
  document.getElementById('modalTitle').textContent = 'Chỉnh Sửa Đồ Án';
  document.getElementById('editId').value    = p.id;
  document.getElementById('fTitle').value    = p.title;
  document.getElementById('fCategory').value = p.category;
  document.getElementById('fTeacher').value  = p.teacherId;
  document.getElementById('fStart').value    = p.startDate;
  document.getElementById('fDeadline').value = p.deadline;
  document.getElementById('fStatus').value   = p.status;
  document.getElementById('fScore').value    = p.score !== null ? p.score : '';
  document.getElementById('fDesc').value     = p.desc || '';
  openModal('modalProject');
}

function saveProject() {
  const id       = document.getElementById('editId').value;
  const title    = document.getElementById('fTitle').value.trim();
  const category = document.getElementById('fCategory').value;
  const teacherId= document.getElementById('fTeacher').value;
  const startDate= document.getElementById('fStart').value;
  const deadline = document.getElementById('fDeadline').value;
  const status   = document.getElementById('fStatus').value;
  const scoreRaw = document.getElementById('fScore').value;
  const score    = scoreRaw !== '' ? parseFloat(scoreRaw) : null;
  const desc     = document.getElementById('fDesc').value.trim();

  if (!title || !category || !teacherId || !deadline) { showToast('Vui lòng điền đầy đủ thông tin bắt buộc!', 'error'); return; }

  if (id) {
    const p = FBU.getProject(id);
    Object.assign(p, { title, category, teacherId, startDate, deadline, status, score, desc });
    showToast('Đã cập nhật đồ án!');
  } else {
    FBU.projects.push({ id: FBU.nextId('DA', FBU.projects), title, category, teacherId, startDate, deadline, status, score, desc, students: [] });
    showToast('Đã thêm đồ án mới!');
  }
  FBU.save(); closeModal('modalProject'); resetProjectForm(); filterProjects();
}

function deleteProject(id) {
  const p = FBU.getProject(id);
  if (!confirm(`Xóa đồ án "${p.title}"?`)) return;
  FBU.projects = FBU.projects.filter(pr => pr.id !== id);
  FBU.students.forEach(s => { if (s.projectId === id) s.projectId = null; });
  FBU.save(); showToast('Đã xóa đồ án!', 'error'); filterProjects();
}

function resetProjectForm() {
  document.getElementById('editId').value = '';
  document.getElementById('modalTitle').textContent = 'Thêm Đồ Án';
  ['fTitle','fStart','fDeadline','fScore','fDesc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('fStatus').value = 'pending';
}