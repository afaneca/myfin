import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from '../features/auth/Login.tsx';
import PrivateRoute from '../components/PrivateRoute.tsx';
import Dashboard from '../features/dashboard/Dashboard.tsx';
import Profile from '../features/profile/Profile.tsx';
import Transactions from '../features/transactions/Transactions.tsx';
import BudgetList from '../features/budgets/list/BudgetList.tsx';

export const ROUTE_AUTH = '/auth';
export const ROUTE_DASHBOARD = '/dashboard';
export const ROUTE_PROFILE = '/profile';
export const ROUTE_TRX = '/transactions';
export const ROUTE_BUDGETS = '/budgets';

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
          <Route path="*" element={<Navigate to="/auth" replace={true} />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default RoutesProvider;
