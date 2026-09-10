import { MediaQuery } from 'svelte/reactivity'

export function useIsMobile(): MediaQuery {
  // Match Tailwind’s md breakpoint.
  return new MediaQuery('(max-width: 48rem)')
}
