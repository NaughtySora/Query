"use strict";

const PICK = 0;
const OMIT = 1;

class Record {
  #mode;
  #mapping = { transform: {}, rename: {}, defaults: {} };
  #create = [];
  #deep = [];
  #fields = new Set();
  #name = "";

  constructor(name = "") {
    this.#name = name;
  }

  #projecting(data) {
    if (this.#fields.size === 0) return {};
    if (this.#mode === 0) return this.#including(data);
    return this.#omitting(data);
  }

  #creating(dataset, data) {
    const create = this.#create;
    if (create.length === 0) return dataset;
    for (const { key, map } of create) {
      dataset[key] = map(data);
    }
    return dataset;
  }

  #including(data) {
    const output = {};
    const { rename, transform, defaults } = this.#mapping;
    for (const key of this.#fields) {
      const value = data[key] ?? defaults[key];;
      if (value === undefined) continue;
      const renamed = rename[key] ?? key;
      const map = transform[renamed];
      const mapped = map ? map(value) : value;
      if (mapped === undefined) continue;
      output[renamed] = mapped;
    }
    return output;
  }

  #omitting(data) {
    const output = {};
    const { rename, transform, defaults } = this.#mapping;
    for (const key of Object.keys(data)) {
      if (this.#fields.has(key)) continue;
      const value = data[key] ?? defaults[key];
      const renamed = rename[key] ?? key;
      const map = transform[renamed];
      const mapped = map ? map(value) : value;
      if (mapped === undefined) continue;
      output[renamed] = mapped;
    }
    return output;
  }

  #delving(output, data) {
    const deep = this.#deep;
    if (deep.length === 0) return output;
    for (const record of deep) {
      const name = record.name;
      if (!name) {
        throw new Error("Record object has to have name associated with target key");
      }
      const target = data[name];
      if (target === undefined) continue;
      Object.assign(output, record.process(target));
    }
    return output;
  }

  process(data) {
    const type = typeof data;
    if (type !== "object" || data === null) {
      throw new TypeError(`Record can't process data type ${type}`);
    }
    return this.#creating(this.#delving(this.#projecting(data), data), data);
  }

  unwrap(...records) {
    for (const record of records) this.#deep.push(record);
    return this;
  }

  add(fields) {
    const create = this.#create;
    for (const entry of Object.entries(fields)) {
      console.log(entry)
      create.push({ key: entry[0], map: entry[1] });
    }
    return this;
  }

  pick(names) {
    const mode = this.#mode;
    if (mode !== undefined && mode !== PICK) {
      throw new Error("Can't pick while omitting");
    }
    this.#mode ??= PICK;
    for (const name of names) this.#fields.add(name);
    return this;
  }

  omit(names) {
    const mode = this.#mode;
    if (mode !== undefined && mode !== OMIT) {
      throw new Error("Can't omit while picking");
    }
    this.#mode ??= OMIT;
    for (const name of names) this.#fields.add(name);
    return this;
  }

  rename(fields) {
    Object.assign(this.#mapping.rename, fields);
    return this;
  }

  map(fields) {
    Object.assign(this.#mapping.transform, fields);
    return this;
  }

  defaults(fields) {
    Object.assign(this.#mapping.defaults, fields);
    return this;
  }

  get name() {
    return this.#name;
  }
}

module.exports = Record;
