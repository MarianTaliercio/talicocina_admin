// INIT
// ══════════════════════════════════════════
function initAdmin(){

  updateBadges();

  renderDashboard();
  renderRecipeTable();
  renderPromoTable();
  renderUsersTable();

  renderWAPreview();

}
function updateBadges(){
  document.getElementById('nb-recetas').textContent=recipes.length;
  document.getElementById('nb-usuarios').textContent=users.length;
  document.getElementById('nb-promos').textContent=promos.length;
}

// ══════════════════════════════════════════
