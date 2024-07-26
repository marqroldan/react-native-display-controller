import * as React from 'react';

import { RNOverlayViewProps } from './RNOverlay.types';

export default function RNOverlayView(props: RNOverlayViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
