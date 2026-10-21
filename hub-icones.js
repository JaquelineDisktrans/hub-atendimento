/* hub-icones.js — biblioteca de ícones e paleta do Hub Disktrans.
   Ícones: traço, viewBox 24, stroke 2, pontas redondas. A chave é o que fica gravado.
   Paleta: só cores da marca Disktrans [rótulo, clara, escura]. Verde é exclusivo de ESG. */
window.HUB_ICONES = {
  // Equipamentos e pós-venda
  transpaleteira: ['Transpaleteira', '<path d="M5 3l3.5 12"/><path d="M4 4.5h3"/><path d="M8.5 15H21v3H8"/><circle cx="8" cy="19.5" r="1.5"/><circle cx="19" cy="19.5" r="1.5"/>', 'Equipamentos'],
  empilhadeira: ['Empilhadeira patolada', '<path d="M3 18V8h5l3 5v5"/><path d="M15 3v15M15 15h6M3 13h8"/><circle cx="6" cy="19.5" r="1.5"/><circle cx="11" cy="19.5" r="1.5"/>', 'Equipamentos'],
  troca: ['Troca', '<path d="M4 8h14l-3-3"/><path d="M20 16H6l3 3"/>', 'Equipamentos'],
  ferramenta: ['Oficina', '<path d="M14.7 6.3a4 4 0 005 5l-8.4 8.4a2.6 2.6 0 01-3.7-3.7z"/><path d="M14.7 6.3 17 4l3 3-2.3 2.3"/>', 'Equipamentos'],
  bateria: ['Bateria', '<rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 11v2M11 9l-2 3h4l-2 3"/>', 'Equipamentos'],
  // Logística
  caminhao: ['Caminhão', '<path d="M3 6h11v10H3z"/><path d="M14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>', 'Logística'],
  palete: ['Palete', '<rect x="5" y="5" width="14" height="11" rx="1"/><path d="M5 10.5h14M3 16h18M5 16v4M12 16v4M19 16v4"/>', 'Logística'],
  armazem: ['Armazém / CD', '<path d="M3 21V9l9-6 9 6v12"/><path d="M7 21v-8h10v8M7 17h10"/>', 'Logística'],
  unidade: ['Unidade', '<path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>', 'Logística'],
  mapa: ['Mapa / rota', '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>', 'Logística'],
  lista: ['Checklist', '<path d="M10 6h11M10 12h11M10 18h11"/><path d="m3 6 1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17"/>', 'Logística'],
  // Dados
  grafico: ['Barras', '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', 'Dados'],
  linha: ['Linha', '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>', 'Dados'],
  painel: ['Painel', '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>', 'Dados'],
  velocimetro: ['SLA / velocímetro', '<path d="M4 18a8 8 0 1116 0"/><path d="m12 18 4-6"/>', 'Dados'],
  tabela: ['Tabela', '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>', 'Dados'],
  banco: ['Banco de dados', '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>', 'Dados'],
  ia: ['IA / brilho', '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>', 'Dados'],
  // Atendimento e comercial
  conversa: ['Conversa / WhatsApp', '<path d="M21 11.5a8.4 8.4 0 01-12.2 7.5L3 21l1.9-5.7A8.5 8.5 0 1121 11.5z"/>', 'Atendimento'],
  email: ['E-mail', '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', 'Atendimento'],
  apresentacao: ['Apresentação', '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v4M8 20h8M7 12l3-3 2 2 4-4"/>', 'Atendimento'],
  alvo: ['Meta', '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>', 'Atendimento'],
  // Gestão
  pessoas: ['Pessoas', '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14a6 6 0 013.5 6"/>', 'Gestão'],
  dinheiro: ['Dinheiro', '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/>', 'Gestão'],
  calendario: ['Calendário', '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>', 'Gestão'],
  relogio: ['Relógio / aging', '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/>', 'Gestão'],
  alerta: ['Alerta', '<path d="M10.3 3.9 2.4 17.5A1.8 1.8 0 004 20.2h16a1.8 1.8 0 001.6-2.7L13.7 3.9a1.9 1.9 0 00-3.4 0z"/><path d="M12 9v4M12 17h.01"/>', 'Gestão'],
  documento: ['Documento', '<path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>', 'Gestão'],
  folha: ['ESG / folha', '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19c3-4 6-6 9-7"/>', 'Gestão']
};

window.HUB_CORES = {
  laranja: ['Laranja (marca)', '#F4941D', '#B9690A'],
  azul:    ['Azul (marca)',    '#1A6BB8', '#004C96'],
  navy:    ['Azul naval',      '#0B3A8C', '#022064'],
  medio:   ['Azul médio',      '#3B9AE0', '#0A7AC9'],
  carvao:  ['Carvão',          '#4A4F60', '#2C303E'],
  cinza:   ['Cinza',           '#94A3B8', '#64748B'],
  verde:   ['Verde ESG (só sustentabilidade)', '#6E8A7E', '#506A5F']
};
