//
import axios from 'axios';
// config
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/me',
    login: '/login',
    register: '/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
   company:{
    list: '/companies',
    filterList: (filter) => `/companies?filter=${filter}`,
    details: (id) => `/companies/${id}`,
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
  scheduler: {
    list: '/schedulers',
    filterList: (filter) => `/schedulers?filter=${filter}`,
    details: (id) => `/schedulers/${id}`,
  },
  companyList:{
    list: '/company-lists',
    filterList: (filter) => `/company-lists?filter=${filter}`,
    details: (id) => `/company-lists/${id}`,
  },
  designation: {
    list: '/designations',
    filterList: (filter) => `/designations?filter=${filter}`,
    details: (id) => `/designations/${id}`,
  },
  workflows: {
    list: '/workflows',
    filterList: (filter) => `/workflows?filter=${filter}`,
    details: (id) => `/workflows/${id}`,
    bluePrint: (id) => `/workflow-blueprints/workflow/${id}`
  },
  workflowInstance: {
    list: '/workflow-instances',
    filterList: (filter) => `/workflow-instances?filter=${filter}`,
    details: (id) => `/workflow-instances/${id}`,
  },
};
