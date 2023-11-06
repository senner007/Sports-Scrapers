import { parseFuncs, parseFuncsKeys } from "./parsers";
import { parse, HTMLElement } from "node-html-parser";

type linkRecord = { category: string, headline: string, subheading: string, link: string }[]

function veryfy_result(results: [string, string, string]) {
    for (const s of results) {
        if (typeof s != "string") {
            throw new Error("invalid data!")
        }
    }
}

export async function fetchContent(links: string[]) {

    const linksResponse = []
    for (const link of links) {
        console.log(link)
        const result = await fetch(link);
        const json = await result.text();

        linksResponse.push({
            URL: link,
            response: json
        })

    }

    return linksResponse

}


export function parseLink(linkResponse : string, parser : typeof parseFuncs[keyof typeof parseFuncs]) {
    const parsed: HTMLElement = parse(linkResponse);
    return parser(parsed)
}

export async function parseContent(links: {
    URL: string;
    response: string;
}[],
    parseFunctions: typeof parseFuncs
) {

    const records: linkRecord = [];
    for (const link of links) {

        const parser = (Object.keys(parseFunctions) as parseFuncsKeys[])
            .filter(p => link.URL.includes(p))
            .map(k => parseFuncs[k])[0]

        try {

            console.log(link.response)

            const parsed: HTMLElement = parse(link.response);
            const [label, header, subHeader] = parseLink(link.response, parser)

            veryfy_result([label, header, subHeader])
            console.log(label, header, subHeader)

            records.push({ category: label, headline: header, subheading: subHeader, link: link.URL });
        } catch (e) {
            console.log(e);
        }
    }

    return records;
}