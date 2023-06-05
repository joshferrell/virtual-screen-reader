import { virtual } from "../../src";

describe("Implicit Aria States", () => {
  afterEach(async () => {
    document.body.innerHTML = "";
  });

  it("should announce implicit aria states as labels", async () => {
    document.body.innerHTML = `
    <div role="tab">A Tab</div>
    `;

    await virtual.start({ container: document.body });
    await virtual.next();

    expect(await virtual.lastSpokenPhrase()).toBe("tab, A Tab, not selected");

    await virtual.stop();
  });
});