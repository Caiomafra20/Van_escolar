import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { db } from '../services/firebaseConfig';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { FaUserPlus, FaTrash, FaWhatsapp, FaArrowLeft, FaCalendarAlt, FaMars, FaVenus, FaEllipsisH, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../styles/alunos.css';

export default function Alunos() {
  const { user } = useContext(AuthContext);
  const [alunos, setAlunos] = useState([]);
  const [view, setView] = useState('list');
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [mensalidadesAluno, setMensalidadesAluno] = useState([]);
  const [showModalForm, setShowModalForm] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showEditMensalidade, setShowEditMensalidade] = useState(null);

  const [form, setForm] = useState({
    nome: '', responsavel: '', telefone: '', escola: '', horario: 'Matutino', genero: 'Feminino', nascimento: ''
  });

  /* ===== CARREGAR ALUNOS ===== */
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "alunos"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, snap => {
      const lista = [];
      snap.forEach(doc => lista.push({ id: doc.id, ...doc.data() }));
      setAlunos(lista);
    });
    return () => unsub();
  }, [user]);

  /* ===== CARREGAR MENSALIDADES ===== */
  useEffect(() => {
    if (view === 'financeiro_aluno' && selectedAluno && user) {
      const q = query(collection(db, "transacoes"), where("uid", "==", user.uid));
      const unsub = onSnapshot(q, snap => {
        const lista = [];
        snap.forEach(doc => {
          const data = doc.data();
          if (data.desc?.toUpperCase().includes(selectedAluno.nome.toUpperCase())) {
            lista.push({ id: doc.id, ...data });
          }
        });
        lista.sort((a, b) => new Date(a.data) - new Date(b.data));
        setMensalidadesAluno(lista);
      });
      return () => unsub();
    }
  }, [view, selectedAluno, user]);

  /* ===== AÇÕES ===== */
  const handleSalvarAluno = async () => {
    if (!form.nome || !form.responsavel) return alert("Preencha obrigatórios!");
    await addDoc(collection(db, "alunos"), { ...form, uid: user.uid, status: 'ativo' });
    setShowModalForm(false);
    setForm({ nome: '', responsavel: '', telefone: '', escola: '', horario: 'Matutino', genero: 'Feminino', nascimento: '' });
  };

  const handleDeleteAluno = async () => {
    if (confirm("Excluir aluno?")) {
      await deleteDoc(doc(db, "alunos", selectedAluno.id));
      setView('list');
      setShowActionSheet(false);
    }
  };

  const fMoney = v => parseFloat(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const fDate = d => d.split('-').reverse().join('/');

  /* ===== TELA LISTA ===== */
  if (view === 'list') {
    return (
      <div className="view-section">
        <div className="alunos-header">
          <h2 className="alunos-title">👨‍🎓 Meus Alunos</h2>
          <button className="btn btn-novo" onClick={() => setShowModalForm(true)}>
            <FaUserPlus /> Novo
          </button>
        </div>

        <div className="alunos-list">
          {alunos.map(aluno => (
            <div key={aluno.id} className="card aluno-item" onClick={() => { setSelectedAluno(aluno); setView('details'); }}>
              <div className="aluno-avatar">🎓</div>
              <div className="aluno-info">
                <h4>{aluno.nome}</h4>
                <small>{aluno.escola}</small>
              </div>
              <span className="aluno-arrow">›</span>
            </div>
          ))}
        </div>

        {showModalForm && (
          <div className="modal">
            <div className="card modal-card">
              <h3>Novo Aluno</h3>
              <input placeholder="Nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
              <input placeholder="Responsável" value={form.responsavel} onChange={e => setForm({ ...form, responsavel: e.target.value })} />
              <input placeholder="Telefone" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
              <input placeholder="Escola" value={form.escola} onChange={e => setForm({ ...form, escola: e.target.value })} />
              <div className="modal-actions">
                <button className="btn btn-cancel" onClick={() => setShowModalForm(false)}>Cancelar</button>
                <button className="btn" onClick={handleSalvarAluno}>Salvar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ===== TELA DETALHES ===== */
  if (view === 'details' && selectedAluno) {
    return (
      <div className="aluno-details">
        <div className="aluno-details-header">
          <FaArrowLeft onClick={() => setView('list')} />
          <span>Detalhes do Aluno</span>
        </div>

        <div className="aluno-profile">
          <div className="aluno-avatar-large">
            {selectedAluno.genero === 'Masculino' ? <FaMars /> : <FaVenus />}
          </div>
          <h2>{selectedAluno.nome}</h2>
          <small>Responsável: {selectedAluno.responsavel}</small>
        </div>

        <div className="card">
          <div className="menu-item" onClick={() => window.open(`https://wa.me/55${selectedAluno.telefone}`)}>
            <FaWhatsapp /> WhatsApp <span>›</span>
          </div>
          <div className="divider" />
          <div className="menu-item" onClick={() => setView('financeiro_aluno')}>
            <FaCalendarAlt /> Ver Mensalidades <span>›</span>
          </div>
        </div>

        <div className="card info-card">
          <h4>Dados</h4>
          <p><b>Escola:</b> {selectedAluno.escola}</p>
          <p><b>Horário:</b> {selectedAluno.horario}</p>
        </div>

        <button className="fab" onClick={() => setShowActionSheet(true)}>
          <FaEllipsisH />
        </button>

        {showActionSheet && (
          <div className="action-sheet" onClick={() => setShowActionSheet(false)}>
            <div className="action-sheet-content" onClick={e => e.stopPropagation()}>
              <button className="btn btn-danger" onClick={handleDeleteAluno}>
                <FaTrash /> Excluir Aluno
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
