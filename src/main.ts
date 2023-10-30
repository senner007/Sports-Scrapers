// tv2 developer tools scrape
// s = Array.from(document.querySelectorAll('.tc_teaser')).map(a => a.children[0].href)
// dr
// s = Array.from(document.querySelector('.hydra-latest-news-page-sidebar__panel').querySelectorAll('a')).map(f => f.href)

import { parse, HTMLElement } from "node-html-parser";
import { createObjectCsvWriter } from "csv-writer";
import { combined, get_archived, store_latest_to_json } from "./store";
import { dr_latest } from "./dr_latest";
import { tv2_latest } from "./tv2_latest";

// const combined_flat = Array.from(new Set(combined.map(o => o.data).flat()))


// const combined_obj = combined_flat.reduce((a, v) => ({ ...a, [v]: v}), {}) 

[...dr_latest, ...tv2_latest].forEach(l => {
  store_latest_to_json(l)
})




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
function subheaderTV2(parsed: HTMLElement) : [string, string, string] {
  
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

//@ts-ignore
async function scrape(links: string[], paseFunc : (parsed) => [string,string,string]) {
  const records: any = [];

  for (const aa of links) {
    const result = await fetch(aa);
    const json = await result.text();

    // @ts-ignore
    try {
      const parsed: HTMLElement = parse(json);
      const [label, header, subHeader] = paseFunc(parsed)

    
      veryfy_result([label, header, subHeader])
      console.log(label, header, subHeader)


      records.push({ category: label, headline: header, subheading: subHeader });
    } catch (e) {
      console.log(e);
    }
  }
  console.log("DONE fetching");

  return records;
}
//@ts-ignore
async function writeCsv(records: any, filename: string) {
  const write = createObjectCsvWriter({
    path: filename,
    header: [
      { id: "category", title: "Category" },
      { id: "headline", title: "Headline" },
      { id: "subheading", title: "SubHeading" },
    ],
    encoding: "utf8",
  });

  console.log("writing...");
  await write.writeRecords(records); // returns a promise
  console.log("DONE writing...");
}

// (async () => {
//   const records = await scrape(dr_latest, parseDR);
//   await writeCsv(records, "dr_latest_2.csv");
// })();
//@ts-ignore

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
