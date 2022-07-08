"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u4TokenAdmin,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /companies */

describe("POST /jobs", function () {
  const newJob = {
    title: "new job",
    salary: 50000,
    equity: "0.01",
    company_handle: "c1"
  };

  test("unauth for anon", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for user", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("works for admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u4TokenAdmin}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        ...newJob,
        id: expect.any(Number)
      },
    });
  });

  test("works for admin with only required fields", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "new job",
          company_handle: "c1"
        })
        .set("authorization", `Bearer ${u4TokenAdmin}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        title: "new job",
        salary: null,
        equity: null,
        company_handle: "c1",
        id: expect.any(Number)
      }});
  });

  test("bad request with missing required data as admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "new job",
          salary: 50000,
        })
        .set("authorization", `Bearer ${u4TokenAdmin}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid equity data as admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "new job",
          equity: "moose",
          company_handle: "c1"
        })
        .set("authorization", `Bearer ${u4TokenAdmin}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok with no filters", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
      {
        title: "j1",
        salary: 10000,
        equity: "0.01",
        company_handle: "c1",
        id: expect.any(Number)
      },
      {
        title: "j2",
        salary: 20000,
        equity: null,
        company_handle: "c1",
        id: expect.any(Number)
      },
      {
        title: "j3",
        salary: 30000,
        equity: "0.03",
        company_handle: "c2",
        id: expect.any(Number)
      },
    ]});
  });

});