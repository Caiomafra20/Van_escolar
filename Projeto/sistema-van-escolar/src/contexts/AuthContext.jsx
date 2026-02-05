import { createContext, useState, useEffect } from "react";
import { auth } from "../services/firebase"; 

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  // --- AQUI ESTÁ A SOLUÇÃO DOS DADOS VAZIOS ---
  // 1. Vá no Firebase > Authentication e copie seu UID.
  // 2. Cole ele dentro das aspas abaixo.
  // Se você deixar "uid_falso", o sistema abre mas NÃO mostra seus gráficos antigos.
  const MEU_UID = "BW0IUvzth3fgm2gtjxRByuXND0c2"; 
  
  const [user, setUser] = useState({
    uid: MEU_UID, 
    displayName: "Wilma (Admin)",
    email: "admin@wilma.com",
    photoURL: null
  });

  const [loading, setLoading] = useState(false);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;