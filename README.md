# Query Object

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