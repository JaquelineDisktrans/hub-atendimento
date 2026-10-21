/* hub-auth.js — login, ficha da pessoa (papel e apps liberados) e botão Sair.
   A segurança real está no banco: sem login e sem o app liberado, as tabelas não respondem (RLS).
   Depende de: supabase-js (UMD), config.js, window.HUB, LOGO_DK, hub.js (window.hubMenu) e montarVista(). */
(function () {
  'use strict';
  var cfg = window.HUB_CONFIG || {}, H = window.HUB;
  var sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey);
  window.hubSupabase = sb;
  var tela = document.getElementById('login'), form = document.getElementById('loginForm'), erro = document.getElementById('loginErro');
  document.getElementById('loginLogo').innerHTML = LOGO_DK;

  function titulo(s) {
    return String(s || '').replace(/[._-]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase()
      .replace(/(^|\s)\S/g, function (c) { return c.toUpperCase(); });
  }
  function mostrarErro(msg) { erro.textContent = msg; erro.hidden = false; }
  function pedirLogin(msg) {
    tela.hidden = false;
    if (msg) { mostrarErro(msg); } else { erro.hidden = true; }
    setTimeout(function () { document.getElementById('loginEmail').focus(); });
  }

  /* Lê a ficha em hub_pessoas e aplica papel, nome e apps liberados. */
  function entrar(user) {
    return sb.from('hub_pessoas').select('nome, papel, ativo, todos_apps, apps, favoritos').eq('user_id', user.id).maybeSingle().then(function (r) {
      var f = r.data;
      if (r.error || !f || !f.ativo) {
        return sb.auth.signOut().then(function () {
          pedirLogin(r.error ? 'Não consegui ler o seu cadastro agora. Tente de novo em alguns minutos.'
            : 'Seu acesso ao hub não está liberado. Fale com um administrador do hub.');
        });
      }
      var nome = f.nome || (user.user_metadata && user.user_metadata.nome) || titulo(String(user.email || '').split('@')[0]);
      var partes = titulo(nome).split(' ');
      H.admin = f.papel === 'admin';
      H.usuario = { nome: titulo(nome), primeiroNome: partes[0], iniciais: (partes[0][0] + (partes[1] ? partes[1][0] : '')).toUpperCase(), papel: H.admin ? 'admin' : 'leitor' };
      H.novos = 0;
      var liberados = f.apps || [];
      H.apps.forEach(function (a) { a.pode = H.admin || f.todos_apps || liberados.indexOf(a.pasta) !== -1; });
      H.favoritos = (f.favoritos || []).filter(function (p) { return H.apps.some(function (a) { return a.pasta === p && a.pode; }); });
      tela.hidden = true;
      window.hubMenu.reiniciar(); montarVista();
    });
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault(); erro.hidden = true;
    var b = document.getElementById('loginBotao'); b.disabled = true; b.textContent = 'Entrando…';
    sb.auth.signInWithPassword({ email: document.getElementById('loginEmail').value.trim(), password: document.getElementById('loginSenha').value })
      .then(function (r) {
        if (r.error) { throw r.error; }
        document.getElementById('loginSenha').value = '';
        return entrar(r.data.user);
      })
      .catch(function (e) {
        var m = String((e && e.message) || '');
        mostrarErro(/invalid/i.test(m) ? 'E-mail ou senha incorretos. Confira e tente de novo.'
          : /banned/i.test(m) ? 'Seu acesso ao hub está desativado. Fale com um administrador do hub.'
          : 'Não consegui entrar agora (' + (m || 'sem resposta') + '). Tente de novo em alguns minutos.');
      })
      .then(function () { b.disabled = false; b.textContent = 'Entrar'; });
  });

  /* Favoritos gravados no Supabase (por pessoa). O hub.js acende a ★ na hora e desfaz se isto falhar. */
  window.hubFavoritar = function (pasta, sim) {
    var lista = (H.favoritos || []).filter(function (p) { return p !== pasta; });
    if (sim) { lista.push(pasta); }
    return sb.rpc('hub_salvar_favoritos', { lista: lista }).then(function (r) {
      if (r.error) { throw new Error(r.error.message); }
      return r.data || [];
    });
  };

  /* botão Sair no pé do menu (o menu é remontado a cada troca de tela) */
  window.hubColocarSair = function () {
    var pe = document.querySelector('.hubm-pe'); if (!pe || pe.querySelector('.hubm-sair')) { return; }
    var b = document.createElement('button'); b.type = 'button'; b.className = 'hubm-item hubm-sair'; b.title = 'Sair do hub';
    b.innerHTML = '<svg class="hubm-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l5-5-5-5M15 12H4"/></svg><span class="hubm-txt">Sair</span>';
    b.addEventListener('click', function () { sb.auth.signOut().then(function () { location.hash = ''; location.reload(); }); });
    pe.insertBefore(b, pe.querySelector('.hubm-quem'));
  };

  document.addEventListener('DOMContentLoaded', function () {
    sb.auth.getSession().then(function (r) {
      var s = r.data && r.data.session;
      if (s) { entrar(s.user); } else { pedirLogin(); }
    });
  });
  sb.auth.onAuthStateChange(function (ev) { if (ev === 'SIGNED_OUT') { tela.hidden = false; } });
})();
