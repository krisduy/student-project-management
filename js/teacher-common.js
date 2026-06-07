// =============================================
// teacher-common.js – Shared logic for Teacher Portal
// Phụ thuộc: data.js, main.js
// =============================================

let currentTeacher = null;
let gradeSelectedId = null;

function resolveCurrentTeacher() {
  const session = getSessionData();
  if (!session || session.role !== "teacher") return null;

  if (session.teacherId) {
    const byId = FBU.teachers.find((t) => t.id === session.teacherId);
    if (byId) return byId;
  }
  if (session.email) {
    const byEmail = FBU.teachers.find((t) => t.email === session.email);
    if (byEmail) return byEmail;
  }
  return null;
}

function myProjects() {
  if (!currentTeacher) return [];
  return FBU.projects.filter((p) => p.teacherId === currentTeacher.id);
}

function myStudents() {
  const projIds = myProjects().map((p) => p.id);
  return FBU.students.filter((s) => s.projectId && projIds.includes(s.projectId));
}

function pendingProjects() {
  return myProjects().filter((p) => p.status === "pending");
}

function submittedProjects() {
  return myProjects().filter((p) => p.submitted || p.submissionLink);
}

function ungradedProjects() {
  return myProjects().filter((p) => {
    const grade = FBU.getGrade(p.id);
    return !grade || grade.status === "rejected";
  });
}

function teacherBadgeCounts() {
  return {
    pending: pendingProjects().length,
    submissions: submittedProjects().length,
    ungraded: ungradedProjects().length,
  };
}

function statusTag(status) {
  const s = FBU.statusLabel[status] || {};
  return `<span class="tag ${s.cls}">${s.label || status}</span>`;
}

function gradeApprovalTag(grade) {
  if (!grade) return "";
  const st = FBU.gradeApprovalLabel[grade.status || "approved"] || FBU.gradeApprovalLabel.approved;
  return `<span class="tag ${st.cls}" style="font-size:10px">${st.label}</span>`;
}

function deadlineHtml(deadline) {
  const days = Math.ceil((new Date(deadline) - new Date()) / 86400000);
  const cls = days <= 7 ? "urgent" : "";
  const txt = days > 0 ? `Còn ${days} ngày` : days === 0 ? "Hôm nay!" : "Đã quá hạn";
  return `<span class="tp-deadline ${cls}"><i class="fa-regular fa-calendar"></i>${deadline} · ${txt}</span>`;
}

function gradeLetter(score) {
  if (score >= 9) return { text: "A+ – Xuất Sắc", color: "var(--green)" };
  if (score >= 8) return { text: "A – Giỏi", color: "var(--green)" };
  if (score >= 7) return { text: "B – Khá", color: "var(--yellow)" };
  if (score >= 5) return { text: "C – Trung Bình", color: "var(--text)" };
  return { text: "F – Không Đạt", color: "var(--red)" };
}

function getTeacherGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

function getTeacherFirstName() {
  if (!currentTeacher) return "Giảng viên";
  const parts = currentTeacher.name.replace(/^(PGS\.|TS\.|ThS\.)\s*/g, "").split(" ");
  return parts[parts.length - 1] || currentTeacher.name;
}

function initTeacherShell() {
  const session = getSessionData();
  if (!session || session.role !== "teacher") {
    window.location.href = "login.html";
    return false;
  }

  currentTeacher = resolveCurrentTeacher();

  const avatar = document.querySelector(".user-avatar");
  const userName = document.querySelector(".user-name");
  const userRole = document.querySelector(".user-role");

  if (currentTeacher) {
    const initials = currentTeacher.name
      .replace(/^(PGS\.|TS\.|ThS\.)\s*/g, "")
      .split(" ")
      .slice(-2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
    if (avatar) avatar.textContent = session.avatar || initials;
    if (userName) userName.textContent = currentTeacher.name;
    if (userRole) userRole.textContent = `Khoa ${currentTeacher.dept}`;
  } else if (session) {
    if (avatar) avatar.textContent = session.avatar || "GV";
    if (userName) userName.textContent = session.name || "Giảng viên";
    if (userRole) userRole.textContent = "Giảng viên";
  }

  updateTeacherNavBadges();
  return true;
}

function updateTeacherNavBadges() {
  const counts = teacherBadgeCounts();
  const pendingEl = document.getElementById("navBadgePending");
  const subEl = document.getElementById("navBadgeSubmissions");
  const gradeEl = document.getElementById("navBadgeGrading");

  if (pendingEl) {
    pendingEl.textContent = counts.pending;
    pendingEl.style.display = counts.pending > 0 ? "inline-block" : "none";
  }
  if (subEl) {
    subEl.textContent = counts.submissions;
    subEl.style.display = counts.submissions > 0 ? "inline-block" : "none";
  }
  if (gradeEl) {
    gradeEl.textContent = counts.ungraded;
    gradeEl.style.display = counts.ungraded > 0 ? "inline-block" : "none";
  }
}

function teacherEmptyState(message, icon = "fa-circle-exclamation") {
  return `<div class="tp-empty"><i class="fa-solid ${icon}"></i><span>${message}</span></div>`;
}

function approveProject(id) {
  const p = FBU.getProject(id);
  if (!p || p.teacherId !== currentTeacher?.id) return;
  p.status = "in-progress";
  FBU.saveProject(p);
  showToast("Đã duyệt đồ án!");
  updateTeacherNavBadges();
}

function rejectProject(id) {
  const p = FBU.getProject(id);
  if (!p || p.teacherId !== currentTeacher?.id) return;
  p.status = "failed";
  FBU.saveProject(p);
  showToast("Đã từ chối đồ án.", "error");
  updateTeacherNavBadges();
}

// ---- Modals ----
function openSvDetail(id) {
  const s = FBU.getStudent(id);
  if (!s) return;
  const proj = s.projectId ? FBU.getProject(s.projectId) : null;
  const teacher = proj ? FBU.getTeacher(proj.teacherId) : null;
  const grade = proj ? FBU.getGrade(proj.id) : null;
  const st = FBU.studentStatusLabel[s.status] || {};
  const gpaColor = s.gpa >= 3.5 ? "var(--green)" : s.gpa >= 2.5 ? "var(--yellow)" : "var(--red)";

  document.getElementById("svDetailContent").innerHTML = `
    <div class="sv-detail-header">
      <div class="sv-detail-avatar">${s.name.split(" ").pop().charAt(0)}</div>
      <div>
        <div style="font-family:'Syne',sans-serif;font-size:17px;font-weight:700">${s.name}</div>
        <div style="color:var(--text2);font-size:13px">${s.id} · ${s.class}</div>
      </div>
      <span class="tag ${st.cls}" style="margin-left:auto">${st.label}</span>
    </div>
    <div class="sv-detail-grid">
      <div class="sv-field"><label>Email</label><strong>${s.email}</strong></div>
      <div class="sv-field"><label>GPA</label><strong style="font-size:20px;color:${gpaColor}">${s.gpa.toFixed(1)}</strong></div>
      <div class="sv-field" style="grid-column:span 2">
        <label>Đồ Án Đang Thực Hiện</label>
        <strong>${proj ? proj.title : "—"}</strong>
      </div>
      ${
        proj
          ? `
        <div class="sv-field"><label>Giảng Viên HD</label><strong>${teacher ? teacher.name : "—"}</strong></div>
        <div class="sv-field"><label>Trạng Thái ĐA</label>${statusTag(proj.status)}</div>
        <div class="sv-field"><label>Deadline</label><strong>${proj.deadline}</strong></div>
        <div class="sv-field"><label>Điểm Đồ Án</label><strong style="font-size:18px;color:var(--green)">${grade ? grade.final.toFixed(1) + "/10" : "—"}</strong>${grade ? `<div style="margin-top:6px">${gradeApprovalTag(grade)}</div>` : ""}</div>
      `
          : ""
      }
    </div>`;
  openModal("modalSvDetail");
}

function openProjDetail(id) {
  const p = FBU.getProject(id);
  if (!p) return;
  const teacher = FBU.getTeacher(p.teacherId);
  const svList = p.students.map((sid) => FBU.getStudent(sid)).filter(Boolean);
  const grade = FBU.getGrade(id);

  const submissionBlock =
    p.submissionLink || p.submitted
      ? `
    <div style="margin-top:16px;padding:14px;background:var(--bg3);border-radius:12px;font-size:13px">
      <div style="font-weight:700;margin-bottom:8px"><i class="fa-solid fa-paper-plane" style="color:var(--accent);margin-right:6px"></i>Bài nộp</div>
      ${p.submissionLink ? `<div style="margin-bottom:6px"><span style="color:var(--text2)">Link:</span> <a href="${p.submissionLink}" target="_blank" style="color:var(--accent)">${p.submissionLink}</a></div>` : ""}
      ${p.submissionNote ? `<div style="margin-bottom:6px"><span style="color:var(--text2)">Ghi chú:</span> ${p.submissionNote}</div>` : ""}
      ${p.submittedAt ? `<div style="font-size:11px;color:var(--text3)">Nộp lúc: ${new Date(p.submittedAt).toLocaleString("vi-VN")}</div>` : ""}
    </div>`
      : "";

  document.getElementById("projDetailContent").innerHTML = `
    <div style="background:var(--bg3);border-radius:12px;padding:16px;margin-bottom:16px">
      <div style="font-family:'Syne',sans-serif;font-size:16px;font-weight:700;margin-bottom:8px">${p.title}</div>
      <div style="font-size:12px;color:var(--text2)">${p.desc || "Không có mô tả."}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">
      <div><span style="color:var(--text2)">Mã ĐA</span><br><strong>${p.id}</strong></div>
      <div><span style="color:var(--text2)">Loại</span><br><span class="tag tag-gray">${p.category}</span></div>
      <div><span style="color:var(--text2)">GVHD</span><br><strong>${teacher ? teacher.name : "—"}</strong></div>
      <div><span style="color:var(--text2)">Trạng Thái</span><br>${statusTag(p.status)}</div>
      <div><span style="color:var(--text2)">Bắt Đầu</span><br><strong>${p.startDate}</strong></div>
      <div><span style="color:var(--text2)">Deadline</span><br><strong>${p.deadline}</strong></div>
      <div><span style="color:var(--text2)">Điểm Số</span><br><strong style="font-size:20px;color:var(--green)">${grade ? grade.final.toFixed(1) + "/10" : "—"}</strong>${grade ? `<div style="margin-top:6px">${gradeApprovalTag(grade)}</div>` : ""}</div>
      <div><span style="color:var(--text2)">Sinh Viên</span><br>
        ${
          svList
            .map(
              (s) => `
          <div style="margin-top:4px;display:flex;align-items:center;gap:7px;cursor:pointer" onclick="closeModal('modalProjDetail');openSvDetail('${s.id}')">
            <div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff">${s.name.split(" ").pop().charAt(0)}</div>
            <span>${s.name}</span><span style="color:var(--text3);font-size:11px">(${s.id})</span>
          </div>`
            )
            .join("") || "—"
        }
      </div>
    </div>
    ${submissionBlock}
    ${
      p.status === "pending"
        ? `
    <div style="display:flex;gap:10px;margin-top:16px">
      <button class="btn btn-primary" onclick="approveProject('${p.id}');closeModal('modalProjDetail');location.reload()"><i class="fa-solid fa-check"></i> Duyệt</button>
      <button class="btn btn-secondary" style="color:var(--red);border-color:var(--red)" onclick="rejectProject('${p.id}');closeModal('modalProjDetail');location.reload()"><i class="fa-solid fa-xmark"></i> Từ chối</button>
    </div>`
        : ""
    }`;

  const goGradeBtn = document.getElementById("goGradeBtn");
  if (goGradeBtn) {
    goGradeBtn.onclick = () => {
      closeModal("modalProjDetail");
      window.location.href = `teacher-grading.html?project=${id}`;
    };
  }
  openModal("modalProjDetail");
}
