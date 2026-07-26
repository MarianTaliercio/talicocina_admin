function renderReferralCodes() {
  const recipeSelect = document.getElementById('rc-recipes');
  if (recipeSelect && !recipeSelect.options.length) recipeSelect.innerHTML = recipes.map(recipe => `<option value="${recipe.id}">${recipe.name}</option>`).join('');
  const list = document.getElementById('referral-codes-list');
  if (!list) return;
  list.innerHTML = referralCodes.map(item => {
    const uses = referralUses.filter(use => use.referral_code_id === item.id).length;
    const plan = item.plans?.name || 'Premium';
    return `<div class="user-row"><div class="user-avatar">#</div><div class="user-info"><div class="user-name">${item.code} <span class="badge ${item.is_active ? 'badge-green' : 'badge-amber'}">${item.is_active ? 'Activo' : 'Pausado'}</span></div><div class="user-meta">${item.owner_name} · ${item.source_type === 'professional' ? 'Profesional' : 'Beneficio'} · ${uses}${item.max_uses ? `/${item.max_uses}` : ''} ingresos · ${Number(item.discount_percentage) || 0}% OFF Premium · ${(item.referral_code_recipes || []).length} recetas</div></div><div class="user-actions"><button class="btn btn-outline" onclick="editReferralCode('${item.id}')">Editar</button><button class="btn btn-outline" onclick="toggleReferralCode('${item.id}', ${!item.is_active})">${item.is_active ? 'Pausar' : 'Activar'}</button><button class="btn btn-outline" onclick="deleteReferralCode('${item.id}')">Eliminar</button></div></div>`;
  }).join('') || '<div class="empty"><p>No hay codigos creados.</p></div>';
}

async function saveReferralCode() {
  const code = document.getElementById('rc-code').value.trim().toUpperCase();
  const owner = document.getElementById('rc-owner').value.trim();
  const ownerEmail = document.getElementById('rc-email').value.trim().toLowerCase();
  if (!code || !owner) return toast('Completa el codigo y su titular.');
  const premium = adminPlans.find(plan => plan.name === 'Premium');
  if (!premium) return toast('Ejecuta referrals-and-plans.sql en Supabase primero.');
  const max = Number(document.getElementById('rc-max').value);
  const discount = Number(document.getElementById('rc-discount').value) || 0;
  if (discount < 0 || discount > 100) return toast('El descuento debe estar entre 0 y 100.');
  const selectedRecipes = [...document.getElementById('rc-recipes').selectedOptions].map(option => option.value);
  if (!/^[A-Z0-9_-]{3,40}$/.test(code)) return toast('Usa entre 3 y 40 letras, numeros, guion o guion bajo.');
  try {
    const action = editReferralId ? 'referral_update' : 'referral_create';
    await adminRequest(action, { id: editReferralId, code, owner_name: owner, owner_email: ownerEmail || null, source_type: document.getElementById('rc-source').value, plan_id: premium.id, max_uses: max || null, discount_percentage: discount, recipe_ids: selectedRecipes });
  } catch (error) {
    return toast(error.message || 'No se pudo crear el codigo.');
  }
  const wasEditing = !!editReferralId;
  cancelReferralEdit();
  await loadAdminSupabaseData(); renderReferralCodes(); toast(wasEditing ? 'Código actualizado' : 'Código Premium creado');
}

function editReferralCode(id) {
  const item = referralCodes.find(code => code.id === id);
  if (!item) return;
  editReferralId = id;
  document.getElementById('rc-code').value = item.code;
  document.getElementById('rc-owner').value = item.owner_name;
  document.getElementById('rc-email').value = item.owner_email || '';
  document.getElementById('rc-source').value = item.source_type;
  document.getElementById('rc-max').value = item.max_uses || '';
  document.getElementById('rc-discount').value = Number(item.discount_percentage) || '';
  const assigned = new Set((item.referral_code_recipes || []).map(row => row.recipe_id));
  [...document.getElementById('rc-recipes').options].forEach(option => { option.selected = assigned.has(option.value); });
  document.getElementById('rc-save-btn').textContent = 'Guardar cambios';
  document.getElementById('rc-cancel-btn').style.display = '';
  document.getElementById('rc-code').focus();
}

function cancelReferralEdit() {
  editReferralId = null;
  document.getElementById('rc-code').value = '';
  document.getElementById('rc-owner').value = '';
  document.getElementById('rc-email').value = '';
  document.getElementById('rc-max').value = '';
  document.getElementById('rc-discount').value = '';
  [...document.getElementById('rc-recipes').options].forEach(option => { option.selected = false; });
  document.getElementById('rc-save-btn').textContent = 'Crear código Premium';
  document.getElementById('rc-cancel-btn').style.display = 'none';
}

async function deleteReferralCode(id) {
  const item = referralCodes.find(code => code.id === id);
  if (!item || !confirm(`¿Eliminar el profesional y el código ${item.code}? La cuenta profesional perderá el acceso y sus pacientes dejarán de estar vinculados, pero conservarán sus cuentas y suscripciones.`)) return;
  try { await adminRequest('referral_delete', { id }); }
  catch (error) { return toast(error.message || 'No se pudo eliminar el código.'); }
  if (editReferralId === id) cancelReferralEdit();
  await loadAdminSupabaseData(); renderReferralCodes(); toast('Código eliminado');
}

async function toggleReferralCode(id, active) {
  try { await adminRequest('referral_toggle', { id, is_active: active }); }
  catch (error) { return toast(error.message || 'No se pudo actualizar el codigo.'); }
  await loadAdminSupabaseData(); renderReferralCodes();
}
