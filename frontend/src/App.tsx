import { Route, Routes, Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ToastProvider } from './components/ui/Toast';
import DashboardPage from './pages/Dashboard';
import GroupsPage from './pages/Groups';
import ExpensesPage from './pages/Expenses';
import BalancesPage from './pages/Balances';
import TransactionsPage from './pages/Transactions';
import ReportsPage from './pages/Reports';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import { RequireAuth, useAuth } from './lib/auth';

function ProtectedLayout() {
  return (
    <RequireAuth>
      <div className="min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-5 lg:px-8">
          <Sidebar />
          <main className="flex-1">
            <Navbar />
            <Outlet />
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}

function App() {
  const { user } = useAuth();

  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignupPage />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/balances" element={<BalancesPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}

export default App;
