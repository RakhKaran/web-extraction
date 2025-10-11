import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';
import { identity } from 'lodash';

// ----------------------------------------------------------------------

export function useGetCompanies() {
  const URL = endpoints.company.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      Companies: data || [],
      CompaniesLoading: isLoading,
      CompaniesError: error,
      CompaniesValidating: isValidating,
      CompaniesEmpty: !isLoading && (!data || data.length === 0),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetCompany(id) {
  const URL = id ? endpoints.company.details(id) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      company: data,
      companyLoading: isLoading,
      companyError: error,
      companyValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useFilterCompanies(queryString) {
  const URL = queryString ? endpoints.company.filterList(queryString) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      filteredCompanies: data || [],
      filterLoading: isLoading,
      filterError: error,
      filterValidating: isValidating,
      filterEmpty: !isLoading && (!data || data.length === 0),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
