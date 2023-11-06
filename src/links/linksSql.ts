import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'

function isSQLObject(val: unknown): val is { errno: number, Error: string } {
    return typeof val === 'object' && val !== null
}

enum SQLERRORS {
    DB_ALREADY_CREATED
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

export class LinksDB {

    db_props = {
        db_file: "./links.db",
        name: "links",
        link_column: "link"
    }

    private db: Database<sqlite3.Database, sqlite3.Statement> | undefined
    constructor() {

    }

    async open() {
        this.db = await open({
            filename: this.db_props.db_file,
            driver: sqlite3.Database
        })
    }

    async close() {
        await this.db?.close()
    }

    async create() {
        const if_exists = `SELECT * FROM sqlite_master WHERE name ='${this.db_props.name}' and type='table'`
        const table_exists = await this.db?.get(if_exists)
        if (table_exists) {
            return
        }
        // create table
        const sql = `CREATE TABLE  ${this.db_props.name}(id INTEGER PRIMARY KEY, ${this.db_props.link_column} NVARCHAR(500) NOT NULL UNIQUE, date TEXT)`
        const idx_links = `CREATE INDEX idx_links ON ${this.db_props.name}(${this.db_props.link_column})`
        await this.db?.exec(sql)
        await this.db?.exec(idx_links)
    }

    async links_insert(links: string[]) {
        for (const link of links) {
            await this.db?.run(
                `INSERT INTO ${this.db_props.name}(${this.db_props.link_column}, date) VALUES (?, ?)`,
                link,
                Date.now()
            )
        }
    }

    async get_link(link: string) {
        return await this.db?.get(
            `SELECT ${this.db_props.link_column} FROM ${this.db_props.name} WHERE ${this.db_props.link_column} = ?`,
            link
        )
    }

    async check_link_exists(link: string) {
        const result = await this.get_link(link)
        if (result === undefined) {
            return false
        }
        return true;
    }
}
