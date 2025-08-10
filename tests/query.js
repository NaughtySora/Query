"use strict";

const assert = require("node:assert");
const { describe, it } = require("node:test");
const Query = require("../lib/Query.js");
const Record = require("../lib/Record.js");
const { mostBearish } = require("./mocks/arrays.json");
const { btc } = require("./mocks/objects.json");

const inRange = (v, min, max) => v >= min && v <= max;

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

  it("unwrap", () => {
    const stats = new Record("statistics").pick(["price"]);
    const data = new Record("data").unwrap(stats);
    const q = new Query().unwrap(data);
    assert.deepStrictEqual(
      q.process([btc]),
      [{ price: btc.data.statistics.price }]
    );
  });

  it("add", () => {
    const mocks = [{ a: 1, b: 2 }, { a: 2, b: 2 }, { a: 4, b: 2 }];
    new Query().add([{ key: "c", map: () => 42 }]).process(mocks).forEach(item => {
      assert.strictEqual(item.a, undefined);
      assert.strictEqual(item.b, undefined);
      assert.strictEqual(item.c, 42);
    });
  });

  it("pick", () => {
    const mocks = [{ a: 1, b: 2 }, { a: 2, b: 2 }, { a: 4, b: 2 }];
    new Query().pick(["b"]).process(mocks).forEach(item => {
      assert.strictEqual(item.a, undefined);
      assert.strictEqual(item.b, 2);
    });
  });

  it("omit", () => {
    const mocks = [{ a: 1, b: 2 }, { a: 2, b: 2 }, { a: 4, b: 2 }];
    new Query().omit(["a"]).process(mocks).forEach(item => {
      assert.strictEqual(item.a, undefined);
      assert.strictEqual(item.b, 2);
    });
  });

  it("map", () => {
    const query = new Query()
      .pick(["symbol"])
      .map({ symbol: s => s.toUpperCase() });
    query.process(mostBearish).forEach(item => {
      assert.ok(inRange(item.symbol, "A", "Z"));
    });
  });

  it("rename", () => {
    const query = new Query().pick(["id", "name"]).rename({ id: "_id", name: "Name" });
    query.process(mostBearish).forEach(item => {
      assert.strictEqual(item.id, undefined);
      assert.strictEqual(item.name, undefined);
      assert.ok(typeof item._id === "number");
      assert.ok(typeof item.Name === "string");
    });
  });

  it("defaults", () => {
    const test = "a";
    const query = new Query().pick(["test"]).defaults({ test });
    query.process(mostBearish).forEach(item => {
      assert.strictEqual(item.test, test);
    });
  });

  it("compose", () => {
    const TAKE = 2;
    const query1 = new Query().omit([""]).take(TAKE);
    const query2 = new Query().pick(["votes", "id", "name"]).rename({ votes: "v" })
    const res = Query.compose(query1, query2)(mostBearish);
    assert.strictEqual(res.length, TAKE);
    res.forEach(item => {
      assert.ok(typeof item.v === "number");
      assert.strictEqual(item.votes, undefined);
      assert.ok(typeof item.id === "number");
      assert.ok(typeof item.name === "string");
    });
  });
});
