import puppeteer, { Page, PuppeteerNode } from "puppeteer";
import { parseDR, parseTV2 } from "../parsers";
import { WebScraper } from "../scraper";
import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'
import { remove_duplicates, trimString } from "../formatters";
import { LinksDB } from "../linksSql";

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
    const links_trimmed = links.map(trimString)
    const links_unique = remove_duplicates(links_trimmed)
    return links_unique
}

export function validate_links(links: string[]) {
    // https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
    function validURL(str: string) {
        var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
          '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
          '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
          '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        return !!pattern.test(str);
    }
    for (const link of links) {
        const result = validURL(link)
        if (!result) {
            throw new Error("Link validation error!")
        }
    }
} 


export type Urls = typeof scrapeIdentifiers[keyof typeof scrapeIdentifiers]["url"]
