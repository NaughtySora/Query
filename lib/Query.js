"use strict";
const { misc } = require("naughty-util");

class Query {
  constructor() {
    this.record = new Record();
    this.operators = new Map([
      ["map", []], ["filter", []],
    ]);
    this.limit = Infinity;
    this.compare = [];
    this.aggregation = null;
  }

  execute(dataset) {
    const { record, aggregation } = this;
    const target = this.narrow(dataset);
    const output = [];
    for (const element of target) {
      output.push(record.projection(element));
    }
    if (aggregation) {
      const { field, fn } = aggregation;
      return fn(output, field);
    }
    return output;
  }

  narrow(dataset) {
    const output = [];
    const { limit, compare } = this;
    const dist = new Map(compare.map(field => [field, []]));
    const filters = this.operators.get("filter");
    const maps = this.operators.get("map");
    const mappers = maps.length ? misc.compose(...this.operators.get("map")) : misc.id;
    top: for (const tuple of dataset) {
      if (limit === output.length) break;
      for (const filter of filters) {
        if (!filter(tuple)) continue top;
      }
      for (const field of compare) {
        const value = tuple[field];
        if (typeof value === "undefined") continue;
        const category = dist.get(field);
        if (category.includes(value)) continue top;
        category.push(value);
      }
      output.push(mappers(tuple));
    }
    return output;
  }

  cursor(dataset) {
    let pointer = 0;
    const query = this;
    const target = this.narrow(dataset);
    return {
      [Symbol.iterator]() {
        return {
          next() {
            const data = target[pointer++];
            if (!data) return { done: true };
            const value = query.record.projection(data);
            return {
              value,
              done: false,
            };
          }
        }
      }
    };
  }

  map(fn) {
    const operators = this.operators;
    operators.get("map").push(fn);
    return this;
  }

  filter(fn) {
    const operators = this.operators;
    operators.get("filter").push(fn);
    return this;
  }

  distinct(fields) {
    this.compare.push(...fields);
    return this;
  }

  unwrap(record) {
    this.record.unwrap(record);
    return this;
  }

  add(options) {
    this.record.add(options);
    return this;
  }

  pick(options) {
    this.record.pick(options);
    return this;
  }

  omit(fields) {
    this.record.omit(fields);
    return this;
  }

  aggregate(command, field) {
    if (!Reflect.has(aggregations, command)) {
      throw new Error(`Can't find command '${command}'`);
    }
    const fn = aggregations[command];
    this.aggregation = { fn, field };
    return this;
  }

  take(amount) {
    this.limit = amount;
    return this;
  }

  static compose(...queries) {
    return (dataset) => {
      let result = dataset;
      for (const query of queries) {
        result = query.execute(result);
      }
      return result;
    }
  }
}

module.exports = Query;