import { getByRole } from "@testing-library/dom";
import { virtual } from "../../src";

function setupInputPage() {
  document.body.innerHTML = `
  <label for="input">Input Some Text</label>
  <input type="text" id="input" value="" />
  <div id="hidden" style="display: none;">Hidden</div>
  `;
}

describe("press", () => {
  beforeEach(() => {
    setupInputPage();
  });

  it("should press keys on the active element", async () => {
    const container = document.body;

    await virtual.start({ container });

    await virtual.next();
    await virtual.next();

    expect(await virtual.itemText()).toEqual("Input Some Text");

    await virtual.press("Shift+a+b+c");
    // TODO: FAIL: Testing Library user-event doesn't support modification yet, this should be "ABC"
    expect(getByRole(container, "textbox")).toHaveValue("abc");

    // TODO: FAIL: item text should include the now non-empty value "ABC"
    expect(await virtual.itemText()).toEqual("Input Some Text");

    await virtual.stop();
  });

  it("should handle requests to press on hidden container gracefully", async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const container = document.querySelector("#hidden")! as HTMLElement;

    await virtual.start({ container });

    await virtual.press("Shift+a+b+c");

    expect(await virtual.itemTextLog()).toEqual([]);
    expect(await virtual.spokenPhraseLog()).toEqual([]);

    await virtual.stop();
  });
});