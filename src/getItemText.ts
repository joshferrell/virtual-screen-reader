import { AccessibilityNode } from "./createAccessibilityTree";

export const getItemText = (
  accessibilityNode: Pick<
    AccessibilityNode,
    "accessibleName" | "accessibleValue"
  >
) => {
  const { accessibleName, accessibleValue } = accessibilityNode;
  const announcedValue =
    accessibleName === accessibleValue ? "" : accessibleValue;

  return [accessibleName, announcedValue].filter(Boolean).join(", ");
};
