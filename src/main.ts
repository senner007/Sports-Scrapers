
import { sqlite_open, sqlite_insert, sqlite_create_table, sqlite_get, sqlite_assert_value_not_found, trimString, removeDuplicates as remove_duplicates } from "./sql";
import { writeCsv as write_csv } from "./csv";
import { fetchContent as fetch_link_content, parseContent as parse_link_content } from "./getContent";
import { removeExistingLinks as filter_links_existing_in_db, scrapeNewLinks as scrape_new_links, scraperDr, scraperTv2 } from "./scrapers/scrapers";
import { parseFuncs } from "./parsers";


(async () => {
  try {
    // TODO : Mock db. Create DB class
    const db = await sqlite_open();
    const links = await scrape_new_links([scraperDr, scraperTv2])

    const linksTrimmed = links.map(l => trimString(l))
    const links_unique = remove_duplicates(linksTrimmed)

    const newLinks = await filter_links_existing_in_db(db, links_unique)

    if (newLinks.length === 0) {
      throw new Error("All links already in storage!")
    }
    const linksResponse = await fetch_link_content(newLinks)

    const records = await parse_link_content(linksResponse, parseFuncs);
    await sqlite_insert(db, newLinks);
    await write_csv(records, new Date().toJSON().replace(/[:\.]/g, "") + "_latest.csv");
  }
  catch (err) {
    console.log(err)
  }
})();


