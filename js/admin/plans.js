function renderPlanManager() {
  const container = document.getElementById('plans-admin-body');
  if (!container) return;
  container.innerHTML = adminPlans.map(plan => `<div class="user-row"><div class="user-avatar">${plan.name.slice(0, 1)}</div><div class="user-info"><div class="user-name">${plan.name}</div><div style="display:flex;gap:7px;margin-top:7px;flex-wrap:wrap"><input class="form-input" id="plan-price-${plan.id}" type="number" value="${plan.price}" style="width:100px;padding:6px"><select class="form-input" id="plan-currency-${plan.id}" style="width:78px;padding:6px"><option ${plan.currency === 'ARS' ? 'selected' : ''}>ARS</option><option ${plan.currency === 'USD' ? 'selected' : ''}>USD</option></select><select class="form-input" id="plan-interval-${plan.id}" style="width:110px;padding:6px"><option value="monthly" ${plan.billing_interval === 'monthly' ? 'selected' : ''}>Mensual</option><option value="quarterly" ${plan.billing_interval === 'quarterly' ? 'selected' : ''}>Trimestral</option><option value="yearly" ${plan.billing_interval === 'yearly' ? 'selected' : ''}>Anual</option></select></div></div><div class="user-actions"><button class="btn btn-outline" onclick="saveAdminPlan('${plan.id}')">Guardar</button></div></div>`).join('') || '<div class="empty"><p>No hay planes. Ejecutá referrals-and-plans.sql.</p></div>';
}

async function saveAdminPlan(id) {
  const values = { price: Number(document.getElementById(`plan-price-${id}`).value) || 0, currency: document.getElementById(`plan-currency-${id}`).value, billing_interval: document.getElementById(`plan-interval-${id}`).value };
  try { await adminRequest('plan_update', { id, values }); await loadAdminSupabaseData(); renderSubs(); renderPlanManager(); toast('Plan actualizado'); } catch (error) { toast(error.message || 'No se pudo actualizar el plan'); }
}
