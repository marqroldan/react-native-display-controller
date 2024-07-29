import type { PropsWithChildren, ReactNode, ComponentClass } from "react";
import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import {TextInput} from 'react-natve';

import {
  DisplayControllerTrailContext,
  DisplayHolderStackContext,
  DisplayControllerActionsContext,
  DisplayControllerDataContext,
  DisplayHolderScrimContext,
  DisplayHolderActionsContext,
  DisplayHolderIDContext,
} from "./contexts";
import { uuid } from "./utils";

type HolderProps = {
  name?: string;
  ScrimComponent?: (() => ReactNode) | ComponentClass<any>;
};

const DefaultStartingPoint = "root";


export function Holder(props: PropsWithChildren<HolderProps>) {
  const trail = useContext(DisplayControllerTrailContext);
  const holderID = useMemo(() => {
    if (trail == null) {
      return DefaultStartingPoint;
    } else {
      return props.name ?? uuid();
    }
  }, [props.name, trail]);

  /////// this is so you know the parent
  const newTrail = useMemo(() => {
    if (holderID === DefaultStartingPoint || !Array.isArray(trail)) {
      return [DefaultStartingPoint];
    } else {
      const _trail = trail.slice();
      _trail.push(holderID);
      return _trail;
    }
  }, [trail, holderID]);

  const { register, bubble } = useContext(DisplayControllerActionsContext);
  const controller = useContext(DisplayControllerDataContext);
  const parentStack = controller[holderID];

  const shouldAccept = useRef(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [localStack, setStack] = useState<any[]>([]);

  useEffect(() => {
    const deregister = register(holderID, trail);
    setIsRegistered(true);
    shouldAccept.current = true;

    return () => {
      shouldAccept.current = false;
      deregister();
      setIsRegistered(false);
      setStack([]);
    };
  }, [trail, holderID]);

  /// when coming from above
  useEffect(() => {
    if (!shouldAccept.current || !isRegistered || parentStack?.length <= 0) {
      return;
    }

    const timeout = setTimeout(() => {
      setStack((prevStack) => {
        if(parentStack?.length) {
          return prevStack.concat(parentStack);
        } else {
          return prevStack;
        }
      });
    }, 16.67 * 2);

    return () => {
      clearTimeout(timeout);
    };
  }, [isRegistered, parentStack]);

  /// when directly talking
  const actions = useMemo(() => {
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
    <DisplayHolderIDContext.Provider value={holderID}>
      <DisplayControllerTrailContext.Provider value={newTrail}>
        <DisplayHolderScrimContext.Provider value={shouldShowStackScrim}>
          <DisplayHolderStackContext.Provider value={localStack}>
            <DisplayHolderActionsContext.Provider value={actions}>
              {props.children}
            </DisplayHolderActionsContext.Provider>
          </DisplayHolderStackContext.Provider>
        </DisplayHolderScrimContext.Provider>
      </DisplayControllerTrailContext.Provider>
    </DisplayHolderIDContext.Provider>
  );
}

export class OverlayController extends React.Component<
  PropsWithChildren<any>,
  {
    currentOrder: string[];
    holders: Record<string, string[] | null>;
    data: Record<string, any>;
  }
> {
  //// static
  static show = (...args: any[]) => {};

  //// instance
  state = {
    currentOrder: [],
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

    const input = TextInput.State.currentlyFocusedInput();

    this.setState((prevState) => {
      const newData = {
        ...prevState.data,
      };

      if (!newData[finalTarget]) {
        newData[finalTarget] = [];
      } else {
        newData[finalTarget] = newData[finalTarget].slice();
      }

      newData[finalTarget].push({
        ...data,
        __internal: {
          lastFocusedInput: input,
        }
      });
      return {
        data: newData,
      };
    });
  };

  register = (name, trail: null | string[]) => {
    this.setState((prevState) => {
      this.flags[name] = true;
      let newOrder = prevState.currentOrder.slice();

      const lastItemIndex = newOrder.length - 1;
      for (let i = 0; i < 5; i++) {
        const targIndex = lastItemIndex - i;

        if (targIndex < 0) {
          break;
        }

        if (newOrder[targIndex] == name) {
          newOrder = newOrder.slice(0, targIndex);
          break;
        }
      }

      return {
        currentOrder: newOrder,
        holders: {
          ...prevState.holders,
          [name]: trail,
        },
      };
    });

    return () => {
      this.flags[name] = false;

      this.setState((prevState) => {
        const { [name]: _, ...newHolders } = prevState.holders;

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
      <DisplayControllerActionsContext.Provider value={this.actions}>
        {/** TODO: This kind of context will re-render all those who are listening **/}
        <DisplayControllerDataContext.Provider value={this.state.data}>
          {this.props.children}
        </DisplayControllerDataContext.Provider>
      </DisplayControllerActionsContext.Provider>
    );
  }
}

export * from "./StackRenderer";
export * from "./Scrim";
