import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Mentors from "./pages/Mentors";
import CareerPaths from "./pages/CareerPaths";
import ChatFeedback from "./pages/ChatFeedback";
import Payments from "./pages/Payments";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import EventRequests from "./pages/EventRequests";
import EventsManagement from "./pages/EventsManagement";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";

  if (token && isLoggedIn) {
    return children;
  }

  // Clean old or fake login data
  localStorage.removeItem("token");
  localStorage.removeItem("admin");
  localStorage.removeItem("adminLoggedIn");

  return <Navigate to="/" replace />;
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentors"
          element={
            <ProtectedRoute>
              <Mentors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/career-paths"
          element={
            <ProtectedRoute>
              <CareerPaths />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat-feedback"
          element={
            <ProtectedRoute>
              <ChatFeedback />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
  path="/event-requests"
  element={
    <ProtectedRoute>
      <EventRequests />
    </ProtectedRoute>
  }
/>

<Route
  path="/events-management"
  element={
    <ProtectedRoute>
      <EventsManagement />
    </ProtectedRoute>
  }
/>
      </Routes>
    </HashRouter>
  );
}

export default App;