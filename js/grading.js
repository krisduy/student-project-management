// =============================================
// grading.js – Duyệt điểm đồ án (Admin)
// =============================================

let selectedId = null;

document.addEventListener('DOMContentLoaded', () => onFbuReady(() => filterList()));

function filterList() {
  const q      = document.getElementById('searchInput').value.toLowerCase();
  const filter = document.getElementById('filterStatus').value;

  const result = FBU.projects.filter(p => {
    const grade = FBU.getGrade(p.id);
    const approved = grade && (grade.status === 'approved' || !grade.status);
    return (!q || p.title.toLowerCase().includes(q)) &&
      (
        filter === '' ||
        (filter === 'graded' && approved) ||
        (filter === 'ungraded' && !grade) ||
        (filter === 'pending' && grade?.status === 'pending') ||
        (filter === 'rejected' && grade?.status === 'rejected')
      );
  });
  renderList(result);
}

function gradeStatusTag(grade) {
  if (!grade) return '<span style="float:right;color:var(--text3);font-size:11px">Chưa chấm</span>';
  const st = FBU.gradeApprovalLabel[grade.status || 'approved'] || FBU.gradeApprovalLabel.approved;
  return `<span style="float:right;font-weight:700;color:var(--green)">${grade.final.toFixed(1)}</span><br/><span class="tag ${st.cls}" style="font-size:10px;float:right;margin-top:5px">${st.label}</span>`;
}

function renderList(data) {
  const el = document.getElementById('projList');
  el.innerHTML = data.map(p => {
    const grade   = FBU.getGrade(p.id);
    const teacher = FBU.getTeacher(p.teacherId);
    const st      = FBU.statusLabel[p.status] || {};
    return `
      <div class="proj-list-item ${p.id === selectedId ? 'selected' : ''}" onclick="selectProject('${p.id}')">
        <div class="pli-title">${p.title}</div>
        <div class="pli-meta">
          <span>${teacher ? teacher.name.split('.').pop().trim() : '—'}</span>
          &middot; <span class="tag ${st.cls}" style="font-size:10px">${st.label}</span>
          ${gradeStatusTag(grade)}
        </div>
      </div>`;
  }).join('') || `<div style="text-align:center;padding:40px;color:var(--text2)">Không có đồ án nào</div>`;
}

function selectProject(id) {
  selectedId = id;
  filterList(); // re-render list highlight
  showGradeForm(id);
}

function showGradeForm(id) {
  const p       = FBU.getProject(id);
  const teacher = FBU.getTeacher(p.teacherId);
  const grade   = FBU.getGrade(id);
  const st      = FBU.statusLabel[p.status] || {};
  const sv      = p.students.map(sid => FBU.getStudent(sid)).filter(Boolean).map(s=>s.name).join(', ');

  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('gradeForm').style.display  = 'block';
  document.getElementById('gTitle').textContent = p.title;
  document.getElementById('gSub').textContent   = `${sv} · HD: ${teacher ? teacher.name.split('.').pop().trim() : '—'}`;
  document.getElementById('gStatus').className  = `tag ${st.cls}`;
  document.getElementById('gStatus').textContent = st.label;
  const approveBtn = document.getElementById('approveBtn');
  const rejectBtn = document.getElementById('rejectBtn');
  
  // Only show approve/reject buttons if a grade is present and it is pending approval
  if (approveBtn) approveBtn.style.display = (grade && grade.status === 'pending') ? 'inline-flex' : 'none';
  if (rejectBtn) rejectBtn.style.display = (grade && grade.status === 'pending') ? 'inline-flex' : 'none';

  const proc = grade ? grade.process : 0;
  const rep  = grade ? grade.report  : 0;
  const def  = grade ? grade.defense : 0;
  const note = grade ? grade.note    : '';

  setSlider('process', proc);
  setSlider('report',  rep);
  setSlider('defense', def);
  document.getElementById('gNote').value = note;
  calcFinal();
}

function setSlider(key, val) {
  const map = { process:'Process', report:'Report', defense:'Defense' };
  const k = map[key];
  document.getElementById('s'+k).value = val;
  document.getElementById('v'+k).value = val;
}

function calcFinal() {
  const proc = parseFloat(document.getElementById('vProcess').value) || 0;
  const rep  = parseFloat(document.getElementById('vReport').value)  || 0;
  const def  = parseFloat(document.getElementById('vDefense').value) || 0;
  const final = (proc * 0.3 + rep * 0.3 + def * 0.4);
  document.getElementById('finalScore').textContent = final.toFixed(1);
  const letter = final >= 9 ? 'A+ – Xuất Sắc' : final >= 8 ? 'A – Giỏi' : final >= 7 ? 'B – Khá' : final >= 5 ? 'C – Trung Bình' : 'F – Không Đạt';
  const color  = final >= 8 ? 'var(--green)' : final >= 7 ? 'var(--yellow)' : final >= 5 ? 'var(--text)' : 'var(--red)';
  document.getElementById('gradeLetter').textContent = letter;
  document.getElementById('gradeLetter').style.color = color;
  document.getElementById('finalScore').style.color  = color;
}

function approveSelectedGrade() {
  if (!selectedId) return;
  const grade = FBU.getGrade(selectedId);
  if (!grade) {
    showToast('Chưa có điểm để duyệt.', 'error');
    return;
  }
  FBU.approveGradeRecord(selectedId).then(() => {
    showToast(`Đã duyệt điểm ${grade.final.toFixed(1)}.`);
    showGradeForm(selectedId);
    filterList();
  });
}

function rejectSelectedGrade() {
  if (!selectedId) return;
  const grade = FBU.getGrade(selectedId);
  if (!grade) {
    showToast('Chưa có điểm để trả lại.', 'error');
    return;
  }
  const note = prompt('Lý do trả lại cho giáo viên:', grade.adminNote || 'Cần kiểm tra lại điểm.');
  if (note === null) return;
  FBU.rejectGradeRecord(selectedId, note || 'Cần kiểm tra lại điểm.').then(() => {
    showToast('Đã trả lại điểm cho giáo viên.', 'error');
    showGradeForm(selectedId);
    filterList();
  });
}
