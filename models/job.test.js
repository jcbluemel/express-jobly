"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 40000,
    equity: "0.04",
    company_handle: "c3",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "new",
      salary: 40000,
      equity: "0.04",
      company_handle: "c3",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
        FROM jobs
        WHERE company_handle = 'c3'`);
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "new",
        salary: 40000,
        equity: "0.04",
        company_handle: "c3",
      },
    ]);
  });

  test("cannot create if company doesn't exist", async function () {
    const newJobFakeCompany = {
      title: "new",
      salary: 40000,
      equity: "0.04",
      company_handle: "no-company",
    };
    try {
      await Job.create(newJobFakeCompany);
      throw new Error("Fail test, you shouldn't get here")
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
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
    ]);
  });
});