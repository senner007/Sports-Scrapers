import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'

function isSQLObject(val: unknown): val is { errno: number, Error: string } {
    return typeof val === 'object' && val !== null
}

enum SQLERRORS {
    DB_ALREADY_CREATED
}

const LINKS_DATABASE = {
    db_file: "./test",
    name: "links",
    link_column: "link"
}


class DB_CREATED_ERROR extends Error {
    constructor(error: number, msg: string = "DB already created") {
        if (error !== 1) {
            throw new Error()
        }
        super(msg);
    }
}

export async function sqlite_open() {

    try {
        // open the database
        const db = await open({
            filename: './test.db',
            driver: sqlite3.Database
        })
        return db;
    } catch (err: unknown) {
        console.log(err)
        if (isSQLObject(err)) {
            throw new DB_CREATED_ERROR(err.errno)
        }
        throw new Error()
    }
}


export async function sqlite_create_table(db: Database<sqlite3.Database, sqlite3.Statement>) {

    try {
        const if_exists = `SELECT * FROM sqlite_master WHERE name ='${LINKS_DATABASE.name}' and type='table'`
        const table_exists = await db.get(if_exists)
        if (table_exists) {
            return
        }
        // create table
        const sql = `CREATE TABLE  ${LINKS_DATABASE.name}(id INTEGER PRIMARY KEY, ${LINKS_DATABASE.link_column} NVARCHAR(500) NOT NULL UNIQUE, date TEXT , host NVARCHAR(100) NOT NULL)`
        const idx_links = `CREATE INDEX idx_links ON ${LINKS_DATABASE.name}(${LINKS_DATABASE.link_column})`
        await db.exec(sql)
        await db.exec(idx_links)
    } catch (err: unknown) {
        console.log(err)
        throw new Error()
    }
}

export async function sqlite_insert(db: Database<sqlite3.Database, sqlite3.Statement>, links: string[], host: string) {

    try {
        for (const l of links) {
            const sql = `INSERT INTO ${LINKS_DATABASE.name}(${LINKS_DATABASE.link_column}, date, host) VALUES ('${l}', '${Date.now()}', '${host}')`
            await db.exec(sql)
        }
    } catch (err) {
        console.log(err)
        throw new Error();
    }
}