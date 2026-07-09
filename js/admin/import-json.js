// IMPORT JSON
// ══════════════════════════════════════════
async function importJSON() {

  let raw = document.getElementById('json-import-area').value.trim();

  if (!raw) {
    toast('Pegá el JSON primero');
    return;
  }

  const btn = document.getElementById('import-btn');
  const prog = document.getElementById('import-prog');
  const progWrap = document.getElementById('import-prog-wrap');
  const res = document.getElementById('import-result');

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Importando...';

  progWrap.style.display = 'block';
  prog.style.width = '0%';

  try {

    raw = raw.replace(/```json|```/g, '').trim();

    const arr = JSON.parse(raw);

    if (!Array.isArray(arr)) {
      throw new Error('El JSON debe ser un array []');
    }

    let added = 0;
    let errs = 0;

    for (let i = 0; i < arr.length; i++) {

      const item = arr[i];

      prog.style.width = Math.round(((i + 1) / arr.length) * 100) + '%';

      if (!item.name) {
        errs++;
        continue;
      }

      const receta = {
        id: uid(),
        name: item.name,
        ytUrl: item.ytUrl || '',
        ytId: getYTId(item.ytUrl || '') || '',
        cals: parseInt(item.cals) || 0,
        porciones: parseInt(item.porciones) || 2,
        ingredientes: Array.isArray(item.ingredientes)
          ? item.ingredientes
          : [],
        pasos: Array.isArray(item.pasos)
          ? item.pasos
          : []
      };

      try {

        await upsertRecipeToSupabase(receta);

        recipes.push(receta);

        added++;

      } catch (e) {

        console.error('Error importando receta:', receta.name, e);

        errs++;

      }

    }

    // Recargar desde Supabase
    await loadAdminSupabaseData();

    renderRecipeTable();
    updateBadges();
    renderDashboard();

    btn.disabled = false;
    btn.textContent = 'Importar recetas';

    progWrap.style.display = 'none';

    res.textContent =
      `✓ ${added} receta${added !== 1 ? 's' : ''} importada${added !== 1 ? 's' : ''}` +
      (errs ? ` · ${errs} con errores` : '');

    document.getElementById('json-import-area').value = '';

    toast(`${added} recetas importadas ✓`);

    if (added > 0) {
      suggestWANotify();
    }

  } catch (err) {

    console.error(err);

    btn.disabled = false;
    btn.textContent = 'Importar recetas';

    progWrap.style.display = 'none';

    toast('Error en el JSON: ' + err.message);

  }

}