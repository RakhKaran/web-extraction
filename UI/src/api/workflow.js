// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetWorkflows() {
  const URL = endpoints.workflows.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshWorkflows = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    workflows: data || [],
    workflowsLoading: isLoading,
    workflowsError: error,
    workflowsValidating: isValidating,
    workflowsEmpty: !isLoading && !data?.length,
    refreshWorkflows, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetWorkflow(workflowId) {
  const URL = workflowId ? [endpoints.workflows.details(workflowId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      workflow: data,
      workflowLoading: isLoading,
      workflowError: error,
      workflowValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetWorkflowWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.workflows.filterList(filter);
  } else {
    URL = endpoints.workflows.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterWorkflows = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredWorkflows: data || [],
    filteredWorkflowsLoading: isLoading,
    filteredWorkflowsError: error,
    filteredWorkflowsValidating: isValidating,
    filteredWorkflowsEmpty: !isLoading && !data?.length,
    refreshFilterWorkflows, // Include the refresh function separately
  };
}
