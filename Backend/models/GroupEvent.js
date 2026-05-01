const mongoose = require("mongoose");

const speakerSchema = new mongoose.Schema(
  {
    mentorProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MentorProfile",
    },
    mentorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    roleLabel: {
      type: String,
      trim: true,
      default: "Speaker",
    },
  },
  { _id: false }
);

const groupEventSchema = new mongoose.Schema(
  {
    organizerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    topic: {
      type: String,
      trim: true,
      default: "",
    },

    eventType: {
      type: String,
      default: "webinar",
    },

    targetAudience: {
      type: String,
      trim: true,
      default: "",
    },

    agenda: {
      type: String,
      trim: true,
      default: "",
    },

    learningOutcomes: {
      type: [String],
      default: [],
    },

    requirements: {
      type: String,
      trim: true,
      default: "",
    },

    speakers: {
      type: [speakerSchema],
      default: [],
    },

    fee: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "EGP",
    },

    capacity: {
      type: Number,
      default: 100,
      min: 1,
    },

    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    meetingProvider: {
      type: String,
      default: "google_meet",
    },

    meetingLink: {
      type: String,
      trim: true,
      default: "",
    },

    scheduledAt: {
      type: Date,
      default: null,
    },

    durationMinutes: {
      type: Number,
      default: 60,
      min: 15,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "pending_review",
        "approved",
        "published",
        "rejected",
        "cancelled",
        "completed",
      ],
      default: "draft",
      index: true,
    },

    coverImageUrl: {
      type: String,
      trim: true,
      default: "",
    },

    requestedScheduledAt: {
      type: Date,
      default: null,
    },

    requestedDurationMinutes: {
      type: Number,
      default: null,
      min: 15,
    },

    requestedCapacity: {
      type: Number,
      default: null,
      min: 1,
    },

    requestedFee: {
      type: Number,
      default: null,
      min: 0,
    },

    mentorNotes: {
      type: String,
      trim: true,
      default: "",
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    adminReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    adminReviewedAt: {
      type: Date,
      default: null,
    },

    adminNotes: {
      type: String,
      trim: true,
      default: "",
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GroupEvent", groupEventSchema);