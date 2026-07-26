function renderUsersTable(){
  const query = (document.getElementById('user-search')?.value || '').toLowerCase();
  const filtered = users.filter(user => `${user.name || ''} ${user.apellido || ''} ${user.email || ''}`.toLowerCase().includes(query));
  document.getElementById('users-count-lbl').textContent = `${filtered.length} usuario${filtered.length !== 1 ? 's' : ''}`;
  document.getElementById('users-body').innerHTML = filtered.map(user => `<div class="user-row"><div class="user-avatar">${(user.name || 'U').slice(0,2).toUpperCase()}</div><div class="user-info"><div class="user-name">${user.name || 'Sin nombre'} ${user.apellido || ''}</div><div class="user-meta">${user.email} · WhatsApp ${user.whatsapp || '—'} · ${user.city || '—'} · ${user.personas || 1} personas</div></div><div class="user-actions"><button class="btn-icon btn-e" onclick="openUserForm('${user.id}')">Editar</button><button class="btn-icon btn-d" onclick="delUser('${user.id}')">Eliminar</button></div></div>`).join('') || '<div class="empty"><p>Sin usuarios</p></div>';
}
function openUserForm(id){
  if (!id) return toast('Los usuarios se crean desde la web de usuarios.');
  editUid = id; const user = users.find(item => item.id === id); if (!user) return;
  document.getElementById('uf-name').value = user.name || ''; document.getElementById('uf-apellido').value = user.apellido || ''; document.getElementById('uf-email').value = user.email || ''; document.getElementById('uf-wapp').value = user.whatsapp || ''; document.getElementById('uf-city').value = user.city || ''; openMo('mo-user');
}
async function saveUser(){
  if (!editUid) return;
  const values = { name: document.getElementById('uf-name').value.trim(), apellido: document.getElementById('uf-apellido').value.trim(), whatsapp: document.getElementById('uf-wapp').value.trim(), city: document.getElementById('uf-city').value.trim() };
  try { await adminRequest('user_update', { id: editUid, values }); } catch (error) { return toast(error.message || 'Error al guardar'); }
  await loadAdminSupabaseData(); renderUsersTable(); renderDashboard(); closeMo('mo-user'); toast('Usuario actualizado');
}
async function refreshUsers(){ await loadAdminSupabaseData(); renderUsersTable(); }
async function delUser(id){
  if (!confirm('Eliminar definitivamente este usuario y sus datos?')) return;
  try { await adminRequest('user_delete', { id }); } catch (error) { return toast(error.message || 'Error al eliminar'); }
  users = users.filter(user => user.id !== id); renderUsersTable(); updateBadges(); toast('Usuario eliminado');
}
