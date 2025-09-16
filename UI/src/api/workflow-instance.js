// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export function useGetWorkflowInstances() {
  const URL = endpoints.workflowInstance.list;

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshWorkflowInstances = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    workflowInstances: data || [],
    workflowInstancesLoading: isLoading,
    workflowInstancesError: error,
    workflowInstancesValidating: isValidating,
    workflowInstancesEmpty: !isLoading && !data?.length,
    refreshWorkflowInstances, // Include the refresh function separately
  };
}

// ----------------------------------------------------------------------

export function useGetWorkflowInstance(workflowInstanceId) {
  const URL = workflowInstanceId ? [endpoints.workflowInstance.details(workflowInstanceId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
      workflowInstance: data,
      workflowInstanceLoading: isLoading,
      workflowInstanceError: error,
      workflowInstanceValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetworkflowInstancesWithFilter(filter) {
  let URL;
  if (filter) {
    URL = endpoints.workflowInstance.filterList(filter);
  } else {
    URL = endpoints.workflowInstance.list;
  }

  const { data, isLoading, error, isValidating, mutate } = useSWR(URL, fetcher);

  const refreshFilterWorkflowInstances = () => {
    // Use the `mutate` function to trigger a revalidation
    mutate();
  };

  return {
    filteredWorkflowInstances: data || [],
    filteredWorkflowInstancesLoading: isLoading,
    filteredWorkflowInstancesError: error,
    filteredWorkflowInstancesValidating: isValidating,
    filteredWorkflowInstancesEmpty: !isLoading && !data?.length,
    refreshFilterWorkflowInstances, // Include the refresh function separately
  };
}
