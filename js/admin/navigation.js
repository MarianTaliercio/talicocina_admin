// NAV
// ══════════════════════════════════════════
const viewMeta={
  dashboard:{title:'Dashboard',sub:'Resumen general',actions:''},
  recetas:{title:'Recetas',sub:'Gestión de recetas',actions:''},
  importar:{title:'Importar JSON',sub:'Carga masiva de recetas',actions:''},
  usuarios:{title:'Usuarios',sub:'Gestión de usuarios registrados',actions:''},
  suscripciones:{title:'Suscripciones',sub:'Estado de pagos y planes',actions:''},
  promos:{title:'Promos bancarias',sub:'Descuentos por banco y supermercado',actions:''},
  notificaciones:{title:'Notificaciones WhatsApp',sub:'Envíos automáticos al publicar recetas',actions:''},
};
function goView(name,el){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('on'));
  document.getElementById('view-'+name).classList.add('on');
  if(el) el.classList.add('on');
  const m=viewMeta[name]||{};
  document.getElementById('topbar-title').textContent=m.title||name;
  document.getElementById('topbar-sub').textContent=m.sub||'';
  if(name==='recetas') renderRecipeTable();
  if(name==='usuarios') renderUsersTable();
  if(name==='suscripciones') renderSubs();
  if(name==='promos') renderPromoTable();
  if(name==='notificaciones') renderNotificaciones();
  if(name==='dashboard') renderDashboard();
}

// ══════════════════════════════════════════
