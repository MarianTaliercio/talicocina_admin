// BOOTSTRAP
(async function () {

  if (sessionStorage.getItem('tc_admin_auth') === '1') {

    document.getElementById('admin-login-screen').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';

    await loadAdminSupabaseData();

    initAdmin();

  }

})();