"use strict";

const { BadRequestError } = require("../expressError");

/** Takes JSON data and prepares it for SQL queries
 *
 * If no data given, return 400 Error
 *
 * Given {"firstName": "Aliya", "age": 32},
 *        {firstName: "first_name"} =>
 *
 * Returns {
 *    setCols: '"first_name"=$1, "age"=$2',
 *    values: ["Aliya", 32]
 *  }
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  console.log("sqlForPartialUpdate", dataToUpdate, jsToSql);

  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  //TODO: Per Spencer -- Add try/catch to ensure any necessary
  // camelCase to snake_case is included in jsToSql argument

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
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

function sqlForCompaniesFindAllFiltered(filters) {
  console.log("sqlForCompaniesFindAllFiltered", filters);

  const { nameLike, minEmployees, maxEmployees } = filters;

  if (minEmployees > maxEmployees) {
    throw new BadRequestError("Minimum employees cannot be larger than maximum");
  }

  const condsFilters = [];
  const condsValues = [];
  let count = 1;

  if (nameLike) {
    condsFilters.push(`name ILIKE $${count}`);
    condsValues.push(nameLike);
    count += 1;
  }
  if (minEmployees) {
    condsFilters.push(`num_employees > $${count}`);
    condsValues.push(minEmployees);
    count += 1;
  }
  if (maxEmployees) {
    condsFilters.push(`num_employees < $${count}`);
    condsValues.push(maxEmployees);
    count += 1;
  }

  return {
    whereConds: condsFilters.join(" AND "),
    values: condsValues,
  };
}

module.exports = { sqlForPartialUpdate, sqlForCompaniesFindAllFiltered };
