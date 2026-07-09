// SUSCRIPCIONES
// ══════════════════════════════════════════
function renderSubs(){
  const activos=users.filter(u=>u.status==='activo').length;
  const mensual=users.filter(u=>u.plan==='mensual').length;
  const anual=users.filter(u=>u.plan==='anual').length;
  const mrr=mensual*1990+anual*Math.round(16900/12);
  document.getElementById('subs-stats').innerHTML=`
    <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-n">${activos}</div><div class="stat-label">Suscriptores activos</div></div>
    <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-n">$${mrr.toLocaleString('es-AR')}</div><div class="stat-label">MRR estimado</div></div>
    <div class="stat-card"><div class="stat-icon">📊</div><div class="stat-n">${anual?Math.round(anual/(activos||1)*100):0}%</div><div class="stat-label">Tasa plan anual</div></div>
  `;
  document.getElementById('subs-tbody').innerHTML=users.map(u=>{
    const monto=u.plan==='mensual'?'$1.990 / mes':u.plan==='anual'?'$16.900 / año':'—';
    return `<tr>
      <td class="td-name">${u.name} ${u.apellido}<br><span style="font-size:11px;color:var(--ink3)">${u.email}</span></td>
      <td><span class="badge ${u.plan==='anual'?'badge-purple':'badge-green'}">${u.plan}</span></td>
      <td><span class="badge ${u.status==='activo'?'badge-green':'badge-red'}">${u.status}</span></td>
      <td style="font-size:12px">${u.joined||'—'}</td>
      <td style="font-size:12px">${u.nextBill||'—'}</td>
      <td style="font-size:13px;font-weight:500">${monto}</td>
    </tr>`;
  }).join('');
}

// ══════════════════════════════════════════
