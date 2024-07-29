import { PropsWithChildren, useContext } from "react";
import { StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

import { DisplayHolderScrimContext } from "./contexts";

const style = [StyleSheet.absoluteFill, { backgroundColor: "rgba(0,0,0,0.4)" }];

export function DisplayControllerScrim(props: PropsWithChildren<any>) {
  const shouldShow = useContext(DisplayHolderScrimContext);

  if (!shouldShow) {
    return null;
  }

  return (
    <Animated.View style={style} entering={FadeIn} exiting={FadeOut}>
      {props.children}
    </Animated.View>
  );
}
