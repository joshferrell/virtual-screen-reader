import {
  AccessibilityNode,
  createAccessibilityTree,
} from "./createAccessibilityTree";
import type { CommandOptions, ScreenReader } from "@guidepup/guidepup";
import {
  ERR_VIRTUAL_MISSING_CONTAINER,
  ERR_VIRTUAL_NOT_STARTED,
} from "./errors";
import { aria } from "aria-query";
import { isElement } from "./isElement";
import { notImplemented } from "./notImplemented";
import userEvent from "@testing-library/user-event";

export interface StartOptions extends CommandOptions {
  container: HTMLElement;
}

const observedAttributes = [
  ...aria.keys(),
  "type",
  "control",
  "for",
  "labels",
  "style",
  "class",
  "title",
  "alt",
  "label",
  "value",
  "hidden",
  "disabled",
];

// TODO: monitor focus change and update the screen reader active element.
// TODO: handle aria-live, role="polite", role="alert", and other interruptions.

const observeDOM = (function () {
  const MutationObserver = window.MutationObserver;

  return function observeDOM(node: Node, onChange: () => void): () => void {
    if (!isElement(node)) {
      return;
    }

    const callback = () => onChange();

    if (MutationObserver) {
      const mutationObserver = new MutationObserver(callback);

      mutationObserver.observe(node, {
        attributes: true,
        attributeFilter: observedAttributes,
        childList: true,
        subtree: true,
      });

      return () => {
        mutationObserver.disconnect();
      };
    }

    return () => {
      // gracefully fallback to not supporting Accessibility Tree refreshes if
      // the DOM changes.
    };
  };
})();

export class Virtual implements ScreenReader {
  #activeNode: AccessibilityNode | null = null;
  #container: Node | null = null;
  #itemTextLog: string[] = [];
  #spokenPhraseLog: string[] = [];
  #treeCache: AccessibilityNode[] | null = null;
  #disconnectDOMObserver: () => void | null = null;

  #checkContainer() {
    if (!this.#container) {
      throw new Error(ERR_VIRTUAL_NOT_STARTED);
    }
  }

  #getAccessibilityTree() {
    if (!this.#treeCache) {
      this.#treeCache = createAccessibilityTree(this.#container);
    }

    return this.#treeCache;
  }

  #invalidateTreeCache() {
    this.#treeCache = null;
  }

  #updateState(accessibilityNode: AccessibilityNode) {
    const { accessibleDescription, accessibleName, role } = accessibilityNode;
    const spokenPhrase = [role, accessibleName, accessibleDescription]
      .filter(Boolean)
      .join(", ");

    this.#activeNode = accessibilityNode;
    this.#itemTextLog.push(accessibleName);
    this.#spokenPhraseLog.push(spokenPhrase);
  }

  #getCurrentIndex(tree: AccessibilityNode[]) {
    return tree.findIndex(
      ({ accessibleDescription, accessibleName, node, role }) =>
        accessibleName === this.#activeNode?.accessibleName &&
        accessibleDescription === this.#activeNode?.accessibleDescription &&
        node === this.#activeNode?.node &&
        role === this.#activeNode?.role
    );
  }

  async detect() {
    return true;
  }

  async default() {
    return false;
  }

  async start({ container }: StartOptions = { container: null }) {
    if (!container) {
      throw new Error(ERR_VIRTUAL_MISSING_CONTAINER);
    }

    this.#container = container;

    const invalidateTreeCache = () => this.#invalidateTreeCache();
    this.#disconnectDOMObserver = observeDOM(container, invalidateTreeCache);

    const tree = this.#getAccessibilityTree();

    if (!tree.length) {
      return;
    }

    this.#updateState(tree[0]);

    return;
  }

  async stop() {
    this.#disconnectDOMObserver?.();
    this.#invalidateTreeCache();

    this.#activeNode = null;
    this.#container = null;
    this.#itemTextLog = [];
    this.#spokenPhraseLog = [];

    return;
  }

  async previous() {
    this.#checkContainer();

    const tree = this.#getAccessibilityTree();

    if (!tree.length) {
      return;
    }

    const currentIndex = this.#getCurrentIndex(tree);
    const nextIndex = currentIndex === -1 ? 0 : currentIndex - 1;
    const newActiveNode = tree.at(nextIndex);

    this.#updateState(newActiveNode);

    return;
  }

  async next() {
    this.#checkContainer();

    const tree = this.#getAccessibilityTree();

    if (!tree.length) {
      return;
    }

    const currentIndex = this.#getCurrentIndex(tree);
    const nextIndex =
      currentIndex === -1 || currentIndex === tree.length - 1
        ? 0
        : currentIndex + 1;
    const newActiveNode = tree.at(nextIndex);

    this.#updateState(newActiveNode);

    return;
  }

  async act() {
    this.#checkContainer();

    notImplemented();

    return;
  }

  async interact() {
    this.#checkContainer();

    return;
  }

  async stopInteracting() {
    this.#checkContainer();

    return;
  }

  async press() {
    this.#checkContainer();

    notImplemented();

    return;
  }

  async type() {
    this.#checkContainer();

    notImplemented();

    return;
  }

  async perform() {
    this.#checkContainer();

    notImplemented();

    return;
  }

  /**
   * Click the mouse.
   *
   * @param {object} [options] Click options.
   */
  async click({ button = "left", clickCount = 1 } = {}) {
    this.#checkContainer();

    if (!this.#activeNode) {
      return;
    }

    const key = `[Mouse${button[0].toUpperCase()}${button.slice(1)}]`;
    const keys = key.repeat(clickCount);
    const target = this.#activeNode.node as HTMLElement;

    await userEvent.pointer([{ target }, { keys, target }]);

    return;
  }

  async lastSpokenPhrase() {
    this.#checkContainer();

    return this.#spokenPhraseLog.at(-1) ?? "";
  }

  async itemText() {
    this.#checkContainer();

    return this.#itemTextLog.at(-1) ?? "";
  }

  async spokenPhraseLog() {
    this.#checkContainer();

    return this.#spokenPhraseLog;
  }

  async itemTextLog() {
    this.#checkContainer();

    return this.#itemTextLog;
  }
}
