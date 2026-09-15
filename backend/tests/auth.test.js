const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = require("../app");

jest.setTimeout(60000);

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = "test_jwt_secret_for_jest_only";

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();

  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("Authentication", () => {
  test("Admin can register", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        username: "Test Admin",
        email: "admin@test.com",
        password: "Test123456",
      });

    expect(response.statusCode).toBe(201);

    expect(response.body).toHaveProperty("message");
    expect(response.body.user).toBeDefined();

    expect(response.body.user.role).toBe("admin");
    expect(response.body.user.email).toBe("admin@test.com");
  });

  test("Admin can login", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        username: "Test Admin",
        email: "admin@test.com",
        password: "Test123456",
      });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@test.com",
        password: "Test123456",
      });

    expect(response.statusCode).toBe(200);

    expect(response.body.token).toBeDefined();
    expect(response.body.user).toBeDefined();
    expect(response.body.user.role).toBe("admin");
  });

  test("Login fails with wrong password", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        username: "Test Admin",
        email: "admin@test.com",
        password: "Test123456",
      });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@test.com",
        password: "WrongPassword",
      });

    expect(response.statusCode).toBe(400);
  });

  test("Protected event route rejects user without token", async () => {
    const response = await request(app)
      .get("/api/events");

    expect(response.statusCode).toBe(401);
  });
});

describe("Admin authorization", () => {
  test("Admin can create an event", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({
        username: "Event Admin",
        email: "eventadmin@test.com",
        password: "Test123456",
      });

    const login = await request(app)
      .post("/api/auth/login")
      .send({
        email: "eventadmin@test.com",
        password: "Test123456",
      });

    expect(login.statusCode).toBe(200);

    const token = login.body.token;

    expect(token).toBeDefined();

    const response = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Wedding",
        description: "Automated test event",
        eventDate: "2026-09-20",
      });

    expect(response.statusCode).toBe(201);

    expect(response.body.event).toBeDefined();
    expect(response.body.event.name).toBe("Test Wedding");
  });
});