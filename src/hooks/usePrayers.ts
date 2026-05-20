import { PRAYERS } from '@/data/prayers';
import { Prayer } from '@/types';

export function usePrayers() {
  return {
    prayers: PRAYERS as Prayer[],
    isLoading: false,
    error: null,
    refetch: () => {},
  };
}
