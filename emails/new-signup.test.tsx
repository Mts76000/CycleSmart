import { describe, expect, it } from "vitest";
import { render } from "react-email";
import { NewSignupEmail } from "./new-signup";

describe("NewSignupEmail", () => {
  it("renders email-safe HTML with user details", async () => {
    const html = await render(
      <NewSignupEmail
        userEmail="marc@exemple.com"
        userName="Marc Dupont"
        signedUpAt="2026-08-26T14:30:00.000Z"
        projectName="CycleSmart"
      />,
    );

    expect(html).toContain("<!DOCTYPE html");
    expect(html).toContain("marc@exemple.com");
    expect(html).toContain("Marc Dupont");
    expect(html).toContain("CycleSmart");
    expect(html).not.toContain("display:flex");
    expect(html).not.toContain("display:grid");
  });
});
