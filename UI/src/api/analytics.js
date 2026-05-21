import useSWR from 'swr';
import {useMemo} from 'react';
import {fetcher} from 'src/utils/axios';

export function useGetAnalyticsOverview(startDate, endDate) {
  const query = new URLSearchParams();
  if (startDate) query.append('startDate', new Date(startDate).toISOString());
  if (endDate) query.append('endDate', new Date(endDate).toISOString());
  const queryString = query.toString();
  const URL = queryString ? `/analytics/overview?${queryString}` : '/analytics/overview';
  
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
