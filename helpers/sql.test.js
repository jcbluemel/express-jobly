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
});
