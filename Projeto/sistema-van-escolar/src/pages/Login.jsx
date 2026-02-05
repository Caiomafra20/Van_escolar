import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
// O seu import já está correto agora:
import { auth } from '../services/firebase'; 
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // MUDANÇA IMPORTANTE: Redireciona para o Dashboard protegido, não para a Home
      navigate('/admin/dashboard'); 
    } catch (err) {
      setError("Erro ao acessar: Verifique e-mail e senha.");
    }
  };

  return (
    <div id="login-screen" style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'var(--primary)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'}}>
      <div className="login-card" style={{background: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '380px', textAlign: 'center'}}>
        {/* MUDANÇA VISUAL: Nome do projeto */}
        <h2 style={{color:'var(--primary)', marginBottom:'5px'}}>Gestão Tia Wilma</h2>
        <p style={{color:'#64748b', marginBottom:'20px'}}>Área Administrativa</p>
        
        <form onSubmit={handleLogin}>
            <input 
                type="email" 
                placeholder="Email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={{marginBottom:'10px', width:'100%', padding:'14px', border:'1px solid #ccc', borderRadius:'8px'}}
            />
            <input 
                type="password" 
                placeholder="Senha" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                style={{marginBottom:'20px', width:'100%', padding:'14px', border:'1px solid #ccc', borderRadius:'8px'}}
            />
            <button type="submit" className="btn" style={{width:'100%', padding:'14px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>
                ENTRAR
            </button>
        </form>
        
        {error && <p style={{color:'red', marginTop:'10px', fontSize:'13px'}}>{error}</p>}
      </div>
    </div>
  );
}