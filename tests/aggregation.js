"use strict";

const assert = require("node:assert");
const { describe, it } = require("node:test");
const aggregations = require("../lib/aggregations.js");
const mock = [42, 1337, 420, 69, 1000].map(value => ({ value }));

describe("Aggregation: units", () => {
  it("max", () => {
    assert.strictEqual(aggregations.max(mock, "value"), 1337);
  });
  it("min", () => {
    assert.strictEqual(aggregations.min(mock, "value"), 42);
  });
  it("avg", () => {
    const avg = mock.reduce((acc, cur) => acc += cur.value, 0) / mock.length;
    assert.strictEqual(aggregations.avg(mock, "value"), avg);
  });
  it("sum", () => {
    const sum = mock.reduce((acc, cur) => acc += cur.value, 0);
    assert.strictEqual(aggregations.sum(mock, "value"), sum);
  });
  it("count", () => {
    assert.strictEqual(aggregations.count(mock), mock.length);
  });
});
