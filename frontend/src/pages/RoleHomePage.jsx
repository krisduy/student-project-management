import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { clearSession, getSession } from "../lib/session.js";

const roleLabels = {
  admin: "Quản trị viên",
  teacher: "Giảng viên",
  student: "Sinh viên",
};

function fullName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Người dùng";
}

export default function RoleHomePage({ role }) {
  const navigate = useNavigate();
  const session = getSession();
  const user = session?.user;

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <main className="role-page">
      <section className="role-panel">
        <div>
          <p className="eyebrow">{roleLabels[role] || role}</p>
          <h1>{fullName(user)}</h1>
          <p className="role-copy">
            Trang làm việc đã sẵn sàng để triển khai module tiếp theo.
          </p>
        </div>
        <button className="secondary-action" type="button" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </section>
    </main>
  );
}
