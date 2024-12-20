// deno-lint-ignore-file no-explicit-any
import { source } from "../../core.ts";
import type { DerivedSignal } from "../../types.ts";
import { dprops } from "./object.ts";

/**
 * Derived Signals of Promise State
 * @param promiseFn
 * @param runImmediately
 * @param ultimately
 * @returns
 */
export const dpromise = <T, Args extends Array<any>>(
  promiseFn: (...args: Args) => Promise<T>,
  ultimately?: () => void,
): readonly [
  (...args: Args) => Promise<void>,
  DerivedSignal<T | undefined>,
  DerivedSignal<Error | undefined>,
  DerivedSignal<boolean>,
] => {
  type PromState = {
    isRunning: boolean;
    result: T | undefined;
    error: Error | undefined;
  };
  const state = source<PromState>({
    isRunning: false,
    result: undefined,
    error: undefined,
  });

  const runPromise = (...args: Args) =>
    promiseFn(...args)
      .then((res) => {
        state.value = {
          isRunning: false,
          result: res,
          error: undefined,
        };
      })
      .catch((e) => {
        const prevResult = state.value.result;
        /**
         * result.value is not set to undefined because, if the promise
         * is run multiple times, ideally last result.value should not be
         * overriden due to current error.
         *
         * Best Practise: Always check error first while using this method.
         * Explanation: There's a chance that promiseFn errors out when run
         * at nth time. In that case, the result of (n-1)th time is still intact
         * and not overriden. While error has some value due to promise failure
         * at the nth time.
         *
         * Notice in catch block that error.value is always reset whenever
         * there is a success. There is no point of preserving the error
         * of the last run.
         */
        state.value = {
          isRunning: false,
          result: prevResult,
          error: e,
        };
      })
      .finally(ultimately);

  const { isRunning, result, error } = dprops(state);
  return [runPromise, result, error, isRunning] as const;
};
