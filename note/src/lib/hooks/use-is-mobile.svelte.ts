import { MediaQuery } from 'svelte/reactivity'

export type Breakpoints<K extends string> = Record<K, string>

/**
 * Based on the default Tailwind CSS breakpoints https://tailwindcss.com/docs/responsive-design.
 */
export const TAILWIND_BREAKPOINTS: Breakpoints<
  'sm' | 'md' | 'lg' | 'xl' | '2xl'
> = {
  '2xl': '96rem',
  lg: '64rem',
  md: '48rem',
  sm: '40rem',
  xl: '80rem',
}

export function useIsMobile(): MediaQuery {
  return new MediaQuery(`(max-width: ${TAILWIND_BREAKPOINTS.md})`)
}
