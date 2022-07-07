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
    equity: 0.04,
    company_handle: "c3",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
          `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE company_handle = 'c3'`);
    expect(result.rows).toEqual([
      {
        title: "new",
        salary: 40000,
        equity: 0.04,
        company_handle: "c3",
      },
    ]);
  });

  test("cannot create if company doesn't exist", async function () {
    const newJobFakeCompany = {
      title: "new",
      salary: 40000,
      equity: 0.04,
      company_handle: "no-company",
    };
    try {
      await Job.create(newJobFakeCompany);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }

    // const result = await db.query(
    //       `SELECT title, salary, equity, company_handle
    //        FROM jobs
    //        WHERE company_handle = 'foo'`);
    // expect(result.rows).toEqual([]);
  });
});