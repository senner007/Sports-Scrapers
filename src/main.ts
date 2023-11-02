// tv2 developer tools scrape
// s = Array.from(document.querySelectorAll('.tc_teaser')).map(a => a.children[0].href)
// dr
// s = Array.from(document.querySelector('.hydra-latest-news-page-sidebar__panel').querySelectorAll('a')).map(f => f.href)

import { parse, HTMLElement } from "node-html-parser";
import { createObjectCsvWriter } from "csv-writer";
import { has_key_in_latest, read_new_links, store_latest_to_json } from "./store";
import { sqlite_open, sqlite_insert, sqlite_create_table } from "./sql";


;(async () => {
  try {
    const db = await sqlite_open();
    // const info = await db.get(`PRAGMA table_info(links)`)
    // console.log(info)
    await sqlite_create_table(db)
    await sqlite_insert(db, ["fofdo"], "tv2.dk");
  } catch (err) {
    console.log(err)
  }
})();


//@ts-ignore
function parseDR(parsed: HTMLElement) : [string, string, string] {

  const label =  parsed.querySelector(".dre-teaser-meta-label.dre-teaser-meta-label--primary")?.text!
  ||  parsed.querySelector(".dre-article-title-section-label__title--link")?.text!

  const header =
    parsed.querySelector(".dre-title-text")?.text!

  const subHeader =
    parsed.querySelector(".dre-article-title__summary")?.text!
    || 
    parsed.querySelector(".hydra-latest-news-page-short-news-article__paragraph.dre-variables")?.text!
    

    return [
      label, header, subHeader
    ]

}

//@ts-ignore
function parseTV2(parsed: HTMLElement) : [string, string, string] {
  
  const label = parsed.querySelector(".tc_page__label")?.childNodes[0].text!;

  const header: string = parsed.querySelector(".tc_heading.tc_heading--2")?.childNodes[0].text!;
  
  const subHeader =
    parsed.querySelector(".tc_page__body__standfirst")?.childNodes[0].childNodes[0].text! ||
    parsed.querySelector(".tc_richcontent")?.firstChild.text!;

  if (subHeader.toLowerCase().includes("podcast") || header.toLowerCase().includes("podcast")) {
    throw new Error("Includes podcast");
  }

  return [
    label, header, subHeader
  ]

}


function veryfy_result(results : [string,string,string]) {
  for (const s of results) {
    if (typeof s != "string") {
      throw new Error("invalid data!")
    }
  } 
}

const parseFuncs = {
  "dr.dk" : parseDR,
  "tv2.dk" : parseTV2
} as const


type parseFuncsKeys = keyof typeof parseFuncs

type linkRecord = {category : string, headline : string, subheading: string, link : string}[]

//@ts-ignore
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

      records.push({ category: label, headline: header, subheading: subHeader, link : aa });
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
      { id : "link", title : "Link" }
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



// ;(async () => {
//   const jsonPreset = (await import('lowdb/node')).JSONPreset

//   type Data = {
//     messages: string[]
//   }

//   const defaultData: Data = { messages: [] }
//   const db = await jsonPreset<Data>('db.json', defaultData)
    
//   db.data.messages.push('foo') // ✅ Success

//   // Finally write db.data content to file
//   await db.write()

// })();


// let arr = [
//     ['sdfsdf sdfsd ', '', "efter danske adasd sdfsdf "],
//     ['Danmark lider nederlag', "Danmark slår Sverige", "Danmark slog Sverige", "kunne ikke slå", "tabte stort til"],

//     [' sdf sdf til danske dasd', ' sffds OL finaler sdfds', ' sdfdsf fdf finalerne adasd', " på sdfdsfsf finalen" ]
// ];

// function getCombn(arr: any, pre: any) {
//     pre = pre || '';

//     if (!arr.length) {
//         return pre;
//     }

//     let ans = arr[0].reduce(function (ans: any, value: any) {
//         return ans.concat(getCombn(
//             arr.slice(1), pre + value));
//     }, []);
//     return ans;
// }
//  //@ts-ignore
// console.log(getCombn(arr));
