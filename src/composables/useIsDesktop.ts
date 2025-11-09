import { useMediaQuery } from '@vueuse/core'

export function useIsDesktop() {
  return useMediaQuery('(width >= 48rem)')
}
