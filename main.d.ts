
export class Record {
  constructor(name?: string);
  process<T extends object>(data: T): any;
  unwrap(...records: Record[]): this;
  add<T extends { [k: string]: Function }>(fields: T): this;
  pick(names: string[]): this;
  omit(names: string[]): this;
  rename<T extends { [k: string]: string }>(fields: T): this;
  map<T extends { [k: string]: Function }>(fields: T): this;
  defaults<T extends { [k: string]: string }>(fields: T): this;
  get name(): string;
}

type Aggregations = "avg" | "sum" | "min" | "max" | "count";

export class Query {
  process(dataset: any[]): any;
  transform(fn: (data: any) => any): this;
  take(value: number): this;
  filter(fn: (data: any) => boolean): this;
  unwrap(record: Parameters<Record["unwrap"]>): this;
  add(options: Parameters<Record["add"]>): this;
  pick(options: Parameters<Record["pick"]>): this;
  omit(fields: Parameters<Record["omit"]>): this;
  aggregate(kind: Aggregations, field: string): this;
  aggregate(kind: "count"): this;
  defaults(value: Parameters<Record["defaults"]>): this;
  map(value: Parameters<Record["map"]>): this;
  rename(value: Parameters<Record["rename"]>): this;
  static compose(...queries: Query[]): any;
}
