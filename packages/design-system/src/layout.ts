/**
 * Responsive layout helpers.
 *
 * The app runs on phones, iPads, and laptop browsers. Content is centered with a
 * comfortable max width on larger viewports so it never stretches edge-to-edge,
 * and components can branch on the current breakpoint.
 */
import { useWindowDimensions } from 'react-native';

export const breakpoints = {
  tablet: 768,
  desktop: 1024,
} as const;

export type Breakpoint = 'phone' | 'tablet' | 'desktop';

export interface Responsive {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  /** tablet or wider — the threshold for centered, multi-column layouts. */
  isWide: boolean;
  /** Suggested columns for a card grid. */
  columns: number;
}

export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();
  const breakpoint: Breakpoint =
    width >= breakpoints.desktop ? 'desktop' : width >= breakpoints.tablet ? 'tablet' : 'phone';
  return {
    width,
    height,
    breakpoint,
    isPhone: breakpoint === 'phone',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isWide: width >= breakpoints.tablet,
    columns: width >= breakpoints.desktop ? 3 : width >= breakpoints.tablet ? 2 : 1,
  };
}

/** Centered content max width. `reading` is narrower for comfortable line length. */
export function useContentMaxWidth(kind: 'default' | 'reading' = 'default'): number | undefined {
  const { width } = useWindowDimensions();
  if (width < breakpoints.tablet) return undefined; // phones: full width
  if (kind === 'reading') return 780;
  return width >= breakpoints.desktop ? 960 : 800;
}
