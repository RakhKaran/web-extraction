// eslint-disable-next-line import/no-extraneous-dependencies
import useSWR from 'swr';
import { useMemo } from 'react';
// utils
import { fetcher, endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------
// workflow blueprint...
export function useGetWorkflowBluePrint(workflowId) {
  const URL = workflowId ? [endpoints.workflows.bluePrint(workflowId)] : null;
  const { data, isLoading, error, isValidating } = useSWR(URL, fetcher);

  const memoizedValue = useMemo(
    () => ({
        bluePrints: data,
        bluePrintsLoading: isLoading,
        bluePrintsError: error,
        bluePrintsValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

