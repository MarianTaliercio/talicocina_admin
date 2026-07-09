// USERS
// ══════════════════════════════════════════

const filtered = (users || []).filter(u =>
  !q || (u.name + u.apellido + u.email + (u.password || '')).toLowerCase().includes(q)
);


async function initAdmin() {

  await refreshUsers();

  renderUsersTable();
  renderRecipeTable();
  renderPromoTable();

  updateBadges();
}

function renderUsersTable(){
  const q=(document.getElementById('user-search')?.value||'').toLowerCase();
  const filtered=users.filter(u=>!q||(u.name+u.apellido+u.email+(u.password||'')).toLowerCase().includes(q));
  document.getElementById('users-count-lbl').textContent=`${filtered.length} usuario${filtered.length!==1?'s':''}`;
  document.getElementById('users-body').innerHTML=`<div>`+filtered.map(u=>`
    <div class="user-row">
      <div class="user-avatar">${(u.name||'U').slice(0,2).toUpperCase()}</div>
      <div class="user-info">
        <div class="user-name">${u.name} ${u.apellido}</div>
        <div class="user-meta">${u.email} · Clave: <strong>${u.password||'Sin cargar'}</strong> · 📱 ${u.wapp||'—'} · 📍 ${u.city||'—'}</div>
      </div>
      <span class="badge ${u.plan==='anual'?'badge-purple':u.plan==='mensual'?'badge-green':'badge-red'}">${u.plan}</span>
      <span class="badge ${u.status==='activo'?'badge-green':'badge-red'}" style="margin-left:4px">${u.status}</span>
      <div class="user-actions">
        <button class="btn-icon btn-e" onclick="openUserForm('${u.id}')">✏️</button>
        <button class="btn-icon btn-d" onclick="delUser('${u.id}')">🗑</button>
      </div>
    </div>`).join('')+`</div>`;
}

function openUserForm(id){
  editUid=id;
  ['uf-name','uf-apellido','uf-email','uf-password','uf-wapp','uf-city'].forEach(fid=>document.getElementById(fid).value='');
  document.getElementById('uf-plan').value='mensual';
  document.getElementById('mo-user-title').textContent=id?'Editar usuario':'Nuevo usuario';
  if(id){
    const u=users.find(x=>x.id===id);if(!u) return;
    document.getElementById('uf-name').value=u.name||'';
    document.getElementById('uf-apellido').value=u.apellido||'';
    document.getElementById('uf-email').value=u.email||'';
    document.getElementById('uf-password').value=u.password||'';
    document.getElementById('uf-wapp').value=u.wapp||'';
    document.getElementById('uf-plan').value=u.plan||'mensual';
    document.getElementById('uf-city').value=u.city||'';
  }
  openMo('mo-user');
}

async function saveUser() {
  const email = document.getElementById('uf-email').value.trim();

  if (!email) {
    toast('Escribí el email');
    return;
  }

  const now = new Date();

  const data = {
    name: document.getElementById('uf-name').value.trim(),
    apellido: document.getElementById('uf-apellido').value.trim(),
    email,
    password: document.getElementById('uf-password').value.trim(),
    wapp: document.getElementById('uf-wapp').value.trim(),
    plan: document.getElementById('uf-plan').value,
    city: document.getElementById('uf-city').value.trim(),
    status: 'activo',
    joined: now.toLocaleDateString('es-AR')
  };

  let error;

  if (editUid) {

    ({ error } = await window.db
      .from('users')
      .update(data)
      .eq('id', editUid));

  } else {

    ({ error } = await window.db
      .from('users')
      .insert([
        {
          id: uid(),
          ...data
        }
      ]));
  }

  if (error) {
    console.error(error);
    toast('Error al guardar');
    return;
  }

  toast(editUid ? 'Usuario actualizado ✓' : 'Usuario agregado ✓');

  closeMo('mo-user');}

async function refreshUsers(){
  const { data, error } = await window.db
    .from('users')
    .select('*');

  if(error){
    console.error(error);
    return;
  }

  users = data || [];
}
async function delUser(id){

  if(!confirm('¿Eliminar usuario?')) return;

  try {

    const { error } = await window.db
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // actualizar lista local
    users = users.filter(u => u.id !== id);

    renderUsersTable();
    updateBadges();

    toast('Usuario eliminado ✓');

  } catch (err) {
    console.error(err);
    toast('Error al eliminar usuario');
  }
}
// ═════════════════════════════════════════