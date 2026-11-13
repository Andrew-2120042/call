import { describe, expect, it } from "vitest";

import { getCalEventResponses, getOptionDisplayValue } from "./getCalEventResponses";

const budgetOptions = [
  { label: "Under $500", value: "under-500" },
  { label: "$500 to $2,000", value: "500-2000" },
];

describe("getOptionDisplayValue", () => {
  it("maps a select value to its option label", () => {
    expect(getOptionDisplayValue({ type: "select", options: budgetOptions }, "500-2000")).toBe(
      "$500 to $2,000"
    );
  });

  it("maps every value of a multi-value field", () => {
    expect(
      getOptionDisplayValue({ type: "multiselect", options: budgetOptions }, ["under-500", "500-2000"])
    ).toEqual(["Under $500", "$500 to $2,000"]);
  });

  it("keeps a value that no longer matches an option instead of dropping it", () => {
    expect(getOptionDisplayValue({ type: "radio", options: budgetOptions }, "retired-option")).toBe(
      "retired-option"
    );
  });

  it("returns undefined for fields without options", () => {
    expect(getOptionDisplayValue({ type: "textarea", options: undefined }, "hello")).toBeUndefined();
    expect(getOptionDisplayValue({ type: "select", options: [] }, "x")).toBeUndefined();
  });

  it("returns undefined for values it cannot map", () => {
    expect(getOptionDisplayValue({ type: "select", options: budgetOptions }, 42)).toBeUndefined();
  });
});

describe("getCalEventResponses display values", () => {
  const bookingFields = [
    { name: "name", type: "name", editable: "system", required: true, defaultLabel: "your_name" },
    { name: "email", type: "email", editable: "system-but-optional", required: true, defaultLabel: "email_address" },
    { name: "budget", type: "select", editable: "user", required: true, label: "Budget", options: budgetOptions },
    { name: "goals", type: "textarea", editable: "user", required: true, label: "Goals" },
  ];

  it("adds a displayValue for option fields and keeps the stored value unchanged", () => {
    const { userFieldsResponses, responses } = getCalEventResponses({
      bookingFields,
      responses: { name: "Maya", email: "maya@example.com", budget: "500-2000", goals: "Promotion" },
    });

    expect(userFieldsResponses.budget).toEqual({
      label: "Budget",
      value: "500-2000",
      displayValue: "$500 to $2,000",
      isHidden: false,
    });
    expect(responses.budget.value).toBe("500-2000");
    expect(userFieldsResponses.goals).not.toHaveProperty("displayValue");
  });
});
