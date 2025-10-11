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
import Rules from '../features/rules/Rules.tsx';
import Invest, { InvestTab } from '../features/invest/Invest.tsx';
import Stats, { StatTab } from '../features/stats/Stats.tsx';
import RecoverPassword from '../features/auth/RecoverPassword.tsx';
import Setup from '../features/setup/Setup.tsx';

export const ROUTE_AUTH = '/auth';
export const ROUTE_RECOVER_PASSWORD = '/recover-password';
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
export const ROUTE_RULES = '/rules';
export const ROUTE_INVEST = '/invest';
export const ROUTE_INVEST_DASHBOARD = '/invest/dashboard';
export const ROUTE_INVEST_ASSETS = '/invest/assets';
export const ROUTE_INVEST_TRANSACTIONS = '/invest/transactions';
export const ROUTE_INVEST_STATS = '/invest/stats';
export const ROUTE_STATS = '/stats';
export const ROUTE_STATS_PATRIMONY_EVO = '/stats/patrimony';
export const ROUTE_STATS_PROJECTIONS = '/stats/projections';
export const ROUTE_STATS_EXPENSES = '/stats/expenses';
export const ROUTE_STATS_INCOME = '/stats/income';
export const ROUTE_STATS_YEAR_BY_YEAR = '/stats/year-by-year';
export const ROUTE_SETUP = '/setup';

const RoutesProvider = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path={ROUTE_AUTH} element={<Login />} />
        <Route path={ROUTE_RECOVER_PASSWORD} element={<RecoverPassword />} />
        <Route path={ROUTE_SETUP} element={<Setup />} />
        <Route element={<PrivateRoute />}>
          {/* Private authenticated routes */}
          <Route path={ROUTE_DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTE_PROFILE} element={<Profile />} />
          <Route path={ROUTE_TRX} element={<Transactions />} />
          <Route path={ROUTE_BUDGETS} element={<BudgetList />} />
          <Route path={ROUTE_BUDGET_DETAILS} element={<BudgetDetails />} />
          <Route path={ROUTE_BUDGET_NEW} element={<BudgetDetails />} />
          <Route path={ROUTE_ACCOUNTS} element={<Accounts />} />
          <Route path={ROUTE_CATEGORIES} element={<Categories />} />
          <Route path={ROUTE_ENTITIES} element={<Entities />} />
          <Route path={ROUTE_TAGS} element={<Tags />} />
          <Route path={ROUTE_IMPORT_TRX} element={<ImportTransactions />} />
          <Route path={ROUTE_RULES} element={<Rules />} />
          <Route path={ROUTE_INVEST} element={<Invest />} />
          <Route
            path={ROUTE_INVEST_DASHBOARD}
            element={<Invest defaultTab={InvestTab.Summary} />}
          />
          <Route
            path={ROUTE_INVEST_ASSETS}
            element={<Invest defaultTab={InvestTab.Assets} />}
          />
          <Route
            path={ROUTE_INVEST_TRANSACTIONS}
            element={<Invest defaultTab={InvestTab.Transactions} />}
          />
          <Route
            path={ROUTE_INVEST_STATS}
            element={<Invest defaultTab={InvestTab.Reports} />}
          />
          <Route path={ROUTE_STATS} element={<Stats />} />
          <Route
            path={ROUTE_STATS_PATRIMONY_EVO}
            element={<Stats defaultTab={StatTab.PatrimonyEvolution} />}
          />
          <Route
            path={ROUTE_STATS_PROJECTIONS}
            element={<Stats defaultTab={StatTab.Projections} />}
          />
          <Route
            path={ROUTE_STATS_EXPENSES}
            element={<Stats defaultTab={StatTab.Expenses} />}
          />
          <Route
            path={ROUTE_STATS_INCOME}
            element={<Stats defaultTab={StatTab.Income} />}
          />
          <Route
            path={ROUTE_STATS_YEAR_BY_YEAR}
            element={<Stats defaultTab={StatTab.YearByYear} />}
          />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default RoutesProvider;
