import { axios } from '../../data/axios.ts';

export enum CategoryStatus {
  Active = 'Ativa',
  Inactive = 'Inativa',
}

export type Category = {
  category_id: bigint;
  color_gradient: string;
  description?: string;
  exclude_from_budgets: 0 | 1;
  name: string;
  status: CategoryStatus;
  type: string;
  users_user_id: bigint;
};

const getCategories = () => {
  return axios.get<Category[]>(`/cats`);
};

export type AddCategoryRequest = {
  name: string;
  description?: string;
  color_gradient: string;
  status: CategoryStatus;
  exclude_from_budgets: boolean;
};

const addCategory = (request: AddCategoryRequest) => {
  return axios.post('/cats', request);
};

export type EditCategoryRequest = {
  category_id: bigint;
  new_name: string;
  new_description?: string;
  new_color_gradient: string;
  new_status: CategoryStatus;
  new_exclude_from_budgets: boolean;
};

const editCategory = (request: EditCategoryRequest) => {
  return axios.put('/cats', request);
};

const removeCategory = (id: bigint) => {
  return axios.delete<string>(`/cats`, { data: { category_id: id } });
};

export default {
  getCategories,
  addCategory,
  editCategory,
  removeCategory,
};
