import useSWR from 'swr';
import {useMemo} from 'react';
import {fetcher} from 'src/utils/axios';

export function useGetAnalyticsOverview() {
  const URL = '/analytics/overview';
  const {data, isLoading, error, isValidating} = useSWR(URL, fetcher);

  return useMemo(
    () => ({
      analytics: data || null,
      analyticsLoading: isLoading,
      analyticsError: error,
      analyticsValidating: isValidating,
    }),
    [data, error, isLoading, isValidating],
  );
}
