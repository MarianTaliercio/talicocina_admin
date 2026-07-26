function foodOptionLabel(category) { return category === 'allergy' ? 'Alergias / restricciones' : 'Preferencias alimentarias'; }

function renderFoodOptions() {
  const target = document.getElementById('food-options-list');
  if (!target) return;
  const groups = ['allergy', 'preference'];
  target.innerHTML = groups.map(category => {
    const rows = foodOptions.filter(option => option.category === category).map(option => `
      <div class="user-row">
        <div class="user-avatar">${category === 'allergy' ? '!' : '✓'}</div>
        <div class="user-info"><div class="user-name">${option.name}</div><div class="user-meta">${option.is_active ? 'Visible para usuarios' : 'Oculta temporalmente'}</div></div>
        <span class="badge ${option.is_active ? 'badge-green' : 'badge-amber'}">${option.is_active ? 'Activa' : 'Inactiva'}</span>
        <div class="user-actions"><button class="btn-icon btn-e" title="Activar o desactivar" onclick="toggleFoodOption('${option.id}',${!option.is_active})">${option.is_active ? '◐' : '◑'}</button><button class="btn-icon btn-d" title="Eliminar" onclick="deleteFoodOption('${option.id}')">🗑</button></div>
      </div>`).join('') || '<div class="empty"><p>No hay opciones todavía.</p></div>';
    return `<div style="margin-bottom:1.4rem"><div class="card-title" style="margin:.25rem .25rem .6rem">${foodOptionLabel(category)}</div>${rows}</div>`;
  }).join('');
}

async function saveFoodOption() {
  const category = document.getElementById('food-option-category').value;
  const input = document.getElementById('food-option-name');
  const name = input.value.trim();
  if (!name) return toast('Escribí una opción primero.');
  try {
    const { data } = await adminRequest('food_option_upsert', { row: { category, name, is_active: true, sort_order: foodOptions.filter(option => option.category === category).length * 10 + 10 } });
    foodOptions.push(data); input.value = ''; renderFoodOptions(); toast('Opción agregada.');
  } catch (error) { toast(`No se pudo agregar: ${error.message}`); }
}

async function toggleFoodOption(id, isActive) {
  try {
    const option = foodOptions.find(item => item.id === id);
    await adminRequest('food_option_upsert', { row: { ...option, is_active: isActive } });
    option.is_active = isActive; renderFoodOptions();
  } catch (error) { toast(`No se pudo actualizar: ${error.message}`); }
}

async function deleteFoodOption(id) {
  if (!confirm('¿Eliminar esta opción? Las personas que ya la eligieron conservarán el dato, pero dejará de mostrarse.')) return;
  try { await adminRequest('food_option_delete', { id }); foodOptions = foodOptions.filter(option => option.id !== id); renderFoodOptions(); toast('Opción eliminada.'); }
  catch (error) { toast(`No se pudo eliminar: ${error.message}`); }
}
