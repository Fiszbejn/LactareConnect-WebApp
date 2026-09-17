import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  Administrador,
  Agendamento,
  Campanha,
  CreateRelatorioGeradoInput,
  Doacao,
  Endereco,
  ExamePreDoacao,
  Nutriz,
  Recompensa,
  RegiaoAtendimento,
  RelatorioGerado,
  Resgate,
} from './types';

export function useNutrizes() {
  return useQuery({
    queryKey: ['nutrizes'],
    queryFn: async () => (await apiClient.get<Nutriz[]>('/nutrizes')).data,
  });
}

export function useEnderecos() {
  return useQuery({
    queryKey: ['enderecos'],
    queryFn: async () => (await apiClient.get<Endereco[]>('/enderecos')).data,
  });
}

export function useDoacoes() {
  return useQuery({
    queryKey: ['doacoes'],
    queryFn: async () => (await apiClient.get<Doacao[]>('/doacoes')).data,
  });
}

export function useCampanhas() {
  return useQuery({
    queryKey: ['campanhas'],
    queryFn: async () => (await apiClient.get<Campanha[]>('/campanhas')).data,
  });
}

export function useAgendamentos() {
  return useQuery({
    queryKey: ['agendamentos'],
    queryFn: async () => (await apiClient.get<Agendamento[]>('/agendamentos')).data,
  });
}

export function useRegioesAtendimento() {
  return useQuery({
    queryKey: ['regioes-atendimento'],
    queryFn: async () => (await apiClient.get<RegiaoAtendimento[]>('/regioes-atendimento')).data,
  });
}

export function useExamesPreDoacao() {
  return useQuery({
    queryKey: ['exames-pre-doacao'],
    queryFn: async () => (await apiClient.get<ExamePreDoacao[]>('/exames-pre-doacao')).data,
  });
}

export function useResgates() {
  return useQuery({
    queryKey: ['resgates'],
    queryFn: async () => (await apiClient.get<Resgate[]>('/resgates')).data,
  });
}

export function useRecompensas() {
  return useQuery({
    queryKey: ['recompensas'],
    queryFn: async () => (await apiClient.get<Recompensa[]>('/recompensas')).data,
  });
}

export function useAdministradores() {
  return useQuery({
    queryKey: ['administradores'],
    queryFn: async () => (await apiClient.get<Administrador[]>('/administradores')).data,
  });
}

export function useRelatoriosGerados() {
  return useQuery({
    queryKey: ['relatorios-gerados'],
    queryFn: async () => (await apiClient.get<RelatorioGerado[]>('/relatorios-gerados')).data,
  });
}

export function useCreateRelatorioGerado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateRelatorioGeradoInput) =>
      (await apiClient.post<RelatorioGerado>('/relatorios-gerados', input)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relatorios-gerados'] });
    },
  });
}
