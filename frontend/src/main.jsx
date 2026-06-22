import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import AdminDefenseScoresPage from "./pages/AdminDefenseScoresPage.jsx";
import AdminStudentsPage from "./pages/AdminStudentsPage.jsx";
import AdminTeachersPage from "./pages/AdminTeachersPage.jsx";
import AdminTopicsPage from "./pages/AdminTopicsPage.jsx";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RoleHomePage from "./pages/RoleHomePage.jsx";
import StudentDefenseScorePage from "./pages/StudentDefenseScorePage.jsx";
import StudentNotificationsPage from "./pages/StudentNotificationsPage.jsx";
import StudentTopicsPage from "./pages/StudentTopicsPage.jsx";
import StudentProfilePage from "./pages/StudentProfilePage.jsx";
import StudentProgressPage from "./pages/StudentProgressPage.jsx";
import TeacherTopicsPage from "./pages/TeacherTopicsPage.jsx";
import TeacherProgressPage from "./pages/TeacherProgressPage.jsx";
import TeacherProfilePage from "./pages/TeacherProfilePage.jsx";
import { getSession } from "./lib/session.js";
import "./styles/global.css";

function defaultPathForRole(role) {
  if (role === "student") return "/student";
  if (role === "teacher") return "/teacher";
  return "/admin";
}

function PublicRoute({ children }) {
  const session = getSession();
  if (session?.token) {
    return <Navigate to={defaultPathForRole(session.user?.role)} replace />;
  }
  return children;
}

function ProtectedRoute({ children }) {
  const session = getSession();
  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function RoleProtectedRoute({ role, children }) {
  const session = getSession();
  if (!session?.token) {
    return <Navigate to="/login" replace />;
  }
  if (session.user?.role !== role) {
    return <Navigate to={defaultPathForRole(session.user?.role)} replace />;
  }
  return children;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: "login",
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      // Admin routes
      {
        path: "admin",
        element: (
          <RoleProtectedRoute role="admin">
            <RoleHomePage role="admin" />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "admin/users",
        element: (
          <RoleProtectedRoute role="admin">
            <AdminUsersPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "admin/topics",
        element: (
          <RoleProtectedRoute role="admin">
            <AdminTopicsPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "admin/defense-scores",
        element: (
          <RoleProtectedRoute role="admin">
            <AdminDefenseScoresPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "admin/students",
        element: (
          <RoleProtectedRoute role="admin">
            <AdminStudentsPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "admin/teachers",
        element: (
          <RoleProtectedRoute role="admin">
            <AdminTeachersPage />
          </RoleProtectedRoute>
        ),
      },
      // Teacher routes
      {
        path: "teacher",
        element: (
          <RoleProtectedRoute role="teacher">
            <RoleHomePage role="teacher" />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "teacher/topics",
        element: (
          <RoleProtectedRoute role="teacher">
            <TeacherTopicsPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "teacher/progress",
        element: (
          <RoleProtectedRoute role="teacher">
            <TeacherProgressPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "teacher/profile",
        element: (
          <RoleProtectedRoute role="teacher">
            <TeacherProfilePage />
          </RoleProtectedRoute>
        ),
      },
      // Student routes
      {
        path: "student",
        element: (
          <RoleProtectedRoute role="student">
            <RoleHomePage role="student" />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "student/topics",
        element: (
          <RoleProtectedRoute role="student">
            <StudentTopicsPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "student/progress",
        element: (
          <RoleProtectedRoute role="student">
            <StudentProgressPage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "student/defense-scores",
        element: (
          <RoleProtectedRoute role="student">
            <StudentDefenseScorePage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "student/profile",
        element: (
          <RoleProtectedRoute role="student">
            <StudentProfilePage />
          </RoleProtectedRoute>
        ),
      },
      {
        path: "student/notifications",
        element: (
          <RoleProtectedRoute role="student">
            <StudentNotificationsPage />
          </RoleProtectedRoute>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
