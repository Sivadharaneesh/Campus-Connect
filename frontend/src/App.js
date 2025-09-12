import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import Dash from "./pages/dashboardreal";
import Dashboard from "./pages/Dashboard";
import Dashboardad from './pages/Dashboardad';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <AuthProvider>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard" element={<Dash />} />
        <Route path="/dashedit" element={<Dashboard />} />
        <Route path="/admin" element={
              <PrivateRoute adminOnly={true}>
                <AdminPanel />
              </PrivateRoute>
            } />
            <Route path="/d" element={
              <PrivateRoute>
                <Dashboardad />
              </PrivateRoute>
            } />
      </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
