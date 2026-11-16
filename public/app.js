(function(){
  var root=document.getElementById('root');
  var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
  var CAT=window.CATALOG;
  var clone=function(o){return JSON.parse(JSON.stringify(o))};
  var SAVED={v:1,items:{},contact:{wa:'',note:''},lotPct:7};
  var draft=clone(SAVED);
  var admin=false, seller=false, login=false, filter='todos', busy=false, notice='', loginError='';
  var CONDS=['Bem conservado','Com marcas de uso'];

  function item(c){
    var o=(draft.items&&draft.items[c.id])||{};
    return {id:c.id,group:c.group,title:c.title,vol:c.vol,img:c.img,
      price:typeof o.price==='number'?o.price:c.price, cond:o.cond||c.cond, sold:!!o.sold};
  }
  function setItem(id,k,v){ draft.items=draft.items||{}; draft.items[id]=draft.items[id]||{}; draft.items[id][k]=v; }
  function brl(n){ return 'R$ '+n.toLocaleString('pt-BR',{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2}); }
  function dirty(){ return JSON.stringify(draft)!==JSON.stringify(SAVED); }
  function waDigits(){ var d=String((draft.contact&&draft.contact.wa)||'').replace(/\D/g,''); if(!d) return ''; return d.length<=11?'55'+d:d; }
  function waLink(text){ return 'https://wa.me/'+waDigits()+'?text='+encodeURIComponent(text); }
  function api(path,method,body){
    return fetch(path,{method:method||'GET',credentials:'same-origin',cache:'no-store',
      headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined})
      .then(function(r){ return r.json().catch(function(){return {}}).then(function(j){ return {ok:r.ok,status:r.status,data:j}; }); });
  }

  function card(it){
    var name=esc(it.title)+(it.vol?' <b>vol. '+it.vol+'</b>':'');
    var h='<article class="card'+(it.sold?' sold':'')+'"><div class="ph"><img src="img/'+esc(it.img)+'.jpg" alt="Capa de '+esc(it.title)+(it.vol?' volume '+it.vol:'')+'" loading="lazy" width="440" height="567">'+(it.sold?'<span class="stamp">VENDIDO</span>':'')+'</div><div class="body"><h3>'+name+'</h3>';
    h+='<p class="cond'+(it.cond===CONDS[1]?' worn':'')+'">'+esc(it.cond)+'</p><div class="price">'+brl(it.price)+'</div>';
    if(!seller && !it.sold && waDigits()){
      h+='<a class="btn go small" target="_blank" rel="noopener" href="'+esc(waLink('Oi! Tenho interesse em '+it.title+(it.vol?' vol. '+it.vol:'')+' ('+brl(it.price)+'). Ainda está disponível?'))+'">Tenho interesse</a>';
    }
    if(seller){
      h+='<div class="tools"><button class="btn small '+(it.sold?'':'solid')+'" data-act="sold" data-id="'+it.id+'">'+(it.sold?'Voltar ao estoque':'Marcar como vendido')+'</button>';
      h+='<label for="p-'+it.id+'">Preço (R$)<input id="p-'+it.id+'" data-f="price" data-id="'+it.id+'" type="number" inputmode="decimal" min="0" step="1" value="'+it.price+'"></label>';
      h+='<label for="c-'+it.id+'">Estado<select id="c-'+it.id+'" data-f="cond" data-id="'+it.id+'">'+CONDS.map(function(c){return '<option'+(c===it.cond?' selected':'')+'>'+c+'</option>'}).join('')+'</select></label></div>';
    }
    return h+'</div></article>';
  }

  function render(){
    var all=CAT.items.map(item);
    var avail=all.filter(function(i){return !i.sold}), sold=all.filter(function(i){return i.sold});
    var pct=Number(draft.lotPct)||0, wa=waDigits(), note=(draft.contact&&draft.contact.note)||'';
    var h='<div class="wrap"><header class="top"><h1>Estante <em>à venda</em></h1>';
    h+='<p class="lede">Mangás, livros e um jogo de cartas, todos de uso pessoal. Cada item sai da lista assim que é vendido.</p>';
    h+='<div class="count"><span><span class="dot"></span>'+avail.length+' de '+all.length+' disponíveis</span>';
    if(admin && !seller) h+='<button class="btn small" data-act="seller-on">Gerenciar estoque</button>';
    h+='</div>';
    if(wa||note){
      h+='<div class="contact"><p><strong>Quer algum item?</strong>'+(wa?'<small>WhatsApp: +'+esc(wa)+'</small>':'')+(note?'<small>'+esc(note)+'</small>':'')+'</p>'+(wa?'<a class="btn go" target="_blank" rel="noopener" href="'+esc(waLink('Oi! Vi sua Estante à Venda e tenho interesse.'))+'">Chamar no WhatsApp</a>':'')+'</div>';
    }
    h+='</header>';
    if(notice) h+='<p class="note" role="status">'+esc(notice)+'</p>';

    if(login && !admin){
      h+='<section class="panel login"><h2>Área do vendedor</h2><form id="login-form"><label for="f-pass">Senha</label><input id="f-pass" name="password" type="password" autocomplete="current-password" required>';
      if(loginError) h+='<p role="alert">'+esc(loginError)+'</p>';
      h+='<div class="count"><button class="btn solid" type="submit"'+(busy?' disabled':'')+'>'+(busy?'Entrando…':'Entrar')+'</button><button class="btn" type="button" data-act="login-cancel">Cancelar</button></div></form></section>';
    }
    if(seller){
      h+='<section class="panel"><h2>Modo vendedor</h2><p>Marque o que vendeu, ajuste preços e toque em Publicar. Quem abrir o site vê a lista atualizada.</p><div class="fields">';
      h+='<label for="f-wa">Seu WhatsApp com DDD<input id="f-wa" data-f="wa" type="tel" inputmode="tel" placeholder="81 9XXXX-XXXX" value="'+esc((draft.contact&&draft.contact.wa)||'')+'"></label>';
      h+='<label for="f-note">Recado para compradores<input id="f-note" data-f="note" type="text" maxlength="120" placeholder="Ex.: retirada em mãos ou envio pelos Correios" value="'+esc(note)+'"></label>';
      h+='<label for="f-pct">Desconto levando a série toda (%)<input id="f-pct" data-f="pct" type="number" inputmode="numeric" min="0" max="50" step="1" value="'+pct+'"></label>';
      h+='</div></section>';
    }

    h+='<nav class="chips" aria-label="Filtrar">';
    [{id:'todos',name:'Todos'}].concat(CAT.groups).forEach(function(g){
      var n=avail.filter(function(i){return g.id==='todos'||i.group===g.id}).length;
      h+='<button class="chip" data-act="filter" data-id="'+g.id+'" aria-pressed="'+(filter===g.id)+'">'+esc(g.name)+'<span>'+n+'</span></button>';
    });
    h+='</nav>';

    CAT.groups.forEach(function(g){
      if(filter!=='todos' && filter!==g.id) return;
      var mine=avail.filter(function(i){return i.group===g.id});
      var total=all.filter(function(i){return i.group===g.id}).length;
      h+='<section class="sec"><div class="sec-head"><div><h2>'+esc(g.name)+'</h2><p>'+esc(g.sub)+'</p></div>';
      if(g.lot && pct>0 && mine.length===total){
        var sum=mine.reduce(function(a,i){return a+i.price},0);
        var lotTxt='Leve os '+total+' por '+brl(Math.round(sum*(1-pct/100)/5)*5);
        h+= waDigits() ? '<a class="lot" target="_blank" rel="noopener" href="'+esc(waLink('Oi! Vi sua Estante à Venda e quero levar os '+total+' volumes de '+g.name+' por '+brl(Math.round(sum*(1-pct/100)/5)*5)+'.'))+'">'+lotTxt+'</a>' : '<span class="lot">'+lotTxt+'</span>';
      }
      h+='</div>';
      if(g.banner && mine.length) h+='<div class="banner"><img src="img/'+esc(g.banner)+'.jpg" alt="Lombadas dos volumes de '+esc(g.name)+' empilhados"></div>';
      h+= mine.length ? '<div class="grid">'+mine.map(card).join('')+'</div>' : '<p class="empty">Tudo vendido por aqui.</p>';
      h+='</section>';
    });

    var soldShown=sold.filter(function(i){return filter==='todos'||i.group===filter});
    if(soldShown.length){
      h+='<section class="sec"><div class="sec-head"><div><h2>Já vendidos</h2><p>Estes já encontraram dono.</p></div></div><div class="grid">'+soldShown.map(card).join('')+'</div></section>';
    }

    h+='<footer class="foot"><span>Preços em reais. Fotos reais dos itens.</span>';
    if(!admin && !login) h+='<button class="link" data-act="login-open">Área do vendedor</button>';
    h+='</footer></div>';

    if(seller){
      h+='<div class="bar"><p>'+(dirty()?'Alterações ainda não publicadas':'Modo vendedor')+'</p>';
      if(dirty()) h+='<button class="btn small" data-act="discard"'+(busy?' disabled':'')+'>Descartar</button><button class="btn go small" data-act="publish"'+(busy?' disabled':'')+'>'+(busy?'Publicando…':'Publicar')+'</button>';
      else h+='<button class="btn small" data-act="seller-off">Fechar</button><button class="btn small" data-act="logout">Sair da conta</button>';
      h+='</div>';
    }
    root.innerHTML=h;
  }

  function load(){
    return api('/api/state').then(function(r){
      if(r.ok && r.data.state){ SAVED=r.data.state; draft=clone(SAVED); admin=!!r.data.admin; if(!admin) seller=false; }
      render();
    }).catch(function(){ render(); });
  }
  function publish(){
    busy=true; notice=''; render();
    api('/api/state','POST',{state:draft}).then(function(r){
      busy=false;
      if(r.ok){ SAVED=r.data.state; draft=clone(SAVED); notice='Publicado. A lista já está atualizada para todo mundo.'; }
      else if(r.status===401){ admin=false; seller=false; login=true; notice='Sua sessão expirou. Entre de novo para publicar.'; }
      else notice=r.data.error||'Não deu para publicar agora. Tente de novo em instantes.';
      render();
    }).catch(function(){ busy=false; notice='Sem conexão. Tente de novo.'; render(); });
  }
  function doLogin(password){
    busy=true; loginError=''; render();
    api('/api/login','POST',{password:password}).then(function(r){
      busy=false;
      if(r.ok){ admin=true; seller=true; login=false; notice=''; }
      else loginError=r.data.error||'Não foi possível entrar.';
      render();
      if(!r.ok){ var f=document.getElementById('f-pass'); if(f) f.focus(); }
    }).catch(function(){ busy=false; loginError='Sem conexão. Tente de novo.'; render(); });
  }

  root.addEventListener('click',function(ev){
    var t=ev.target.closest('[data-act]'); if(!t) return;
    var a=t.getAttribute('data-act'), id=t.getAttribute('data-id');
    if(a==='filter'){ filter=id; }
    else if(a==='login-open'){ login=true; loginError=''; render(); var f=document.getElementById('f-pass'); if(f){ f.focus(); f.scrollIntoView({block:'center'}); } return; }
    else if(a==='login-cancel'){ login=false; }
    else if(a==='seller-on'){ seller=true; notice=''; }
    else if(a==='seller-off'){ seller=false; notice=''; }
    else if(a==='logout'){ api('/api/logout','POST',{}).then(function(){ admin=false; seller=false; render(); }); return; }
    else if(a==='sold'){ var c=CAT.items.filter(function(x){return x.id===id})[0]; setItem(id,'sold',!item(c).sold); }
    else if(a==='discard'){ draft=clone(SAVED); notice=''; }
    else if(a==='publish'){ if(!busy) publish(); return; }
    render();
  });
  root.addEventListener('submit',function(ev){
    if(ev.target.id!=='login-form') return;
    ev.preventDefault();
    if(!busy) doLogin(ev.target.elements.password.value);
  });
  root.addEventListener('change',function(ev){
    var t=ev.target, f=t.getAttribute&&t.getAttribute('data-f'); if(!f) return;
    var id=t.getAttribute('data-id');
    draft.contact=draft.contact||{};
    if(f==='price'){ var n=Math.max(0,Math.round(parseFloat(String(t.value).replace(',','.'))*100)/100); if(isFinite(n)) setItem(id,'price',n); }
    else if(f==='cond'){ setItem(id,'cond',t.value); }
    else if(f==='wa'){ draft.contact.wa=t.value.trim(); }
    else if(f==='note'){ draft.contact.note=t.value.trim(); }
    else if(f==='pct'){ draft.lotPct=Math.min(50,Math.max(0,parseInt(t.value,10)||0)); }
    render();
  });

  render();
  load();
})();
