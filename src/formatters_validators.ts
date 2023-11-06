export function remove_duplicates (strArr : any[]){
    return Array.from(new Set(strArr))
}

export function trimString (str : string){
    const trimmed = str.trim();
    const remove_full_stop = trimmed[trimmed.length-1] === "." ? trimmed.slice(0,-1) : trimmed
    return remove_full_stop
}

// https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
export function is_valid_URL(str: string) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
}

export function throw_if_not_string(str : string) {
    if (typeof str !== "string") {
        throw new Error("String expected!")
    }
}