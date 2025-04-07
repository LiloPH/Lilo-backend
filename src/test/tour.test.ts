import request from "supertest";
import { Express } from "express";
import { app } from "../app";

describe("POST /api/v1/tour", () => {
  it("should create a new tour and return 201", async () => {
    jest.setTimeout(10000);

    const response = await request(app)
      .post("/api/v1/tour")
      .send({
        name: "Mountain Trek Tour",
        price: 1500,
        summary: "A beautiful mountain trekking experience",
        description:
          "Detailed description of the mountain trek tour experience",
        cover_image: "https://example.com/cover.jpg",
        images: [
          "https://res.cloudinary.com/dtmqzxchr/image/upload/v1742401065/to4woxbesgq1wvcsqlm8.png",
          "https://res.cloudinary.com/dtmqzxchr/image/upload/v1742401065/to4woxbesgq1wvcsqlm8.png",
        ],
      })
      .expect(201);

    expect(response.body).toHaveProperty("name", "Mountain Trek Tour");
    expect(response.body).toHaveProperty("price", 1500);
  });
});
