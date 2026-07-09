// AUTH
async function adminLogin(){
  const u=document.getElementById('adm-user').value;
  const p=document.getElementById('adm-pass').value;
  const btn=document.getElementById('adm-login-btn');
  btn.innerHTML='<span class="spinner"></span> Ingresandoâ€¦';btn.disabled=true;
  setTimeout(()=>{
    if(u==='admin'&&p==='tali2025'){
      sessionStorage.setItem('tc_admin_auth','1');
      document.getElementById('admin-login-screen').style.display='none';
      document.getElementById('admin-panel').style.display='block';
      initAdmin();
    } else {
      toast('Usuario o contraseña incorrectos');
    }
    btn.textContent='Ingresar al panel';btn.disabled=false;
  },700);
}

function adminLogout(){
  if(!confirm('¿Cerrar sesion?')) return;
  sessionStorage.removeItem('tc_admin_auth');
  document.getElementById('admin-panel').style.display='none';
  document.getElementById('admin-login-screen').style.display='block';
  document.getElementById('adm-user').value='';
  document.getElementById('adm-pass').value='';
  closeSidebar();
  toast('SesiÃ³n cerrada');
}
