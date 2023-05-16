// Challenge:
// Write a JavaScript function called findEvenNumbers that takes an array of numbers as input and returns a new array containing only the even numbers from the original array.
export function findEvenNumbers (arr : number[]) {
    return arr.filter(n => n % 2 === 0)
}