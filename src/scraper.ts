import { parseFuncs, parseFuncsKeys } from "./parsers";
import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'
import { parse, HTMLElement } from "node-html-parser";

type linkRecord = { category: string, headline: string, subheading: string, link: string }[]
function veryfy_result(results: [string, string, string]) {
    for (const s of results) {
        if (typeof s != "string") {
            throw new Error("invalid data!")
        }
    }
}

export async function scraper(db: Database<sqlite3.Database>, links: string[]) {

    const records: linkRecord = [];

    for (const [i, aa] of links.entries()) {

        const parseFunc = (Object.keys(parseFuncs) as parseFuncsKeys[])
            .filter(p => aa.includes(p))
            .map(k => parseFuncs[k])[0]

        try {

            const result = await fetch(aa);
            const json = await result.text();
            const parsed: HTMLElement = parse(json);
            const [label, header, subHeader] = parseFunc(parsed)

            veryfy_result([label, header, subHeader])
            console.log(label, header, subHeader)

            records.push({ category: label, headline: header, subheading: subHeader, link: aa });
        } catch (e) {
            console.log(e);
        }
    }

    return records;
}