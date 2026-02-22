import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import type {
  Solicitacao,
  Aluno,
  AlunoSolicitado,
  DadosContrato,
  Mensalidade,
} from "@/lib/data"
import { gerarMensalidades } from "@/lib/data"

// --- SOLICITACOES ---

export async function criarSolicitacao(
  data: Omit<Solicitacao, "id" | "status" | "criadoEm">
): Promise<string> {
  const docRef = await addDoc(collection(db, "solicitacoes"), {
    ...data,
    status: "pendente",
    criadoEm: new Date().toISOString(),
  })
  return docRef.id
}

export async function listarSolicitacoes(
  statusFilter?: string
): Promise<Solicitacao[]> {
  let q
  if (statusFilter) {
    q = query(
      collection(db, "solicitacoes"),
      where("status", "==", statusFilter),
      orderBy("criadoEm", "desc")
    )
  } else {
    q = query(collection(db, "solicitacoes"), orderBy("criadoEm", "desc"))
  }
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Solicitacao)
}

export async function atualizarSolicitacao(
  id: string,
  data: Partial<Solicitacao>
): Promise<void> {
  await updateDoc(doc(db, "solicitacoes", id), data as Record<string, unknown>)
}

// --- ALUNOS ---

export async function criarAluno(aluno: Omit<Aluno, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, "alunos"), aluno)
  return docRef.id
}

export async function listarAlunos(): Promise<Aluno[]> {
  const q = query(collection(db, "alunos"), orderBy("criadoEm", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Aluno)
}

export async function buscarAluno(id: string): Promise<Aluno | null> {
  const snap = await getDoc(doc(db, "alunos", id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Aluno
}

export async function atualizarAluno(
  id: string,
  data: Partial<Aluno>
): Promise<void> {
  await updateDoc(doc(db, "alunos", id), data as Record<string, unknown>)
}

// --- APROVAR SOLICITACAO ---

export async function aprovarSolicitacao(
  solicitacao: Solicitacao,
  alunosSolicitados: AlunoSolicitado[],
  endereco: string,
  contrato: DadosContrato
): Promise<string[]> {
  const mensalidades = gerarMensalidades(contrato)
  const alunoIds: string[] = []

  for (const al of alunosSolicitados) {
    const alunoData: Omit<Aluno, "id"> = {
      solicitacaoId: solicitacao.id!,
      nome: al.nome,
      escola: al.escola,
      turno: al.turno,
      responsavel_nome: solicitacao.responsavel_nome,
      responsavel_cpf: solicitacao.responsavel_cpf,
      telefone: solicitacao.telefone,
      endereco,
      contrato,
      mensalidades,
      status: "ativo",
      criadoEm: new Date().toISOString(),
    }
    const id = await criarAluno(alunoData)
    alunoIds.push(id)
  }

  await atualizarSolicitacao(solicitacao.id!, { status: "aprovado" })
  return alunoIds
}

export async function rejeitarSolicitacao(id: string): Promise<void> {
  await atualizarSolicitacao(id, { status: "rejeitado" })
}

// --- PAGAMENTOS ---

export async function registrarPagamento(
  alunoId: string,
  parcelaIndex: number,
  aluno: Aluno
): Promise<void> {
  const mensalidades = [...aluno.mensalidades]
  mensalidades[parcelaIndex] = {
    ...mensalidades[parcelaIndex],
    status: "pago",
    multa: 0,
    dataPagamento: new Date().toISOString().split("T")[0],
  }
  await atualizarAluno(alunoId, { mensalidades })
}

// --- UPLOAD CONTRATO ---

export async function uploadContratoAssinado(
  alunoId: string,
  file: File
): Promise<string> {
  const storageRef = ref(storage, `contratos/${alunoId}/${file.name}`)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  await atualizarAluno(alunoId, { contratoAssinadoUrl: url })
  return url
}
