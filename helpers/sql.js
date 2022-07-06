"use strict";

const { BadRequestError } = require("../expressError");

/** Takes JSON data and prepares it for SQL queries
 * 
 * If no data given, return 400 Error
 * 
 * Given {"firstName": "Aliya", "age": 32} =>
 * 
 * Returns {
 *    setCols: '"first_name"=$1, "age"=$2',
 *    values: ["Aliya", 32]
 *  }
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
