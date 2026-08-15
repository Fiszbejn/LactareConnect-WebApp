export type NutrizStatus = 'pendente' | 'aprovada' | 'inativa';

export type Nutriz = {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  email: string;
  status: NutrizStatus;
  saldoGotinhas: number;
  dataCadastro: string;
  enderecoId: number | null;
  preferenciasId: number | null;
};

export type Endereco = {
  id: number;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  nutrizId: number;
};

export type Doacao = {
  id: number;
  volumeMl: number;
  dataColeta: string;
  nutrizId: number;
  agendamentoId: number | null;
};

export type CampanhaCanal = 'email' | 'push' | 'sms' | 'whatsapp' | 'inapp';

export type Campanha = {
  id: number;
  nome: string;
  canal: CampanhaCanal;
  enviados: number;
  aberturas: number;
  cliques: number;
  dataEnvio: string;
};

export type AgendamentoStatus = 'agendado' | 'realizado' | 'cancelado';

export type Agendamento = {
  id: number;
  dataColeta: string;
  horario: string;
  status: AgendamentoStatus;
  nutrizId: number | null;
  regiaoAtendimentoId: number | null;
  doacaoId: number | null;
};

export type RegiaoAtendimento = {
  id: number;
  nome: string;
  enderecoTexto: string;
  areaAtendimento: string;
  latitude: number | null;
  longitude: number | null;
};

export type ExameTipo =
  | 'carteira_pre_natal'
  | 'hemograma'
  | 'sorologias'
  | 'htlv'
  | 'sorologia_hiv'
  | 'vdrl'
  | 'sorologia_hepatites_b_c';

export type ExameStatus = 'ok' | 'pendente' | 'faltando';

export type ExamePreDoacao = {
  id: number;
  tipoExame: ExameTipo;
  status: ExameStatus;
  arquivoUrl: string | null;
  dataEnvio: string | null;
  nutrizId: number | null;
};

export type ResgateStatus = 'pendente' | 'enviado' | 'concluido';

export type Resgate = {
  id: number;
  status: ResgateStatus;
  enderecoEntrega: string | null;
  data: string;
  nutrizId: number | null;
  recompensaId: number | null;
};

export type Recompensa = {
  id: number;
  nome: string;
  parceiro: string;
  categoria: string;
  custoGotinhas: number;
  estoque: number;
  ativo: boolean;
  imagemUrl: string | null;
};

export type Administrador = {
  id: number;
  nome: string;
  email: string;
  papel: string;
  regiaoAtendimentoVinculadaId: number | null;
};

export type RelatorioFormato = 'pdf_completo' | 'pdf_resumo' | 'csv';

export type RelatorioGerado = {
  id: number;
  periodoInicio: string;
  periodoFim: string;
  secoesIncluidas: string;
  formato: RelatorioFormato;
  arquivoUrl: string | null;
  dataGeracao: string;
  administradorId: number | null;
};

export type CreateRelatorioGeradoInput = {
  periodoInicio: string;
  periodoFim: string;
  secoesIncluidas: string;
  formato: RelatorioFormato;
  administradorId: number;
};
