"use strict";

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const aggregations = require("../lib/aggregations.js");

const mock = [42, 1337, 420, 69, 1000].map(value => ({ value }));

describe("Aggregation: units", () => {
  it("max", () => {
    assert.equal(aggregations.max(mock, "value"), 1337);
  });
  it("min", () => {
    assert.equal(aggregations.min(mock, "value"), 42);
  });
  it("avg", () => {
    const avg = mock.reduce((acc, cur) => acc += cur.value, 0) / mock.length;
    assert.equal(aggregations.avg(mock, "value"), avg);
  });
  it("sum", () => {
    const sum = mock.reduce((acc, cur) => acc += cur.value, 0);
    assert.equal(aggregations.sum(mock, "value"), sum);
  });
  it("count", () => {
    assert.equal(aggregations.count(mock), mock.length);
  });
});
