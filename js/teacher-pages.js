// =============================================
// teacher-pages.js – Page-specific render logic
// Phụ thuộc: teacher-common.js, data.js
// =============================================

function initTeacherPage(page) {
  FBU.ensureLoaded().then(() => {
    if (!initTeacherShell()) return;

    const body = document.getElementById("pageBody");
    if (!body) return;

    if (!currentTeacher) {
      body.innerHTML = teacherEmptyState("Không tìm thấy thông tin giảng viên. Vui lòng liên hệ quản trị viên.");
      return;
    }

    switch (page) {
      case "dashboard":
        body.innerHTML = buildTeacherDashboard();
        break;
      case "students":
        body.innerHTML = buildTeacherStudents();
        break;
      case "grading":
        gradeSelectedId = new URLSearchParams(location.search).get("project");
        body.innerHTML = buildTeacherGrading();
        if (gradeSelectedId) selectGradeProject(gradeSelectedId);
        break;
      case "submissions":
        body.innerHTML = buildTeacherSubmissions();
        break;
      case "profile":
        body.innerHTML = buildTeacherProfile();
        break;
    }
  });
}

// =============================================
//  DASHBOARD
// =============================================
function buildTeacherDashboard() {
  const projs = myProjects();
  const studs = myStudents();
  const done = projs.filter((p) => p.status === "completed").length;
  const ungraded = ungradedProjects().length;
  const waitingGradeApproval = projs.filter((p) => FBU.getGrade(p.id)?.status === "pending").length;
  const pending = pendingProjects().length;
  const subs = submittedProjects().length;
  const avgScore = (() => {
    const g = projs.map((p) => FBU.getGrade(p.id)).filter(Boolean);
    return g.length ? (g.reduce((s, x) => s + x.final, 0) / g.length).toFixed(1) : "—";
  })();
  const recent = [...projs].slice(-3).reverse();
  const firstName = getTeacherFirstName();

  return `
    <div class="gv-hero">
      <div class="gv-hero-border"></div>
      <div class="gv-hero-content">
        <div class="gv-greeting">${getTeacherGreeting()}</div>
        <div class="gv-name">Xin chào, <span class="highlight">${firstName}</span></div>
        <div class="gv-subtitle">
          Quản lý ${projs.length} đồ án · ${studs.length} sinh viên phụ trách
          · Khoa ${currentTeacher.dept}
        </div>
        <div class="gv-hero-stats">
          <div class="gv-hstat">
            <div class="gv-hstat-num" style="color:var(--accent)">${projs.length}</div>
            <div class="gv-hstat-lbl">Đồ án</div>
          </div>
          <div class="gv-hstat">
            <div class="gv-hstat-num" style="color:var(--green)">${done}</div>
            <div class="gv-hstat-lbl">Hoàn thành</div>
          </div>
          <div class="gv-hstat">
            <div class="gv-hstat-num" style="color:var(--yellow)">${pending}</div>
            <div class="gv-hstat-lbl">Chờ duyệt</div>
          </div>
          <div class="gv-hstat">
            <div class="gv-hstat-num" style="color:var(--pink)">${avgScore}</div>
            <div class="gv-hstat-lbl">Điểm TB</div>
          </div>
        </div>
        <div class="gv-hero-actions">
          <a href="teacher-grading.html" class="btn btn-primary"><i class="fa-solid fa-star-half-stroke"></i> Chấm điểm</a>
          <a href="teacher-submissions.html" class="btn btn-secondary"><i class="fa-solid fa-inbox"></i> Xem bài nộp</a>
        </div>
      </div>
      <div class="gv-hero-right">
        <div class="gv-hero-badge">
          <div class="gv-hero-badge-num">${ungraded + waitingGradeApproval}</div>
          <div class="gv-hero-badge-sub">Chưa chấm</div>
        </div>
      </div>
    </div>

    <div class="gv-quick-grid">
      <a href="teacher-students.html" class="gv-quick-card">
        <div class="gv-quick-icon" style="background:rgba(245,158,11,.15);color:var(--yellow)"><i class="fa-solid fa-user-graduate"></i></div>
        <div class="gv-quick-title">Sinh viên</div>
        <div class="gv-quick-desc">${studs.length} sinh viên trong các đồ án của bạn</div>
      </a>
      <a href="teacher-submissions.html" class="gv-quick-card">
        ${subs > 0 ? `<span class="gv-quick-badge">${subs}</span>` : ""}
        <div class="gv-quick-icon" style="background:rgba(34,197,94,.15);color:var(--green)"><i class="fa-solid fa-paper-plane"></i></div>
        <div class="gv-quick-title">Bài nộp & Duyệt</div>
        <div class="gv-quick-desc">Xem bài nộp và duyệt đồ án mới</div>
      </a>
      <a href="teacher-grading.html" class="gv-quick-card">
        ${ungraded > 0 ? `<span class="gv-quick-badge">${ungraded}</span>` : ""}
        <div class="gv-quick-icon" style="background:rgba(236,72,153,.15);color:var(--pink)"><i class="fa-solid fa-star-half-stroke"></i></div>
        <div class="gv-quick-title">Chấm điểm</div>
        <div class="gv-quick-desc">Nhập điểm quá trình, báo cáo và bảo vệ</div>
      </a>
    </div>

    <div class="gv-dash-grid">
      <div class="card" style="padding:20px">
        <div class="card-header" style="margin-bottom:16px">
          <h2 style="font-size:15px">Đồ Án Gần Đây</h2>
        </div>
        ${
          recent.length
            ? recent
                .map((p) => {
                  const sv = p.students.map((id) => FBU.getStudent(id)).filter(Boolean);
                  return `
            <div class="recent-item" onclick="openProjDetail('${p.id}')" style="cursor:pointer">
              <div class="ri-icon"><i class="fa-solid fa-folder"></i></div>
              <div class="ri-body">
                <div class="ri-title">${p.title}</div>
                <div class="ri-sub">${sv.map((s) => s.name).join(", ") || "—"}</div>
              </div>
              <div class="ri-right">
                ${statusTag(p.status)}
                <div class="ri-date" style="margin-top:4px;font-size:11px">${p.deadline}</div>
              </div>
            </div>`;
                })
                .join("")
            : '<div style="color:var(--text2);font-size:13px;padding:20px 0;text-align:center">Chưa có đồ án nào</div>'
        }
      </div>

      <div class="card" style="padding:20px">
        <div class="card-header" style="margin-bottom:16px">
          <h2 style="font-size:15px">Cần Xử Lý</h2>
        </div>
        ${
          pending > 0
            ? pendingProjects()
                .map(
                  (p) => `
          <div class="recent-item" onclick="openProjDetail('${p.id}')" style="cursor:pointer">
            <div class="ri-icon" style="background:rgba(245,158,11,.1);color:var(--yellow)"><i class="fa-solid fa-hourglass-half"></i></div>
            <div class="ri-body">
              <div class="ri-title">${p.title}</div>
              <div class="ri-sub">Chờ duyệt đồ án</div>
            </div>
            ${statusTag(p.status)}
          </div>`
                )
                .join("")
            : ""
        }
        ${
          ungraded > 0
            ? projs
                .filter((p) => {
                  const grade = FBU.getGrade(p.id);
                  return !grade || grade.status === "rejected";
                })
                .slice(0, 3)
                .map(
                  (p) => `
          <div class="recent-item" onclick="location.href='teacher-grading.html?project=${p.id}'" style="cursor:pointer">
            <div class="ri-icon" style="background:rgba(239,68,68,.1);color:var(--red)"><i class="fa-solid fa-clock"></i></div>
            <div class="ri-body">
              <div class="ri-title">${p.title}</div>
              <div class="ri-sub">Chưa chấm điểm</div>
            </div>
            ${statusTag(p.status)}
          </div>`
                )
                .join("")
            : ""
        }
        ${
          pending === 0 && ungraded === 0
            ? '<div style="color:var(--green);font-size:13px;padding:20px 0;text-align:center"><i class="fa-solid fa-circle-check" style="margin-right:6px"></i>Tất cả đã được xử lý!</div>'
            : ""
        }
      </div>
    </div>`;
}

// =============================================
//  STUDENTS
// =============================================
function buildTeacherStudents() {
  const studs = myStudents();
  return `
    <div class="toolbar" style="margin-bottom:20px">
      <div class="toolbar-left">
        <div class="search-bar" style="max-width:300px;flex:1">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="tpSearchSv" placeholder="Tìm sinh viên..." oninput="filterTpStudents()"/>
        </div>
        <select class="form-control" id="tpFilterProj" onchange="filterTpStudents()" style="width:200px">
          <option value="">Tất cả đồ án</option>
          ${myProjects().map((p) => `<option value="${p.id}">${p.title}</option>`).join("")}
        </select>
      </div>
      <span id="tpSvCount" style="font-size:13px;color:var(--text2);align-self:center">${studs.length} sinh viên</span>
    </div>
    <div class="card" style="padding:0">
      <div class="tbl-wrap">
        <table class="tp-student-table">
          <thead>
            <tr>
              <th>MSSV</th><th>Họ và Tên</th><th>Lớp</th><th>Email</th>
              <th>GPA</th><th>Trạng Thái</th><th>Đồ Án</th><th>Điểm ĐA</th><th></th>
            </tr>
          </thead>
          <tbody id="tpSvBody">${renderStudentRows(studs)}</tbody>
        </table>
      </div>
    </div>`;
}

function filterTpStudents() {
  const q = document.getElementById("tpSearchSv")?.value.toLowerCase() || "";
  const pid = document.getElementById("tpFilterProj")?.value || "";
  const result = myStudents().filter(
    (s) =>
      (!q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) &&
      (!pid || s.projectId === pid)
  );
  const body = document.getElementById("tpSvBody");
  if (body) {
    body.innerHTML = renderStudentRows(result);
    const countEl = document.getElementById("tpSvCount");
    if (countEl) countEl.textContent = `${result.length} sinh viên`;
  }
}

function renderStudentRows(studs) {
  if (!studs.length) {
    return `<tr><td colspan="9" style="text-align:center;padding:40px;color:var(--text2)">Không tìm thấy sinh viên</td></tr>`;
  }

  return studs
    .map((s) => {
      const proj = s.projectId ? FBU.getProject(s.projectId) : null;
      const grade = proj ? FBU.getGrade(proj.id) : null;
      const st = FBU.studentStatusLabel[s.status] || {};
      const gpaColor = s.gpa >= 3.5 ? "var(--green)" : s.gpa >= 2.5 ? "var(--yellow)" : "var(--red)";

      return `
      <tr>
        <td><code style="font-size:12px;color:var(--accent)">${s.id}</code></td>
        <td>
          <div style="display:flex;align-items:center;gap:9px">
            <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">
              ${s.name.split(" ").pop().charAt(0)}
            </div>
            <span style="font-weight:500">${s.name}</span>
          </div>
        </td>
        <td><span class="tag tag-gray">${s.class}</span></td>
        <td style="font-size:12px;color:var(--text2)">${s.email}</td>
        <td><span style="font-weight:700;color:${gpaColor}">${s.gpa.toFixed(1)}</span></td>
        <td><span class="tag ${st.cls}">${st.label}</span></td>
        <td style="font-size:12px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          ${proj ? `<span title="${proj.title}">${proj.title}</span>` : '<span style="color:var(--text3)">—</span>'}
        </td>
        <td style="font-weight:700;color:var(--green)">
          ${grade ? `${grade.final.toFixed(1)}<div style="margin-top:4px">${gradeApprovalTag(grade)}</div>` : '<span style="color:var(--text3);font-weight:400">—</span>'}
        </td>
        <td>
          <button class="btn-icon" style="width:30px;height:30px;border-radius:8px" onclick="openSvDetail('${s.id}')">
            <i class="fa-regular fa-eye"></i>
          </button>
        </td>
      </tr>`;
    })
    .join("");
}

// =============================================
//  GRADING
// =============================================
function buildTeacherGrading() {
  const projs = myProjects();
  const list = `
    <div class="tp-pick-list" id="tpPickList">
      ${
        projs.length
          ? projs
              .map((p) => {
                const grade = FBU.getGrade(p.id);
                const st = FBU.statusLabel[p.status] || {};
                return `
          <div class="tp-pick-item ${p.id === gradeSelectedId ? "sel" : ""}" data-id="${p.id}" onclick="selectGradeProject('${p.id}')">
            <div style="font-weight:600;font-size:13px">${p.title}</div>
            <div class="tp-pick-meta">
              <span class="tag ${st.cls}" style="font-size:10px">${st.label}</span>
              ${
                grade
                  ? `<span style="float:right;font-weight:700;color:var(--green)">${grade.final.toFixed(1)}</span><div style="margin-top:7px">${gradeApprovalTag(grade)}</div>`
                  : '<span style="float:right;color:var(--text3);font-size:11px">Chưa chấm</span>'
              }
            </div>
          </div>`;
              })
              .join("")
          : '<div style="color:var(--text2);padding:20px;text-align:center">Không có đồ án</div>'
      }
    </div>`;

  return `
    <div class="tp-grade-layout">
      <div>${list}</div>
      <div id="tpGradeForm">${buildGradeFormContent()}</div>
    </div>`;
}

function buildGradeFormContent() {
  if (!gradeSelectedId) {
    return `
      <div class="tp-grade-panel">
        <div class="tp-empty" style="border:none">
          <i class="fa-solid fa-pen-to-square"></i>
          <span>Chọn một đồ án để bắt đầu chấm điểm</span>
        </div>
      </div>`;
  }

  const p = FBU.getProject(gradeSelectedId);
  if (!p) return teacherEmptyState("Không tìm thấy đồ án.");
  const sv = p.students
    .map((id) => FBU.getStudent(id))
    .filter(Boolean)
    .map((s) => s.name)
    .join(", ");
  const grade = FBU.getGrade(gradeSelectedId);
  const proc = grade ? grade.process : 0;
  const rep = grade ? grade.report : 0;
  const def = grade ? grade.defense : 0;
  const note = grade ? grade.note || "" : "";
  const final = (proc * 0.3 + rep * 0.3 + def * 0.4).toFixed(1);
  const letter = gradeLetter(parseFloat(final));

  return `
    <div class="tp-grade-panel">
      <div class="card-header" style="margin-bottom:20px">
        <div>
          <h2 style="font-size:15px">${p.title}</h2>
          <p style="font-size:12px;color:var(--text2);margin-top:4px">${sv || "—"} · ${p.category}</p>
        </div>
        ${statusTag(p.status)}
      </div>
      <div class="tp-grade-row">
        <label><i class="fa-solid fa-tasks" style="margin-right:5px;color:var(--accent)"></i>Quá Trình</label>
        <input type="range" id="gS_proc" min="0" max="10" step="0.5" value="${proc}" oninput="syncGrade('proc')"/>
        <input type="number" class="tp-score-num" id="gV_proc" min="0" max="10" step="0.5" value="${proc}" oninput="syncSlide('proc')"/>
      </div>
      <div class="tp-grade-row">
        <label><i class="fa-solid fa-file-lines" style="margin-right:5px;color:var(--yellow)"></i>Báo Cáo</label>
        <input type="range" id="gS_rep" min="0" max="10" step="0.5" value="${rep}" oninput="syncGrade('rep')"/>
        <input type="number" class="tp-score-num" id="gV_rep" min="0" max="10" step="0.5" value="${rep}" oninput="syncSlide('rep')"/>
      </div>
      <div class="tp-grade-row">
        <label><i class="fa-solid fa-person-chalkboard" style="margin-right:5px;color:var(--pink)"></i>Bảo Vệ</label>
        <input type="range" id="gS_def" min="0" max="10" step="0.5" value="${def}" oninput="syncGrade('def')"/>
        <input type="number" class="tp-score-num" id="gV_def" min="0" max="10" step="0.5" value="${def}" oninput="syncSlide('def')"/>
      </div>
      <div class="form-group" style="margin-top:4px">
        <label>Nhận Xét</label>
        <textarea class="form-control" id="gNote" rows="3" placeholder="Nhận xét của giảng viên...">${note}</textarea>
      </div>
      <div class="tp-final-display">
        <div style="font-size:12px;color:var(--text2);margin-bottom:6px">Điểm Tổng Kết</div>
        <div class="tp-final-num" id="gFinalNum">${final}</div>
        <div id="gLetter" style="font-size:14px;font-weight:700;margin-top:6px">${letter.text}</div>
        <div style="font-size:11px;color:var(--text2);margin-top:4px">Quá trình 30% · Báo cáo 30% · Bảo vệ 40%</div>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px">
        <button class="btn btn-secondary" onclick="resetGradeForm()">Làm Lại</button>
        <button class="btn btn-primary" onclick="submitGradeForm()">
          <i class="fa-solid fa-floppy-disk"></i> Lưu Điểm
        </button>
      </div>
    </div>`;
}

function selectGradeProject(id) {
  gradeSelectedId = id;
  document.querySelectorAll(".tp-pick-item").forEach((el) => {
    el.classList.toggle("sel", el.dataset.id === id);
  });
  const formDiv = document.getElementById("tpGradeForm");
  if (formDiv) formDiv.innerHTML = buildGradeFormContent();
  history.replaceState(null, "", `teacher-grading.html?project=${id}`);
}

function syncGrade(key) {
  document.getElementById(`gV_${key}`).value = document.getElementById(`gS_${key}`).value;
  refreshFinal();
}

// Function name matching is case-sensitive, this synchronizes the slider when the number input is modified.
function syncSlide(key) {
  document.getElementById(`gS_${key}`).value = document.getElementById(`gV_${key}`).value;
  refreshFinal();
}

function refreshFinal() {
  const proc = parseFloat(document.getElementById("gV_proc")?.value) || 0;
  const rep = parseFloat(document.getElementById("gV_rep")?.value) || 0;
  const def = parseFloat(document.getElementById("gV_def")?.value) || 0;
  const final = proc * 0.3 + rep * 0.3 + def * 0.4;
  const fl = gradeLetter(final);
  const numEl = document.getElementById("gFinalNum");
  const ltEl = document.getElementById("gLetter");
  if (numEl) {
    numEl.textContent = final.toFixed(1);
    numEl.style.color = fl.color;
  }
  if (ltEl) {
    ltEl.textContent = fl.text;
    ltEl.style.color = fl.color;
  }
}

function resetGradeForm() {
  ["proc", "rep", "def"].forEach((k) => {
    document.getElementById(`gS_${k}`).value = 0;
    document.getElementById(`gV_${k}`).value = 0;
  });
  document.getElementById("gNote").value = "";
  refreshFinal();
}

function submitGradeForm() {
  if (!gradeSelectedId) return;
  const proc = parseFloat(document.getElementById("gV_proc").value) || 0;
  const rep = parseFloat(document.getElementById("gV_rep").value) || 0;
  const def = parseFloat(document.getElementById("gV_def").value) || 0;
  const note = document.getElementById("gNote").value.trim();
  const final = parseFloat((proc * 0.3 + rep * 0.3 + def * 0.4).toFixed(1));

  const p = FBU.getProject(gradeSelectedId);
  const existing = FBU.getGrade(gradeSelectedId);
  const gradePayload = {
    projectId: gradeSelectedId,
    teacherId: currentTeacher ? currentTeacher.id : p.teacherId,
    process: proc,
    report: rep,
    defense: def,
    final,
    note,
    status: "pending",
    adminNote: "",
    approvedAt: null,
  };
  if (existing) {
    Object.assign(existing, gradePayload);
  } else {
    FBU.grades.push(gradePayload);
  }
  FBU.saveGradeRecord(gradePayload, p);
  showToast(`Đã gửi điểm ${final.toFixed(1)} chờ admin duyệt!`);
  updateTeacherNavBadges();
  const body = document.getElementById("pageBody");
  if (body) {
    body.innerHTML = buildTeacherGrading();
    selectGradeProject(gradeSelectedId);
  }
}

// =============================================
//  SUBMISSIONS
// =============================================
function buildTeacherSubmissions() {
  const pending = pendingProjects();
  const submitted = submittedProjects().filter((p) => p.status !== "pending");

  const pendingSection =
    pending.length > 0
      ? `
    <div style="margin-bottom:28px">
      <h2 style="font-size:15px;margin-bottom:16px"><i class="fa-solid fa-hourglass-half" style="color:var(--yellow);margin-right:8px"></i>Chờ Duyệt (${pending.length})</h2>
      <div class="gv-sub-grid">${pending.map(renderPendingCard).join("")}</div>
    </div>`
      : "";

  const submittedSection = `
    <div>
      <h2 style="font-size:15px;margin-bottom:16px"><i class="fa-solid fa-paper-plane" style="color:var(--accent);margin-right:8px"></i>Bài Nộp (${submitted.length})</h2>
      ${
        submitted.length
          ? `<div class="gv-sub-grid">${submitted.map(renderSubmissionCard).join("")}</div>`
          : `<div class="tp-empty" style="height:200px"><i class="fa-solid fa-inbox"></i><span>Chưa có bài nộp nào</span></div>`
      }
    </div>`;

  if (!pending.length && !submitted.length) {
    return teacherEmptyState("Chưa có đồ án hoặc bài nộp nào.", "fa-inbox");
  }

  return pendingSection + submittedSection;
}

function renderPendingCard(p) {
  const sv = p.students.map((id) => FBU.getStudent(id)).filter(Boolean);
  return `
    <div class="gv-sub-card pending">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
        <div style="font-weight:700;font-size:14px">${p.title}</div>
        ${statusTag(p.status)}
      </div>
      <div style="font-size:12px;color:var(--text2)">${p.desc || ""}</div>
      <div style="font-size:12px;color:var(--text2)">
        <i class="fa-solid fa-user-graduate" style="margin-right:5px"></i>
        ${sv.map((s) => s.name).join(", ") || "—"}
      </div>
      <div class="gv-sub-actions">
        <button class="btn btn-primary" style="flex:1" onclick="approveProject('${p.id}');initTeacherPage('submissions')"><i class="fa-solid fa-check"></i> Duyệt</button>
        <button class="btn btn-secondary" style="color:var(--red)" onclick="rejectProject('${p.id}');initTeacherPage('submissions')"><i class="fa-solid fa-xmark"></i> Từ chối</button>
        <button class="btn btn-secondary" onclick="openProjDetail('${p.id}')"><i class="fa-regular fa-eye"></i></button>
      </div>
    </div>`;
}

function renderSubmissionCard(p) {
  const sv = p.students.map((id) => FBU.getStudent(id)).filter(Boolean);
  const grade = FBU.getGrade(p.id);
  return `
    <div class="gv-sub-card submitted">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
        <div style="font-weight:700;font-size:14px">${p.title}</div>
        ${statusTag(p.status)}
      </div>
      <div style="font-size:12px;color:var(--text2)">${sv.map((s) => s.name).join(", ")}</div>
      ${
        p.submissionLink
          ? `<a class="gv-sub-link" href="${p.submissionLink}" target="_blank"><i class="fa-solid fa-link"></i> ${p.submissionLink}</a>`
          : ""
      }
      ${p.submissionNote ? `<div style="font-size:12px;color:var(--text2)"><strong>Ghi chú:</strong> ${p.submissionNote}</div>` : ""}
      ${p.submittedAt ? `<div style="font-size:11px;color:var(--text3)">Nộp lúc: ${new Date(p.submittedAt).toLocaleString("vi-VN")}</div>` : ""}
      <div class="gv-sub-actions">
        <button class="btn btn-secondary" onclick="openProjDetail('${p.id}')"><i class="fa-regular fa-eye"></i> Chi tiết</button>
        ${
          !grade || grade.status === "rejected"
            ? `<a href="teacher-grading.html?project=${p.id}" class="btn btn-primary"><i class="fa-solid fa-star-half-stroke"></i> Chấm điểm</a>`
            : `<span style="font-size:13px;font-weight:700;color:var(--green);align-self:center">${grade.final.toFixed(1)}/10 ${gradeApprovalTag(grade)}</span>`
        }
      </div>
    </div>`;
}

// =============================================
//  PROFILE
// =============================================
function buildTeacherProfile() {
  const t = currentTeacher;
  const projs = myProjects();
  const studs = myStudents();
  const done = projs.filter((p) => p.status === "completed").length;
  const initials = t.name
    .replace(/^(PGS\.|TS\.|ThS\.)\s*/g, "")
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return `
    <div class="gv-profile-layout">
      <div class="gv-avatar-card">
        <div class="gv-avatar-img">${initials}</div>
        <div style="font-family:'Space Grotesk',sans-serif;font-size:19px;font-weight:700;margin-bottom:4px">${t.name}</div>
        <div style="font-size:13px;color:var(--text3);margin-bottom:16px">${t.email}</div>
        <div style="display:inline-flex;align-items:center;gap:7px;padding:7px 16px;border-radius:20px;background:rgba(91,124,246,.1);border:1px solid rgba(91,124,246,.18);color:var(--accent);font-size:12px;font-weight:600;margin-bottom:24px">
          <i class="fa-solid fa-chalkboard-user"></i> Giảng viên · Khoa ${t.dept}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-top:20px;border-top:1px solid var(--border)">
          <div style="background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center">
            <span style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:var(--accent)">${projs.length}</span>
            <span style="display:block;font-size:11px;color:var(--text3);margin-top:5px">Đồ án</span>
          </div>
          <div style="background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center">
            <span style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:var(--green)">${done}</span>
            <span style="display:block;font-size:11px;color:var(--text3);margin-top:5px">Hoàn thành</span>
          </div>
          <div style="background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;grid-column:span 2">
            <span style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:var(--yellow)">${studs.length}</span>
            <span style="display:block;font-size:11px;color:var(--text3);margin-top:5px">Sinh viên phụ trách</span>
          </div>
        </div>
      </div>

      <div class="gv-info-card">
        <div class="gv-info-section">
          <h3 style="font-size:15px;margin-bottom:18px"><i class="fa-solid fa-id-card" style="color:var(--accent);margin-right:8px"></i>Thông tin cá nhân</h3>
          <div class="gv-info-grid">
            <div class="gv-field"><label>Mã giảng viên</label><strong>${t.id}</strong></div>
            <div class="gv-field"><label>Khoa / Bộ môn</label><strong>${t.dept}</strong></div>
            <div class="gv-field"><label>Chuyên môn</label><strong>${t.expertise || "—"}</strong></div>
            <div class="gv-field"><label>Email</label><strong>${t.email}</strong></div>
          </div>
        </div>
        <div class="gv-info-section">
          <h3 style="font-size:15px;margin-bottom:18px"><i class="fa-solid fa-bolt" style="color:var(--yellow);margin-right:8px"></i>Truy cập nhanh</h3>
          <div style="display:flex;flex-wrap:wrap;gap:10px">
            <a href="teacher-students.html" class="btn btn-secondary"><i class="fa-solid fa-user-graduate"></i> Sinh viên</a>
            <a href="teacher-submissions.html" class="btn btn-secondary"><i class="fa-solid fa-inbox"></i> Bài nộp</a>
            <a href="teacher-grading.html" class="btn btn-primary"><i class="fa-solid fa-star-half-stroke"></i> Chấm điểm</a>
          </div>
        </div>
      </div>
    </div>`;
}
