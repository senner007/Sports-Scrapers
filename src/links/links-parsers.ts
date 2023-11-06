import { HTMLElement } from "node-html-parser";
import { parse_html_response } from "../fetch-content";
import { throw_if_not_string } from "../formatters_validators";

export function parseDR(parsed: HTMLElement): [string, string, string] {

    const label = parsed.querySelector(".dre-teaser-meta-label.dre-teaser-meta-label--primary")?.text!
        || parsed.querySelector(".dre-article-title-section-label__title--link")?.text!
    const header =
        parsed.querySelector(".dre-title-text")?.text!
    const subHeader =
        parsed.querySelector(".dre-article-title__summary")?.text!
        ||
        parsed.querySelector(".hydra-latest-news-page-short-news-article__paragraph.dre-variables")?.text!

    return [
        label, header, subHeader
    ]

}

export function parseTV2(parsed: HTMLElement): [string, string, string] {

    const label = parsed.querySelector(".tc_page__label")?.childNodes[0].text!;
    const header: string = parsed.querySelector(".tc_heading.tc_heading--2")?.childNodes[0].text!;
    const subHeader =
        parsed.querySelector(".tc_page__body__standfirst")?.childNodes[0].childNodes[0].text! ||
        parsed.querySelector(".tc_richcontent")?.firstChild.text!;

    if (subHeader.toLowerCase().includes("podcast") || header.toLowerCase().includes("podcast")) {
        throw new Error("Includes podcast");
    }

    return [
        label, header, subHeader
    ]
}


export function validate_parsed_content(linkRecords: linkRecords) {

    const validated_content: linkRecords = []
    
    for (const record of linkRecords) {
        try {
            console.log(record.link)
            throw_if_not_string(record.category)
            throw_if_not_string(record.headline)
            throw_if_not_string(record.link)
            throw_if_not_string(record.subHeading)
            validated_content.push(record)
        } catch(error) {
            console.log(error)
        }
    }
    return validated_content
}

export async function parse_links_content(links: {
    URL: string;
    response: string;
}[],
    parseFunctions: typeof parseFuncs
) {

    const records: linkRecords = [];
    for (const link of links) {

        const parser = (Object.keys(parseFunctions) as parseFuncsKeys[])
            .filter(p => link.URL.includes(p))
            .map(k => parseFuncs[k])[0]

        try {
            const [label, header, subHeader] = parse_html_response(link.response, parser)
            records.push({ category: label, headline: header, subHeading: subHeader, link: link.URL });
        } catch (e) {
            console.log(e);
        }
    }

    return records;
}

export const parseFuncs = {
    "dr.dk": parseDR,
    "tv2.dk": parseTV2
} as const

export type parseFuncsKeys = keyof typeof parseFuncs
export type linkRecords = { category: string, headline: string, subHeading: string, link: string }[]