import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetCompanies() {
    const URL = endpoints.companyMaster.list;

    const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

    const memoizedValue = useMemo(
        () => ({
            companies: data || [],
            companiesLoading: isLoading,
            companiesError: error,
            companiesValidating: isValidating,
            companiesEmpty: !isLoading && (!data || data.length === 0),
        }),
        [data, error, isLoading, isValidating]
    );

    return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetCompany(id) {
    const URL = id ? endpoints.companyMaster.details(id) : null;

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
    const URL = queryString ? endpoints.designation.filterList(queryString) : null;

    const { data, isLoading, error, isValidating } = useSWR(URL, fetcher, {
        keepPreviousData: true,
    });

    const memoizedValue = useMemo(
        () => ({
            filteredCompanies: data || [],
            filteredCompaniesLoading: isLoading,
            filteredCompaniesError: error,
            filteredCompaniesValidating: isValidating,
            filteredCompaniesEmpty: !isLoading && (!data || data.length === 0),
        }),
        [data, error, isLoading, isValidating]
    );

    return memoizedValue;
}
