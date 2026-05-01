const GroupEvent = require("../models/GroupEvent");

function ensureFutureDate(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid event date");
  }

  if (date <= new Date()) {
    throw new Error("Event must be scheduled in the future");
  }

  return date;
}

function buildAvailability(event) {
  const capacity = Number(event.capacity || 0);
  const registeredCount = Number(event.registeredCount || 0);
  const availableSeats = Math.max(capacity - registeredCount, 0);

  return {
    capacity,
    registeredCount,
    availableSeats,
    isFull: availableSeats <= 0,
  };
}

const getPendingEventRequests = async (req, res) => {
  try {
    const events = await GroupEvent.find({ status: "pending_review" })
      .sort({ submittedAt: 1, createdAt: 1 })
      .populate("organizerUserId", "fullName name email phoneNumber role");

    res.status(200).json({
      success: true,
      data: events.map((event) => ({
        ...event.toObject(),
        availability: buildAvailability(event),
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch pending event requests",
      error: error.message,
    });
  }
};

const getAllAdminEvents = async (req, res) => {
  try {
    const query = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    const events = await GroupEvent.find(query)
      .sort({ createdAt: -1 })
      .populate("organizerUserId", "fullName name email phoneNumber role");

    res.status(200).json({
      success: true,
      data: events.map((event) => ({
        ...event.toObject(),
        availability: buildAvailability(event),
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};

const approveEventRequest = async (req, res) => {
  try {
    const { eventId } = req.params;

    const {
      scheduledAt,
      durationMinutes,
      capacity,
      fee,
      currency,
      adminNotes,
      meetingProvider,
      meetingLink,
    } = req.body;

    const event = await GroupEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.status !== "pending_review") {
      return res.status(400).json({
        message: "Only pending event requests can be approved",
      });
    }

    const finalScheduledAt = scheduledAt || event.requestedScheduledAt;

    if (!finalScheduledAt) {
      return res.status(400).json({
        message: "scheduledAt is required before approval",
      });
    }

    event.scheduledAt = ensureFutureDate(finalScheduledAt);
    event.durationMinutes =
      Number(durationMinutes || event.requestedDurationMinutes || 60);
    event.capacity = Number(capacity || event.requestedCapacity || 100);
    event.fee =
      fee !== undefined
        ? Number(fee)
        : event.requestedFee !== null && event.requestedFee !== undefined
        ? Number(event.requestedFee)
        : Number(event.fee || 0);

    event.currency = currency || event.currency || "EGP";

    if (meetingProvider !== undefined) {
      event.meetingProvider = meetingProvider;
    }

    if (meetingLink !== undefined) {
      event.meetingLink = meetingLink;
    }

    event.adminNotes = adminNotes || "";
    event.status = "approved";
    event.adminReviewedBy = req.admin?.id || null;
    event.adminReviewedAt = new Date();
    event.approvedAt = new Date();
    event.rejectionReason = "";

    await event.save();

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve event request",
      error: error.message,
    });
  }
};

const rejectEventRequest = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { rejectionReason, adminNotes } = req.body;

    const event = await GroupEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!["pending_review", "approved"].includes(event.status)) {
      return res.status(400).json({
        message: "Only pending or approved event requests can be rejected",
      });
    }

    event.status = "rejected";
    event.adminReviewedBy = req.admin?.id || null;
    event.adminReviewedAt = new Date();
    event.adminNotes = adminNotes || "";
    event.rejectionReason =
      rejectionReason || "Event request was rejected by admin";
    event.approvedAt = null;

    await event.save();

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reject event request",
      error: error.message,
    });
  }
};

const publishEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await GroupEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.status !== "approved") {
      return res.status(400).json({
        message: "Only approved events can be published",
      });
    }

    if (!event.scheduledAt) {
      return res.status(400).json({
        message: "Event scheduledAt is required before publishing",
      });
    }

    ensureFutureDate(event.scheduledAt);

    event.status = "published";
    event.publishedAt = new Date();

    await event.save();

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to publish event",
      error: error.message,
    });
  }
};

module.exports = {
  getPendingEventRequests,
  getAllAdminEvents,
  approveEventRequest,
  rejectEventRequest,
  publishEvent,
};