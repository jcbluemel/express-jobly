"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

/** Related functions for companies. */

class Job {
  /** Create a job (from data), update db, return new job data.
   * //TODO: schema for equity should be string. check in route if NaN
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, company_handle }
   * */

   static async create({ title, salary, equity, company_handle }) {
    const noCompany = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [company_handle]);

    if (noCompany.rows.length === 0) {
      throw new BadRequestError(`Company doesn't exist: ${company_handle}`);
    }


    const result = await db.query(
      `INSERT INTO jobs(
          title,
          salary,
          equity,
          company_handle)
           VALUES
             ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle`,
      [
        title,
        salary,
        equity,
        company_handle,
      ],
    );
    const job = result.rows[0];

    return job;
  }
}

module.exports = Job;
