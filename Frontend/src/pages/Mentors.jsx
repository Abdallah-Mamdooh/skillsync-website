import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

function Mentors() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    field: "",
    rating: 0,
    sessions: 0,
    status: "Pending",
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [mentorToDelete, setMentorToDelete] = useState(null);

  const token = localStorage.getItem("token");

  const fetchMentors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/mentors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load mentors");
      }

      setMentors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load mentors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const isMentorVerified = (mentor) => {
    const status = String(mentor.status || "").toLowerCase();
    const verificationStatus = String(
      mentor.verificationStatus || ""
    ).toLowerCase();

    return (
      status === "active" ||
      status === "verified" ||
      mentor.isVerified === true ||
      mentor.verified === true ||
      verificationStatus === "approved" ||
      verificationStatus === "verified"
    );
  };

  const getMentorDisplayStatus = (mentor) => {
    if (isMentorVerified(mentor)) return "Verified";

    const status = String(mentor.status || "").trim();

    if (!status) return "Pending";

    return status;
  };

  const openViewModal = (mentor) => {
    setSelectedMentor(mentor);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setSelectedMentor(null);
    setIsViewModalOpen(false);
  };

  const openEditModal = (mentor) => {
    setSelectedMentor(mentor);
    setEditForm({
      name: mentor.name || "",
      email: mentor.email || "",
      field: mentor.field || "",
      rating: mentor.rating || 0,
      sessions: mentor.sessions || 0,
      status: mentor.status || "Pending",
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedMentor(null);
    setIsEditModalOpen(false);
  };

  const openDeleteModal = (mentor) => {
    setMentorToDelete(mentor);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setMentorToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]:
        name === "rating" || name === "sessions" ? Number(value) : value,
    }));
  };

  const handleUpdateMentor = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/api/mentors/${selectedMentor._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update mentor");
      }

      closeEditModal();
      fetchMentors();
    } catch (err) {
      alert(err.message || "Failed to update mentor");
    }
  };

  const handleVerifyMentor = async (mentor) => {
    const confirmed = window.confirm(
      `Are you sure you want to verify ${mentor.name}? This will allow the mentor to access their account.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/mentors/${mentor._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: mentor.name || "",
            email: mentor.email || "",
            field: mentor.field || "",
            rating: mentor.rating || 0,
            sessions: mentor.sessions || 0,
            status: "Active",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify mentor");
      }

      alert("Mentor verified successfully");
      fetchMentors();
    } catch (err) {
      alert(err.message || "Failed to verify mentor");
    }
  };

  const handleDeleteMentor = async () => {
    if (!mentorToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/mentors/${mentorToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete mentor");
      }

      closeDeleteModal();
      fetchMentors();
    } catch (err) {
      alert(err.message || "Failed to delete mentor");
    }
  };

  const getStatusStyle = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "verified" || normalized === "active") {
      return {
        background: "rgba(34,197,94,0.15)",
        color: "#86efac",
        border: "1px solid rgba(34,197,94,0.25)",
      };
    }

    if (normalized === "rejected") {
      return {
        background: "rgba(239,68,68,0.15)",
        color: "#fca5a5",
        border: "1px solid rgba(239,68,68,0.25)",
      };
    }

    return {
      background: "rgba(245,161,0,0.12)",
      color: "#F5A100",
      border: "1px solid rgba(245,161,0,0.25)",
    };
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "26px", margin: 0 }}>Mentor Monitoring</h1>

        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
          View mentor profiles, review pending registrations, and verify mentors.
        </p>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "20px",
          padding: "24px",
        }}
      >
        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.75)" }}>
            Loading mentors...
          </p>
        ) : error ? (
          <p style={{ color: "#ff7d7d" }}>{error}</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>
                <th align="left">Mentor</th>
                <th align="left">Specialization</th>
                <th align="left">Rating</th>
                <th align="left">Sessions</th>
                <th align="left">Status</th>
                <th align="left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {mentors.map((mentor) => {
                const displayStatus = getMentorDisplayStatus(mentor);
                const verified = isMentorVerified(mentor);

                return (
                  <tr
                    key={mentor._id}
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <td style={{ padding: "14px 0", fontWeight: "600" }}>
                      {mentor.name || "Unnamed Mentor"}
                    </td>

                    <td style={{ color: "rgba(255,255,255,0.75)" }}>
                      {mentor.field || "Not specified"}
                    </td>

                    <td style={{ color: "#F5A100", fontWeight: "600" }}>
                      ⭐ {mentor.rating || 0}
                    </td>

                    <td style={{ color: "rgba(255,255,255,0.75)" }}>
                      {mentor.sessions || 0}
                    </td>

                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: "700",
                          ...getStatusStyle(displayStatus),
                        }}
                      >
                        {displayStatus}
                      </span>
                    </td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                          padding: "10px 0",
                        }}
                      >
                        <button
                          onClick={() => openViewModal(mentor)}
                          style={actionBtn}
                        >
                          View
                        </button>

                        <button
                          onClick={() => openEditModal(mentor)}
                          style={actionBtn}
                        >
                          Edit
                        </button>

                        {verified ? (
                          <button disabled style={verifiedBtn}>
                            Verified
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyMentor(mentor)}
                            style={verifyBtn}
                          >
                            Verify
                          </button>
                        )}

                        <button
                          onClick={() => openDeleteModal(mentor)}
                          style={deleteBtn}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {mentors.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      padding: "18px 0",
                      color: "rgba(255,255,255,0.6)",
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    No mentors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isViewModalOpen && selectedMentor && (
        <div onClick={closeViewModal} style={overlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
            <div style={{ padding: "28px", position: "relative" }}>
              <button onClick={closeViewModal} style={closeBtn}>
                ×
              </button>

              <h2
                style={{
                  margin: "4px 0 18px 0",
                  color: "#F9FAFB",
                  fontSize: "24px",
                  fontWeight: "800",
                }}
              >
                Mentor Details
              </h2>

              <div style={{ display: "grid", gap: "18px" }}>
                <div>
                  <p style={detailsLabel}>Name</p>
                  <p style={detailsValue}>{selectedMentor.name}</p>
                </div>

                <div>
                  <p style={detailsLabel}>Email</p>
                  <p style={detailsValue}>{selectedMentor.email}</p>
                </div>

                <div>
                  <p style={detailsLabel}>Specialization</p>
                  <p style={detailsValue}>{selectedMentor.field}</p>
                </div>

                <div>
                  <p style={detailsLabel}>Rating</p>
                  <p style={detailsValue}>⭐ {selectedMentor.rating || 0}</p>
                </div>

                <div>
                  <p style={detailsLabel}>Sessions</p>
                  <p style={detailsValue}>{selectedMentor.sessions || 0}</p>
                </div>

                <div>
                  <p style={detailsLabel}>Status</p>
                  <p style={detailsValue}>
                    {getMentorDisplayStatus(selectedMentor)}
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                padding: "18px 28px 22px 28px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <button onClick={closeViewModal} style={cancelBtn}>
                Close
              </button>
            </div>
          </div>

          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }

              @keyframes modalSlide {
                from {
                  opacity: 0;
                  transform: translateY(14px) scale(0.98);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
            `}
          </style>
        </div>
      )}

      {isEditModalOpen && selectedMentor && (
        <div onClick={closeEditModal} style={overlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
            <div style={{ padding: "28px", position: "relative" }}>
              <button onClick={closeEditModal} style={closeBtn}>
                ×
              </button>

              <h2
                style={{
                  margin: "4px 0 18px 0",
                  color: "#F9FAFB",
                  fontSize: "24px",
                  fontWeight: "800",
                }}
              >
                Edit Mentor
              </h2>

              <form
                onSubmit={handleUpdateMentor}
                style={{ display: "grid", gap: "16px" }}
              >
                <div>
                  <p style={detailsLabel}>Name</p>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <p style={detailsLabel}>Email</p>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <p style={detailsLabel}>Specialization</p>
                  <input
                    type="text"
                    name="field"
                    value={editForm.field}
                    onChange={handleEditChange}
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <p style={detailsLabel}>Rating</p>
                  <input
                    type="number"
                    name="rating"
                    value={editForm.rating}
                    onChange={handleEditChange}
                    min="0"
                    step="0.1"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <p style={detailsLabel}>Sessions</p>
                  <input
                    type="number"
                    name="sessions"
                    value={editForm.sessions}
                    onChange={handleEditChange}
                    min="0"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <p style={detailsLabel}>Status</p>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    style={inputStyle}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                    marginTop: "8px",
                  }}
                >
                  <button
                    type="button"
                    onClick={closeEditModal}
                    style={cancelBtn}
                  >
                    Cancel
                  </button>

                  <button type="submit" style={saveBtn}>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && mentorToDelete && (
        <div onClick={closeDeleteModal} style={overlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={deleteModalStyle}>
            <div style={{ padding: "28px", position: "relative" }}>
              <button onClick={closeDeleteModal} style={closeBtn}>
                ×
              </button>

              <h2
                style={{
                  margin: "4px 0 14px 0",
                  color: "#F9FAFB",
                  fontSize: "24px",
                  fontWeight: "800",
                }}
              >
                Delete Mentor
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.72)",
                  fontSize: "15px",
                  lineHeight: 1.7,
                }}
              >
                Are you sure you want to delete{" "}
                <span style={{ color: "#F9FAFB", fontWeight: "700" }}>
                  {mentorToDelete.name}
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                padding: "18px 28px 22px 28px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <button onClick={closeDeleteModal} style={cancelBtn}>
                Cancel
              </button>

              <button onClick={handleDeleteMentor} style={confirmDeleteBtn}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

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
  animation: "fadeIn 0.2s ease",
};

const modalStyle = {
  width: "100%",
  maxWidth: "560px",
  borderRadius: "24px",
  overflow: "hidden",
  background:
    "linear-gradient(180deg, rgba(20,53,70,0.97) 0%, rgba(16,38,50,0.99) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
  animation: "modalSlide 0.25s ease",
};

const deleteModalStyle = {
  width: "100%",
  maxWidth: "520px",
  borderRadius: "24px",
  overflow: "hidden",
  background:
    "linear-gradient(180deg, rgba(39,20,20,0.97) 0%, rgba(30,16,16,0.99) 100%)",
  border: "1px solid rgba(239,68,68,0.16)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
  animation: "modalSlide 0.25s ease",
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

const cancelBtn = {
  padding: "12px 24px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.02)",
  color: "#F9FAFB",
  fontSize: "15px",
  cursor: "pointer",
};

const saveBtn = {
  padding: "12px 24px",
  borderRadius: "14px",
  border: "1px solid rgba(245,161,0,0.25)",
  background: "rgba(245,161,0,0.12)",
  color: "#F9FAFB",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
};

const confirmDeleteBtn = {
  padding: "12px 24px",
  borderRadius: "14px",
  border: "1px solid rgba(239,68,68,0.28)",
  background: "rgba(239,68,68,0.16)",
  color: "#fecaca",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
};

const actionBtn = {
  padding: "6px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "transparent",
  color: "#fff",
  cursor: "pointer",
};

const verifyBtn = {
  padding: "6px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(34,197,94,0.25)",
  background: "rgba(34,197,94,0.12)",
  color: "#86efac",
  cursor: "pointer",
};

const verifiedBtn = {
  padding: "6px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(34,197,94,0.18)",
  background: "rgba(34,197,94,0.06)",
  color: "rgba(134,239,172,0.65)",
  cursor: "not-allowed",
};

const deleteBtn = {
  padding: "6px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(239,68,68,0.25)",
  background: "transparent",
  color: "#ff7d7d",
  cursor: "pointer",
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

const detailsLabel = {
  margin: "0 0 8px 0",
  color: "rgba(249,250,251,0.58)",
  fontSize: "13px",
  fontWeight: "600",
  letterSpacing: "0.2px",
};

const detailsValue = {
  margin: 0,
  color: "#F9FAFB",
  fontSize: "15px",
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
};

export default Mentors;