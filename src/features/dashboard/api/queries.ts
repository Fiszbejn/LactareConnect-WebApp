import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/client';
import type { Agendamento, Campanha, Doacao, Endereco, Nutriz } from '../../../shared/api/types';

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
