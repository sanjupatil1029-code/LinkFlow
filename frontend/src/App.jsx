import { Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/AppLayout';
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyLinks from './pages/MyLinks';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/links" element={<MyLinks />} />
            <Route path="/analytics/:shortCode" element={<Analytics />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1B1931',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#ED9E59', secondary: '#1B1931' } },
          error: { iconTheme: { primary: '#A34054', secondary: '#fff' } },
        }}
      />
    </>
  );
}
