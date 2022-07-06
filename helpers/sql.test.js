"use strict";

const { sqlForPartialUpdate } = require("./sql");
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