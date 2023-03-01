import { Database as Sqlite3Database } from 'sqlite3';
import { executeQuery } from './sqlite';

export class Database {
  database: Sqlite3Database;
  
  constructor(database: Sqlite3Database) {
    this.database = database;
  }

  async executeQuery(query: string): Promise<Record<string, string | number>[]> {
    const results: Record<string, string | number>[] = await executeQuery(this.database, query);
    return results;
  }

}
