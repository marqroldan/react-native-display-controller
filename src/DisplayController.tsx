import type { PropsWithChildren } from "react";
import React from "react";
import {TextInput} from 'react-natve';

import {
  DisplayControllerActionsContext,
  DisplayControllerDataContext,
} from "./contexts";


export class DisplayController extends React.Component<
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
    DisplayController.show = this.show;
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
