const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const controller = require("../controllers/eventController");

router.get("/admin/requests/pending", protect, controller.getPendingEventRequests);

router.get("/admin/all", protect, controller.getAllAdminEvents);

router.post("/admin/:eventId/approve", protect, controller.approveEventRequest);

router.post("/admin/:eventId/reject", protect, controller.rejectEventRequest);

router.post("/admin/:eventId/publish", protect, controller.publishEvent);

module.exports = router;