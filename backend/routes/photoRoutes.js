const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const Photo = require("../models/Photo");
const Event = require("../models/Event");
const cloudinary = require("../config/cloudinary");

const authMiddleware = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "trizenai-photo-sharing",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    resource_type: "image",
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 20,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }

    cb(null, true);
  },
});

async function canAccessEvent(eventId, user) {
  const event = await Event.findById(eventId);

  if (!event) {
    return null;
  }

  if (user.role === "admin") {
    if (event.createdBy.toString() !== user.userId) {
      return null;
    }
  }

  if (user.role === "team") {
    const assigned = event.teamMembers.some(
      (memberId) => memberId.toString() === user.userId
    );

    if (!assigned) {
      return null;
    }
  }

  return event;
}

router.post(
  "/event/:eventId",
  authMiddleware,
  upload.array("photos", 20),
  async (req, res) => {
    try {
      const event = await canAccessEvent(
        req.params.eventId,
        req.user
      );

      if (!event) {
        return res.status(403).json({
          message: "Event access denied",
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: "No photos uploaded",
        });
      }

      const photos = await Photo.insertMany(
        req.files.map((file) => ({
          event: event._id,
          uploadedBy: req.user.userId,

          filename:
            file.filename ||
            file.originalname,

          // Cloudinary HTTPS URL
          storageLocation: file.path,

          fileSize: file.size,
          mimetype: file.mimetype,
        }))
      );

      res.status(201).json({
        message: "Photos uploaded successfully",
        photos,
      });
    } catch (error) {
      console.error("Photo upload error:", error);

      res.status(500).json({
        message: error.message,
      });
    }
  }
);

router.get(
  "/event/:eventId",
  authMiddleware,
  async (req, res) => {
    try {
      const event = await canAccessEvent(
        req.params.eventId,
        req.user
      );

      if (!event) {
        return res.status(403).json({
          message: "Event access denied",
        });
      }

      const filter = {
        event: event._id,
      };

      if (req.user.role === "team") {
        filter.uploadedBy = req.user.userId;
      }

      const photos = await Photo.find(filter)
        .populate("uploadedBy", "username email")
        .sort({ createdAt: -1 });

      res.json(photos);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

router.patch(
  "/:photoId/select",
  authMiddleware,
  adminOnly,
  async (req, res) => {
    try {
      const photo = await Photo.findById(
        req.params.photoId
      );

      if (!photo) {
        return res.status(404).json({
          message: "Photo not found",
        });
      }

      const event = await Event.findById(photo.event);

      if (!event) {
        return res.status(404).json({
          message: "Event not found",
        });
      }

      if (
        event.createdBy.toString() !==
        req.user.userId
      ) {
        return res.status(403).json({
          message: "You cannot manage this photo",
        });
      }

      photo.selected = !photo.selected;

      await photo.save();

      res.json(photo);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

module.exports = router;