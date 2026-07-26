function renderDashboard(){
  const active = subscriptions.filter(subscription => subscription.status === 'active').length;
  const openReports = promotionReports.filter(item => item.status === 'open');
  document.getElementById('dash-stats').innerHTML = [
    ['🍽', recipes.length, 'Recetas cargadas'],
    ['👥', users.length, 'Usuarios registrados'],
    ['💳', active, 'Suscripciones activas'],
    ['🏦', promos.length, 'Promociones activas'],
    ['💬', recipeFeedback.length, 'Respuestas sobre recetas'],
    ['⚑', openReports.length, 'Promociones reportadas']
  ].map(([icon, value, label]) => `<div class="stat-card"><div class="stat-icon">${icon}</div><div class="stat-n">${value}</div><div class="stat-label">${label}</div></div>`).join('');

  const recipeName = id => recipes.find(recipe => recipe.id === id)?.name || 'Receta';
  const countsBy = (items, getId) => Object.entries(items.reduce((counts, item) => {
    const id = getId(item);
    if (id) counts[id] = (counts[id] || 0) + 1;
    return counts;
  }, {})).sort((a, b) => b[1] - a[1]);
  const chosenRanking = countsBy(recipeSelections, item => item.recipe_id || item.weekly_menu_recipes?.recipe_id);
  const likes = countsBy(recipeFeedback.filter(item => item.outcome === 'liked'), item => item.recipe_id);
  const favorites = countsBy(recipeFavorites, item => item.recipe_id);
  const likedRanking = [...new Set([...likes.map(item => item[0]), ...favorites.map(item => item[0])])]
    .map(id => [id, likes.find(item => item[0] === id)?.[1] || 0, favorites.find(item => item[0] === id)?.[1] || 0])
    .sort((a, b) => (b[1] + b[2]) - (a[1] + a[2]));
  const rankingEmpty = '<div class="empty"><p>Todavía no hay actividad suficiente.</p></div>';
  document.getElementById('dash-most-chosen').innerHTML = chosenRanking.length ? chosenRanking.slice(0, 8).map(([id, count], index) =>
    `<div class="ranking-row"><span class="ranking-position">${index + 1}</span><strong>${recipeName(id)}</strong><span>${count} elección${count === 1 ? '' : 'es'}</span></div>`
  ).join('') : rankingEmpty;
  document.getElementById('dash-most-liked').innerHTML = likedRanking.length ? likedRanking.slice(0, 8).map(([id, likeCount, favoriteCount], index) =>
    `<div class="ranking-row"><span class="ranking-position">${index + 1}</span><strong>${recipeName(id)}</strong><span>😍 ${likeCount} · ♥ ${favoriteCount}</span></div>`
  ).join('') : rankingEmpty;

  document.getElementById('dash-recipes').innerHTML = recipes.slice(0,4).map(recipe =>
    `<div style="padding:.6rem 0;border-bottom:1px solid var(--line)"><strong>${recipe.name}</strong><div style="font-size:11px;color:var(--ink3)">${recipe.ingredientes.length} ingredientes · ${recipe.cals || '—'} kcal</div></div>`
  ).join('') || '<div class="empty"><p>Sin recetas</p></div>';

  document.getElementById('dash-users').innerHTML = users.slice(0,4).map(user =>
    `<div style="padding:.6rem 0;border-bottom:1px solid var(--line)"><strong>${user.name || 'Usuario'} ${user.apellido || ''}</strong><div style="font-size:11px;color:var(--ink3)">${user.email}</div></div>`
  ).join('') || '<div class="empty"><p>Sin usuarios</p></div>';

  if (openReports.length) {
    document.getElementById('dash-users').insertAdjacentHTML('beforeend',
      `<div style="margin-top:1rem;font-weight:700">Reportes pendientes</div>${openReports.slice(0,4).map(item =>
        `<div style="padding:.55rem 0;border-bottom:1px solid var(--line)"><strong>${item.promotions?.name || 'Promoción'}</strong><div style="font-size:11px;color:var(--ink3)">${item.reason}</div></div>`
      ).join('')}`);
  }
}
