import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AdminRoute from './AdminRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
// Importe suas outras páginas aqui se necessário (Ex: Alunos, Contratos)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Redirecionamento automático: Raiz -> Dashboard */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Rota do Dashboard liberada */}
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            } 
          />
          
          {/* Rota de Login (opcional, fica acessível mas não é obrigatória) */}
          <Route path="/login" element={<Login />} />

          {/* Qualquer erro joga para o Dashboard */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;