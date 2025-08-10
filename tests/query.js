"use strict";

const assert = require("node:assert");
const { describe, it } = require("node:test");
const Query = require("../lib/Query.js");
const { mostBearish } = require("./mocks/arrays.json");

describe("Query: units", () => {
  it("take", () => {
    const TAKE = 3;
    const query = new Query().take(TAKE);
    const res = query.process(mostBearish);
    assert.strictEqual(res.length, TAKE);
  });

  it("transform", () => {
    const query = new Query().omit([""]).transform(() => ({ votes: "mock" }));
    const res = query.process(mostBearish);
    res.forEach(item => {
      assert.strictEqual(item.votes, "mock");
    });
  });

  it("filter", () => {
    const first = mostBearish[0];
    const query = new Query().omit([""]).filter(d => d.id === first.id);
    const res = query.process(mostBearish);
    assert.strictEqual(res.length, 1);
    assert.deepStrictEqual(res[0], first);
  });

  it("aggregate", () => {
    assert.strictEqual(
      new Query().omit([""]).aggregate("sum", "votes").process(mostBearish),
      mostBearish.reduce((acc, cur) => acc += cur.votes, 0)
    );

    assert.strictEqual(
      new Query().omit([""]).aggregate("max", "votes").process(mostBearish),
      Math.max(...mostBearish.map(item => item.votes)),
    );

    assert.strictEqual(
      new Query().omit([""]).aggregate("min", "votes").process(mostBearish),
      Math.min(...mostBearish.map(item => item.votes)),
    );

    assert.strictEqual(
      new Query().omit([""]).aggregate("avg", "votes").process(mostBearish),
      mostBearish.reduce((acc, cur) => acc += cur.votes, 0) / mostBearish.length,
    );

    assert.strictEqual(
      new Query().omit([""]).aggregate("count").process(mostBearish),
      mostBearish.length,
    );
  });

  it("unwrap",);

  it("add");

  it("pick");

  it("omit");

  it("compose");

  it("map");

  it("rename");

  it("defaults");

  it("compose");
});
