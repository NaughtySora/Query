"use strict";

const assert = require("node:assert");
const { describe, it } = require("node:test");
const Record = require("../lib/Record.js");
const { btc, mock } = require("./mocks/objects.json");

describe("units", () => {
  it("pick", () => {
    const statistics = new Record("statistics")
      .pick(["price", "priceChangePercentage24h", "rank"]);
    const res = statistics.process(btc.data.statistics);
    assert.strictEqual(res.price, btc.data.statistics.price);
    assert.strictEqual(
      res.priceChangePercentage24h,
      btc.data.statistics.priceChangePercentage24h
    );
    assert.strictEqual(res.rank, btc.data.statistics.rank);
  });

  it("omit", () => {
    const statistics = new Record("statistics")
      .omit(["price", "priceChangePercentage24h", "rank"]);
    const res = statistics.process(btc.data.statistics);
    assert.strictEqual(res.rank, undefined);
    assert.strictEqual(res.price, undefined);
    assert.strictEqual(
      res.priceChangePercentage24h,
      undefined
    );
    assert.strictEqual(res.maxSupply, btc.data.statistics.maxSupply);
    assert.strictEqual(res.totalSupply, btc.data.statistics.totalSupply);
    assert.strictEqual(
      res.circulatingSupply,
      btc.data.statistics.circulatingSupply
    );
    assert.strictEqual(res.marketCap, btc.data.statistics.marketCap);
  });

  describe("pick and omit", () => {
    it("pick->omit", () => {
      assert.throws(() => {
        new Record().pick(["key"]).omit(["key2"]);
      }, { message: "Can't omit while picking" });
    });
    it("omit->pick", () => {
      assert.throws(() => {
        new Record().omit(["key"]).pick(["key2"]);
      }, { message: "Can't pick while omitting" });
    });
  });

  describe("rename", () => {
    it("pick", () => {
      const statistics = new Record("statistics")
        .pick(["marketCap", "circulatingSupply"])
        .rename({ marketCap: "cap", circulatingSupply: "supply" });
      const res = statistics.process(btc.data.statistics);
      assert.strictEqual(res.cap, btc.data.statistics.marketCap);
      assert.strictEqual(res.supply, btc.data.statistics.circulatingSupply);
      assert.strictEqual(res.marketCap, undefined);
      assert.strictEqual(res.circulatingSupply, undefined);
    });

    it("omit", () => {
      const statistics = new Record("statistics")
        .omit(["price", "priceChangePercentage24h", "marketCap", "circulatingSupply"])
        .rename({ totalSupply: "total", maxSupply: "max", rank: "tier" });
      const res = statistics.process(btc.data.statistics);
      assert.strictEqual(res.total, btc.data.statistics.totalSupply);
      assert.strictEqual(res.max, btc.data.statistics.maxSupply);
      assert.strictEqual(res.tier, btc.data.statistics.rank);
      assert.strictEqual(res.price, undefined);
      assert.strictEqual(res.priceChangePercentage24h, undefined);
      assert.strictEqual(res.marketCap, undefined);
      assert.strictEqual(res.circulatingSupply, undefined);
    });
  });

  describe("map", () => {
    it("pick", () => {
      const status = new Record()
        .pick(["timestamp"])
        .map({ timestamp: Date.parse });
      const res = status.process(btc.status);
      assert.strictEqual(res.timestamp, Date.parse(btc.status.timestamp));
    });
    it("omit", () => {
      const status = new Record()
        .omit(["timestamp"])
        .map({ error_code: parseInt });
      const res = status.process(btc.status);
      assert.strictEqual(res.error_code, 0);
    });
  });

  describe("defaults", () => {
    it("pick", () => {
      const status = new Record()
        .pick(["key"])
        .defaults({ key: "value" });
      const res = status.process(btc.status);
      assert.strictEqual(res.key, "value");
    });
    it("omit", () => {
      const category = { a: 1 };
      const rec = new Record()
        .omit(["key",])
        .defaults({ category });
      const res = rec.process(mock);
      assert.strictEqual(res.category, category);
    });
  });

  it("add", () => {
    const rec = new Record().add([
      { key: "smth", map() { return 1 } },
      { key: "key", map() { return "value" } },
      { key: "category", map(data) { return data.category } },
      { key: "key2", map(data) { return data.key + "--" } },
    ]);
    const res = rec.process(mock);
    assert.strictEqual(res.smth, 1);
    assert.strictEqual(res.key, "value");
    assert.strictEqual(res.category, null);
    assert.strictEqual(res.key2, "value--");
  });

  it("unwrap", () => {
    const rec = new Record()
      .unwrap(
        new Record("data")
          .unwrap(
            new Record("statistics").pick(["price"]),
          ),);
    assert.deepStrictEqual(
      rec.process(btc),
      { price: btc.data.statistics.price }
    );
  });

  it("name", () => {
    const record = new Record("data");
    assert.strictEqual(record.name, "data");
  });
});

// const statistics = new Record("statistics")
//   .pick(["price", "rank", "totalSupply"])
//   .rename({ totalSupply: "supply" });

// const data = new Record("data")
//   .pick(["id", "symbol"])
//   .rename({ id: "_id" })
//   .map({ _id: (id) => `-${id}-hello` })
//   .unwrap(statistics);

// const r = new Record("Bitcoin")
//   .unwrap(data, statistics);

// const mapped = r.process(btc);

// // const mapped2 = {
// //   _id: `-${btc.data.id}-hello`,
// //   symbol: btc.data.symbol,
// //   price: btc.data.statistics.price,
// //   rank: btc.data.statistics.rank,
// //   supply: btc.data.statistics.maxSupply,
// // };

// const r2 = new Record().pick([0, 1])

// const mapped3 = r2.process([1, 2, 3, 4, 5, 6]);

// console.log({
//   mapped,
//   // mapped2,
//   mapped3,
// })