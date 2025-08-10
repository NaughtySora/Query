"use strict";

module.exports = {
  __proto__: null,
  avg(dataset, field) {
    let result = 0;
    for (const item of dataset) {
      const value = item[field];
      if (!Number.isFinite(value)) continue;
      result += value;
    }
    return result / dataset.length;
  },
  max(dataset, field) {
    let result;
    for (const item of dataset) {
      const value = item[field];
      if (!Number.isFinite(value)) continue;
      if (result === undefined || result < value) result = value;
    }
    return result;
  },
  min(dataset, field) {
    let result;
    for (const item of dataset) {
      const value = item[field];
      if (!Number.isFinite(value)) continue;
      if (result === undefined || result > value) result = value;
    }
    return result;
  },
  sum(dataset, field) {
    let result = 0;
    for (const item of dataset) {
      const value = item[field];
      if (!Number.isFinite(value)) continue;
      result += value;
    }
    return result;
  },
  count(dataset) {
    return dataset.length;
  }
};
