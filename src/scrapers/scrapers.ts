import puppeteer, { Page, PuppeteerNode } from "puppeteer";
import { parseDR, parseTV2 } from "../parsers";
import { WebScraper } from "../scraper";
import { removeDuplicates, sqlite_assert_value_not_found, trimString } from "../sql";
import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'

const scrapeIdentifiers = {
    "dr.dk": {
        url: "https://www.dr.dk/sporten/seneste-sport/",
        parseFunc: parseDR,
        linkSelector: '.hydra-latest-news-page-sidebar__panel a'
    },
    "tv2.dk": {
        url: "https://sport.tv2.dk/",
        parseFunc: parseTV2,
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


export async function removeExistingLinks(db: Database<sqlite3.Database>, links: string[]) {

    const new_links = []

    for (const l of links) {
        const notExist = await sqlite_assert_value_not_found(db, l)
        if (notExist) {
            new_links.push(l)
        }
    }
    return new_links

}


export async function scrapeNewLinks(scrapers : WebScraper<string[]>[]) {

    // TODO : Mock WebScraper with mock execute method to return links array 

    const links = await Promise.all(scrapers.map(scraper => scraper.execute()));

    return links.flat()
}


export type Urls = typeof scrapeIdentifiers[keyof typeof scrapeIdentifiers]["url"]
