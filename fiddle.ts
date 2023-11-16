console.log("fiddle")


const sentence = "4, 3324, 1926, 1908"

var vocab = require('./vocab.json')
var regexes = require('./regexes.json')


function function_formatter(regexes: any, str: string) {
    let new_str = str.toLocaleLowerCase()
    for (const r in regexes) {
        const regex = new RegExp(regexes[r]["regex"], "gi");
        const replacer = regexes[r]["replacewith"].replace("\\1", () => "$1")
        console.log(replacer)
        new_str = new_str.replace(regex, replacer)
    }

    return new_str.split(" ").map(s => s.trim()).filter(s => s)
}
function create_vocab_dict(vocab: string[]) {

    const obj: Record<string, number> = {}
    for (const [i, v] of vocab.entries()) {
        obj[v] = i
    }
    return obj

}

const vocab_dict = create_vocab_dict(vocab)

function vectorize(vocab_dict : Record<string,number>, words: string[]) {
    let vectors: number[] = []
    for (const w of words) {
        vectors.push(vocab_dict[w])
    }
    return vectors
}

function pad_zeros(words : number[]) {

    return new Array(60).fill(0).map((w,i) => {
        return words[i] || 0  
    });

}


//   5, 1919, 3341, 4402,    4,   14, 4516,    2, 1919, 6516,    2,
//['xland' 'skal' 'med' 'i' 'xtournament' ',' 'hvor' 'xnationality' 'skal' 'besejre' 'xnationality']

; (async () => {
    // console.log(regexes)

    const formatted = function_formatter(regexes, "danmark skal med i OL, hvor danskere skal besejre svenskere")
    const vectorized = vectorize(vocab_dict, formatted)
    const padded = pad_zeros(vectorized);
    console.log(padded)

})();

