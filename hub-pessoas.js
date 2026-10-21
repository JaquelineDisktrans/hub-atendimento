/* hub-pessoas.js — telas de admin: "Pessoas e acessos" (funcional) e "Gerenciar apps" (em construção).
   Toda gravação passa pela Edge Function hub-admin, que confere se quem pede é admin ativo. */
(function () {
  'use strict';
  var H = window.HUB;

  function el(t, c, x) { var e = document.createElement(t); if (c) { e.className = c; } if (x != null) { e.textContent = x; } return e; }
  function br(n) { return Number(n || 0).toLocaleString('pt-BR'); }
  function quando(s) {
    if (!s) { return 'nunca entrou'; }
    var d = new Date(s), p = function (n) { return String(n).padStart(2, '0'); };
    return 'último acesso ' + p(d.getDate()) + '/' + p(d.getMonth() + 1) + ' às ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  function iniciais(nome) { var p = String(nome || '?').trim().split(/\s+/); return ((p[0] || '?')[0] + (p[1] ? p[1][0] : '')).toUpperCase(); }
  function senhaAleatoria() {
    var a = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789', r = new Uint32Array(12), s = '';
    crypto.getRandomValues(r); r.forEach(function (n) { s += a[n % a.length]; }); return s;
  }

  /* chama a função hub-admin e devolve o JSON (ou lança Error com a mensagem dela) */
  function chamar(corpo) {
    return window.hubSupabase.functions.invoke('hub-admin', { body: corpo }).then(function (r) {
      if (!r.error) { return r.data; }
      var ctx = r.error.context;
      if (ctx && typeof ctx.json === 'function') {
        return ctx.json().then(function (j) { throw new Error((j && j.erro) || r.error.message); }, function () { throw new Error(r.error.message); });
      }
      throw new Error(r.error.message || 'sem resposta');
    });
  }
  function aviso(box, tipo, txt) { box.className = 'aviso ' + tipo; box.textContent = txt; box.hidden = false; }

  /* bloco de papel (rádios em cartão) */
  function blocoPapel(nome, atual) {
    var g = el('div', 'pp-opcoes'); g.setAttribute('role', 'radiogroup'); g.setAttribute('aria-label', 'Papel');
    [['leitor', 'Leitor', 'Usa os apps liberados para ele.'], ['admin', 'Admin', 'Vê todos os apps e gerencia pessoas.']].forEach(function (o) {
      var l = el('label', 'opcao'), i = el('input'); i.type = 'radio'; i.name = nome; i.value = o[0]; i.checked = atual === o[0];
      var t = el('span'); t.append(el('b', '', o[1]), el('small', '', o[2])); l.append(i, t); g.appendChild(l);
    });
    return g;
  }
  /* bloco de apps (todos ou escolhidos) */
  function blocoApps(prefixo, todos, lista) {
    var w = el('div', 'pp-apps');
    var tl = el('label', 'opcao pp-todos'), ti = el('input'); ti.type = 'checkbox'; ti.checked = !!todos; ti.setAttribute('data-todos', '');
    var tt = el('span'); tt.append(el('b', '', 'Todos os apps'), el('small', '', 'Inclui os apps que forem criados depois.')); tl.append(ti, tt);
    var grade = el('div', 'pp-grade');
    H.apps.forEach(function (a) {
      var l = el('label', 'opcao pp-app'), i = el('input'); i.type = 'checkbox'; i.value = a.pasta; i.id = prefixo + '-' + a.pasta;
      i.checked = (lista || []).indexOf(a.pasta) !== -1;
      l.appendChild(i); l.insertAdjacentHTML('beforeend', window.hubMenu.hex(a, 22)); l.appendChild(el('span', '', a.nome)); grade.appendChild(l);
    });
    function sinc() { grade.classList.toggle('pp-off', ti.checked); grade.querySelectorAll('input').forEach(function (x) { x.disabled = ti.checked; }); }
    ti.addEventListener('change', sinc); sinc();
    w.append(tl, grade);
    return w;
  }
  function lerApps(w) {
    return { todos_apps: w.querySelector('[data-todos]').checked,
      apps: Array.prototype.map.call(w.querySelectorAll('.pp-grade input:checked'), function (x) { return x.value; }) };
  }
  function lerPapel(w) { var r = w.querySelector('input[type=radio]:checked'); return r ? r.value : 'leitor'; }
  function campo(rot, tipo, id, valor, ajuda) {
    var c = el('div', 'campo'), l = el('label', '', rot), i = el('input'); l.htmlFor = id; i.id = id; i.type = tipo; if (valor) { i.value = valor; }
    c.append(l, i); if (ajuda) { c.appendChild(el('span', 'ajuda', ajuda)); } return c;
  }

  function telaPessoas(m) {
    if (!H.admin) { var v = el('div', 'vazio card'); v.appendChild(el('b', '', 'Só administradores do hub veem esta tela.')); m.appendChild(v); return; }
    var kp = el('div', 'kpis'), msg = el('div', 'aviso'); msg.hidden = true;
    var lista = el('section', 'bloco'), cab = el('div', 'bloco-cab'); cab.appendChild(el('h3', '', 'Pessoas')); lista.appendChild(cab);
    var corpo = el('div', 'pp-lista'); corpo.appendChild(el('p', 'sub', 'Carregando pessoas…')); lista.appendChild(corpo);

    /* + Incluir pessoa */
    var inc = el('details', 'card pp-incluir'), sum = el('summary', 'pp-sum');
    sum.innerHTML = '<span class="pp-mais" aria-hidden="true">+</span>'; sum.appendChild(el('b', '', 'Incluir pessoa'));
    var f = el('form', 'pp-form'); f.noValidate = true;
    var linha = el('div', 'grade-3');
    var cs = campo('Senha inicial', 'text', 'ppNovaSenha', senhaAleatoria(), 'Mínimo de 8 caracteres. Copie e passe para a pessoa.');
    linha.append(campo('Nome', 'text', 'ppNovoNome', '', ''), campo('E-mail', 'email', 'ppNovoEmail', '', ''), cs);
    var gerar = el('button', 'bt fant peq', 'Gerar outra senha'); gerar.type = 'button';
    gerar.addEventListener('click', function () { document.getElementById('ppNovaSenha').value = senhaAleatoria(); });
    cs.appendChild(gerar);
    var papel = blocoPapel('ppNovoPapel', 'leitor'), apps = blocoApps('ppNovo', false, []);
    var msgI = el('div', 'aviso'); msgI.hidden = true;
    var ok = el('button', 'bt pri', 'Incluir pessoa'); ok.type = 'submit';
    f.append(linha, el('h4', 'pp-sub', 'Papel'), papel, el('h4', 'pp-sub', 'Apps que a pessoa abre'), apps, msgI, ok);
    f.addEventListener('submit', function (ev) {
      ev.preventDefault(); ok.disabled = true; msgI.hidden = true;
      var a = lerApps(apps), p = lerPapel(papel), email = document.getElementById('ppNovoEmail').value.trim();
      chamar({ acao: 'incluir', nome: document.getElementById('ppNovoNome').value.trim(), email: email,
        senha: document.getElementById('ppNovaSenha').value, papel: p, todos_apps: a.todos_apps, apps: a.apps })
        .then(function () {
          aviso(msgI, 'ok', 'Acesso criado para ' + email + '. Passe a senha inicial para a pessoa: ela entra em ' + location.origin + '.');
          document.getElementById('ppNovoNome').value = ''; document.getElementById('ppNovoEmail').value = '';
          document.getElementById('ppNovaSenha').value = senhaAleatoria(); carregar();
        })
        .catch(function (e) { aviso(msgI, 'erro', e.message); })
        .then(function () { ok.disabled = false; });
    });
    inc.append(sum, f);

    m.append(kp, msg, inc, lista);

    function ficha(p) {
      var d = el('details', 'card pp-pessoa' + (p.ativo ? '' : ' pp-inativa')), s = el('summary', 'pp-sum');
      var ini = el('span', 'pp-ini', iniciais(p.nome || p.email));
      var tx = el('span', 'pp-txt'), n = el('b', '', p.nome || p.email);
      if (p.voce) { n.appendChild(el('span', 'novo-tag', 'Você')); }
      tx.append(n, el('small', '', p.email + ' · ' + quando(p.ultimo_acesso)));
      var selos = el('span', 'pp-selos');
      selos.appendChild(el('span', 'selo' + (p.papel === 'admin' ? '' : ' azul'), p.papel === 'admin' ? 'Admin' : 'Leitor'));
      selos.appendChild(el('span', 'selo cinza', p.papel === 'admin' || p.todos_apps ? 'Todos os apps' : (p.apps || []).length + ' app' + ((p.apps || []).length === 1 ? '' : 's')));
      selos.appendChild(el('span', 'selo ' + (p.ativo ? 'ok' : 'cinza'), p.ativo ? 'Ativo' : 'Desativado'));
      s.append(ini, tx, selos); d.appendChild(s);

      var fm = el('div', 'pp-form'), id = 'pp' + p.user_id.slice(0, 8);
      var cn = campo('Nome', 'text', id + 'Nome', p.nome, '');
      var pa = blocoPapel(id + 'Papel', p.papel), ap = blocoApps(id, p.todos_apps, p.apps);
      var m2 = el('div', 'aviso'); m2.hidden = true;
      var acoes = el('div', 'linha-flex');
      var salvar = el('button', 'bt azul peq', 'Salvar alterações'); salvar.type = 'button';
      var ns = el('input'); ns.type = 'text'; ns.id = id + 'Senha'; ns.placeholder = 'Nova senha provisória'; ns.className = 'pp-senha'; ns.setAttribute('aria-label', 'Nova senha provisória');
      var bs = el('button', 'bt sec peq', 'Definir senha'); bs.type = 'button';
      var at = el('button', 'bt sec peq' + (p.ativo ? ' perigo' : ''), p.ativo ? 'Desativar acesso' : 'Reativar acesso'); at.type = 'button';
      acoes.append(salvar, el('span', 'empurra'), ns, bs, at);
      fm.append(cn, el('h4', 'pp-sub', 'Papel'), pa, el('h4', 'pp-sub', 'Apps que a pessoa abre'), ap, m2, acoes);
      d.appendChild(fm);

      function rodar(b, corpo, txtOk) {
        b.disabled = true; m2.hidden = true;
        chamar(corpo).then(function () { aviso(m2, 'ok', txtOk); setTimeout(carregar, 900); })
          .catch(function (e) { aviso(m2, 'erro', e.message); }).then(function () { b.disabled = false; });
      }
      salvar.addEventListener('click', function () {
        var a = lerApps(ap); rodar(salvar, { acao: 'atualizar', user_id: p.user_id, nome: document.getElementById(id + 'Nome').value, papel: lerPapel(pa), todos_apps: a.todos_apps, apps: a.apps }, 'Alterações salvas. Valem no próximo acesso da pessoa.');
      });
      bs.addEventListener('click', function () {
        if (!ns.value) { ns.value = senhaAleatoria(); }
        rodar(bs, { acao: 'senha', user_id: p.user_id, senha: ns.value }, 'Senha definida: ' + ns.value + '. Passe para a pessoa.');
      });
      at.addEventListener('click', function () {
        if (p.ativo && at.getAttribute('data-confirmar') !== '1') {
          at.setAttribute('data-confirmar', '1'); at.textContent = 'Confirmar: desativar ' + (p.nome || p.email).split(' ')[0];
          setTimeout(function () { at.removeAttribute('data-confirmar'); at.textContent = 'Desativar acesso'; }, 5000); return;
        }
        rodar(at, { acao: p.ativo ? 'desativar' : 'reativar', user_id: p.user_id }, p.ativo ? 'Acesso desativado. A pessoa não consegue mais entrar.' : 'Acesso reativado.');
      });
      return d;
    }

    function carregar() {
      chamar({ acao: 'listar' }).then(function (r) {
        var ps = r.pessoas || [];
        kp.textContent = '';
        [['Pessoas no hub', ps.length, 'destaque', 'com acesso cadastrado'],
         ['Admin', ps.filter(function (p) { return p.ativo && p.papel === 'admin'; }).length, '', 'gerenciam pessoas e veem tudo'],
         ['Leitor', ps.filter(function (p) { return p.ativo && p.papel === 'leitor'; }).length, '', 'usam os apps liberados'],
         ['Desativados', ps.filter(function (p) { return !p.ativo; }).length, '', 'sem acesso, histórico guardado']].forEach(function (k) {
          var c = el('div', 'kpi ' + k[2]); c.append(el('div', 'rot', k[0]), el('div', 'val', br(k[1])), el('div', 'det', k[3])); kp.appendChild(c);
        });
        corpo.textContent = '';
        ps.sort(function (a, b) { return (b.ativo - a.ativo) || String(a.nome || a.email).localeCompare(String(b.nome || b.email), 'pt-BR'); })
          .forEach(function (p) { corpo.appendChild(ficha(p)); });
        if (!ps.length) { corpo.appendChild(el('p', 'sub', 'Ninguém cadastrado ainda.')); }
      }).catch(function (e) { aviso(msg, 'erro', 'Não consegui carregar as pessoas: ' + e.message); corpo.textContent = ''; });
    }
    carregar();
  }

  window.hubTelaExtra = function (t) {
    var m = document.getElementById('hubMiolo'); if (!m) { return; }
    if (t === 'pessoas') { telaPessoas(m); }
    else if (t === 'gerenciar') {
      var f = el('div', 'faixa info');
      f.appendChild(el('span', 'faixa-txt', 'Gerenciar apps ainda está em construção. Para liberar apps por pessoa, use Pessoas e acessos.'));
      m.appendChild(f);
    }
  };
})();
