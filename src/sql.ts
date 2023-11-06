import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'

function isSQLObject(val: unknown): val is { errno: number, Error: string } {
    return typeof val === 'object' && val !== null
}

enum SQLERRORS {
    DB_ALREADY_CREATED
}

const LINKS_DATABASE = {
    db_file: "./links.db",
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

class DB_VALUE_NOT_IN_TABLE extends Error {
    constructor(msg: string = "Table does not have the value") {
        super(msg);
    }
}


export function trimString (str : string){
    const trimmed = str.trim();
    const remove_full_stop = trimmed[trimmed.length-1] === "." ? trimmed.slice(0,-1) : trimmed
    return remove_full_stop
}

export function removeDuplicates (strArr : any[]){
    return Array.from(new Set(strArr))
}


export async function sqlite_open() {

    try {
        // open the database
        const db = await open({
            filename: LINKS_DATABASE.db_file,
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

    const if_exists = `SELECT * FROM sqlite_master WHERE name ='${LINKS_DATABASE.name}' and type='table'`
    const table_exists = await db.get(if_exists)
    if (table_exists) {
        return
    }
    // create table
    const sql = `CREATE TABLE  ${LINKS_DATABASE.name}(id INTEGER PRIMARY KEY, ${LINKS_DATABASE.link_column} NVARCHAR(500) NOT NULL UNIQUE, date TEXT)`
    const idx_links = `CREATE INDEX idx_links ON ${LINKS_DATABASE.name}(${LINKS_DATABASE.link_column})`
    await db.exec(sql)
    await db.exec(idx_links)

}

export async function sqlite_insert(db: Database<sqlite3.Database, sqlite3.Statement>, links: string[]) {

    for (const l of links) {
        try {
            await db.run(
                `INSERT INTO ${LINKS_DATABASE.name}(${LINKS_DATABASE.link_column}, date) VALUES (?, ?)`,
                l, Date.now()
            )
        } catch (err) {
            console.log(err)
            console.log(l)
            throw new Error()
        }
      
    }
}


export async function sqlite_fetch_value(db: Database<sqlite3.Database, sqlite3.Statement>, link: string) {

    return await db.get(`SELECT ${LINKS_DATABASE.link_column} FROM ${LINKS_DATABASE.name} WHERE ${LINKS_DATABASE.link_column} = ?`, link)

}

export async function sqlite_assert_value_not_found(db: Database<sqlite3.Database, sqlite3.Statement>, link: string) {

    const result = await sqlite_fetch_value(db, link)
    if (result === undefined) {
        return true
    }
    return false;
}

export async function sqlite_get(db: Database<sqlite3.Database, sqlite3.Statement>, link: string) {

    const result = await db.get(`SELECT ${LINKS_DATABASE.link_column} FROM ${LINKS_DATABASE.name} WHERE ${LINKS_DATABASE.link_column} = ?`, link)
    if (result === undefined) {
        throw new DB_VALUE_NOT_IN_TABLE()
    }
    return result
}