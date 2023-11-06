import puppeteer, { Page, Puppeteer, PuppeteerNode } from 'puppeteer';

// type LinkSelectors = typeof scrapeIdentifiers[keyof typeof scrapeIdentifiers]["linkSelector"]

export class WebScraper<T> {

    constructor(
        private manipulator: (URL? : string) => Promise<T>) {
    }

    async execute(URL? : string) {
        return await this.manipulator(URL)
    }
}







