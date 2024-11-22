import entityServices, {
  AddEntityRequest,
  EditEntityRequest,
} from '../entity/entityServices.ts';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../../data/react-query.ts';

const QUERY_KEY_GET_ENTITIES = 'QUERY_KEY_GET_ENTITIES';

export function useGetEntities() {
  async function getEntities() {
    const data = await entityServices.getEntities();
    return data.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_ENTITIES],
    queryFn: getEntities,
    placeholderData: keepPreviousData,
  });
}

export function useRemoveEntity() {
  async function removeEntity(entityId: bigint) {
    const result = await entityServices.removeEntity(entityId);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_ENTITIES],
    });
    return result;
  }

  return useMutation({
    mutationFn: removeEntity,
  });
}

export function useAddEntity() {
  async function addEntity(request: AddEntityRequest) {
    const result = await entityServices.addEntity(request);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_ENTITIES],
    });
    return result;
  }

  return useMutation({
    mutationFn: addEntity,
  });
}

export function useEditEntity() {
  async function editEntity(request: EditEntityRequest) {
    const result = await entityServices.editEntity(request);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_ENTITIES],
    });
    return result;
  }

  return useMutation({
    mutationFn: editEntity,
  });
}
