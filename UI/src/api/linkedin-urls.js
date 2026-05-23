import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetLinkedInUrls() {
  const URL = endpoints.linkedInUrls?.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      linkedInUrls: data || [],
      linkedInUrlsLoading: isLoading,
      linkedInUrlsError: error,
      linkedInUrlsValidating: isValidating,
      linkedInUrlsEmpty: !isLoading && (!data || data.length === 0),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetLinkedInUrl(id) {
  const URL = id ? endpoints.linkedInUrls?.details(id) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      linkedInUrl: data,
      linkedInUrlLoading: isLoading,
      linkedInUrlError: error,
      linkedInUrlValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
