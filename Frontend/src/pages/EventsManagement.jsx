import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import {
  getAllAdminEvents,
  publishEvent,
} from "../services/adminEventsService";

const statuses = [
  "",
  "pending_review",
  "approved",
  "published",
  "rejected",
  "cancelled",
  "completed",
];

function EventsManagement() {
  const [events, setEvents] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = async (status = statusFilter) => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllAdminEvents(status);
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents("");
  }, []);

  const handleFilterChange = async (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    fetchEvents(value);
  };

  const handlePublish = async (eventId) => {
    try {
      await publishEvent(eventId);
      fetchEvents(statusFilter);
    } catch (err) {
      alert(err.message || "Failed to publish event");
    }
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "26px", margin: 0 }}>Events Management</h1>

        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
          View all mentor events, monitor capacity, and publish approved events.
        </p>
      </div>

      <div
        style={{
          marginBottom: "18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <select
          value={statusFilter}
          onChange={handleFilterChange}
          style={selectStyle}
        >
          {statuses.map((status) => (
            <option key={status || "all"} value={status}>
              {status ? formatStatus(status) : "All statuses"}
            </option>
          ))}
        </select>
      </div>

      <div style={cardStyle}>
        {loading ? (
          <p style={mutedText}>Loading events...</p>
        ) : error ? (
          <p style={{ color: "#ff7d7d" }}>{error}</p>
        ) : events.length === 0 ? (
          <p style={mutedText}>No events found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={tableHeadRow}>
                <th align="left">Event</th>
                <th align="left">Organizer</th>
                <th align="left">Date</th>
                <th align="left">Seats</th>
                <th align="left">Fee</th>
                <th align="left">Status</th>
                <th align="left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr key={event._id} style={tableRow}>
                  <td style={{ padding: "14px 0" }}>
                    <strong>{event.title}</strong>
                    <p style={smallMuted}>{event.topic || "No topic"}</p>
                  </td>

                  <td style={cellText}>
                    {event.organizerUserId?.fullName || "Unknown"}
                  </td>

                  <td style={cellText}>
                    {event.scheduledAt
                      ? new Date(event.scheduledAt).toLocaleString()
                      : "Not set"}
                  </td>

                  <td style={cellText}>
                    {event.registeredCount || 0}/{event.capacity || 0}
                    <p style={smallMuted}>
                      {event.availability?.availableSeats ?? 0} available
                    </p>
                  </td>

                  <td style={cellText}>
                    {event.fee || 0} {event.currency || "EGP"}
                  </td>

                  <td>
                    <span style={getStatusStyle(event.status)}>
                      {formatStatus(event.status)}
                    </span>
                  </td>

                  <td>
                    {event.status === "approved" ? (
                      <button
                        onClick={() => handlePublish(event._id)}
                        style={publishBtn}
                      >
                        Publish
                      </button>
                    ) : (
                      <span style={smallMuted}>No action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}

function formatStatus(status) {
  return String(status || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusStyle(status) {
  const base = {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
  };

  if (status === "published") {
    return {
      ...base,
      background: "rgba(34,197,94,0.15)",
      color: "#86efac",
      border: "1px solid rgba(34,197,94,0.25)",
    };
  }

  if (status === "rejected" || status === "cancelled") {
    return {
      ...base,
      background: "rgba(239,68,68,0.15)",
      color: "#fca5a5",
      border: "1px solid rgba(239,68,68,0.25)",
    };
  }

  if (status === "approved") {
    return {
      ...base,
      background: "rgba(59,130,246,0.15)",
      color: "#93c5fd",
      border: "1px solid rgba(59,130,246,0.25)",
    };
  }

  return {
    ...base,
    background: "rgba(245,161,0,0.12)",
    color: "#F5A100",
    border: "1px solid rgba(245,161,0,0.25)",
  };
}

const cardStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: "20px",
  padding: "24px",
};

const mutedText = {
  color: "rgba(255,255,255,0.75)",
};

const smallMuted = {
  margin: "6px 0 0 0",
  color: "rgba(255,255,255,0.55)",
  fontSize: "13px",
};

const tableHeadRow = {
  fontSize: "12px",
  color: "rgba(255,255,255,0.55)",
};

const tableRow = {
  borderTop: "1px solid rgba(255,255,255,0.05)",
};

const cellText = {
  color: "rgba(255,255,255,0.75)",
};

const selectStyle = {
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  color: "#F9FAFB",
  outline: "none",
};

const publishBtn = {
  padding: "8px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(34,197,94,0.28)",
  background: "rgba(34,197,94,0.16)",
  color: "#bbf7d0",
  fontWeight: "700",
  cursor: "pointer",
};

export default EventsManagement;