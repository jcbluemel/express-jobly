"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
      `SELECT handle
           FROM companies
           WHERE handle = $1`,
      [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(
      `INSERT INTO companies(
          handle,
          name,
          description,
          num_employees,
          logo_url)
           VALUES
             ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
      [
        handle,
        name,
        description,
        numEmployees,
        logoUrl,
      ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    console.log("findAll");

    const companiesRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           ORDER BY name`);
    return companiesRes.rows;
  }

  /** Find all companies, filtering via query params.
   *  Given { param: filterValue, ... } =>
   *  Returns matching companies as:
   *  [{ handle, name, description, numEmployees, logoUrl }, ...]
   */
  static async findAllFiltered(data) {
    console.log("findAllFiltered");
    const { whereConds, values } =
        this._sqlForCompaniesFindAllFiltered(data);

    const querySql = `
      SELECT handle,
            name,
            description,
            num_employees AS "numEmployees",
            logo_url AS "logoUrl"
      FROM companies
      WHERE ${ whereConds }
      ORDER BY name`;
    const result = await db.query(querySql, values);
    return result.rows;
  }


  /** Take JSON data and prepare it for company filtering query.
 *
 *  If minEmployees > maxEmployees, return 400 Error.
 *
 *  Given { nameLike: "net", minEmployees: 50, maxEmployees: 500 } =>
 *
 *  Return {
 *    whereConds: `name ILIKE $1
        AND num_employees > $2
        AND num_employees < $3`,
      values: ["net", 50, 500]
 *   }
 */
  static _sqlForCompaniesFindAllFiltered(filters) {
    console.log("sqlForCompaniesFindAllFiltered", filters);
  
    const { nameLike, minEmployees, maxEmployees } = filters;
  
    if (minEmployees > maxEmployees) {
      throw new BadRequestError("Minimum employees cannot be larger than maximum");
    }
  
    const whereConds = [];
    const condsValues = [];
    let count = 1;
  
    if (nameLike) {
      whereConds.push(`name ILIKE $${count}`);
      condsValues.push(`%${nameLike}%`);
      count += 1;
    }
    if (minEmployees) {
      whereConds.push(`num_employees >= $${count}`);
      condsValues.push(minEmployees);
      count += 1;
    }
    if (maxEmployees) {
      whereConds.push(`num_employees <= $${count}`);
      condsValues.push(maxEmployees);
      count += 1;
    }
  
    return {
      whereConds: whereConds.join(" AND "),
      values: condsValues,
    };
  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
      [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
      UPDATE companies
      SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
      `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
      [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
