import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";

import { DisplayHolderIDContext, DisplayHolderStackContext } from "./contexts";
function DefaultRenderer(props: any) {
  const Component = props.component;
  return (
    <View style={StyleSheet.absoluteFill}>
      <Component />
    </View>
  );
}

export function StackRenderer() {
  const stack = useContext(DisplayHolderStackContext);
  const holderID = useContext(DisplayHolderIDContext);

  if (!stack?.length) {
    return null;
  }

  return stack.map((item, index) => {
    const Renderer = item.layerRenderer ?? DefaultRenderer;
    const name =
      item.name ?? item.component?.displayName ?? item.component?.name ?? "";
    return <Renderer {...item} key={`${holderID}-${name || index}`} />;
  });
}
