import { neon } from "@neondatabase/serverless";

export function sqlClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url, { fullResults: true });
}

// A small parameterized-query interface shared by the content routes.
// SQL comes only from source code; user values are always separate bindings.
class Statement {
  constructor(readonly text: string, readonly values: unknown[] = []) {}
  bind(...values: unknown[]) { return new Statement(this.text, values); }
  query() {
    let index = 0;
    const text = this.text.replace(/\?/g, () => `$${++index}`);
    if (index !== this.values.length) throw new Error("SQL binding count mismatch");
    return sqlClient().query(text, this.values);
  }
  async all<T = Record<string, unknown>>() {
    const result = await this.query();
    return { results: result.rows as T[] };
  }
  async first<T = Record<string, unknown>>() {
    return (await this.all<T>()).results[0] ?? null;
  }
  async run() {
    const result = await this.query();
    return { meta: { changes: result.rowCount ?? 0 } };
  }
}
export function db() {
  return {
    prepare: (text: string) => new Statement(text),
    batch: (statements: Statement[]) => sqlClient().transaction(statements.map(s => s.query())),
  };
}
