import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { RNOverlayViewProps } from './RNOverlay.types';

const NativeView: React.ComponentType<RNOverlayViewProps> =
  requireNativeViewManager('RNOverlay');

export default function RNOverlayView(props: RNOverlayViewProps) {
  return <NativeView {...props} />;
}
