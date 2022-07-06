"use strict";

const {
  sqlForPartialUpdate,
  sqlForCompaniesFindAllFiltered } = require("./sql");
const { BadRequestError } = require("../expressError");


describe("sqlForPartialUpdate", function () {
  test("works", function () {
    const { setCols, values } = sqlForPartialUpdate(
      { firstName: "Test", age: 42 },
      { firstName: "first_name"});
    expect(setCols).toEqual('"first_name"=$1, "age"=$2');
    expect(values).toEqual(["Test", 42]);
  });

  test("no data failure", function () {
    try {
      sqlForPartialUpdate(
        {},
        { firstName: "first_name"});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });


  //TODO: Test if requisite key conversion in jsToSql
  //Test for potential error we would need to add to sql.js
  // test("no jsToSql failure", function () {
  //   try {
  //     sqlForPartialUpdate(
  //       { firstName: "Test", age: 42 },
  //       {});
  //     fail();
  //   } catch (err) {
  //     expect(err instanceof BadRequestError).toBeTruthy();
  //   }
  // });
});

describe("sqlForCompaniesFindAllFiltered", function () {
  test("works for all filters", function () {
    const { whereConds, values } = sqlForCompaniesFindAllFiltered(
      { nameLike: "test", minEmployees: 50, maxEmployees: 500 });
    expect(whereConds).toEqual(
      `name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3`);
    expect(values).toEqual(["%test%", 50, 500]);
  });

  test("works for nameLike only", function () {
    const { whereConds, values } = sqlForCompaniesFindAllFiltered(
      { nameLike: "test" });
    expect(whereConds).toEqual(
      `name ILIKE $1`);
    expect(values).toEqual(["%test%"]);
  });

  test("works for minEmployees only", function () {
    const { whereConds, values } = sqlForCompaniesFindAllFiltered(
      { minEmployees: 50 });
    expect(whereConds).toEqual(
      `num_employees >= $1`);
    expect(values).toEqual([50]);
  });

  test("works for maxEmployees only", function () {
    const { whereConds, values } = sqlForCompaniesFindAllFiltered(
      { maxEmployees: 500 });
    expect(whereConds).toEqual(
      `num_employees <= $1`);
    expect(values).toEqual([500]);
  });

  test("fails min > max", function () {
    try {
      sqlForCompaniesFindAllFiltered(
        { minEmployees: 500, maxEmployees: 50 });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });


});