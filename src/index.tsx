import type { PropsWithChildren, ReactNode, ComponentClass } from "react";
import React, { useState, createContext, useEffect, useMemo } from "react";

const StackContext = createContext([]);
const StackScrimContext = createContext(false);
const OverlayActionsContext = createContext({
  registerSelf: (name: string, listener: () => void) => {},
  show: (target: string, data: any) => {},
});

type HolderProps = {
  name: string;
  ScrimComponent: (() => ReactNode) | ComponentClass<any>;
};
function Holder(props: PropsWithChildren<HolderProps>) {
  const { registerSelf } = useOverlayController();
  const [stack, setStack] = useState([]);

  useEffect(() => {
    return registerSelf(props.name, (data) => {
      setStack((prevStack) => {
        const newStack = prevStack.slice();

        newStack.push(data);
        return newStack;
      });
    });
  }, []);

  const shouldShowStackScrim = stack.some((a) => a.showStackScrim);

  return (
    <StackScrimContext.Provider value={shouldShowStackScrim}>
      <StackContext.Provider value={stack}>
        {props.children}
      </StackContext.Provider>
    </StackScrimContext.Provider>
  );
}

function OverlayController(props) {
  const [holders, setHolders] = useState({});
  const [data, setData] = useState({});

  const actions = useMemo(() => {
    return {
      registerSelf: (name, listener) => {
        return () => {};
      },
      show: (target: string, data: any) => {
        setData((prevData) => {
          const newData = {
            ...prevData,
          };

          if (!newData[target]) {
            newData[target] = [];
          }

          newData[target].push(data);
        });
      },
    };
  }, []);

  useEffect(() => {
    //// check the data and see if there's a listener, filter if it's not meant to fallback
  }, [data]);

  return (
    <OverlayActionsContext.Provider value={actions}>
      {props.children}
    </OverlayActionsContext.Provider>
  );
}
