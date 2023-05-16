import { expect, test } from "vitest";
import { findEvenNumbers } from "../src/findEvenNumbers";

test('should work as expected', () => {
    expect(findEvenNumbers([1, 2, 3, 4, 5, 6])).toStrictEqual([2, 4, 6])
})