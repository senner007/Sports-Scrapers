import { parse, HTMLElement } from "node-html-parser";
import { parseFuncs, parseFuncsKeys } from "./links/links-parsers";




export async function html_fetch(links: string[]) {

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

export function parse_html_response(linkResponse : string, parser : typeof parseFuncs[keyof typeof parseFuncs]) {
    const parsed: HTMLElement = parse(linkResponse);
    return parser(parsed)
}

