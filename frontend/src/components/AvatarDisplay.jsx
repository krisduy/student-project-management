export function fullName(user) {
  return (
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Người dùng"
  );
}

export function initials(user) {
  return (
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "A"
  );
}

export function getRoleLabel(role) {
  const labels = {
    admin: "Quản trị viên",
    teacher: "Giảng viên",
    student: "Sinh viên",
  };
  return labels[role] || role;
}

export function AvatarDisplay({ user, size = "md" }) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-20 h-20 text-2xl",
    xl: "w-32 h-32 text-4xl",
  };

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={fullName(user)}
        className={`${sizes[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold`}>
      {initials(user)}
    </div>
  );
}
