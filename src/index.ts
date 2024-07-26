import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to RNOverlay.web.ts
// and on native platforms to RNOverlay.ts
import RNOverlayModule from './RNOverlayModule';
import RNOverlayView from './RNOverlayView';
import { ChangeEventPayload, RNOverlayViewProps } from './RNOverlay.types';

// Get the native constant value.
export const PI = RNOverlayModule.PI;

export function hello(): string {
  return RNOverlayModule.hello();
}

export async function setValueAsync(value: string) {
  return await RNOverlayModule.setValueAsync(value);
}

const emitter = new EventEmitter(RNOverlayModule ?? NativeModulesProxy.RNOverlay);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { RNOverlayView, RNOverlayViewProps, ChangeEventPayload };
