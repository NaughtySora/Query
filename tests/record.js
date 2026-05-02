"use strict";

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const Record = require("../lib/Record.js");
const { btc, mock } = require("./mocks/objects.json");

describe("Record: units", () => {
  it("pick", () => {
    const statistics = new Record("statistics")
      .pick(["price", "priceChangePercentage24h", "rank"]);
    const res = statistics.process(btc.data.statistics);
    assert.equal(res.price, btc.data.statistics.price);
    assert.equal(
      res.priceChangePercentage24h,
      btc.data.statistics.priceChangePercentage24h
    );
    assert.equal(res.rank, btc.data.statistics.rank);
  });

  it("omit", () => {
    const statistics = new Record("statistics")
      .omit(["price", "priceChangePercentage24h", "rank"]);
    const res = statistics.process(btc.data.statistics);
    assert.equal(res.rank, undefined);
    assert.equal(res.price, undefined);
    assert.equal(
      res.priceChangePercentage24h,
      undefined
    );
    assert.equal(res.maxSupply, btc.data.statistics.maxSupply);
    assert.equal(res.totalSupply, btc.data.statistics.totalSupply);
    assert.equal(
      res.circulatingSupply,
      btc.data.statistics.circulatingSupply
    );
    assert.equal(res.marketCap, btc.data.statistics.marketCap);
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
      assert.equal(res.cap, btc.data.statistics.marketCap);
      assert.equal(res.supply, btc.data.statistics.circulatingSupply);
      assert.equal(res.marketCap, undefined);
      assert.equal(res.circulatingSupply, undefined);
    });

    it("omit", () => {
      const statistics = new Record("statistics")
        .omit(["price", "priceChangePercentage24h", "marketCap", "circulatingSupply"])
        .rename({ totalSupply: "total", maxSupply: "max", rank: "tier" });
      const res = statistics.process(btc.data.statistics);
      assert.equal(res.total, btc.data.statistics.totalSupply);
      assert.equal(res.max, btc.data.statistics.maxSupply);
      assert.equal(res.tier, btc.data.statistics.rank);
      assert.equal(res.price, undefined);
      assert.equal(res.priceChangePercentage24h, undefined);
      assert.equal(res.marketCap, undefined);
      assert.equal(res.circulatingSupply, undefined);
    });
  });

  describe("map", () => {
    it("pick", () => {
      const status = new Record()
        .pick(["timestamp"])
        .map({ timestamp: Date.parse });
      const res = status.process(btc.status);
      assert.equal(res.timestamp, Date.parse(btc.status.timestamp));
    });
    it("omit", () => {
      const status = new Record()
        .omit(["timestamp"])
        .map({ error_code: parseInt });
      const res = status.process(btc.status);
      assert.equal(res.error_code, 0);
    });
  });

  describe("defaults", () => {
    it("pick", () => {
      const status = new Record()
        .pick(["key"])
        .defaults({ key: "value" });
      const res = status.process(btc.status);
      assert.equal(res.key, "value");
    });
    it("omit", () => {
      const category = { a: 1 };
      const rec = new Record()
        .omit(["key",])
        .defaults({ category });
      const res = rec.process(mock);
      assert.equal(res.category, category);
    });
  });

  it("add", () => {
    const rec = new Record().add({
      smth: () => 1,
      key: () => "value",
      category: (data) => data.category,
      key2: (data) => data.key + "--"
    });
    const res = rec.process(mock);
    assert.equal(res.smth, 1);
    assert.equal(res.key, "value");
    assert.equal(res.category, null);
    assert.equal(res.key2, "value--");
  });

  it("unwrap", () => {
    const stats = new Record("statistics").pick(["price"]);
    const data = new Record("data").unwrap(stats);
    const rec = new Record().unwrap(data);
    assert.deepEqual(
      rec.process(btc),
      { price: btc.data.statistics.price }
    );
  });

  it("name", () => {
    const record = new Record("data");
    assert.equal(record.name, "data");
  });
});


it("integration", () => {
  const external = new Map([["BTC", 42]]);

  const stats = new Record("statistics")
    .pick(["price", "marketCap", "rank", "not_exists"])
    .rename({ marketCap: "cap", })
    .defaults({ not_exists: "default value" })
    .map({
      price: (p) => Math.floor(p),
      cap: (c) => c.toString(),
    });

  const data = new Record("data")
    .pick(["id", "name"]).unwrap(stats)
    .add({
      important: (data) => external.get(data.symbol),
    });

  const rec = new Record().unwrap(data);
  const res = rec.process(btc);
  assert.deepEqual(res, {
    id: 1,
    name: 'Bitcoin',
    price: 118794,
    cap: '2364530652737.9',
    rank: 1,
    not_exists: 'default value',
    important: 42
  });
});