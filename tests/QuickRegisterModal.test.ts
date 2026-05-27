import { describe, expect, it } from "vitest";
import { getProtocolKeywords } from "../src/components/QuickRegisterModal";

describe("QuickRegisterModal protocol matching", () => {
  it("no truena cuando palabras_clave llega null", () => {
    expect(getProtocolKeywords({ palabras_clave: null })).toEqual([]);
  });
});
