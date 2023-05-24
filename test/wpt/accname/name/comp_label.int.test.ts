import { virtual } from "../../../../src";

/**
 * https://github.com/web-platform-tests/wpt/blob/master/accname/name/comp_label.html
 */

describe("Name Comp: Label", () => {
  beforeEach(async () => {
    document.body.innerHTML = `
    <div aria-label="label" data-expectedlabel="label" data-testname="label valid on group" role="group" class="ex">x</div>
    `;

    await virtual.start({ container: document.body });

    while ((await virtual.lastSpokenPhrase()) !== "end of document") {
      await virtual.next();
    }
  });

  afterEach(async () => {
    document.body.innerHTML = "";

    await virtual.stop();
  });

  test("tests accessible name", async () => {
    expect(await virtual.itemTextLog()).toEqual([
      "",
      "label",
      "x",
      "label",
      "",
    ]);
  });
});
