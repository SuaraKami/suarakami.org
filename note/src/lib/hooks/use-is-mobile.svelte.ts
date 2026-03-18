import { MediaQuery } from 'svelte/reactivity'

export type Breakpoints<K extends string> = Record<K, string>

/**
 * Based on the default Tailwind CSS breakpoints https://tailwindcss.com/docs/responsive-design.
 */
export const TAILWIND_BREAKPOINTS: Breakpoints<'sm' | 'md' | 'lg' | 'xl' | '2xl'> = {
  sm: '40rem',
  md: '48rem',
  lg: '64rem',
  xl: '80rem',
  '2xl': '96rem',
}

export function useIsMobile(): MediaQuery {
  return new MediaQuery(`(max-width: ${TAILWIND_BREAKPOINTS.md})`)
}
