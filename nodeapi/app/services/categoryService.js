import { prisma } from '../config/prisma.js';

const Category = prisma.categories;
const BudgetHasCategories = prisma.budgets_has_categories;

const getAllCategoriesForUser = async (userId) =>
  Category.findMany({
    where: { users_user_id: userId },
  });
const createCategory = async (userId, category) => {
  const catDbObject = {
    ...category,
    ...{
      users_user_id: 1,
      type: 'M',
      exclude_from_budgets: +category.exclude_from_budgets,
    },
  };
  return Category.create({ data: catDbObject });
};

const deleteCategory = async (userId, categoryId) => {
  const deleteBudgetHasCategoriesRefs = BudgetHasCategories.deleteMany({
    where: {
      categories_category_id: categoryId,
      budgets_users_user_id: userId,
    },
  });
  const deleteCat = Category.delete({
    where: {
      users_user_id: userId,
      category_id: categoryId,
    },
  });

  return prisma.$transaction([deleteBudgetHasCategoriesRefs, deleteCat]);
};

const updateCategory = async (userId, category) =>
  Category.update({
    where: {
      users_user_id: userId,
      category_id: category.category_id,
    },
    data: {
      name: category.new_name,
      description: category.new_description,
      color_gradient: category.new_color_gradient,
      status: category.new_status,
      exclude_from_budgets: +category.new_exclude_from_budgets,
    },
  });

export default {
  getAllCategoriesForUser,
  createCategory,
  updateCategory,
  deleteCategory,
};
