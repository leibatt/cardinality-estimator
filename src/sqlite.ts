import { Database } from 'sqlite3';

/*
const db = new Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE lorem (col TEXT)");

    const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (let i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();

    executeQuery(db,"SELECT rowid AS id, col FROM lorem")
    .then(rows => {
        rows.forEach(row => { console.log(row.id + ": " + row.col); });
    });
});

db.close();
*/

export function executeQuery(db: Database, query: string): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    db.all(query,{}, (err, rows) => {
      if(err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}
