// deno-lint-ignore-file no-explicit-any
import { derived, valueIsSignal } from "../../core.ts";
import type { DerivedSignal, Signal } from "../../types.ts";

/**
 * Derived String Signal
 * @param strings
 * @param tlExpressions
 * @returns
 */

export type TemplateLiteralExpressions = ((() => any) | Signal<any> | any)[];

export const dstr = (
  strings: TemplateStringsArray,
  ...tlExpressions: TemplateLiteralExpressions
): DerivedSignal<string> =>
  derived(() => {
    return strings.reduce((acc, fragment, i) => {
      let expValue;
      const expression = tlExpressions[i];

      if (typeof expression === "function") {
        expValue = expression() ?? "";
      } else if (valueIsSignal(expression)) {
        expValue = (expression as Signal<any>).value ?? "";
      } else {
        expValue = (expression as any) ?? "";
      }

      return `${acc}${fragment}${expValue.toString()}`;
    }, "");
  });
