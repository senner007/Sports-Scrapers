import puppeteer from "puppeteer";
import { WebScraper } from "../scraper";
import { is_valid_URL, remove_duplicates, trim_string } from "../formatters_validators";
import { LinksDB } from "./linksSql";

const scrapeIdentifiers = {
    "dr.dk": {
        url: "https://www.dr.dk/sporten/seneste-sport/",
        linkSelector: '.hydra-latest-news-page-sidebar__panel a'
    },
    "tv2.dk": {
        url: "https://sport.tv2.dk/",
        linkSelector: '.tc_teaser > .tc_teaser__link',
        buttonLink: '.tc_button.js-tc_load-more__trigger.tc_button--secondary.tc_button--default.js-tc_load-more__bound',
        buttonLoadingRemoved: 'document.querySelector(".tc_button--loading") == null'
    } as const
} as const


export const scraperTv2 = new WebScraper(
    async (URL : string = scrapeIdentifiers['tv2.dk'].url) => {

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage()

        await page.goto(URL);


        for (let i = 0; i < 3; i++) {
            let button = await page.waitForSelector(scrapeIdentifiers['tv2.dk'].buttonLink);
            await button!.click();
            await page.waitForFunction(scrapeIdentifiers['tv2.dk'].buttonLoadingRemoved);
        }

        return await page.evaluate((query) => {
            return Array.from(document.querySelectorAll(query)).map(link => {
                if ("href" in link) {
                    return link.href
                }
                throw new Error();
            });
        }, scrapeIdentifiers['tv2.dk'].linkSelector) as string[]
    })

export const scraperDr = new WebScraper(
    async (URL : string = scrapeIdentifiers['dr.dk'].url) => {

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage()

        await page.goto(URL);

        return await page.evaluate((query) => {
            return Array.from(document.querySelectorAll(query)).map(link => {
                if ("href" in link) {
                    return link.href
                }
                throw new Error();
            });
        }, scrapeIdentifiers['dr.dk'].linkSelector) as string[]

    })


export async function remove_existing_links(db: LinksDB, links: string[]) {

    const new_links = []

    for (const link of links) {
        const ifExists = await db.check_link_exists(link)
        if (!ifExists) {
            new_links.push(link)
        }
    }
    return new_links

}

export async function scrape_new_links(scrapers : WebScraper<string[]>[]) {
    const links = await Promise.all(scrapers.map(scraper => scraper.execute()));
    return links.flat()
}

export function format_links(links: string[]) {
    const links_trimmed = links.map(trim_string)
    const links_unique = remove_duplicates(links_trimmed)
    return links_unique
}

export function validate_links(links: string[]) {
    for (const link of links) {
        const result = is_valid_URL(link)
        if (!result) {
            throw new Error("Link validation error!")
        }
    }
} 

export type Urls = typeof scrapeIdentifiers[keyof typeof scrapeIdentifiers]["url"]
