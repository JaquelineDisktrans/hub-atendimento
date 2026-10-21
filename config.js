/* Configuração do Hub no Netlify. Só valores PÚBLICOS: URL do projeto e chave anon/publishable.
   Sem login, essa chave não lê nada (as tabelas só respondem a usuários logados).
   Nunca coloque a chave service_role/secret aqui. */
window.HUB_CONFIG = {
  supabaseUrl: 'https://ijhmawbhhkuvbgzgwgsz.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqaG1hd2JoaGt1dmJnemd3Z3N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNDMwMDEsImV4cCI6MjEwNzkxOTAwMX0.ATY2dZAju66hRAq8PF6DnsozNWvkDwVUdeVo8RkC6to',
  admins: []  // não usado: o papel (admin/leitor) fica no banco, em hub_pessoas, e muda pela tela Pessoas e acessos
};
