import { derived } from "../../core.ts";
import type { DerivedSignal } from "../../types.ts";

/**
 * Tuple of truthy and falsy derived signals
 * @param boolGetterFn
 * @returns
 */
export const dbools = (
  boolGetterFn: () => boolean,
): [DerivedSignal<boolean>, DerivedSignal<boolean>] => {
  const truthy = derived(boolGetterFn);
  const falsy = derived(() => !truthy.value);

  return [truthy, falsy];
};
