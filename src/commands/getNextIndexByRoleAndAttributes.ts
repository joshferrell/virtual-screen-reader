import {
  getIndexByRoleAndAttributes,
  type GetIndexFilters,
} from "./getIndexByRoleAndAttributes";
import type { VirtualCommandArgs } from "./types";

export type GetNextIndexArgs = Omit<VirtualCommandArgs, "container">;

export function getNextIndexByRoleAndAttributes(
  filters: Readonly<GetIndexFilters>
) {
  return function getNextIndexByRoleAndAttributesInner({
    currentIndex,
    tree,
  }: GetNextIndexArgs) {
    const reorderedTree = tree
      .slice(currentIndex + 1)
      .concat(tree.slice(0, currentIndex + 1));

    return getIndexByRoleAndAttributes({ filters, reorderedTree, tree });
  };
}
