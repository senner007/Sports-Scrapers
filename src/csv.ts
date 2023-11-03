import { createObjectCsvWriter } from "csv-writer";

//@ts-ignore
export async function writeCsv(records: linkRecord, filename: string) {
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
  