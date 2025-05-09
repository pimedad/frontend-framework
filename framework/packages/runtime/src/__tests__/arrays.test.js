import { describe, it, expect } from "vitest";
import { withoutNulls } from "../utils/arrays.js";

describe("arrays.js", () => {
  describe("withoutNulls()", () => {
    it("should remove null and undefined values from an array", () => {
      const original = [1, null, 2, undefined, 3, "hello", null];
      const expected = [1, 2, 3, "hello"];
      expect(withoutNulls(original)).toEqual(expected);
    });

    it("should return an identical array if no null or undefined values are present", () => {
      const original = [1, 2, 3, "world"];
      expect(withoutNulls(original)).toEqual(original);
    });

    it("should return an empty array if the input is an empty array", () => {
      expect(withoutNulls([])).toEqual([]);
    });

    it("should return an empty array if all items are null or undefined", () => {
      const original = [null, undefined, null];
      expect(withoutNulls(original)).toEqual([]);
    });
  });
});
