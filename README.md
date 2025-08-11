# Query Object


## Types

`class Record {`
`  constructor(name?: string);`\
`  process<T extends object>(data: T): any;`\
`  unwrap(...records: Record[]): this;`\
`  add<T extends { [k: string]: Function }>(fields: T): this;`\
`  pick(names: string[]): this;`\
`  omit(names: string[]): this;`\
`  rename<T extends { [k: string]: string }>(fields: T): this;`\
`  map<T extends { [k: string]: Function }>(fields: T): this;`\
`  defaults<T extends { [k: string]: string }>(fields: T): this;`\
`  get name(): string;`\
`}`

`class Query {`\
`  process(dataset: any[]): any;`\
`  transform(fn: (data: any) => any): this;`\
`  take(value: number): this;`\
`  filter(fn: (data: any) => boolean): this;`\
`  unwrap(record: Parameters<Record["unwrap"]>): this;`\
`  add(options: Parameters<Record["add"]>): this;`\
`  pick(options: Parameters<Record["pick"]>): this;`\
`  omit(fields: Parameters<Record["omit"]>): this;`\
`  aggregate(kind: Aggregation, field: string): this;`\
`  aggregate(kind: "count"): this;`\
`  defaults(value: Parameters<Record["defaults"]>): this;`\
`  map(value: Parameters<Record["map"]>): this;`\
`  rename(value: Parameters<Record["rename"]>): this;`\
`  static compose(...queries: Query[]): any;`\
`}`

## Examples

### Record
```js
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
  const result = rec.process(input);
```

### Query
```js
    const stats = new Record("statistics").pick(["price"]);
    const data = new Record("data").unwrap(stats);
    const query = new Query()
    .unwrap(data)
    .take(3)
    .defaults({marketCap: 0})
    .filter(item => item.marketCap > 100);
    const result = query.process(dataset);
```