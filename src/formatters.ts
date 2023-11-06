export function remove_duplicates (strArr : any[]){
    return Array.from(new Set(strArr))
}

export function trimString (str : string){
    const trimmed = str.trim();
    const remove_full_stop = trimmed[trimmed.length-1] === "." ? trimmed.slice(0,-1) : trimmed
    return remove_full_stop
}
