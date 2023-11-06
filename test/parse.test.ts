import { expect, test, describe } from "vitest";
import { parse_html_response } from "../src/fetch-content";
import { parseDR } from "../src/links/links-parsers";

describe("Parse html test", () => { 
    test('parsing html should return expected content', async () => {
          
        // Arrange
        const fs = require('fs');
        const htmlFakeText = fs.readFileSync(__dirname + '\\dr-link-fake.html', 'utf8');

        // Act
        const result = parse_html_response(htmlFakeText, parseDR)
    
        //Assert
        expect(result).toStrictEqual(["LABEL-TEXT", "HEADER-TEXT", "SUBHEADER-TEXT"])

    })
});