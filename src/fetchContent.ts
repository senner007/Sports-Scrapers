import puppeteer, { Page } from 'puppeteer';
import { parseDR, parseTV2 } from './parsers';
import { sqlite_assert_value_not_found, trimString } from './sql';
import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'

const contentProviders = {
    "dr.dk": {
        url: "https://www.dr.dk/sporten/seneste-sport/",
        parseFunc: parseDR,
        linkSelector: '.hydra-latest-news-page-sidebar__panel a'
    },
    "tv2.dk": {
        url: "https://sport.tv2.dk/",
        parseFunc: parseTV2,
        linkSelector: '.tc_teaser > .tc_teaser__link'
    } as const
} as const

type LinkSelectors = typeof contentProviders[keyof typeof contentProviders]["linkSelector"]
type Urls = typeof contentProviders[keyof typeof contentProviders]["url"]


class WebScraper {

    constructor(
        private url: Urls,
        public linkSelector: LinkSelectors,
        private manipulator?: (page: Page) => Promise<void>) {

    }


    async execute(page: Page): Promise<void> {
        await page.goto(this.url);
        console.log(this.url)
        if (this.manipulator) {
            await this.manipulator(page)
        }
    }
}

async function timer() {
    return new Promise(res => setTimeout(res, 1000));
}

export const scraperTv2 = new WebScraper(
    contentProviders['tv2.dk'].url,
    contentProviders['tv2.dk'].linkSelector,
    async (page: Page) => {
        const buttonQuery = '.tc_button.js-tc_load-more__trigger.tc_button--secondary.tc_button--default.js-tc_load-more__bound';
        const buttonLoadingRemoved = 'document.querySelector(".tc_button--loading") == null';
        for (let i = 0; i < 3; i++) {
            let button = await page.waitForSelector(buttonQuery);
            await button!.click();
            await page.waitForFunction(buttonLoadingRemoved);
        }
    })

export const scraperDr = new WebScraper(
    contentProviders['dr.dk'].url,
    contentProviders['dr.dk'].linkSelector
);


export async function getLinks(scraper: WebScraper): Promise<string[]> {

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage()

    await scraper.execute(page)

    const result = await page.evaluate((query) => {
        return Array.from(document.querySelectorAll(query)).map(link => {
            if ("href" in link) {
                return link.href
            }
            throw new Error();
        });
    }, scraper.linkSelector) as string[]

    await browser.close();
    return result;
}

export async function filter_new_links(db: Database<sqlite3.Database>, links: string[]) {

    const new_links = []

    for (const l of links) {
        const result = await sqlite_assert_value_not_found(db, l)
        if (result) {
            new_links.push(l)
        }
    }
    console.log("new l´links", new_links.length)
    return new_links

}


export async function get_all_links(db: Database<sqlite3.Database>) {

    const drLinks = await getLinks(scraperDr)
    const tv2Links = await getLinks(scraperTv2)

    const links = [...drLinks, ...tv2Links]
    const linksTrimmed = links.map(l => trimString(l))
    const links_unique = Array.from(new Set(linksTrimmed))
      
    console.log("new l´links", links_unique.length)

    return await filter_new_links(db, links_unique)

}
