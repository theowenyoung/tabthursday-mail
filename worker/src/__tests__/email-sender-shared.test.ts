import { describe, expect, it } from "vitest";
import { parseFrom } from "../lib/email-sender/shared";
import { encodeDisplayName } from "../lib/format-from-address";

describe("parseFrom", () => {
  it("splits a plain display name from the address", () => {
    expect(parseFrom("The Support Team <support@example.com>")).toEqual({
      name: "The Support Team",
      address: "support@example.com",
    });
  });

  it("returns a bare address with no name", () => {
    expect(parseFrom("  support@example.com ")).toEqual({
      address: "support@example.com",
    });
    expect(parseFrom("<support@example.com>")).toEqual({
      name: undefined,
      address: "support@example.com",
    });
  });

  it("strips both quotes from a quoted display name", () => {
    // Regression: the closing quote survived (`Jant (via Admin)"`) because the
    // space before `<` was still attached when the quotes were stripped.
    expect(parseFrom('"Jant (via Admin)" <admin@example.com>')).toEqual({
      name: "Jant (via Admin)",
      address: "admin@example.com",
    });
  });

  it("unescapes quoted-pairs inside a quoted display name", () => {
    expect(parseFrom('"Bob \\"The Builder\\"" <bob@example.com>')).toEqual({
      name: 'Bob "The Builder"',
      address: "bob@example.com",
    });
  });

  it("keeps an angle bracket that sits inside the quoted name", () => {
    expect(parseFrom('"a <b> c" <x@example.com>')).toEqual({
      name: "a <b> c",
      address: "x@example.com",
    });
  });

  it("round-trips every name encodeDisplayName produces", () => {
    for (const name of [
      "The Support Team",
      "Ada, VP of Engineering",
      "Jant (via Admin)",
      "Jane D.",
      'Bob "The Builder"',
      "back\\slash, inc",
    ]) {
      expect(parseFrom(`${encodeDisplayName(name)} <a@example.com>`)).toEqual({
        name,
        address: "a@example.com",
      });
    }
  });
});
