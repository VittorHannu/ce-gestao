export const formatDateOnly = (dateString) => {
  if (!dateString) return 'Não informado';
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
