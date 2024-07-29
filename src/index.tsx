import type { PropsWithChildren, ReactNode, ComponentClass } from "react";
import React, {
  useState,
  createContext,
  useEffect,
  useMemo,
  useContext, createRef, useRef
} from "react";

const OverlayTrailContext = createContext(["root"]);
const StackContext = createContext([]);
const StackScrimContext = createContext(false);
const OverlayActionsContext = createContext({
  registerSelf: (name: string, listener: () => void) => {},
  show: (target: string, data: any) => {},
});

function useOverlayController(nodeName: string) {
  const [stack, setStack] = useState([]);

  useEffect(() => {
    return registerSelf(nodeName, (data) => {
      setStack((prevStack) => {
        const newStack = prevStack.slice();

        newStack.push(data);
        return newStack;
      });
    });
  }, []);


  const shouldShowStackScrim = stack.some((a) => a.showStackScrim);


  return {
    stack;
  }
}

type HolderProps = {
  name: string;
  ScrimComponent: (() => ReactNode) | ComponentClass<any>;
};
function Holder(props: PropsWithChildren<HolderProps>) {
  const trail = useContext(OverlayTrailContext);
  const newTrail = useMemo(() => {
    const _trail = trail.slice();
    _trail.push(props.name);
    return _trail;
  }, [trail]);

  const shouldAccept = useRef(false);


  const { registerSelf, notifier } = useOverlayController(props.name);
  const [stack, setStack] = useState([]);

  useEffect(() => {
    const remove = registerSelf(props.name, (data) => {
      if(!shouldAccept.current) {
        return;
      }
      setStack((prevStack) => {
        const newStack = prevStack.slice();

        newStack.push(data);
        return newStack;
      });
    });
    return () => {
      shouldAccept.current = false;
      remove();
    }
  }, []);


  const shouldShowStackScrim = stack.some((a) => a.showStackScrim);



  return (
    <OverlayTrailContext.Provider value={newTrail}>
      <StackScrimContext.Provider value={shouldShowStackScrim}>
        <StackContext.Provider value={stack}>
          {props.children}
        </StackContext.Provider>
      </StackScrimContext.Provider>
    </OverlayTrailContext.Provider>
  );
}

const RootStart = ["root"];

function OverlayController(props) {
  const [holders, setHolders] = useState({});
  const [data, setData] = useState({});

  const flags = useRef<Record<string, boolean>>({})

  const actions = useMemo(() => {
    return {
      shouldAcceptNotifier: (name, value) => {
        flags.current[name] = value;
      },
      registerSelf: (name, listener) => {
        setHolders((prevHolders) => {
          const newData = {
            ...prevHolders,
          };

          if (!newData[name]) {
            newData[name] = [];
          } else {
            newData[name] = newData[name].slice();
          }

          newData[name].push(listener);

          flags.current[name] = true;
          return newData;
        });
        return () => {
          flags.current[name] = false;
          setHolders((prevHolders) => {
            if (!prevHolders[name] || prevHolders[name]?.length === 0) {
              return prevHolders;
            }

            return {
              ...prevHolders,
              [name]: prevHolders[name].filter((a) => a !== listener),
            };
          });
        };
      },
      show: (target: string, data: any) => {
        setData((prevData) => {
          const newData = {
            ...prevData,
          };

          if (!newData[target]) {
            newData[target] = [];
          } else {
            newData[target] = newData[target].slice();
          }

          newData[target].push(data);
        });
      },
    };
  }, []);

  //// check the data and see if there's a listener, filter if it's not meant to fallback
  useEffect(() => {
    const debouncer = setTimeout(() => {
      ////
    }, 600);
    return () => {
      clearTimeout(debouncer);
    };
  }, [data]);

  return (
    <OverlayTrailContext.Provider value={RootStart}>
      <OverlayActionsContext.Provider value={actions}>
        {props.children}
      </OverlayActionsContext.Provider>
    </OverlayTrailContext.Provider>
  );
}
