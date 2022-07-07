"use strict";

const { BadRequestError } = require("../expressError");

/** Takes data and prepares it for SQL queries
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


module.exports = { sqlForPartialUpdate };
