"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: login and admin
 */

router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(
    req.body,
    jobNewSchema,
    { required: true }
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  if (req.body.equity) {
    if (isNaN(req.body.equity)) {
      throw new BadRequestError("Equity must be a numeric string <= 1.0");
    }
  }

  const job = await Job.create(req.body);

  return res.status(201).json({ job });
});

/** GET /  =>
 *   { jobs: [ { title, salary, equity, company_handle }, ...] }
 *
 * TODO: filter to be added
 * Can filter on provided search filters:
 * - title(will find case-insensitive, partial matches)
 * - minSalar
 * - hasEquity 
 *
 * Authorization required: none
 */

 router.get("/", async function (req, res, next) {

  // if no filters
  if (Object.keys(req.query).length === 0) {

    const jobs = await Job.findAll();
    return res.json({ jobs });

  }

  // if query filters included
  // const validator = jsonschema.validate(
  //   req.query,
  //   jobNewSchema,
  //   { required: true }
  // );

  // if (!validator.valid) {
  //   const errs = validator.errors.map(e => e.stack);
  //   throw new BadRequestError(errs);
  // }

  // const filters = req.query;
  // const jobs = await Job.findAllFiltered(filters);
  
  return res.json({ jobs });
});

module.exports = router;
