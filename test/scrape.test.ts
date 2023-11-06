import { expect, test, describe } from "vitest";
import { scraperDr, scraperTv2 } from "../src/scrapers/scrapers";

describe("Scrape class test", () => { // put in mocks folder
    test('scrape classes should return links within html', async () => {

        // Arrange

        // Act
        const resultdr = await scraperDr.execute(__dirname + "\\dr-fake.html")
        const resulttv2 = await scraperTv2.execute(__dirname + "\\tv2-fake.html")

        //Assert
        expect(resultdr).toStrictEqual(["https://www.dr.dk/fake_1.html", "https://www.dr.dk/fake_2.html"])
        expect(resulttv2).toStrictEqual(["https://www.tv2.dk/fake_1.html", "https://www.tv2.dk/fake_2.html"])
    })
});
