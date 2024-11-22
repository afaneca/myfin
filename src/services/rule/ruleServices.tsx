import { axios } from '../../data/axios.ts';
import { Account } from '../auth/authServices.ts';
import { Entity } from '../trx/trxServices.ts';
import { Category } from '../category/categoryServices.ts';

export enum RuleMatchingOperatorType {
  Ignore = 'IG',
  Equals = 'EQ',
  NotEquals = 'NEQ',
  Contains = 'CONTAINS',
  NotContains = 'NOTCONTAINS',
}

export type Rule = {
  rule_id: bigint;
  assign_account_from_id?: bigint;
  assign_account_to_id?: bigint;
  assign_category_id?: bigint;
  assign_entity_id?: bigint;
  assign_is_essential?: number;
  assign_type?: string;
  matcher_account_from_id_operator?: string;
  matcher_account_from_id_value?: bigint;
  matcher_account_to_id_operator?: string;
  matcher_account_to_id_value?: bigint;
  matcher_amount_operator?: string;
  matcher_amount_value?: string;
  matcher_description_operator?: string;
  matcher_description_value?: string;
  matcher_type_operator?: string;
  matcher_type_value?: string;
};

export type GetRulesResponse = {
  rules: Rule[];
  accounts: Account[];
  entities: Entity[];
  categories: Category[];
};
const getRules = () => {
  return axios.get<GetRulesResponse>(`/rules`);
};

const addRule = (request: Partial<Rule>) => {
  // Remove null values from request
  const cleanedRequest = Object.fromEntries(
    Object.entries({
      ...request,
      matcher_amount_value: String(request.matcher_amount_value),
      assign_essential: request.assign_is_essential,
      users_user_id: undefined,
      assign_is_essential: undefined,
    }).filter(([_, value]) => value !== null),
  );

  return axios.post(`/rules`, cleanedRequest);
};

const removeRule = (id: bigint) => {
  return axios.delete(`/rules`, { data: { rule_id: id } });
};

const editRule = (request: Rule) => {
  // Remove null values from request
  const cleanedRequest = Object.fromEntries(
    Object.entries({
      ...request,
      matcher_amount_value: String(request.matcher_amount_value),
      assign_essential: request.assign_is_essential,
      users_user_id: undefined,
      assign_is_essential: undefined,
    }).filter(([_, value]) => value !== null),
  );

  return axios.put(`/rules`, cleanedRequest);
};

export default {
  getRules,
  addRule,
  removeRule,
  editRule,
};
