import tagServices, {
  AddTagRequest,
  EditTagRequest,
} from '../tag/tagServices.ts';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../../data/react-query.ts';

const QUERY_KEY_GET_ENTITIES = 'QUERY_KEY_GET_ENTITIES';

export function useGetTags(page: number, pageSize: number, query?: string) {
  async function getEntities() {
    const data = await tagServices.getTags(page, pageSize, query);
    return data.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_ENTITIES, page, pageSize, query],
    queryFn: getEntities,
    placeholderData: keepPreviousData,
  });
}

export function useRemoveTag() {
  async function removeTag(tagId: bigint) {
    const result = await tagServices.removeTag(tagId);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_ENTITIES],
    });
    return result;
  }

  return useMutation({
    mutationFn: removeTag,
  });
}

export function useAddTag() {
  async function addTag(request: AddTagRequest) {
    const result = await tagServices.addTag(request);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_ENTITIES],
    });
    return result;
  }

  return useMutation({
    mutationFn: addTag,
  });
}

export function useEditTag() {
  async function editTag(request: EditTagRequest) {
    const result = await tagServices.editTag(request);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_ENTITIES],
    });
    return result;
  }

  return useMutation({
    mutationFn: editTag,
  });
}
