import { setupBasicPage } from "../utils.js";
import { virtual } from "../../src/index.js";

describe("interact / stopInteracting", () => {
  beforeEach(() => {
    setupBasicPage();
  });

  it("should not do anything", async () => {
    await virtual.start({ container: document.body });
    await virtual.next();
    await virtual.interact();
    await virtual.next();
    await virtual.stopInteracting();
    await virtual.next();

    expect(await virtual.spokenPhraseLog()).toEqual([
      "document",
      "navigation",
      "Nav Text",
      "end of navigation",
    ]);
  });
});
