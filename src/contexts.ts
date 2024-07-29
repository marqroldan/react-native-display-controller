import { createContext } from "react";

//// For the whole package
export const DisplayControllerActionsContext = createContext({
  bubble: (from: string, data: any) => {},
  register: (name: string, trail: null | string[]) => () => {},
  show: (target: string, data: any) => {},
});
export const DisplayControllerDataContext = createContext({});
export const DisplayControllerTrailContext = createContext<null | string[]>(
  null,
);

//// Holder-specific
export const DisplayHolderActionsContext = createContext({});
export const DisplayHolderStackContext = createContext([]);
export const DisplayHolderScrimContext = createContext(false);
