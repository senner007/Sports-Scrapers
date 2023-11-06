
import { LinksDB } from "./links/linksSql";
import { writeCsv as write_csv } from "./csv";
import { html_fetch } from "./fetch-content";
import { format_links, remove_existing_links as filter_existing_links, scrape_new_links as scrape_new_links, scraperDr, scraperTv2, validate_links } from "./links/links-scrapers";
import { logger } from "./logger";
import { parse_links_content, parseFuncs, validate_parsed_content } from "./links/links-parsers";


async function main() {

  const links_db = new LinksDB()
  await links_db.open()

  const links = await scrape_new_links([scraperDr, scraperTv2])

  const links_formatted = format_links(links)
  validate_links(links_formatted)

  const newLinks = await filter_existing_links(links_db, links_formatted)

  if (newLinks.length === 0) {
    throw new Error("All links already in storage!")
  }
  const linksResponse = await html_fetch(newLinks)

  const records = await parse_links_content(linksResponse, parseFuncs);

  const validated_records = validate_parsed_content(records)

  const csv_file_name = new Date().toJSON().replace(/[:\.]/g, "") + "_latest.csv";
  await write_csv(validated_records, csv_file_name);

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
  } catch (error) {
    console.log(error)

    logger.log({
      level: 'error',
      message: typeof error === "object" && error != null && "message" in error
        ? error.message as string : "Unknown error occured"
    });
  } finally {
    process.exit()
  }
})();