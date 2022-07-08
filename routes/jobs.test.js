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
    company_handle: "new"
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
      job: newJob,
    });
  });

  test("works for admin with only required fields", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "new job",
          company_handle: "new"
        })
        .set("authorization", `Bearer ${u4TokenAdmin}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        title: "new job",
        salary: NULL,
        equity: NULL,
        company_handle: "new"
      }});
  });

  test("bad request with missing required data as admin", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
          title: "new job",
          salary: 50000,
        })
        .set("authorization", `Bearer ${u4TokenAdmin}`);
    expect(resp.statusCode).toEqual(400);
  });
  //TODO:
  // test("bad request with invalid data as admin", async function () {
  //   const resp = await request(app)
  //       .post("/companies")
  //       .send({
  //         ...newJob,
  //         logoUrl: "not-a-url",
  //       })
  //       .set("authorization", `Bearer ${u4TokenAdmin}`);
  //   expect(resp.statusCode).toEqual(400);
  // });
});