const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

function runScript(db, script) {
  const sql = fs.readFileSync(script, 'utf8');
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

const getViews = (db) => {
  const sql = `SELECT * FROM SQLITE_MASTER WHERE TYPE = "view"`
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

const getViewColumns = (db, viewName) => {
  const sql = `pragma table_info(${viewName})`
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

describe('the SQL in the `exercise.sql` file', () => {
  let db;
  let scriptPath1;
  let scriptPath2;
  let cleanup;
  let testData

  beforeAll(async () => {
    const dbPath = path.resolve(__dirname, '..', 'lesson37.db');
    db = new sqlite3.Database(dbPath);

    scriptPath1 = path.resolve(__dirname, '..', 'exercise1.sql');
    scriptPath2 = path.resolve(__dirname, '..', 'exercise2.sql');
    cleanup = path.resolve(__dirname, './cleanup.sql');
    testData = path.resolve(__dirname, './testdata.sql');
    await runScript(db, cleanup);
  });

  afterAll(async () => {
    await runScript(db, cleanup);
    db.close();
  });

  it('create view Employee_Contact with the specified columns', async () => {
    await runScript(db, scriptPath1);
    const expectedViewName = "Employee_Contact";
    const expectedColumns = [
      "Current Date",
      "FIRST_NAME",
      "LAST_NAME",
      "EMAIL",
      "PHONE_NUMBER",
      "ADDRESS",
      "ZIP_CODE" 
    ]

    const views = await getViews(db);
    expect(views.some(view => view.name == expectedViewName)).toBe(true);

    const viewColumns = await getViewColumns(db, expectedViewName)
    expectedColumns.map((eCol) => {
      expect(viewColumns.some(vCol => vCol.name == eCol)).toBe(true);
    })
  });

  it('should select all rows and columns from Employee_Contact', async () => {
    const results = await runScript(db, scriptPath2);
    const expected = await runScript(db, testData);

    expect(results).toEqual(expected);
  });
});
