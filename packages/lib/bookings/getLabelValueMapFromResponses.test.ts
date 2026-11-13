import { describe, expect, it } from "vitest";

import getLabelValueMapFromResponses from "./getLabelValueMapFromResponses";

describe("getLabelValueMapFromResponses", () => {
  it("prefers the human-readable display value for option answers", () => {
    const map = getLabelValueMapFromResponses({
      eventTypeId: 3,
      userFieldsResponses: {
        budget: { label: "Budget", value: "500-2000", displayValue: "$500 to $2,000" },
        goals: { label: "Goals", value: "Promotion" },
      },
    });

    expect(map).toEqual({ Budget: "$500 to $2,000", Goals: "Promotion" });
  });

  it("hides hidden fields from attendees but shows them to the organizer", () => {
    const calEvent = {
      eventTypeId: 3,
      userFieldsResponses: { internal: { label: "Internal", value: "x", isHidden: true } },
    };

    expect(getLabelValueMapFromResponses(calEvent)).toEqual({});
    expect(getLabelValueMapFromResponses(calEvent, true)).toEqual({ Internal: "x" });
  });
});
