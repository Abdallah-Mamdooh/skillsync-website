import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import {
  approveEventRequest,
  getPendingEventRequests,
  rejectEventRequest,
} from "../services/adminEventsService";

function EventRequests() {
  const [requests, setRequests] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [approvalForm, setApprovalForm] = useState({
    scheduledAt: "",
    durationMinutes: 60,
    capacity: 50,
    fee: 0,
    currency: "EGP",
    adminNotes: "",
  });

  const [rejectionReason, setRejectionReason] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPendingEventRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load event requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openReviewModal = (event) => {
    setSelectedEvent(event);

    setApprovalForm({
      scheduledAt: event.requestedScheduledAt
        ? formatDateForInput(event.requestedScheduledAt)
        : "",
      durationMinutes: event.requestedDurationMinutes || 60,
      capacity: event.requestedCapacity || 50,
      fee: event.requestedFee || 0,
      currency: event.currency || "EGP",
      adminNotes: "",
    });

    setRejectionReason("");
  };

  const closeReviewModal = () => {
    setSelectedEvent(null);
    setRejectionReason("");
  };

  const handleApprovalChange = (e) => {
    const { name, value } = e.target;

    setApprovalForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApprove = async () => {
    if (!selectedEvent) return;

    try {
      setActionLoading(true);

      await approveEventRequest(selectedEvent._id, {
        scheduledAt: approvalForm.scheduledAt
          ? new Date(approvalForm.scheduledAt).toISOString()
          : "",
        durationMinutes: Number(approvalForm.durationMinutes),
        capacity: Number(approvalForm.capacity),
        fee: Number(approvalForm.fee),
        currency: approvalForm.currency,
        adminNotes: approvalForm.adminNotes,
      });

      closeReviewModal();
      fetchRequests();
    } catch (err) {
      alert(err.message || "Failed to approve event request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedEvent) return;

    if (!rejectionReason.trim()) {
      alert("Please write a rejection reason first.");
      return;
    }

    try {
      setActionLoading(true);

      await rejectEventRequest(selectedEvent._id, {
        rejectionReason,
        adminNotes: approvalForm.adminNotes,
      });

      closeReviewModal();
      fetchRequests();
    } catch (err) {
      alert(err.message || "Failed to reject event request");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "26px", margin: 0 }}>Event Requests</h1>

        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
          Review mentor event requests, approve final details, or reject with a
          reason.
        </p>
      </div>

      <div style={cardStyle}>
        {loading ? (
          <p style={mutedText}>Loading event requests...</p>
        ) : error ? (
          <p style={{ color: "#ff7d7d" }}>{error}</p>
        ) : requests.length === 0 ? (
          <p style={mutedText}>No pending event requests found.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={tableHeadRow}>
                <th align="left">Event</th>
                <th align="left">Mentor</th>
                <th align="left">Preferred Date</th>
                <th align="left">Capacity</th>
                <th align="left">Fee</th>
                <th align="left">Status</th>
                <th align="left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((event) => (
                <tr key={event._id} style={tableRow}>
                  <td style={{ padding: "14px 0" }}>
                    <strong>{event.title}</strong>
                    <p style={smallMuted}>{event.topic || "No topic"}</p>
                  </td>

                  <td style={cellText}>
                    {event.organizerUserId?.fullName || "Unknown"}
                  </td>

                  <td style={cellText}>
                    {event.requestedScheduledAt
                      ? new Date(event.requestedScheduledAt).toLocaleString()
                      : "Not provided"}
                  </td>

                  <td style={cellText}>
                    {event.requestedCapacity || "Not provided"}
                  </td>

                  <td style={cellText}>
                    {event.requestedFee ?? "Not provided"}{" "}
                    {event.currency || "EGP"}
                  </td>

                  <td>
                    <span style={statusBadge}>Pending Review</span>
                  </td>

                  <td>
                    <button
                      onClick={() => openReviewModal(event)}
                      style={actionBtn}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedEvent && (
        <div onClick={closeReviewModal} style={overlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
            <div style={{ padding: "28px", position: "relative" }}>
              <button onClick={closeReviewModal} style={closeBtn}>
                ×
              </button>

              <h2 style={modalTitle}>Review Event Request</h2>

              <div style={{ display: "grid", gap: "22px" }}>
                <section>
                  <h3 style={sectionTitle}>Mentor Request</h3>

                  <div style={detailsGrid}>
                    <Detail label="Title" value={selectedEvent.title} />
                    <Detail label="Topic" value={selectedEvent.topic} />
                    <Detail label="Type" value={selectedEvent.eventType} />
                    <Detail
                      label="Mentor"
                      value={selectedEvent.organizerUserId?.fullName}
                    />
                    <Detail
                      label="Description"
                      value={selectedEvent.description}
                    />
                    <Detail
                      label="Target Audience"
                      value={selectedEvent.targetAudience}
                    />
                    <Detail label="Agenda" value={selectedEvent.agenda} />
                    <Detail
                      label="Requirements"
                      value={selectedEvent.requirements}
                    />
                    <Detail
                      label="Mentor Notes"
                      value={selectedEvent.mentorNotes}
                    />
                  </div>
                </section>

                <section>
                  <h3 style={sectionTitle}>Final Admin Details</h3>

                  <div style={formGrid}>
                    <Field label="Final Date & Time">
                      <input
                        type="datetime-local"
                        name="scheduledAt"
                        value={approvalForm.scheduledAt}
                        onChange={handleApprovalChange}
                        style={inputStyle}
                      />
                    </Field>

                    <Field label="Duration Minutes">
                      <input
                        type="number"
                        name="durationMinutes"
                        min="15"
                        value={approvalForm.durationMinutes}
                        onChange={handleApprovalChange}
                        style={inputStyle}
                      />
                    </Field>

                    <Field label="Capacity">
                      <input
                        type="number"
                        name="capacity"
                        min="1"
                        value={approvalForm.capacity}
                        onChange={handleApprovalChange}
                        style={inputStyle}
                      />
                    </Field>

                    <Field label="Fee">
                      <input
                        type="number"
                        name="fee"
                        min="0"
                        value={approvalForm.fee}
                        onChange={handleApprovalChange}
                        style={inputStyle}
                      />
                    </Field>

                    <Field label="Currency">
                      <input
                        type="text"
                        name="currency"
                        value={approvalForm.currency}
                        onChange={handleApprovalChange}
                        style={inputStyle}
                      />
                    </Field>

                    <Field label="Admin Notes">
                      <textarea
                        name="adminNotes"
                        value={approvalForm.adminNotes}
                        onChange={handleApprovalChange}
                        rows="3"
                        style={inputStyle}
                      />
                    </Field>

                    <Field label="Rejection Reason">
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows="3"
                        placeholder="Required only if rejecting"
                        style={inputStyle}
                      />
                    </Field>
                  </div>
                </section>
              </div>
            </div>

            <div style={modalFooter}>
              <button onClick={closeReviewModal} style={cancelBtn}>
                Cancel
              </button>

              <button
                onClick={handleReject}
                disabled={actionLoading}
                style={rejectBtn}
              >
                Reject
              </button>

              <button
                onClick={handleApprove}
                disabled={actionLoading}
                style={approveBtn}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p style={detailsLabel}>{label}</p>
      <p style={detailsValue}>{value || "Not provided"}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label>
      <p style={detailsLabel}>{label}</p>
      {children}
    </label>
  );
}

function formatDateForInput(value) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
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

const statusBadge = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "700",
  background: "rgba(245,161,0,0.12)",
  color: "#F5A100",
  border: "1px solid rgba(245,161,0,0.25)",
};

const actionBtn = {
  padding: "8px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "transparent",
  color: "#fff",
  cursor: "pointer",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(5, 12, 18, 0.58)",
  backdropFilter: "blur(5px)",
  WebkitBackdropFilter: "blur(5px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  padding: "24px",
};

const modalStyle = {
  width: "100%",
  maxWidth: "850px",
  maxHeight: "90vh",
  overflowY: "auto",
  borderRadius: "24px",
  background:
    "linear-gradient(180deg, rgba(20,53,70,0.97) 0%, rgba(16,38,50,0.99) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
};

const closeBtn = {
  position: "absolute",
  top: "18px",
  right: "18px",
  background: "transparent",
  border: "none",
  color: "rgba(255,255,255,0.55)",
  fontSize: "34px",
  lineHeight: 1,
  cursor: "pointer",
};

const modalTitle = {
  margin: "4px 0 22px 0",
  color: "#F9FAFB",
  fontSize: "24px",
  fontWeight: "800",
};

const sectionTitle = {
  margin: "0 0 14px 0",
  color: "#F9FAFB",
  fontSize: "17px",
};

const detailsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "16px",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "16px",
};

const detailsLabel = {
  margin: "0 0 8px 0",
  color: "rgba(249,250,251,0.58)",
  fontSize: "13px",
  fontWeight: "600",
};

const detailsValue = {
  margin: 0,
  color: "#F9FAFB",
  fontSize: "15px",
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  color: "#F9FAFB",
  outline: "none",
  fontSize: "14px",
  boxSizing: "border-box",
};

const modalFooter = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  padding: "18px 28px 22px 28px",
  borderTop: "1px solid rgba(255,255,255,0.08)",
};

const cancelBtn = {
  padding: "12px 24px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.02)",
  color: "#F9FAFB",
  cursor: "pointer",
};

const rejectBtn = {
  padding: "12px 24px",
  borderRadius: "14px",
  border: "1px solid rgba(239,68,68,0.28)",
  background: "rgba(239,68,68,0.16)",
  color: "#fecaca",
  fontWeight: "700",
  cursor: "pointer",
};

const approveBtn = {
  padding: "12px 24px",
  borderRadius: "14px",
  border: "1px solid rgba(34,197,94,0.28)",
  background: "rgba(34,197,94,0.16)",
  color: "#bbf7d0",
  fontWeight: "700",
  cursor: "pointer",
};

export default EventRequests;