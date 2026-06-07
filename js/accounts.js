// =============================================
// accounts.js – Quản lý tài khoản (Admin only)
// =============================================

let allUsers = [];
let editingId = null;

const ROLE_LABELS = {
  admin: { label: "Admin", cls: "tag-red" },
  teacher: { label: "Giảng viên", cls: "tag-blue" },
  student: { label: "Sinh viên", cls: "tag-green" },
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN");
}

function linkedId(user) {
  if (user.role === "student") return user.studentId || "—";
  if (user.role === "teacher") return user.teacherId || "—";
  return "—";
}

async function loadUsers() {
  try {
    const res = await API.listUsers();
    allUsers = res.users || [];
    filterUsers();
  } catch (err) {
    showToast(err.message || "Không tải được danh sách tài khoản", "error");
    document.getElementById("accountBody").innerHTML =
      `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text2)">Lỗi: ${err.message}</td></tr>`;
  }
}

function filterUsers() {
  const q = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const role = document.getElementById("filterRole")?.value || "";
  const filtered = allUsers.filter((u) => {
    const matchQ =
      !q ||
      u.email.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q) ||
      (u.studentId && u.studentId.toLowerCase().includes(q)) ||
      (u.teacherId && u.teacherId.toLowerCase().includes(q));
    const matchRole = !role || u.role === role;
    return matchQ && matchRole;
  });
  renderUsers(filtered);
  const countEl = document.getElementById("resultCount");
  if (countEl) countEl.textContent = `${filtered.length} tài khoản`;
}

function renderUsers(users) {
  const body = document.getElementById("accountBody");
  if (!body) return;

  if (!users.length) {
    body.innerHTML =
      `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text2)">Không có tài khoản nào</td></tr>`;
    return;
  }

  body.innerHTML = users
    .map((u) => {
      const role = ROLE_LABELS[u.role] || { label: u.role, cls: "tag-gray" };
      const initials = u.avatar || u.name.split(" ").map((w) => w[0]).slice(-2).join("").toUpperCase();
      const statusTag = u.disabled
        ? '<span class="tag tag-red">Đã khóa</span>'
        : '<span class="tag tag-green">Hoạt động</span>';
      const canManage = u.role !== "admin";

      return `
      <tr>
        <td style="padding:12px 14px">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff">${initials}</div>
            <div>
              <div style="font-weight:600;font-size:13px">${u.name}</div>
              <div style="font-size:12px;color:var(--text2)">${u.email}</div>
            </div>
          </div>
        </td>
        <td style="padding:12px 14px"><span class="tag ${role.cls}">${role.label}</span></td>
        <td style="padding:12px 14px"><code style="font-size:12px;color:var(--accent)">${linkedId(u)}</code></td>
        <td style="padding:12px 14px">${statusTag}</td>
        <td style="padding:12px 14px;font-size:12px;color:var(--text2)">${formatDate(u.createdAt)}</td>
        <td style="padding:12px 14px">
          ${
            canManage
              ? `<div style="display:flex;gap:6px">
            <button class="btn-icon" title="Khóa/Mở" onclick="toggleLock('${u.id}')"><i class="fa-solid fa-${u.disabled ? "lock-open" : "lock"}"></i></button>
            <button class="btn-icon" title="Xóa" style="color:var(--red)" onclick="deleteAccount('${u.id}')"><i class="fa-solid fa-trash"></i></button>
          </div>`
              : '<span style="font-size:11px;color:var(--text3)">—</span>'
          }
        </td>
      </tr>`;
    })
    .join("");
}

function openCreateModal() {
  editingId = null;
  document.getElementById("modalTitle").textContent = "Tạo Tài Khoản Mới";
  document.getElementById("accountForm").reset();
  document.getElementById("editUserId").value = "";
  document.getElementById("fPassword").required = true;
  document.getElementById("fRole").value = "student";
  document.getElementById("fRole").disabled = false;
  onRoleChange();
  openModal("modalAccount");
}

function onRoleChange() {
  const role = document.getElementById("fRole").value;
  document.getElementById("studentFields").style.display = role === "student" ? "block" : "none";
  document.getElementById("teacherFields").style.display = role === "teacher" ? "block" : "none";
}

async function saveAccount() {
  const name = document.getElementById("fName").value.trim();
  const email = document.getElementById("fEmail").value.trim();
  const password = document.getElementById("fPassword").value;
  const role = document.getElementById("fRole").value;

  if (!name || !email || !password) {
    showToast("Vui lòng điền đầy đủ thông tin bắt buộc", "error");
    return;
  }

  const body = { name, email, password, role };
  if (role === "student") {
    body.class = document.getElementById("fClass").value;
  } else if (role === "teacher") {
    body.dept = document.getElementById("fDept").value;
    body.expertise = document.getElementById("fExpertise").value.trim();
  }

  try {
    await API.createUser(body);
    showToast("Đã tạo tài khoản thành công!");
    closeModal("modalAccount");
    if (typeof FBU !== "undefined") {
      FBU._loaded = false;
      FBU._loadPromise = null;
      await FBU.ensureLoaded();
    }
    await loadUsers();
  } catch (err) {
    showToast(err.message || "Không thể tạo tài khoản", "error");
  }
}

async function toggleLock(id) {
  try {
    const res = await API.toggleUserLock(id);
    showToast(res.message || "Đã cập nhật trạng thái");
    await loadUsers();
  } catch (err) {
    showToast(err.message || "Không thể thay đổi trạng thái", "error");
  }
}

async function deleteAccount(id) {
  const user = allUsers.find((u) => u.id === id);
  if (!user || user.role === "admin") return;
  if (!confirm(`Xóa tài khoản ${user.email}? Hành động không thể hoàn tác.`)) return;

  try {
    await API.deleteUser(id);
    showToast("Đã xóa tài khoản");
    await loadUsers();
  } catch (err) {
    showToast(err.message || "Không thể xóa tài khoản", "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("fRole")?.addEventListener("change", onRoleChange);
  loadUsers();
});
