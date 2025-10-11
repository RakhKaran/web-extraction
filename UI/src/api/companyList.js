import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';
import { identity } from 'lodash';

// ----------------------------------------------------------------------

export function useGetCompanies() {
  const URL = endpoints.companyList.list;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      CompaniesList: data || [],
      CompaniesListLoading: isLoading,
      CompaniesListError: error,
      CompaniesListValidating: isValidating,
      CompaniesListEmpty: !isLoading && (!data || data.length === 0),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetCompany(id) {
  const URL = id ? endpoints.companyList.details(id) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      companyList: data,
      companyListLoading: isLoading,
      companyListError: error,
      companyListValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useFilterCompanies(queryString) {
  const URL = queryString ? endpoints.companyList.filterList(queryString) : null;

  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
    keepPreviousData: true,
  });

  const memoizedValue = useMemo(
    () => ({
      filteredCompaniesList: data || [],
      filterLoading: isLoading,
      filterError: error,
      filterValidating: isValidating,
      filterEmpty: !isLoading && (!data || data.length === 0),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
