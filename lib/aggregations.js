"use strict";

module.exports = {
  __proto__: null,
  avg(dataset, field) {
    let result = 0;
    let ratio = 0;
    for (const item of dataset) {
      let value = item[field];
      if (!Reflect.has(item, field) || !Number.isFinite(value)) value = 0;
      result += value;
      ratio++;
    }
    return result / ratio;
  },
  max(dataset, field) {
    let result;
    for (const item of dataset) {
      const value = item[field];
      if (!Reflect.has(item, field) || !Number.isFinite(value)) continue;
      if (typeof result === "undefined") result = value;
      else if (result < value) result = value;
    }
    return result;
  },
  min(dataset, field) {
    let result;
    for (const item of dataset) {
      const value = item[field];
      if (!Reflect.has(item, field) || !Number.isFinite(value)) continue;
      if (typeof result === "undefined") result = value;
      else if (result > value) result = value;
    }
    return result;
  },
  sum(dataset, field) {
    let result = 0;
    for (const item of dataset) {
      const value = item[field];
      if (!Reflect.has(item, field) || !Number.isFinite(value)) continue;
      result += value;
    }
    return result;
  },
};