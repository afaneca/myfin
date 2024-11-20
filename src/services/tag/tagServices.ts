import { Tag } from '../trx/trxServices.ts';
import { axios } from '../../data/axios.ts';

export type TagPageResponse = {
  filtered_count: number;
  total_count: number;
  results: Tag[];
};

const getTags = (page: number, page_size?: number, query?: string) => {
  return axios.get<TagPageResponse>(`/tags/filteredByPage/${page}`, {
    params: {
      page_size,
      query,
    },
  });
};

export type AddTagRequest = {
  name: string;
  description: string;
};

const addTag = (request: AddTagRequest) => {
  return axios.post(`/tags`, request);
};

export type EditTagRequest = {
  tag_id: bigint;
  new_name: string;
  new_description: string;
};

const editTag = (request: EditTagRequest) => {
  return axios.put(`/tags/${request.tag_id}`, {
    new_name: request.new_name,
    new_description: request.new_description,
  });
};

const removeTag = (tagId: bigint) => {
  return axios.delete<string>(`/tags/${tagId}`);
};

export default {
  getTags,
  addTag,
  editTag,
  removeTag,
};
