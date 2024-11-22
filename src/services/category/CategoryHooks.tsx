import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '../../data/react-query.ts';
import CategoryServices, {
  AddCategoryRequest,
  EditCategoryRequest,
} from './categoryServices.ts';

const QUERY_KEY_GET_CATEGORIES = 'QUERY_KEY_GET_CATEGORIES';

export function useGetCategories() {
  async function getCategories() {
    const data = await CategoryServices.getCategories();
    return data.data;
  }

  return useQuery({
    queryKey: [QUERY_KEY_GET_CATEGORIES],
    queryFn: getCategories,
    placeholderData: keepPreviousData,
  });
}

export function useRemoveCategory() {
  async function removeCategory(CategoryId: bigint) {
    const result = await CategoryServices.removeCategory(CategoryId);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_CATEGORIES],
    });
    return result;
  }

  return useMutation({
    mutationFn: removeCategory,
  });
}

export function useAddCategory() {
  async function addCategory(request: AddCategoryRequest) {
    const result = await CategoryServices.addCategory(request);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_CATEGORIES],
    });
    return result;
  }

  return useMutation({
    mutationFn: addCategory,
  });
}

export function useEditCategory() {
  async function editCategory(request: EditCategoryRequest) {
    const result = await CategoryServices.editCategory(request);

    void queryClient.invalidateQueries({
      queryKey: [QUERY_KEY_GET_CATEGORIES],
    });
    return result;
  }

  return useMutation({
    mutationFn: editCategory,
  });
}
