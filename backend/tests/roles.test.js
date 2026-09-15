const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");

jest.setTimeout(60000);

let mongoServer;
let adminToken;
let teamToken;
let secondTeamToken;
let teamUserId;
let eventId;

beforeAll(async () => {
  process.env.JWT_SECRET = "test_jwt_secret_for_jest_only";

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Start temporary MongoDB database
  mongoServer = await MongoMemoryServer.create();

  await mongoose.connect(mongoServer.getUri());

  // ==================================================
  // 1. CREATE ADMIN
  // ==================================================

  const registerResponse = await request(app)
    .post("/api/auth/register")
    .send({
      username: "Role Test Admin",
      email: "roleadmin@test.com",
      password: "Test123456",
    });

  expect(registerResponse.statusCode).toBe(201);

  // ==================================================
  // 2. LOGIN ADMIN
  // ==================================================

  const adminLogin = await request(app)
    .post("/api/auth/login")
    .send({
      email: "roleadmin@test.com",
      password: "Test123456",
    });

  expect(adminLogin.statusCode).toBe(200);

  adminToken = adminLogin.body.token;

  expect(adminToken).toBeDefined();

  // ==================================================
  // 3. ADMIN CREATES TEAM ONE
  // ==================================================

  const teamResponse = await request(app)
    .post("/api/users/team")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      username: "Team One",
      email: "team1@test.com",
      password: "Test123456",
    });

  expect(teamResponse.statusCode).toBe(201);

  // ==================================================
  // 4. GET TEAM ONE ID
  // ==================================================

  const teamListResponse = await request(app)
    .get("/api/users/team")
    .set("Authorization", `Bearer ${adminToken}`);

  expect(teamListResponse.statusCode).toBe(200);
  expect(Array.isArray(teamListResponse.body)).toBe(true);

  const createdTeam = teamListResponse.body.find(
    (member) => member.email === "team1@test.com"
  );

  expect(createdTeam).toBeDefined();

  teamUserId = createdTeam._id;

  expect(teamUserId).toBeDefined();

  // ==================================================
  // 5. LOGIN TEAM ONE
  // ==================================================

  const teamLogin = await request(app)
    .post("/api/auth/login")
    .send({
      email: "team1@test.com",
      password: "Test123456",
    });

  expect(teamLogin.statusCode).toBe(200);

  teamToken = teamLogin.body.token;

  expect(teamToken).toBeDefined();

  // ==================================================
  // 6. ADMIN CREATES TEAM TWO
  // ==================================================

  const secondTeamResponse = await request(app)
    .post("/api/users/team")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      username: "Team Two",
      email: "team2@test.com",
      password: "Test123456",
    });

  expect(secondTeamResponse.statusCode).toBe(201);

  // ==================================================
  // 7. LOGIN TEAM TWO
  // ==================================================

  const secondTeamLogin = await request(app)
    .post("/api/auth/login")
    .send({
      email: "team2@test.com",
      password: "Test123456",
    });

  expect(secondTeamLogin.statusCode).toBe(200);

  secondTeamToken = secondTeamLogin.body.token;

  expect(secondTeamToken).toBeDefined();

  // ==================================================
  // 8. ADMIN CREATES EVENT
  // ==================================================

  const eventResponse = await request(app)
    .post("/api/events")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      name: "Wedding Test Event",
      description: "Role authorization test",
      eventDate: "2026-09-20",
    });

  expect(eventResponse.statusCode).toBe(201);

  eventId =
    eventResponse.body.event?._id ||
    eventResponse.body._id;

  expect(eventId).toBeDefined();

  // ==================================================
  // 9. ASSIGN TEAM ONE TO EVENT
  // ==================================================

  const assignResponse = await request(app)
    .post(`/api/events/${eventId}/team`)
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      userId: teamUserId,
    });

  expect(assignResponse.statusCode).toBe(200);
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
// ROLE AUTHORIZATION TESTS
// ====================================================

describe("Role authorization", () => {
  test("Team Member cannot create an event", async () => {
    const response = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${teamToken}`)
      .send({
        name: "Unauthorized Event",
        description: "Team must not create events",
        eventDate: "2026-09-21",
      });

    expect(response.statusCode).toBe(403);
  });

  test("Team Member cannot create another Team Member", async () => {
    const response = await request(app)
      .post("/api/users/team")
      .set("Authorization", `Bearer ${teamToken}`)
      .send({
        username: "Unauthorized Team",
        email: "unauthorized@test.com",
        password: "Test123456",
      });

    expect(response.statusCode).toBe(403);
  });

  test("Team Member cannot access Admin team list", async () => {
    const response = await request(app)
      .get("/api/users/team")
      .set("Authorization", `Bearer ${teamToken}`);

    expect(response.statusCode).toBe(403);
  });
});

// ====================================================
// EVENT ACCESS TESTS
// ====================================================

describe("Assigned event authorization", () => {
  test("Assigned Team Member can see assigned event", async () => {
    const response = await request(app)
      .get("/api/events")
      .set("Authorization", `Bearer ${teamToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    const found = response.body.some(
      (event) => event._id === eventId
    );

    expect(found).toBe(true);
  });

  test("Unassigned Team Member cannot see event", async () => {
    const response = await request(app)
      .get("/api/events")
      .set(
        "Authorization",
        `Bearer ${secondTeamToken}`
      );

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    const found = response.body.some(
      (event) => event._id === eventId
    );

    expect(found).toBe(false);
  });

  test("Unassigned Team Member cannot access event photos", async () => {
    const response = await request(app)
      .get(`/api/photos/event/${eventId}`)
      .set(
        "Authorization",
        `Bearer ${secondTeamToken}`
      );

    expect(response.statusCode).toBe(403);
  });

  test("Assigned Team Member can access event photos", async () => {
    const response = await request(app)
      .get(`/api/photos/event/${eventId}`)
      .set("Authorization", `Bearer ${teamToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});