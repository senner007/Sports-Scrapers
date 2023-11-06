import { createObjectCsvWriter } from "csv-writer";
import { linkRecords } from "./links/links-parsers";

export async function writeCsv(records: linkRecords, filename: string) {

  const to_camel = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  const header = Object.keys(records[0])
    .map(key => ({id : key, title : to_camel(key)}))

    const write = createObjectCsvWriter({
      path: filename,
      header: header,
      encoding: "utf8",
    });
  
    console.log("writing...");
    await write.writeRecords(records); // returns a promise
    console.log("DONE writing...");
  }
  