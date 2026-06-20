import React, { createContext, useContext } from 'react';

export type Direction = 'ltr' | 'rtl';

const DirectionContext = createContext<Direction>('ltr');

export interface DirectionProviderProps {
  /** Active writing direction; drives default text alignment for <Text>. */
  dir: Direction;
  children: React.ReactNode;
}

/**
 * Carries the app's writing direction down the tree so primitives (notably
 * <Text>) can align themselves without each screen wiring up i18n. The app feeds
 * this from the selected language; defaults to LTR when no provider is present.
 */
export function DirectionProvider({ dir, children }: DirectionProviderProps) {
  return <DirectionContext.Provider value={dir}>{children}</DirectionContext.Provider>;
}

/** The active writing direction ('ltr' | 'rtl'). */
export function useDirection(): Direction {
  return useContext(DirectionContext);
}

/** Convenience flag — true when the active direction is right-to-left. */
export function useIsRTL(): boolean {
  return useContext(DirectionContext) === 'rtl';
}
