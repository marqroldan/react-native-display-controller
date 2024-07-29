import type { PropsWithChildren, ReactNode, ComponentClass } from "react";
import React, {
  useState,
  createContext,
  useEffect,
  useContext,
  useRef,
  useMemo,
} from "react";

import { uuid } from "./utils";

const OverlayTrailContext = createContext<string[]>([]);
const StackContext = createContext([]);
const StackScrimContext = createContext(false);
const OverlayActionsContext = createContext({
  bubble: (from: string, data: any) => {},
  register: (name: string, trail: string[]) => () => {},
  show: (target: string, data: any) => {},
});
const ControllerDataContext = createContext({});

type HolderProps = {
  name?: string;
  ScrimComponent?: (() => ReactNode) | ComponentClass<any>;
};

export function Holder(props: PropsWithChildren<HolderProps>) {
  const holderID = useMemo(() => {
    return props.name ?? uuid();
  }, [props.name]);

  /////// this is so you know the parent
  const trail = useContext(OverlayTrailContext);
  const newTrail = useMemo(() => {
    const _trail = trail.slice();
    _trail.push(holderID);
    return _trail;
  }, [trail, holderID]);

  const { register, bubble } = useContext(OverlayActionsContext);
  const controller = useContext(ControllerDataContext);
  const parentStack = controller[holderID];

  const shouldAccept = useRef(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [localStack, setStack] = useState<any[]>([]);

  useEffect(() => {
    const deregister = register(props.name, trail);
    setIsRegistered(true);

    return () => {
      shouldAccept.current = false;
      deregister();
      setStack([]);
    };
  }, [trail]);

  /// when coming from above
  useEffect(() => {
    if (!shouldAccept.current || !isRegistered || parentStack.length <= 0) {
      return;
    }

    const timeout = setTimeout(() => {
      setStack((prevStack) => {
        return prevStack.concat(parentStack);
      });
    }, 600);

    return () => {
      clearTimeout(timeout);
    };
  }, [isRegistered, parentStack]);

  /// when directly talking
  const holderActions = useMemo(() => {
    return {
      push: (data: any) => {
        if (shouldAccept.current) {
          /// add it to current stack
          setStack((prevStack) => {
            const newStack = prevStack.slice();
            newStack.push(data);
            return newStack;
          });
        } else {
          /// bubble up to parent
          bubble(holderID, data);
        }
      },
      pop: () => {
        /// remove last item
        setStack((prevStack) => {
          const newStack = prevStack.slice();
          newStack.pop();
          return newStack;
        });
      },
    };
  }, [holderID]);

  const shouldShowStackScrim = localStack.some((a) => a.showStackScrim);

  return (
    <OverlayTrailContext.Provider value={newTrail}>
      <StackScrimContext.Provider value={shouldShowStackScrim}>
        <StackContext.Provider value={localStack}>
          {props.children}
        </StackContext.Provider>
      </StackScrimContext.Provider>
    </OverlayTrailContext.Provider>
  );
}

const RootStart = ["root"];

export class OverlayController extends React.Component<PropsWithChildren<any>> {
  //// static
  static show = () => {};

  //// instance
  state = {
    holders: {},
    data: {},
  };
  flags = {};

  show = (target: string, data: any) => {
    let finalTarget = target;
    if (!this.flags[target]) {
      /// check if holder is still available
      const parent = this.state.holders[target]?.at?.(-1);
      if (!parent) {
        finalTarget = "root";
      } else {
        finalTarget = parent;
      }
    }

    this.setState((prevState) => {
      const newData = {
        ...prevState.data,
      };

      if (!newData[finalTarget]) {
        newData[finalTarget] = [];
      } else {
        newData[finalTarget] = newData[finalTarget].slice();
      }

      newData[finalTarget].push(data);
      return {
        data: newData,
      };
    });
  };

  register = (name, trail) => {
    this.setState((prevState) => {
      const newHolders = {
        ...prevState.holders,
      };
      if (!newHolders[name]) {
        newHolders[name] = [];
      } else {
        newHolders[name] = newHolders[name].slice();
      }

      newHolders[name].push(trail);

      this.flags[name] = true;
      return {
        holders: newHolders,
      };
    });

    return () => {
      this.flags[name] = false;

      this.setState((prevState) => {
        const newHolders = {
          ...prevState.holders,
        };
        delete newHolders[name];

        return {
          holders: newHolders,
        };
      });
    };
  };

  bubble = (from: string, data: any) => {
    const holders = this.state.holders;
    let nextTarget = "root";
    if (holders[from]?.length) {
      nextTarget = holders[from].at(-1)!;
    }
    this.show(nextTarget, data);
  };

  actions = {
    show: this.show,
    bubble: this.bubble,
    register: this.register,
  };

  componentDidMount() {
    OverlayController.show = this.show;
  }

  componentDidUpdate(
    prevProps: Readonly<React.PropsWithChildren<any>>,
    prevState: Readonly<object>,
    snapshot?: any,
  ) {
    ///
  }

  render() {
    return (
      <OverlayTrailContext.Provider value={RootStart}>
        <OverlayActionsContext.Provider value={this.actions}>
          {this.props.children}
        </OverlayActionsContext.Provider>
      </OverlayTrailContext.Provider>
    );
  }
}
