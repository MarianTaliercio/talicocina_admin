async function adminLogin() {
  const user = document.getElementById('adm-user').value.trim().toLowerCase();
  const password = document.getElementById('adm-pass').value;
  if (!user || !password) return toast('Ingresa usuario y contrasena.');
  sessionStorage.setItem('tc_admin_user', user);
  sessionStorage.setItem('tc_admin_password', password);
  try { await adminRequest('login'); } catch (error) { sessionStorage.removeItem('tc_admin_user'); sessionStorage.removeItem('tc_admin_password'); return toast(error.message || 'Usuario o contrasena incorrectos.'); }
  sessionStorage.setItem('tc_admin_auth', '1');
  document.getElementById('admin-login-screen').style.display = 'none';
  document.getElementById('admin-panel').style.display = 'block';
  await loadAdminSupabaseData();
  initAdmin();
}

async function adminLogout() {
  if (!confirm('Cerrar sesion?')) return;
  sessionStorage.removeItem('tc_admin_auth');
  sessionStorage.removeItem('tc_admin_user'); sessionStorage.removeItem('tc_admin_password');
  document.getElementById('admin-panel').style.display = 'none';
  document.getElementById('admin-login-screen').style.display = 'block';
  closeSidebar();
  toast('Sesion cerrada');
}
