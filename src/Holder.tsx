import type { PropsWithChildren, ReactNode, ComponentClass } from "react";
import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import {
  DisplayControllerActionsContext,
  DisplayControllerDataContext,
  DisplayControllerTrailContext,
  DisplayHolderActionsContext,
  DisplayHolderIDContext,
  DisplayHolderScrimContext,
  DisplayHolderStackContext
} from "./contexts";
import { uuid } from "./utils"

type HolderProps = {
  name?: string;
  ScrimComponent?: (() => ReactNode) | ComponentClass<any>;
};

const DefaultStartingPoint = "root";


export function DisplayHolder(props: PropsWithChildren<HolderProps>) {
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
