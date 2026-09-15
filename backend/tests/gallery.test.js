const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");

const User = require("../models/User");
const Photo = require("../models/Photo");

jest.setTimeout(60000);

let mongoServer;
let adminToken;
let teamToken;
let adminUserId;
let eventId;
let selectedPhotoId;
let unselectedPhotoId;
let gallerySlug;
let galleryPin;

beforeAll(async () => {
  process.env.JWT_SECRET = "test_jwt_secret_for_jest_only";

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();

  await mongoose.connect(mongoServer.getUri());

  // ==========================================
  // 1. CREATE ADMIN
  // ==========================================

  const registerResponse = await request(app)
    .post("/api/auth/register")
    .send({
      username: "Gallery Admin",
      email: "galleryadmin@test.com",
      password: "Test123456",
    });

  expect(registerResponse.statusCode).toBe(201);

  // Get Admin ID directly from test database
  const adminUser = await User.findOne({
    email: "galleryadmin@test.com",
  });

  expect(adminUser).toBeDefined();

  adminUserId = adminUser._id;

  expect(adminUserId).toBeDefined();

  // ==========================================
  // 2. LOGIN ADMIN
  // ==========================================

  const adminLogin = await request(app)
    .post("/api/auth/login")
    .send({
      email: "galleryadmin@test.com",
      password: "Test123456",
    });

  expect(adminLogin.statusCode).toBe(200);

  adminToken = adminLogin.body.token;

  expect(adminToken).toBeDefined();

  // ==========================================
  // 3. CREATE TEAM MEMBER
  // ==========================================

  const teamCreateResponse = await request(app)
    .post("/api/users/team")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      username: "Gallery Team",
      email: "galleryteam@test.com",
      password: "Test123456",
    });

  expect(teamCreateResponse.statusCode).toBe(201);

  // ==========================================
  // 4. LOGIN TEAM MEMBER
  // ==========================================

  const teamLogin = await request(app)
    .post("/api/auth/login")
    .send({
      email: "galleryteam@test.com",
      password: "Test123456",
    });

  expect(teamLogin.statusCode).toBe(200);

  teamToken = teamLogin.body.token;

  expect(teamToken).toBeDefined();

  // ==========================================
  // 5. CREATE EVENT
  // ==========================================

  const eventResponse = await request(app)
    .post("/api/events")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: "Gallery Test Wedding",
      description: "Gallery publishing test event",
      eventDate: "2026-09-20",
    });

  expect(eventResponse.statusCode).toBe(201);

  eventId =
    eventResponse.body.event?._id ||
    eventResponse.body._id;

  expect(eventId).toBeDefined();

  // ==========================================
  // 6. CREATE SELECTED PHOTO
  // ==========================================

  const selectedPhoto = await Photo.create({
    event: eventId,
    uploadedBy: adminUserId,
    filename: "selected-photo.jpg",
    storageLocation:
      "https://example.com/selected-photo.jpg",
    fileSize: 1000,
    mimetype: "image/jpeg",
    selected: true,
  });

  selectedPhotoId = selectedPhoto._id.toString();

  // ==========================================
  // 7. CREATE UNSELECTED PHOTO
  // ==========================================

  const unselectedPhoto = await Photo.create({
    event: eventId,
    uploadedBy: adminUserId,
    filename: "unselected-photo.jpg",
    storageLocation:
      "https://example.com/unselected-photo.jpg",
    fileSize: 1000,
    mimetype: "image/jpeg",
    selected: false,
  });

  unselectedPhotoId = unselectedPhoto._id.toString();

  expect(selectedPhotoId).toBeDefined();
  expect(unselectedPhotoId).toBeDefined();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
});

// ====================================================
// PHOTO AUTHORIZATION
// ====================================================

describe("Photo selection authorization", () => {
  test("Team Member cannot select or unselect photos", async () => {
    const response = await request(app)
      .patch(`/api/photos/${unselectedPhotoId}/select`)
      .set("Authorization", `Bearer ${teamToken}`);

    expect(response.statusCode).toBe(403);
  });

  test("Admin can select a photo", async () => {
    const response = await request(app)
      .patch(`/api/photos/${unselectedPhotoId}/select`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.selected).toBe(true);

    // Change it back to unselected
    const resetResponse = await request(app)
      .patch(`/api/photos/${unselectedPhotoId}/select`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(resetResponse.statusCode).toBe(200);
    expect(resetResponse.body.selected).toBe(false);
  });
});

// ====================================================
// GALLERY PUBLISHING
// ====================================================

describe("Gallery publishing", () => {
  test("Team Member cannot publish gallery", async () => {
    const response = await request(app)
      .post(`/api/galleries/event/${eventId}/publish`)
      .set("Authorization", `Bearer ${teamToken}`);

    expect(response.statusCode).toBe(403);
  });

  test("Admin can publish gallery", async () => {
    const response = await request(app)
      .post(`/api/galleries/event/${eventId}/publish`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(201);

    expect(response.body.message).toBe(
      "Gallery published successfully"
    );

    expect(response.body.gallery).toBeDefined();
    expect(response.body.gallery.slug).toBeDefined();
    expect(response.body.gallery.pin).toBeDefined();

    expect(response.body.gallery.selectedPhotos).toBe(1);

    gallerySlug = response.body.gallery.slug;
    galleryPin = response.body.gallery.pin;

    expect(galleryPin).toMatch(/^\d{6}$/);
  });

  test("Admin cannot publish same gallery twice", async () => {
    const response = await request(app)
      .post(`/api/galleries/event/${eventId}/publish`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      "Gallery already published"
    );
  });
});

// ====================================================
// CUSTOMER ACCESS
// ====================================================

describe("Customer gallery access", () => {
  test("Wrong PIN is rejected", async () => {
    let wrongPin = "000000";

    // Ensure we don't accidentally use the generated PIN
    if (wrongPin === galleryPin) {
      wrongPin = "999999";
    }

    const response = await request(app)
      .post(`/api/galleries/public/${gallerySlug}/unlock`)
      .send({
        pin: wrongPin,
      });

    expect(response.statusCode).toBe(401);

    expect(response.body.message).toBe(
      "Incorrect PIN"
    );
  });

  test("Correct PIN unlocks gallery", async () => {
    const response = await request(app)
      .post(`/api/galleries/public/${gallerySlug}/unlock`)
      .send({
        pin: galleryPin,
      });

    expect(response.statusCode).toBe(200);

    expect(response.body.message).toBe(
      "Gallery unlocked"
    );

    expect(response.body.event).toBeDefined();

    expect(
      Array.isArray(response.body.photos)
    ).toBe(true);
  });

  test("Customer receives only selected photos", async () => {
    const response = await request(app)
      .post(`/api/galleries/public/${gallerySlug}/unlock`)
      .send({
        pin: galleryPin,
      });

    expect(response.statusCode).toBe(200);

    expect(response.body.photos).toHaveLength(1);

    expect(response.body.photos[0].filename).toBe(
      "selected-photo.jpg"
    );

    const selectedExists = response.body.photos.some(
      (photo) =>
        photo._id?.toString() === selectedPhotoId
    );

    expect(selectedExists).toBe(true);

    const unselectedExists = response.body.photos.some(
      (photo) =>
        photo._id?.toString() === unselectedPhotoId
    );

    expect(unselectedExists).toBe(false);
  });
});