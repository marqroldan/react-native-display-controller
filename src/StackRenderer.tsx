import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { DisplayHolderIDContext, DisplayHolderStackContext } from "./contexts";
function DefaultRenderer(props: any) {
  const Component = props.component ?? React.Fragment;
  return (
    <Animated.View style={StyleSheet.absoluteFill} entering={FadeIn} exiting={FadeOut}>
      <Component />
    </Animated.View>
  );
}

export function DisplayHolderStackRenderer() {
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
