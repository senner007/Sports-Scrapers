// tv2 developer tools scrape
// s = Array.from(document.querySelectorAll('.tc_teaser')).map(a => a.children[0].href)
// dr
// s = Array.from(document.querySelector('.hydra-latest-news-page-sidebar__panel').querySelectorAll('a')).map(f => f.href)

import { parse, HTMLElement } from "node-html-parser";
import { createObjectCsvWriter } from "csv-writer";
import { has_key_in_latest, read_new_links, store_latest_to_json } from "./store";
import { sqlite_open, sqlite_insert, sqlite_create_table, sqlite_get } from "./sql";
import { parseFuncs, parseFuncsKeys } from "./parsers";


; (async () => {
  try {
    const db = await sqlite_open();
    // const info = await db.get(`PRAGMA table_info(links)`)
    // console.log(info)
    await sqlite_create_table(db)
    // await sqlite_insert(db, ["fofdo", "fsdfds"], "tv2.dk");
    const val = await sqlite_get(db, "fdofdo")
    console.log(val)
  } catch (err) {
    console.log(err)
  }
})();





function veryfy_result(results: [string, string, string]) {
  for (const s of results) {
    if (typeof s != "string") {
      throw new Error("invalid data!")
    }
  }
}


type linkRecord = { category: string, headline: string, subheading: string, link: string }[]

async function scrape() {

  const links = (Array.from(new Set(read_new_links())) as string[]).
    filter((l: string) => !has_key_in_latest(l))

  if (links.length === 0) {
    throw new Error("links already in storage!")
  };

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

  for (const link of links) {
    console.log(link)
    store_latest_to_json(link)
  }
  console.log("DONE");

  return records;
}
//@ts-ignore
async function writeCsv(records: linkRecord, filename: string) {
  const write = createObjectCsvWriter({
    path: filename,
    header: [
      { id: "category", title: "Category" },
      { id: "headline", title: "Headline" },
      { id: "subheading", title: "SubHeading" },
      { id: "link", title: "Link" }
    ],
    encoding: "utf8",
  });

  console.log("writing...");
  await write.writeRecords(records); // returns a promise
  console.log("DONE writing...");
}

// (async () => {
//   try {
//     const records = await scrape();
//     await writeCsv(records, new Date().toJSON().replace(/[:\.]/g, "") + "_latest.csv");
//   }
//   catch (err) {
//     console.log(err)
//   }
// })();
