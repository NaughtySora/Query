"use strict";

const tests = ["record", "query"];
const exclude = process.argv.slice(2);

for (const test of tests) {
  if (exclude.includes(test)) continue;
  require(`./${test}.js`);
}
