const API_BASE_URL = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }

  return data.data || data;
}

export const getPendingEventRequests = () => {
  return request("/events/requests/pending");
};

export const getAllAdminEvents = (status = "") => {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return request(`/events${query}`);
};

export const approveEventRequest = (eventId, payload) => {
  return request(`/events/${eventId}/approve`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const rejectEventRequest = (eventId, payload) => {
  return request(`/events/${eventId}/reject`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const publishEvent = (eventId) => {
  return request(`/events/${eventId}/publish`, {
    method: "POST",
  });
};