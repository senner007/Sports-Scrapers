import { parse, HTMLElement } from "node-html-parser";

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

export const parseFuncs = {
    "dr.dk": parseDR,
    "tv2.dk": parseTV2
} as const

export type parseFuncsKeys = keyof typeof parseFuncs