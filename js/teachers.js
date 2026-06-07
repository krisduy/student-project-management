// =============================================
// teachers.js – Quản lý giảng viên
// =============================================

document.addEventListener('DOMContentLoaded', () => onFbuReady(() => {
  const deptSel = document.getElementById('filterDept');
  FBU.departments.forEach(d => { const o = document.createElement('option'); o.value = d; o.textContent = d; deptSel.appendChild(o); });
  filterTeachers();
}));

function filterTeachers() {
  const q    = document.getElementById('searchInput').value.toLowerCase();
  const dept = document.getElementById('filterDept').value;
  const result = FBU.teachers.filter(t =>
    (!q    || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)) &&
    (!dept || t.dept === dept)
  );
  document.getElementById('resultCount').textContent = `${result.length} giảng viên`;
  renderGrid(result);
}

function renderGrid(data) {
  const el = document.getElementById('teacherGrid');
  if (!data.length) {
    el.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text2)"><i class="fa-solid fa-inbox" style="font-size:36px;display:block;margin-bottom:12px"></i>Không tìm thấy giảng viên</div>`;
    return;
  }
  el.innerHTML = data.map(t => {
    const projs = FBU.projects.filter(p => p.teacherId === t.id);
    const done  = projs.filter(p => p.status === 'completed').length;
    const initials = t.name.split(' ').filter(w => w.match(/^[A-ZÁÀẢÃẠĂẮẶẤẦẨẪÂẤẦẨẪĐÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴ]/i)).slice(-2).map(w=>w[0]).join('') || t.name[0];
    return `
      <div class="teacher-card">
        <div class="tc-avatar">${initials.toUpperCase()}</div>
        <div class="tc-name">${t.name}</div>
        <div class="tc-dept"><i class="fa-solid fa-building-columns" style="margin-right:5px;color:var(--text3)"></i>Khoa ${t.dept}</div>
        <span class="tc-expertise"><i class="fa-solid fa-code" style="margin-right:5px"></i>${t.expertise}</span>
        <div class="tc-stats">
          <div class="tc-stat"><span class="tc-stat-val" style="color:var(--accent)">${projs.length}</span><span class="tc-stat-lbl">Đồ Án</span></div>
          <div class="tc-stat"><span class="tc-stat-val" style="color:var(--green)">${done}</span><span class="tc-stat-lbl">Hoàn Thành</span></div>
        </div>
        <div style="font-size:11px;color:var(--text2);margin-top:8px">${t.email}</div>
        <div class="tc-actions">
          <button class="btn btn-secondary" style="padding:7px 14px;font-size:12px" onclick="editTeacher('${t.id}')"><i class="fa-regular fa-pen-to-square"></i> Sửa</button>
          <button class="btn btn-danger" style="padding:7px 14px;font-size:12px" onclick="deleteTeacher('${t.id}')"><i class="fa-regular fa-trash-can"></i></button>
        </div>
      </div>`;
  }).join('');
}

function editTeacher(id) {
  const t = FBU.getTeacher(id);
  document.getElementById('modalTitle').textContent = 'Chỉnh Sửa Giảng Viên';
  document.getElementById('editId').value    = t.id;
  document.getElementById('fName').value     = t.name;
  document.getElementById('fEmail').value    = t.email;
  document.getElementById('fDept').value     = t.dept;
  document.getElementById('fExpertise').value= t.expertise;
  openModal('modalTeacher');
}

function saveTeacher() {
  const id        = document.getElementById('editId').value;
  const name      = document.getElementById('fName').value.trim();
  const email     = document.getElementById('fEmail').value.trim();
  const dept      = document.getElementById('fDept').value;
  const expertise = document.getElementById('fExpertise').value.trim();

  if (!name || !email) { showToast('Vui lòng điền đầy đủ thông tin!', 'error'); return; }

  if (id) {
    const t = FBU.getTeacher(id);
    Object.assign(t, { name, email, dept, expertise });
    showToast('Đã cập nhật giảng viên!');
  } else {
    FBU.teachers.push({ id: FBU.nextId('GV', FBU.teachers), name, email, dept, expertise, projects: 0 });
    showToast('Đã thêm giảng viên!');
  }
  FBU.save(); closeModal('modalTeacher'); resetForm(); filterTeachers();
}

function deleteTeacher(id) {
  const t = FBU.getTeacher(id);
  if (FBU.projects.some(p => p.teacherId === id)) {
    showToast('Không thể xóa! Giảng viên đang hướng dẫn đồ án.', 'error'); return;
  }
  if (!confirm(`Xóa giảng viên "${t.name}"?`)) return;
  FBU.teachers = FBU.teachers.filter(tv => tv.id !== id);
  FBU.save(); showToast('Đã xóa giảng viên!', 'error'); filterTeachers();
}

function resetForm() {
  document.getElementById('editId').value = '';
  document.getElementById('modalTitle').textContent = 'Thêm Giảng Viên';
  ['fName','fEmail','fExpertise'].forEach(id => document.getElementById(id).value = '');
}