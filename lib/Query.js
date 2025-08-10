"use strict";

const Record = require("./Record.js");

class Query {
  #operators = { filter: null, map: null }
  #record = new Record();
  #limit = Infinity;
  #aggregation = null;

  constructor() { }

  #narrow(dataset) {
    const { filter, map } = this.#operators;
    const limit = this.#limit;
    const output = [];
    for (const tuple of dataset) {
      if (limit === output.length) return output;
      if (!(filter ? filter(tuple) : true)) continue;
      output.push(map ? map(tuple) : tuple);
    }
    return output;
  }

  process(dataset) {
    const record = this.#record;;
    const output = [];
    for (const element of this.#narrow(dataset)) {
      output.push(record.projection(element));
    }
    const aggregation = this.#aggregation;
    if (aggregation !== null) {
      const { field, fn } = aggregation;
      return fn(output, field);
    }
    return output;
  }

  transform(fn) {
    this.#operators.map = transform;
    return this;
  }

  take(value) {
    this.#limit = value;
    return this;
  }

  filter(fn) {
    this.#operators.filter = fn;
    return this;
  }

  unwrap(record) {
    this.#record.unwrap(record);
    return this;
  }

  add(options) {
    this.#record.add(options);
    return this;
  }

  pick(options) {
    this.#record.pick(options);
    return this;
  }

  omit(fields) {
    this.#record.omit(fields);
    return this;
  }

  aggregate(kind, field) {
    if (!Reflect.has(aggregations, kind)) {
      throw new Error(`Can't find aggregation '${kind}'`);
    }
    this.#aggregation = { fn: aggregations[kind], field };
    return this;
  }

  defaults(value) {
    this.#record.defaults(value);
    return this;
  }

  map(value) {
    this.#record.map(value);
    return this;
  }

  rename(value) {
    this.#record.rename(value);
    return this;
  }

  static compose(...queries) {
    return dataset => {
      let result = dataset;
      for (const query of queries) {
        result = query.process(result);
      }
      return result;
    }
  }
}

module.exports = Query;
