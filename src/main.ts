
import { sqlite_open, sqlite_insert, sqlite_create_table, sqlite_get, sqlite_assert_value_not_found } from "./sql";
import { writeCsv } from "./csv";
import { scraper } from "./scraper";
import { get_all_links as get_new_links } from "./fetchContent";

(async () => {
  try {
    const db = await sqlite_open();
    const new_links = await get_new_links(db)
    if (new_links.length === 0) {
      throw new Error("All links already in storage!")
    }
    const records = await scraper(db, new_links);
    await sqlite_insert(db, new_links);
    await writeCsv(records, new Date().toJSON().replace(/[:\.]/g, "") + "_latest.csv");
  }
  catch (err) {
    console.log(err)
  }
})();

