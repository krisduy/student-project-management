// =============================================
// students.js – Quản lý sinh viên
// =============================================

document.addEventListener('DOMContentLoaded', () => onFbuReady(() => {
  populateFilters();
  renderTable(FBU.students);
}));

function populateFilters() {
  const sel = document.getElementById('filterClass');
  FBU.classes.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; sel.appendChild(o); });

  const fc = document.getElementById('fClass');
  FBU.classes.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; fc.appendChild(o); });
}

function filterStudents() {
  const q       = document.getElementById('searchInput').value.toLowerCase();
  const cls     = document.getElementById('filterClass').value;
  const status  = document.getElementById('filterStatus').value;

  const result = FBU.students.filter(s =>
    (!q      || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) &&
    (!cls    || s.class === cls) &&
    (!status || s.status === status)
  );
  renderTable(result);
}

function renderTable(data) {
  document.getElementById('resultCount').textContent = `${data.length} sinh viên`;
  const tbody = document.getElementById('studentBody');
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text2)"><i class="fa-solid fa-inbox" style="font-size:28px;display:block;margin-bottom:10px"></i>Không tìm thấy sinh viên</td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(s => {
    const st   = FBU.studentStatusLabel[s.status] || {};
    const proj = s.projectId ? FBU.getProject(s.projectId) : null;
    const gpaColor = s.gpa >= 3.5 ? 'var(--green)' : s.gpa >= 2.5 ? 'var(--yellow)' : 'var(--red)';
    return `
      <tr>
        <td><code style="font-size:12px;color:var(--accent)">${s.id}</code></td>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">
              ${s.name.split(' ').pop().charAt(0)}
            </div>
            <span style="font-weight:500">${s.name}</span>
          </div>
        </td>
        <td><span class="tag tag-gray">${s.class}</span></td>
        <td style="color:var(--text2);font-size:12px">${s.email}</td>
        <td><span style="font-weight:700;color:${gpaColor}">${s.gpa.toFixed(1)}</span></td>
        <td><span class="tag ${st.cls}">${st.label}</span></td>
        <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px">
          ${proj ? `<span title="${proj.title}">${proj.title}</span>` : '<span style="color:var(--text3)">—</span>'}
        </td>
        <td>
          <div style="display:flex;gap:6px">
            <button class="btn-icon" style="width:30px;height:30px;border-radius:8px" title="Xem" onclick="viewStudent('${s.id}')"><i class="fa-regular fa-eye"></i></button>
            <button class="btn-icon" style="width:30px;height:30px;border-radius:8px" title="Sửa" onclick="editStudent('${s.id}')"><i class="fa-regular fa-pen-to-square"></i></button>
            <button class="btn-icon" style="width:30px;height:30px;border-radius:8px;color:var(--red)" title="Xóa" onclick="deleteStudent('${s.id}')"><i class="fa-regular fa-trash-can"></i></button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

function viewStudent(id) {
  const s = FBU.getStudent(id);
  const proj = s.projectId ? FBU.getProject(s.projectId) : null;
  const teacher = proj ? FBU.getTeacher(proj.teacherId) : null;
  const st = FBU.studentStatusLabel[s.status] || {};
  document.getElementById('detailContent').innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding:16px;background:var(--bg3);border-radius:12px">
      <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">${s.name.split(' ').pop().charAt(0)}</div>
      <div>
        <div style="font-family:'Syne',sans-serif;font-size:18px;font-weight:700">${s.name}</div>
        <div style="color:var(--text2);font-size:13px">${s.id} &middot; ${s.class}</div>
      </div>
      <span class="tag ${st.cls}" style="margin-left:auto">${st.label}</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">
      <div><span style="color:var(--text2)">Email:</span><br><strong>${s.email}</strong></div>
      <div><span style="color:var(--text2)">GPA:</span><br><strong style="font-size:20px;color:${s.gpa>=3.5?'var(--green)':s.gpa>=2.5?'var(--yellow)':'var(--red)'}">${s.gpa.toFixed(1)}</strong></div>
      <div style="grid-column:span 2"><span style="color:var(--text2)">Đồ Án:</span><br><strong>${proj ? proj.title : '—'}</strong></div>
      ${proj ? `<div><span style="color:var(--text2)">GVHD:</span><br><strong>${teacher ? teacher.name : '—'}</strong></div>` : ''}
      ${proj ? `<div><span style="color:var(--text2)">Trạng Thái Đồ Án:</span><br><span class="tag ${FBU.statusLabel[proj.status].cls}">${FBU.statusLabel[proj.status].label}</span></div>` : ''}
    </div>`;
  openModal('modalDetail');
}

function editStudent(id) {
  const s = FBU.getStudent(id);
  document.getElementById('modalTitle').textContent = 'Chỉnh Sửa Sinh Viên';
  document.getElementById('editId').value   = s.id;
  document.getElementById('fName').value    = s.name;
  document.getElementById('fEmail').value   = s.email;
  document.getElementById('fClass').value   = s.class;
  document.getElementById('fGpa').value     = s.gpa;
  document.getElementById('fStatus').value  = s.status;
  openModal('modalStudent');
}

function saveStudent() {
  const id     = document.getElementById('editId').value;
  const name   = document.getElementById('fName').value.trim();
  const email  = document.getElementById('fEmail').value.trim();
  const cls    = document.getElementById('fClass').value;
  const gpa    = parseFloat(document.getElementById('fGpa').value) || 0;
  const status = document.getElementById('fStatus').value;

  if (!name || !email || !cls) { showToast('Vui lòng điền đầy đủ thông tin bắt buộc!', 'error'); return; }

  if (id) {
    const s = FBU.getStudent(id);
    Object.assign(s, { name, email, class: cls, gpa, status });
    showToast(`Đã cập nhật sinh viên ${name}`);
  } else {
    FBU.students.push({ id: FBU.nextId('SV', FBU.students), name, email, class: cls, gpa, status, projectId: null });
    showToast(`Đã thêm sinh viên ${name}`);
  }

  FBU.save();
  closeModal('modalStudent');
  resetForm();
  filterStudents();
}

function deleteStudent(id) {
  const s = FBU.getStudent(id);
  if (!confirm(`Xóa sinh viên "${s.name}"?\nHành động này không thể hoàn tác.`)) return;
  FBU.students = FBU.students.filter(sv => sv.id !== id);
  FBU.save();
  showToast(`Đã xóa sinh viên ${s.name}`, 'error');
  filterStudents();
}

function resetForm() {
  document.getElementById('editId').value   = '';
  document.getElementById('modalTitle').textContent = 'Thêm Sinh Viên';
  ['fName','fEmail','fGpa'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('fStatus').value = 'active';
}
document.getElementById('modalStudent').addEventListener('click', e => {
  if (e.target.id === 'modalStudent') { closeModal('modalStudent'); resetForm(); }
});