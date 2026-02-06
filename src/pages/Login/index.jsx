import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch {
      setError('Falha no login. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      navigate('/admin/dashboard');
    } catch {
      setError('Erro ao entrar com Google.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-gray-200">
      <form 
        onSubmit={handleLogin} 
        className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg"
      >
        <h2 className="mb-2 text-3xl font-bold text-center text-gray-800">
          Acesso Tia Wilma
        </h2>
        <p className="mb-6 text-sm text-center text-gray-500">
          Entre com sua conta para continuar
        </p>

        {error && (
          <p className="mb-4 text-sm text-center text-red-500">
            {error}
          </p>
        )}

        <input 
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input 
          type="password"
          placeholder="Senha"
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button 
          type="submit"
          disabled={loading}
          className="w-full p-3 mb-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="px-3 text-sm text-gray-500">ou</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center w-full gap-3 p-3 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          <FcGoogle size={22} />
          <span className="text-sm font-medium">
            Entrar com Google
          </span>
        </button>
      </form>
    </div>
  );
}
