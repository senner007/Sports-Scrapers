import { expect, test, describe } from "vitest";
import { parseLink } from "../src/getContent";
import { parseDR } from "../src/parsers";

describe("Parse html test", () => { 
    test('parsing html should return expected content', async () => {
          
        // Arrange
        const fs = require('fs');
        const htmlFakeText = fs.readFileSync(__dirname + '\\dr-link-fake.html', 'utf8');

        // Act
        const result = parseLink(htmlFakeText, parseDR)
    
        //Assert
        expect(result).toStrictEqual(["LABEL-TEXT", "HEADER-TEXT", "SUBHEADER-TEXT"])

    })
});