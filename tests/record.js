"use strict";

const Record = require("../lib/Record.js");
const btc = require("./mocks/btc.json");

const statistics = new Record("statistics")
  .pick(["price", "rank", "totalSupply"])
  .rename({ totalSupply: "supply" });

const data = new Record("data")
  .pick(["id", "symbol"])
  .rename({ id: "_id" })
  .map({ _id: (id) => `-${id}-hello` })
  .unwrap(statistics);

const r = new Record("Bitcoin")
  .unwrap(data, statistics);

const mapped = r.process(btc);

// const mapped2 = {
//   _id: `-${btc.data.id}-hello`,
//   symbol: btc.data.symbol,
//   price: btc.data.statistics.price,
//   rank: btc.data.statistics.rank,
//   supply: btc.data.statistics.maxSupply,
// };

const r2 = new Record().pick([0, 1])

const mapped3 = r2.process([1, 2, 3, 4, 5, 6]);

console.log({
  mapped,
  // mapped2,
  mapped3,
})