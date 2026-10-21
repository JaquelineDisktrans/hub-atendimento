/* hub.js — Hub Disktrans: menu, busca Ctrl K, favoritos, recentes, avisos e telas do hub.
   Lê tudo de window.HUB (§9). Sem biblioteca. Todo texto entra por textContent. */
(function () {
  'use strict';
  var H = window.HUB, html = document.documentElement;
  if (!H) { return; }
  var ICONES = window.HUB_ICONES || {}, CORES = window.HUB_CORES || {};

  // ── utilidades ─────────────────────────────────────────────────────────────
  function guardar(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function semAcento(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function el(tag, cls, txt) { var x = document.createElement(tag); if (cls) { x.className = cls; } if (txt != null) { x.textContent = txt; } return x; }
  function svg(paths, cls, cor) {
    return '<svg class="' + (cls || 'ic') + '" viewBox="0 0 24 24" fill="none" stroke="' + (cor || 'currentColor') +
      '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }
  var IC = {
    inicio: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
    buscar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    catalogo: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    avisos: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    pessoas: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><path d="M16 4.5a3.5 3.5 0 010 7M18 14a6 6 0 013.5 6"/>',
    gerenciar: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    recolher: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 10l-2 2 2 2"/>',
    expandir: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M13 10l2 2-2 2"/>',
    estrela: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', fechar: '<path d="M6 6l12 12M18 6 6 18"/>',
    seta: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  function areaCor(area) { return (H.areas || {})[area] || 'cinza'; }
  var PADRAO_AREA = { 'Pós-venda': 'troca', 'Logística': 'caminhao', 'Oficina': 'ferramenta', 'Comercial': 'alvo', 'Dados': 'grafico', 'Gestão': 'painel' };

  /** Hexágono de um app (HTML). Tamanho e cor inline para resistir a CSS de apps. */
  function hex(a, larg) {
    larg = larg || 44;
    var cor = CORES[a.cor || areaCor(a.area)] || CORES.cinza || ['', '#7C8AA3', '#64748B'];
    var ic = (ICONES[a.icone || PADRAO_AREA[a.area]] || ICONES.caixa || ['', ''])[1];
    var t = Math.round(larg * 0.48);
    return '<span class="hubhex" style="width:' + larg + 'px;height:' + Math.round(larg * 1.09) + 'px;background:linear-gradient(160deg,' + cor[1] + ' 0%,' + cor[2] + ' 100%)">' +
      '<svg viewBox="0 0 24 24" width="' + t + '" height="' + t + '" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ic + '</svg></span>';
  }
  /** Etiqueta da área: cor escura sobre a clara a 14%. */
  function etiqueta(area) {
    var c = CORES[areaCor(area)] || ['', '#7C8AA3', '#64748B'];
    var n = parseInt(c[1].slice(1), 16);
    var s = el('span', 'et', area);
    s.style.color = c[2];
    s.style.background = 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',.14)';
    return s;
  }
  /** App fora do hub (outro site): abre em nova aba. */
  function externo(href) { return /^https?:\/\//i.test(href || ''); }
  function alvoLink(a, href) { if (externo(href)) { a.target = '_blank'; a.rel = 'noopener'; } }
  function abrirHref(href) { if (!externo(href)) { location.href = href; return; } var a = document.createElement('a'); a.href = href; alvoLink(a, href); document.body.appendChild(a); a.click(); a.remove(); }
  function rota(t) { return (H.rotas || {})[t] || ('?ver=' + t); }
  function appsMeus() { return (H.apps || []).filter(function (a) { return a.pode && (a.ativo || H.admin); }); }
  function porPasta() { var m = {}; (H.apps || []).forEach(function (a) { m[a.pasta] = a; }); return m; }

  // ── MENU ───────────────────────────────────────────────────────────────────
  // Classes de modo aplicadas antes de pintar (repita esta linha no <head> para evitar o "pulo").
  html.classList.add('hubm-on', ler('hub-menu') === 'recolhido' ? 'hubm-recolhido' : 'hubm-expandido');

  function item(id, rotulo, extra) {
    var on = id === H.telaAtual;
    return '<a href="' + rota(id) + '" class="hubm-item' + (on ? ' on" aria-current="page' : '') + '" title="' + rotulo + '">' +
      svg(IC[id], 'hubm-ic') + '<span class="hubm-txt">' + rotulo + '</span>' + (extra || '') + '</a>';
  }
  function linhaApp(a, on) {
    var x = el('a', 'hubm-item hubm-app' + (on ? ' on' : ''));
    x.href = a.href; alvoLink(x, a.href); x.title = a.nome; x.setAttribute('data-pasta', a.pasta);
    if (on) { x.setAttribute('aria-current', 'page'); }
    x.insertAdjacentHTML('afterbegin', hex(a, 22));
    x.appendChild(el('span', 'hubm-txt', a.nome));
    return x;
  }
  function montarMenu() {
    var m = H.marca || {}, u = H.usuario || {};
    var nav = el('nav', 'hubm'); nav.id = 'hubMenu'; nav.setAttribute('aria-label', 'Menu do hub');
    nav.innerHTML =
      '<div class="hubm-topo"><a class="hubm-marca" href="' + rota('inicio') + '" aria-label="' + (m.nome || 'Hub') + ' — Início">' +
      (m.logoLargo
        ? '<span class="hubm-marca-col hubm-so-exp"><span class="hubm-logo">' + m.logoLargo + '</span><small></small></span><span class="hubm-selo hubm-so-rec">' + (m.logo || '') + '</span>'
        : '<span class="hubm-selo">' + (m.logo || '') + '</span><span class="hubm-txt"><b></b><small></small></span>') + '</a>' +
      '<button type="button" class="hubm-fechar" data-hubm-gaveta aria-label="Fechar menu">' + svg(IC.fechar, 'hubm-ic') + '</button></div>' +
      '<div class="hubm-grupo">' + item('inicio', 'Início') +
      '<button type="button" class="hubm-item" data-hubm-busca title="Buscar (Ctrl K)">' + svg(IC.buscar, 'hubm-ic') + '<span class="hubm-txt">Buscar</span><kbd class="hubm-txt">Ctrl K</kbd></button>' +
      item('catalogo', 'Catálogo') + item('avisos', 'Avisos', '<span class="hubm-conta" data-hubm-naolidos hidden></span>') + '</div>' +
      '<div class="hubm-grupo" id="hubmAberto" hidden><div class="hubm-titulo"><span class="hubm-txt">Aberto agora</span></div></div>' +
      '<div class="hubm-grupo" id="hubmFavoritos"><div class="hubm-titulo"><span class="hubm-txt">Favoritos</span></div></div>' +
      '<div class="hubm-pe">' +
      (H.admin ? item('gerenciar', 'Gerenciar apps', H.novos ? '<span class="hubm-conta">' + (+H.novos) + '</span>' : '') + item('pessoas', 'Pessoas e acessos') : '') +
      '<button type="button" class="hubm-item hubm-modo" data-hubm-modo><span class="hubm-so-exp">' + svg(IC.recolher, 'hubm-ic') + '</span><span class="hubm-so-rec">' + svg(IC.expandir, 'hubm-ic') + '</span><span class="hubm-txt">Recolher menu</span></button>' +
      '<div class="hubm-quem"><span class="hubm-ini"></span><span class="hubm-txt"><b></b><small></small></span></div></div>';
    if (nav.querySelector('.hubm-marca b')) { nav.querySelector('.hubm-marca b').textContent = m.nome || 'Hub'; }
    nav.querySelector('.hubm-marca small').textContent = m.sub || '';
    nav.querySelector('.hubm-ini').textContent = u.iniciais || '··';
    nav.querySelector('.hubm-quem b').textContent = u.nome || '';
    nav.querySelector('.hubm-quem small').textContent = u.papel ? u.papel.charAt(0).toUpperCase() + u.papel.slice(1) : '';
    nav.querySelector('.hubm-quem').title = u.nome || '';

    var abrir = el('button', 'hubm-abrir'); abrir.type = 'button'; abrir.setAttribute('data-hubm-gaveta', '');
    abrir.setAttribute('aria-label', 'Abrir o menu'); abrir.innerHTML = svg(IC.menu, 'hubm-ic');
    var veu = el('div', 'hubm-veu'); veu.setAttribute('data-hubm-gaveta', ''); veu.hidden = true;

    var pal = el('div', 'hubm-paleta'); pal.id = 'hubmPaleta'; pal.hidden = true;
    pal.innerHTML = '<div class="hubm-paleta-fundo" data-hubm-fechar-busca></div>' +
      '<div class="hubm-paleta-caixa" role="dialog" aria-modal="true" aria-label="Buscar">' +
      '<div class="hubm-paleta-campo">' + svg(IC.buscar, 'hubm-ic') +
      '<input type="search" id="hubmPaletaCampo" placeholder="Buscar aplicativo ou página…" autocomplete="off" role="combobox" aria-expanded="true" aria-controls="hubmPaletaLista" aria-autocomplete="list"><kbd>Esc</kbd></div>' +
      '<ul class="hubm-paleta-lista" id="hubmPaletaLista" role="listbox"></ul>' +
      '<div class="hubm-paleta-pe"><span><kbd>↑</kbd><kbd>↓</kbd> navegar</span><span><kbd>Enter</kbd> abrir</span><span><kbd>Ctrl K</kbd> abre e fecha</span></div></div>';

    document.body.prepend(nav, abrir, veu);
    document.body.appendChild(pal);

    var atual = H.appAtual ? porPasta()[H.appAtual] : null;
    if (atual && (H.favoritos || []).indexOf(atual.pasta) === -1) {
      var g = document.getElementById('hubmAberto'); g.appendChild(linhaApp(atual, true)); g.hidden = false;
    }
    desenharFavoritos();
  }
  function desenharFavoritos() {
    var g = document.getElementById('hubmFavoritos'); if (!g) { return; }
    g.querySelectorAll('.hubm-app, .hubm-dica').forEach(function (x) { x.remove(); });
    var mp = porPasta(), n = 0;
    (H.favoritos || []).forEach(function (p) { var a = mp[p]; if (a && a.pode) { g.appendChild(linhaApp(a, H.appAtual === p)); n++; } });
    if (!n) { g.appendChild(el('p', 'hubm-dica hubm-txt', 'Marque ★ nos apps do Início ou do Catálogo para eles ficarem aqui.')); }
  }

  // ── modo e gaveta ──────────────────────────────────────────────────────────
  function ligarMenu() {
    var modo = document.querySelector('[data-hubm-modo]');
    function rotular() {
      var rec = html.classList.contains('hubm-recolhido');
      modo.querySelector('.hubm-txt').textContent = rec ? 'Expandir menu' : 'Recolher menu';
      modo.title = rec ? 'Expandir o menu' : 'Recolher o menu';
      modo.setAttribute('aria-pressed', rec ? 'true' : 'false');
    }
    modo.addEventListener('click', function () {
      html.classList.add('hubm-anima');
      var rec = !html.classList.contains('hubm-recolhido');
      html.classList.toggle('hubm-recolhido', rec); html.classList.toggle('hubm-expandido', !rec);
      guardar('hub-menu', rec ? 'recolhido' : 'expandido'); rotular();
      setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 220);   // gráficos se ajustam
    });
    rotular();
    document.querySelectorAll('[data-hubm-gaveta]').forEach(function (x) {
      x.addEventListener('click', function () { gaveta(!html.classList.contains('hubm-gaveta')); });
    });
  }
  function gaveta(abrir) { html.classList.toggle('hubm-gaveta', abrir); document.querySelector('.hubm-veu').hidden = !abrir; }

  // ── busca Ctrl K ───────────────────────────────────────────────────────────
  var pal, campo, lista, itens = [], sel = 0, foco = null, todos = [];
  function ligarBusca() {
    pal = document.getElementById('hubmPaleta'); campo = document.getElementById('hubmPaletaCampo'); lista = document.getElementById('hubmPaletaLista');
    var paginas = [{ nome: 'Início', href: rota('inicio'), tipo: 'Página' }, { nome: 'Catálogo', href: rota('catalogo'), tipo: 'Página' }, { nome: 'Avisos', href: rota('avisos'), tipo: 'Página' }];
    if (H.admin) { paginas.push({ nome: 'Gerenciar apps', href: rota('gerenciar'), tipo: 'Admin' }, { nome: 'Pessoas e acessos', href: rota('pessoas'), tipo: 'Admin' }); }
    todos = appsMeus().map(function (a) {
      return { nome: a.nome, sub: a.resumo || a.area, href: a.href, tipo: a.area, hex: hex(a, 22), busca: semAcento(a.nome + ' ' + a.resumo + ' ' + a.area + ' ' + a.pasta) };
    }).concat(paginas.map(function (p) { return { nome: p.nome, sub: '', href: p.href, tipo: p.tipo, hex: '', busca: semAcento(p.nome) }; }));

    campo.addEventListener('input', function () { sel = 0; desenharBusca(); });
    campo.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); if (itens.length) { sel = (sel + 1) % itens.length; marcar(); } }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); if (itens.length) { sel = (sel - 1 + itens.length) % itens.length; marcar(); } }
      else if (ev.key === 'Enter') { ev.preventDefault(); if (itens[sel]) { fecharBusca(); abrirHref(itens[sel].href); } }
      else if (ev.key === 'Escape') { ev.preventDefault(); fecharBusca(); }
    });
    pal.querySelectorAll('[data-hubm-fechar-busca]').forEach(function (x) { x.addEventListener('click', fecharBusca); });
    document.querySelectorAll('[data-hubm-busca]').forEach(function (x) { x.addEventListener('click', function (ev) { ev.preventDefault(); abrirBusca(); }); });
  }
  function desenharBusca() {
    var t = semAcento(campo.value.trim());
    itens = todos.filter(function (i) { return !t || i.busca.indexOf(t) !== -1; }).slice(0, 12);
    if (sel >= itens.length) { sel = 0; }
    lista.textContent = '';
    if (!itens.length) { lista.appendChild(el('li', 'hubm-paleta-vazio', 'Nada encontrado para "' + campo.value + '".')); return; }
    itens.forEach(function (i, n) {
      var li = el('li', 'hubm-paleta-item' + (n === sel ? ' sel' : '')); li.id = 'hubm-op-' + n; li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', n === sel ? 'true' : 'false');
      var a = el('a'); a.href = i.href; alvoLink(a, i.href); a.tabIndex = -1;
      if (i.hex) { a.insertAdjacentHTML('afterbegin', i.hex); }
      var tx = el('span', 'hubm-paleta-txt'); tx.appendChild(el('b', '', i.nome)); if (i.sub) { tx.appendChild(el('small', '', i.sub)); }
      a.appendChild(tx); a.appendChild(el('span', 'hubm-paleta-tag', i.tipo)); li.appendChild(a);
      li.addEventListener('mousemove', function () { if (sel !== n) { sel = n; marcar(); } });
      lista.appendChild(li);
    });
    campo.setAttribute('aria-activedescendant', 'hubm-op-' + sel);
  }
  function marcar() {
    Array.prototype.forEach.call(lista.children, function (li, n) {
      li.classList.toggle('sel', n === sel); li.setAttribute('aria-selected', n === sel ? 'true' : 'false');
      if (n === sel && li.scrollIntoView) { li.scrollIntoView({ block: 'nearest' }); }
    });
    campo.setAttribute('aria-activedescendant', 'hubm-op-' + sel);
  }
  function abrirBusca() { foco = document.activeElement; gaveta(false); pal.hidden = false; campo.value = ''; sel = 0; desenharBusca(); campo.focus(); }
  function fecharBusca() { if (pal.hidden) { return; } pal.hidden = true; if (foco && foco.focus) { foco.focus(); } }

  // ── teclado ────────────────────────────────────────────────────────────────
  function digitando(x) { return x && (x.tagName === 'INPUT' || x.tagName === 'TEXTAREA' || x.tagName === 'SELECT' || x.isContentEditable); }
  var esperandoG = 0;
  document.addEventListener('keydown', function (ev) {
    if ((ev.ctrlKey || ev.metaKey) && !ev.altKey && (ev.key || '').toLowerCase() === 'k') {
      ev.preventDefault(); if (!pal.hidden) { fecharBusca(); } else { abrirBusca(); } return;
    }
    if (ev.key === 'Escape' && html.classList.contains('hubm-gaveta')) { gaveta(false); return; }
    // "/" e "G + letra" só nas telas do hub (dentro de app, as letras são do app)
    if (!H.telaAtual || digitando(ev.target) || ev.ctrlKey || ev.metaKey || ev.altKey || !pal.hidden) { return; }
    if (ev.key === '/') { ev.preventDefault(); abrirBusca(); return; }
    var k = (ev.key || '').toUpperCase();
    if (esperandoG && Date.now() - esperandoG < 1500) {
      esperandoG = 0;
      var alvo = appsMeus().filter(function (a) { return a.atalho === k; })[0];
      if (alvo) { abrirHref(alvo.href); }
      return;
    }
    if (k === 'G') { esperandoG = Date.now(); }
  });

  // ── avisos não lidos ───────────────────────────────────────────────────────
  function contarAvisos() {
    var visto = ler('hub-avisos-visto') || '';
    var n = (H.avisos || []).filter(function (a) { return a.criado_em > visto; }).length;
    document.querySelectorAll('[data-hubm-naolidos]').forEach(function (x) { x.textContent = n > 9 ? '9+' : String(n); x.hidden = n === 0; });
    return n;
  }

  // ── recentes ───────────────────────────────────────────────────────────────
  function anotarRecente() {
    if (!H.appAtual) { return; }
    try {
      var r = JSON.parse(ler('hub-recentes') || '[]'); if (!Array.isArray(r)) { r = []; }
      r = r.filter(function (x) { return x && x.pasta !== H.appAtual; });
      r.unshift({ pasta: H.appAtual, quando: Date.now() });
      guardar('hub-recentes', JSON.stringify(r.slice(0, 8)));
    } catch (e) {}
  }
  function quando(ms) {
    var min = Math.round((Date.now() - ms) / 60000);
    if (min < 1) { return 'agora'; } if (min < 60) { return 'há ' + min + ' min'; }
    var h = Math.round(min / 60); if (h < 24) { return 'há ' + h + ' h'; }
    var d = Math.round(h / 24); return d === 1 ? 'ontem' : 'há ' + d + ' dias';
  }

  // ── favoritos (otimista) ───────────────────────────────────────────────────
  /** Troque por uma chamada ao servidor que devolve a lista nova: Promise<string[]>. */
  window.hubFavoritar = window.hubFavoritar || function (pasta, sim) {
    var l = (H.favoritos || []).filter(function (p) { return p !== pasta; }); if (sim) { l.push(pasta); }
    return Promise.resolve(l);
  };
  function botaoEstrela(a) {
    var b = el('button', 'estrela'); b.type = 'button'; b.setAttribute('data-favorito', a.pasta);
    b.innerHTML = svg(IC.estrela, 'ic'); pintarEstrela(b, (H.favoritos || []).indexOf(a.pasta) !== -1, a.nome);
    return b;
  }
  function pintarEstrela(b, sim, nome) {
    b.classList.toggle('on', sim); b.setAttribute('aria-pressed', sim ? 'true' : 'false');
    b.title = sim ? 'Tirar dos favoritos' : 'Adicionar aos favoritos';
    if (nome) { b.setAttribute('aria-label', (sim ? 'Tirar ' : 'Adicionar ') + nome + (sim ? ' dos favoritos' : ' aos favoritos')); }
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-favorito]'); if (!b) { return; }
    ev.preventDefault(); ev.stopPropagation();
    var pasta = b.getAttribute('data-favorito'), sim = !b.classList.contains('on');
    var todosB = document.querySelectorAll('[data-favorito="' + CSS.escape(pasta) + '"]');
    todosB.forEach(function (x) { pintarEstrela(x, sim); }); b.disabled = true;
    window.hubFavoritar(pasta, sim).then(function (lista) {
      H.favoritos = lista; desenharFavoritos();
      document.querySelectorAll('[data-conta-favoritos]').forEach(function (x) { x.textContent = plural(lista.length, 'favorito', 'favoritos', 'nenhum favorito ainda'); });
    }).catch(function (e) { todosB.forEach(function (x) { pintarEstrela(x, !sim); }); alert('Não consegui salvar o favorito: ' + e.message); })
      .then(function () { b.disabled = false; });
  });
  function plural(n, um, varios, zero) { return n === 0 && zero ? zero : n + ' ' + (n === 1 ? um : varios); }

  // ── cartão de app (Início) e linha (Catálogo) ──────────────────────────────
  function selos(a, alvo) {
    alvo.appendChild(etiqueta(a.area));
    if (a.selo) { alvo.appendChild(el('span', 'selo', a.selo)); }
    if (!a.ativo) { var d = el('span', 'selo cinza', 'Desligado'); d.title = 'Só administradores veem'; alvo.appendChild(d); }
    if (H.admin && a.ativo && a.acesso === 'restrito') { alvo.appendChild(el('span', 'selo azul', 'Restrito · ' + (a.pessoas || []).length)); }
  }
  function cartaoApp(a) {
    var c = el('article', 'card app-card'); c.setAttribute('data-area', a.area);
    var topo = el('div', 'app-card-topo'); topo.insertAdjacentHTML('afterbegin', hex(a, 44)); topo.appendChild(botaoEstrela(a));
    var nome = el('a', 'app-card-nome', a.nome); nome.href = a.href; alvoLink(nome, a.href);
    var pe = el('span', 'app-card-pe'); selos(a, pe);
    c.append(topo, nome, el('span', 'app-card-resumo', a.resumo || 'Sem descrição'), pe);
    return c;
  }
  function chips(areas, aoEscolher) {
    var g = el('div', 'chips'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Filtrar por área');
    [''].concat(areas).forEach(function (ar, i) {
      var b = el('button', 'chip' + (i === 0 ? ' on' : ''), ar || 'Todas'); b.type = 'button';
      b.addEventListener('click', function () { g.querySelectorAll('.chip').forEach(function (o) { o.classList.toggle('on', o === b); }); aoEscolher(ar); });
      g.appendChild(b);
    });
    return g;
  }

  // ── TELAS ──────────────────────────────────────────────────────────────────
  var TELAS = {
    inicio: function (m) {
      var agora = new Date(), h = agora.getHours();
      var dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
      var meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      var apps = appsMeus().sort(function (a, b) {
        var fa = (H.favoritos || []).indexOf(a.pasta) === -1, fb = (H.favoritos || []).indexOf(b.pasta) === -1;
        return fa === fb ? a.nome.localeCompare(b.nome, 'pt-BR') : (fa ? 1 : -1);
      });
      // capa
      var capa = el('section', 'capa'); capa.innerHTML = '<div class="grade-fundo" aria-hidden="true"></div>';
      var tx = el('div', 'capa-txt');
      tx.appendChild(el('span', 'capa-data', dias[agora.getDay()] + ', ' + agora.getDate() + ' de ' + meses[agora.getMonth()] + (H.local ? ' · ' + H.local : '')));
      tx.appendChild(el('h2', '', (h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite') + ', ' + ((H.usuario || {}).primeiroNome || '') + '.'));
      var res = el('p', 'capa-resumo');
      res.appendChild(el('span', '', plural(apps.filter(function (a) { return a.ativo; }).length, 'aplicativo liberado', 'aplicativos liberados')));
      var fav = el('span', '', plural((H.favoritos || []).length, 'favorito', 'favoritos', 'nenhum favorito ainda')); fav.setAttribute('data-conta-favoritos', ''); res.appendChild(fav);
      var nNovos = contarAvisos();
      if (nNovos) { var la = el('a', '', plural(nNovos, 'aviso novo', 'avisos novos')); la.href = rota('avisos'); res.appendChild(la); }
      tx.appendChild(res); capa.appendChild(tx); m.appendChild(capa);
      // faixas
      if (H.admin && H.novos) {
        var fn = el('a', 'faixa novo'); fn.href = rota('gerenciar');
        fn.appendChild(el('span', 'faixa-txt', plural(H.novos, 'app novo chegou', 'apps novos chegaram') + ' e espera você ligar e definir quem acessa.'));
        var ac = el('span', 'faixa-acao', 'Gerenciar '); ac.insertAdjacentHTML('beforeend', svg(IC.seta)); fn.appendChild(ac); m.appendChild(fn);
      }
      var av = (H.avisos || [])[0];
      if (av) {
        var fa = el('a', 'faixa ' + (av.nivel === 'alerta' ? 'alerta' : 'info')); fa.href = rota('avisos');
        fa.insertAdjacentHTML('afterbegin', svg(IC.avisos)); fa.appendChild(el('span', 'faixa-txt', av.texto));
        var ac2 = el('span', 'faixa-acao', H.avisos.length > 1 ? 'Ver todos (' + H.avisos.length + ') ' : 'Ver aviso '); ac2.insertAdjacentHTML('beforeend', svg(IC.seta));
        fa.appendChild(ac2); m.appendChild(fa);
      }
      // continuar de onde parou
      var rec = []; try { rec = JSON.parse(ler('hub-recentes') || '[]'); } catch (e) {}
      var mp = {}; apps.forEach(function (a) { mp[a.pasta] = a; });
      rec = (Array.isArray(rec) ? rec : []).filter(function (r) { return r && mp[r.pasta]; }).slice(0, 4);
      if (rec.length) {
        var br = el('section', 'bloco'), cr = el('div', 'bloco-cab'); cr.appendChild(el('h3', '', 'Continuar de onde parou')); br.appendChild(cr);
        var gr = el('div', 'recentes');
        rec.forEach(function (r) {
          var a = mp[r.pasta], x = el('a', 'recente card'); x.href = a.href; x.insertAdjacentHTML('afterbegin', hex(a, 34));
          var t = el('span'); t.append(el('b', '', a.nome), el('small', '', quando(r.quando))); x.appendChild(t); gr.appendChild(x);
        });
        br.appendChild(gr); m.appendChild(br);
      }
      // seus aplicativos
      var b = el('section', 'bloco'), cab = el('div', 'bloco-cab'); cab.appendChild(el('h3', '', 'Seus aplicativos'));
      var conta = el('span', 'conta', String(apps.length)); cab.appendChild(conta); b.appendChild(cab);
      if (!apps.length) {
        var v = el('div', 'vazio card'); v.appendChild(el('b', '', 'Nenhum aplicativo liberado para você ainda.'));
        var vs = el('span', '', 'Veja no '); var vl = el('a', '', 'catálogo'); vl.href = rota('catalogo'); vs.append(vl, ' o que existe e peça acesso a um administrador.');
        v.appendChild(vs); b.appendChild(v); m.appendChild(b); return;
      }
      var grade = el('div', 'grade-apps'); apps.forEach(function (a) { grade.appendChild(cartaoApp(a)); });
      var usadas = Object.keys(H.areas || {}).filter(function (ar) { return apps.some(function (a) { return a.area === ar; }); });
      if (usadas.length > 1) {
        cab.appendChild(chips(usadas, function (ar) {
          var k = 0; grade.querySelectorAll('.app-card').forEach(function (c) { c.hidden = ar !== '' && c.getAttribute('data-area') !== ar; if (!c.hidden) { k++; } });
          conta.textContent = k;
        }));
      }
      b.appendChild(grade); m.appendChild(b);
    },

    catalogo: function (m) {
      var ordem = Object.keys(H.areas || {});
      var lista = (H.apps || []).filter(function (a) { return a.ativo || H.admin; }).sort(function (a, b) {
        var d = (ordem.indexOf(a.area) + 99) % 99 - (ordem.indexOf(b.area) + 99) % 99; return d || a.nome.localeCompare(b.nome, 'pt-BR');
      });
      var area = '', barra = el('div', 'barra-filtro'), lab = el('label', 'filtro-campo');
      lab.innerHTML = svg(IC.buscar); var campoF = el('input'); campoF.type = 'search'; campoF.placeholder = 'Filtrar por nome, área ou responsável…'; campoF.setAttribute('aria-label', 'Filtrar catálogo');
      lab.appendChild(campoF); barra.appendChild(lab);
      var cx = el('div', 'card tabela-cat'); cx.setAttribute('role', 'table');
      var cab = el('div', 'cat-linha cat-cab'); ['Aplicativo', 'Área', 'Versão', 'Responsável', 'Seu acesso', ''].forEach(function (t) { cab.appendChild(el('span', '', t)); }); cx.appendChild(cab);
      var linhas = lista.map(function (a) {
        var l = el('div', 'cat-linha'); l.setAttribute('role', 'row'); l.setAttribute('data-area', a.area);
        l.setAttribute('data-busca', semAcento([a.nome, a.resumo, a.area, a.responsavel, a.pasta].join(' ')));
        var ap = el('span', 'cat-app'); ap.insertAdjacentHTML('afterbegin', hex(a, 36));
        var t = el('span'); t.append(el('b', '', a.nome), el('small', '', a.resumo || 'Sem descrição')); ap.appendChild(t);
        var ea = el('span'); ea.appendChild(etiqueta(a.area));
        var acesso = el('span');
        if (!a.ativo) { acesso.appendChild(el('span', 'selo cinza', 'Desligado')); }
        else if (a.pode && H.admin && a.acesso === 'restrito') { acesso.appendChild(el('span', 'selo azul', 'Admin · restrito a ' + (a.pessoas || []).length)); }
        else if (a.pode) { acesso.appendChild(el('span', 'selo ok', 'Liberado')); }
        else { var s = el('span', 'selo cinza', 'Sem acesso'); s.title = 'Peça a um administrador para liberar'; acesso.appendChild(s); }
        if (a.selo) { acesso.append(' ', el('span', 'selo', a.selo)); }
        var acao = el('span', 'cat-acao');
        if (a.pode) { acao.appendChild(botaoEstrela(a)); var ab = el('a', 'bt sec peq', 'Abrir'); ab.href = a.href; alvoLink(ab, a.href); acao.appendChild(ab); }
        else { acao.appendChild(el('span', 'sub', 'Peça ao admin')); }
        l.append(ap, ea, el('span', 'mono suave', a.versao || '—'), el('span', 'suave', a.responsavel || '—'), acesso, acao);
        cx.appendChild(l); return l;
      });
      var vazio = el('p', 'vazio', 'Nenhum aplicativo encontrado.'); vazio.hidden = linhas.length > 0; cx.appendChild(vazio);
      function aplicar() {
        var t = semAcento(campoF.value.trim()), n = 0;
        linhas.forEach(function (l) { var ok = (!area || l.getAttribute('data-area') === area) && (!t || l.getAttribute('data-busca').indexOf(t) !== -1); l.hidden = !ok; if (ok) { n++; } });
        vazio.hidden = n > 0;
      }
      campoF.addEventListener('input', aplicar);
      barra.appendChild(chips(ordem, function (ar) { area = ar; aplicar(); }));
      m.append(barra, cx);
    },

    avisos: function (m) {
      var visto = ler('hub-avisos-visto') || '', l = el('div', 'lista-avisos');
      if (!(H.avisos || []).length) { var v = el('div', 'vazio card'); v.appendChild(el('b', '', 'Nenhum aviso por enquanto.')); m.appendChild(v); }
      (H.avisos || []).forEach(function (a) {
        var c = el('article', 'card aviso-card' + (a.nivel === 'alerta' ? ' alerta' : ''));
        var ic = el('span', 'aviso-ic'); ic.innerHTML = svg(IC.avisos); c.appendChild(ic);
        var corpo = el('div', 'aviso-corpo'), p = el('p', '', a.texto);
        if (a.criado_em > visto) { p.appendChild(el('span', 'novo-tag', 'Novo')); }
        var d = new Date(a.criado_em.replace(' ', 'T')), dd = function (n) { return String(n).padStart(2, '0'); };
        corpo.append(p, el('small', '', 'por ' + a.por + ' · ' + dd(d.getDate()) + '/' + dd(d.getMonth() + 1) + ' às ' + dd(d.getHours()) + ':' + dd(d.getMinutes())));
        c.appendChild(corpo); l.appendChild(c);
      });
      m.appendChild(l);
      if ((H.avisos || [])[0]) { guardar('hub-avisos-visto', H.avisos[0].criado_em); }   // abrir a tela = tudo lido
      contarAvisos();
    }
  };

  // ── partida ────────────────────────────────────────────────────────────────
  function iniciar() {
    montarMenu(); ligarMenu(); ligarBusca(); contarAvisos(); anotarRecente();
    var miolo = document.getElementById('hubMiolo');
    if (miolo && TELAS[H.telaAtual]) { TELAS[H.telaAtual](miolo); }
    window.hubMenu = { reiniciar: reiniciar, abrirBusca: abrirBusca, fecharBusca: fecharBusca, contarAvisos: contarAvisos, hex: hex, etiqueta: etiqueta, dados: H };
  }
  /** Remonta menu e tela (para roteamento por #hash, sem recarregar a página). */
  function reiniciar() {
    ['hubMenu', 'hubmPaleta'].forEach(function (id) { var x = document.getElementById(id); if (x) { x.remove(); } });
    document.querySelectorAll('.hubm-abrir, .hubm-veu').forEach(function (x) { x.remove(); });
    html.classList.remove('hubm-gaveta');
    var m = document.getElementById('hubMiolo'); if (m) { m.textContent = ''; }
    iniciar();
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', iniciar); } else { iniciar(); }
})();
