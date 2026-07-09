// DASHBOARD
// ══════════════════════════════════════════
function renderDashboard(){
  const active=users.filter(u=>u.status==='activo').length;
  const mensual=users.filter(u=>u.plan==='mensual').length;
  const anual=users.filter(u=>u.plan==='anual').length;
  const mrr=mensual*1990+anual*Math.round(16900/12);
  document.getElementById('dash-stats').innerHTML=`
    <div class="stat-card"><div class="stat-icon">🍽</div><div class="stat-n">${recipes.length}</div><div class="stat-label">Recetas cargadas</div></div>
    <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-n">${active}</div><div class="stat-label">Usuarios activos</div><div class="stat-trend up">↑ ${users.length} registrados total</div></div>
    <div class="stat-card"><div class="stat-icon">💳</div><div class="stat-n">${mensual+anual}</div><div class="stat-label">Suscriptores</div><div class="stat-trend up">${anual} anuales · ${mensual} mensuales</div></div>
    <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-n">$${mrr.toLocaleString('es-AR')}</div><div class="stat-label">Ingreso mensual estimado</div></div>
  `;
  document.getElementById('dash-recipes').innerHTML=recipes.slice(0,4).map(r=>`
    <div style="display:flex;align-items:center;gap:10px;padding:.6rem 0;border-bottom:1px solid var(--line)">
      <div style="width:36px;height:36px;border-radius:8px;background:var(--g5);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">🍽</div>
      <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:500;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.name}</div><div style="font-size:11px;color:var(--ink3)">${(r.ingredientes||[]).length} ingredientes${r.cals?' · '+r.cals+' kcal':''}</div></div>
    </div>`).join('')||'<div class="empty"><div class="empty-icon">🍽</div><p>Sin recetas</p></div>';
  document.getElementById('dash-users').innerHTML=users.slice(0,4).map(u=>`
    <div style="display:flex;align-items:center;gap:10px;padding:.6rem 0;border-bottom:1px solid var(--line)">
      <div style="width:36px;height:36px;border-radius:50%;background:var(--g4);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:500;color:var(--g1);flex-shrink:0">${(u.name||'U').slice(0,2).toUpperCase()}</div>
      <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:500;color:var(--ink)">${u.name} ${u.apellido}</div><div style="font-size:11px;color:var(--ink3)">${u.email}</div></div>
      <span class="badge ${u.status==='activo'?'badge-green':'badge-red'}">${u.plan}</span>
    </div>`).join('')||'<div class="empty"><p>Sin usuarios</p></div>';
}

// ══════════════════════════════════════════
