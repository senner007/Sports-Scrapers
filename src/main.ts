
import { LinksDB } from "./linksSql";
import { writeCsv as write_csv } from "./csv";
import { fetchContent as fetch_link_content, parseContent as parse_link_content } from "./getContent";
import { remove_existing_links as filter_links_existing_in_db, format_links, scrape_new_links as scrape_new_links, scraperDr, scraperTv2, validate_links } from "./scrapers/scrapers";
import { parseFuncs } from "./parsers";
import { logger } from "./logger";


// TODO : Test the entire pipeline. Insert dependencies as parameters: DB, fetch, csv_name
async function main() {

  const links_db = new LinksDB()
  await links_db.open()

  const links = await scrape_new_links([scraperDr, scraperTv2])

  const links_formatted = format_links(links)
  validate_links(links_formatted)

  const newLinks = await filter_links_existing_in_db(links_db, links_formatted)

  if (newLinks.length === 0) {
    throw new Error("All links already in storage!")
  }
  const linksResponse = await fetch_link_content(newLinks)

  const records = await parse_link_content(linksResponse, parseFuncs);

  const csv_file_name = new Date().toJSON().replace(/[:\.]/g, "") + "_latest.csv";
  await write_csv(records, csv_file_name);

  await links_db.links_insert(newLinks)
  
  return csv_file_name

}

; (async () => {
  try {
    const csv_file_name = await main()
    logger.log({
      level: 'info',
      message: `Links scrape success! Wrote ${csv_file_name}`
    });
  } catch(error) {

    logger.log({
      level: 'error',
      message: typeof error === "object" && error != null && "message" in error 
        ? error.message as string : "Unknown error occured"
    });
  }
})();