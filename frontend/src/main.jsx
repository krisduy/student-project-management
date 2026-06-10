import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import AdminStudentsPage from "./pages/AdminStudentsPage.jsx";
import AdminTeachersPage from "./pages/AdminTeachersPage.jsx";
import AdminTopicsPage from "./pages/AdminTopicsPage.jsx";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RoleHomePage from "./pages/RoleHomePage.jsx";
import StudentTopicsPage from "./pages/StudentTopicsPage.jsx";
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
      {
        path: "admin",
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
      {
        path: "teacher",
        element: (
          <ProtectedRoute>
            <RoleHomePage role="teacher" />
          </ProtectedRoute>
        ),
      },
      {
        path: "student",
        element: (
          <RoleProtectedRoute role="student">
            <StudentTopicsPage />
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
