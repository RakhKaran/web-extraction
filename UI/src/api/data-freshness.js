import axiosInstance from 'src/utils/axios';

// Create freshness check configuration
export const createFreshnessCheck = async (data) => {
  const response = await axiosInstance.post('/data-freshness', data);
  return response.data;
};

// Get all freshness check configurations
export const getFreshnessChecks = async () => {
  const response = await axiosInstance.get('/data-freshness');
  return response.data;
};

// Get single freshness check configuration
export const getFreshnessCheckById = async (id) => {
  const response = await axiosInstance.get(`/data-freshness/${id}`);
  return response.data;
};

// Update freshness check configuration
export const updateFreshnessCheck = async (id, data) => {
  const response = await axiosInstance.patch(`/data-freshness/${id}`, data);
  return response.data;
};

// Delete freshness check configuration
export const deleteFreshnessCheck = async (id) => {
  const response = await axiosInstance.delete(`/data-freshness/${id}`);
  return response.data;
};

// Run freshness check manually
export const runFreshnessCheck = async (id) => {
  const response = await axiosInstance.post(`/data-freshness/${id}/run`);
  return response.data;
};

// Pause freshness check
export const pauseFreshnessCheck = async (id) => {
  const response = await axiosInstance.post(`/data-freshness/${id}/pause`);
  return response.data;
};

// Resume freshness check
export const resumeFreshnessCheck = async (id) => {
  const response = await axiosInstance.post(`/data-freshness/${id}/resume`);
  return response.data;
};

// Get freshness check logs
export const getFreshnessCheckLogs = async (id, limit = 10, skip = 0) => {
  const response = await axiosInstance.get(`/data-freshness/${id}/logs`, {
    params: { limit, skip },
  });
  return response.data;
};

// Get freshness check statistics
export const getFreshnessCheckStats = async (id) => {
  const response = await axiosInstance.get(`/data-freshness/${id}/stats`);
  return response.data;
};
