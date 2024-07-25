import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from '../features/auth/Login.tsx';
import PrivateRoute from '../components/PrivateRoute.tsx';
import Dashboard from '../features/dashboard/Dashboard.tsx';
import Profile from '../features/profile/Profile.tsx';
import Transactions from '../features/transactions/Transactions.tsx';
import BudgetList from '../features/budgets/list/BudgetList.tsx';
import BudgetDetails from '../features/budgets/details/BudgetDetails.tsx';
import Accounts from '../features/accounts/Accounts.tsx';
import Categories from '../features/categories/Categories.tsx';
import Entities from '../features/entities/Entities.tsx';
import Tags from '../features/tags/Tags.tsx';
import ImportTransactions from '../features/transactions/import/ImportTransactions.tsx';

export const ROUTE_AUTH = '/auth';
export const ROUTE_DASHBOARD = '/dashboard';
export const ROUTE_PROFILE = '/profile';
export const ROUTE_TRX = '/transactions';
export const ROUTE_BUDGETS = '/budgets';
export const ROUTE_BUDGET_DETAILS = '/budget/:id';
export const ROUTE_BUDGET_NEW = '/budget/new';
export const ROUTE_ACCOUNTS = '/accounts';
export const ROUTE_CATEGORIES = '/categories';
export const ROUTE_ENTITIES = '/entities';
export const ROUTE_TAGS = '/tags';
export const ROUTE_IMPORT_TRX = '/transactions/import';

const RoutesProvider = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path={`${ROUTE_AUTH}`} element={<Login />} />
        <Route element={<PrivateRoute />}>
          {/* Private authenticated routes */}
          <Route path={`${ROUTE_DASHBOARD}`} element={<Dashboard />} />
          <Route path={`${ROUTE_PROFILE}`} element={<Profile />} />
          <Route path={`${ROUTE_TRX}`} element={<Transactions />} />
          <Route path={`${ROUTE_BUDGETS}`} element={<BudgetList />} />
          <Route path={`${ROUTE_BUDGET_DETAILS}`} element={<BudgetDetails />} />
          <Route path={`${ROUTE_BUDGET_NEW}`} element={<BudgetDetails />} />
          <Route path={`${ROUTE_ACCOUNTS}`} element={<Accounts />} />
          <Route path={`${ROUTE_CATEGORIES}`} element={<Categories />} />
          <Route path={`${ROUTE_ENTITIES}`} element={<Entities />} />
          <Route path={`${ROUTE_TAGS}`} element={<Tags />} />
          <Route
            path={`${ROUTE_IMPORT_TRX}`}
            element={<ImportTransactions />}
          />
          <Route path="*" element={<Navigate to="/auth" replace={true} />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default RoutesProvider;
