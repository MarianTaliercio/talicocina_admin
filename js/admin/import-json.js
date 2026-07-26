// IMPORTACION MASIVA DE RECETAS
// Acepta tanto el formato del panel como nombres de campos habituales.
const TEST_RECIPES = [
  {
    name: 'Pollo grillado con vegetales', cals: 460, porciones: 2,
    ingredientes: [{ n: 'Pechuga de pollo', c: '2', u: 'unidades' }, { n: 'Zapallito', c: '2', u: 'unidades' }, { n: 'Morrón rojo', c: '1', u: 'unidad' }, { n: 'Aceite de oliva', c: '1', u: 'cda' }],
    pasos: ['Condimentá el pollo con sal, pimienta y limón.', 'Cociná el pollo en una plancha caliente hasta dorar ambos lados.', 'Salteá los vegetales con aceite de oliva y serví junto al pollo.']
  },
  {
    name: 'Pasta cremosa de calabaza', cals: 520, porciones: 2,
    ingredientes: [{ n: 'Fideos secos', c: '180', u: 'g' }, { n: 'Calabaza', c: '400', u: 'g' }, { n: 'Queso crema', c: '80', u: 'g' }, { n: 'Nuez moscada', c: '1', u: 'pizca' }],
    pasos: ['Herví los fideos hasta que queden al dente.', 'Cociná la calabaza, pisala y mezclala con queso crema y nuez moscada.', 'Integrá la salsa con la pasta y serví caliente.']
  },
  {
    name: 'Ensalada tibia de lentejas', cals: 390, porciones: 2,
    ingredientes: [{ n: 'Lentejas cocidas', c: '300', u: 'g' }, { n: 'Tomate cherry', c: '150', u: 'g' }, { n: 'Huevo', c: '2', u: 'unidades' }, { n: 'Rúcula', c: '1', u: 'puñado' }],
    pasos: ['Herví los huevos durante 8 minutos.', 'Mezclá las lentejas tibias con tomate y rúcula.', 'Terminá con huevo en cuartos, aceite de oliva y limón.']
  },
  {
    name: 'Milanesas al horno con puré', cals: 570, porciones: 2,
    ingredientes: [{ n: 'Milanesas de carne', c: '2', u: 'unidades' }, { n: 'Papa', c: '500', u: 'g' }, { n: 'Leche', c: '80', u: 'ml' }, { n: 'Queso rallado', c: '30', u: 'g' }],
    pasos: ['Llevá las milanesas al horno fuerte, dándolas vuelta a mitad de cocción.', 'Herví las papas y prepará un puré con leche y queso.', 'Serví las milanesas doradas con el puré.']
  },
  {
    name: 'Wok de arroz y verduras', cals: 430, porciones: 2,
    ingredientes: [{ n: 'Arroz integral cocido', c: '300', u: 'g' }, { n: 'Brócoli', c: '200', u: 'g' }, { n: 'Zanahoria', c: '1', u: 'unidad' }, { n: 'Salsa de soja', c: '2', u: 'cdas' }],
    pasos: ['Cortá las verduras en trozos pequeños.', 'Saltealas en un wok a fuego alto hasta que estén tiernas pero crocantes.', 'Sumá el arroz, la salsa de soja y mezclá durante dos minutos.']
  },
  {
    name: 'Tortilla de papa y espinaca', cals: 410, porciones: 2,
    ingredientes: [{ n: 'Papa', c: '350', u: 'g' }, { n: 'Huevo', c: '4', u: 'unidades' }, { n: 'Espinaca', c: '150', u: 'g' }, { n: 'Cebolla', c: '1', u: 'unidad' }],
    pasos: ['Cociná la papa en cubos y la cebolla hasta que estén tiernas.', 'Agregá la espinaca para que se reduzca y mezclá con los huevos batidos.', 'Cociná la tortilla en sartén antiadherente, vuelta y vuelta.']
  }
];

function loadJSONDemo() {
  const area = document.getElementById('json-import-area');
  area.value = JSON.stringify(TEST_RECIPES, null, 2);
  document.getElementById('import-result').textContent = '6 recetas de prueba listas para importar.';
  area.focus();
}

function inferImportedIngredientCategory(name) {
  const value = String(name || '').trim().toLocaleLowerCase('es-AR');
  if (/bondiola|peceto|nalga|cuadril|lomo|bife|costilla|asado|milanesa|matambre|vac[ií]o|entraña|paleta|carne|cerdo|chorizo|morcilla|jam[oó]n|panceta/.test(value)) return 'Carnicería';
  if (/pollo|pechuga|pata muslo|muslo|alita|suprema|gallina|pavo/.test(value)) return 'Pollería';
  if (/pescado|merluza|atún|salmon|salmón|calamar|langostino|marisco/.test(value)) return 'Pescadería';
  if (/tomate|papa|cebolla|zanahoria|lechuga|espinaca|zapallo|calabaza|fruta|limón|ajo|morron|morrón|berenjena|zucchini|pepino|acelga|br[oó]coli|coliflor|batata|manzana|banana|naranja|rúcula|rucula/.test(value)) return 'Verdulería';
  if (/leche|queso|yogur|manteca|crema|huevo/.test(value)) return 'Lácteos y frescos';
  if (/pan|tortilla|masa/.test(value)) return 'Panadería';
  if (/agua|jugo|gaseosa|vino|cerveza|bebida/.test(value)) return 'Bebidas';
  if (/congelado|helado/.test(value)) return 'Congelados';
  return 'Almacén';
}

function normalizeImportedIngredient(ingredient) {
  if (typeof ingredient === 'string') {
    return { n: ingredient.trim(), c: '1', u: 'u', category: inferImportedIngredientCategory(ingredient) };
  }
  const name = String(ingredient?.n || ingredient?.name || ingredient?.nombre || '').trim();
  return {
    n: name,
    c: String(ingredient?.c ?? ingredient?.quantity ?? ingredient?.cantidad ?? '1'),
    u: String(ingredient?.u || ingredient?.unit || ingredient?.unidad || 'u'),
    category: String(ingredient?.category || ingredient?.categoria || ingredient?.rubro || inferImportedIngredientCategory(name)).trim()
  };
}

function normalizeImportedRecipe(item) {
  const ingredients = item.ingredientes || item.ingredients || [];
  const steps = item.pasos || item.steps || item.instructions || [];
  const youtubeUrl = item.ytUrl || item.youtube_url || item.youtubeUrl || '';
  return {
    id: item.id || uid(),
    name: String(item.name || item.nombre || item.title || '').trim(),
    ytUrl: youtubeUrl,
    ytId: item.ytId || item.youtube_id || getYTId(youtubeUrl) || '',
    cals: Number(item.cals ?? item.calories ?? item.calorias) || 0,
    porciones: Math.max(1, Number(item.porciones ?? item.servings ?? item.raciones) || 2),
    ingredientes: Array.isArray(ingredients) ? ingredients.map(normalizeImportedIngredient).filter(ingredient => ingredient.n) : [],
    pasos: Array.isArray(steps) ? steps : [],
    allergens: Array.isArray(item.allergens || item.alergenos) ? (item.allergens || item.alergenos) : [],
    dietaryTags: Array.isArray(item.dietaryTags || item.dietary_tags || item.etiquetas_alimentarias) ? (item.dietaryTags || item.dietary_tags || item.etiquetas_alimentarias) : [],
    isActive: item.isActive !== false && item.is_active !== false
  };
}

async function importJSON() {
  const area = document.getElementById('json-import-area');
  let raw = area.value.trim();
  if (!raw) return toast('Pegá el JSON o cargá las recetas de prueba primero.');

  const btn = document.getElementById('import-btn');
  const prog = document.getElementById('import-prog');
  const progWrap = document.getElementById('import-prog-wrap');
  const result = document.getElementById('import-result');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Importando...';
  result.textContent = '';
  progWrap.style.display = 'block';
  prog.style.width = '0%';

  try {
    raw = raw.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('El JSON debe ser una lista de recetas entre [ ].');
    if (!parsed.length) throw new Error('La lista de recetas está vacía.');

    const valid = parsed.map(normalizeImportedRecipe).filter(recipe => recipe.name);
    const omitted = parsed.length - valid.length;
    if (!valid.length) throw new Error('Cada receta necesita al menos un nombre.');

    const importedCategoryNames = [...new Set(valid.flatMap(recipe => recipe.ingredientes.map(ingredient => ingredient.category)).filter(Boolean))];
    for (const categoryName of importedCategoryNames) {
      if (ingredientCategories.some(item => item.name.toLocaleLowerCase('es-AR') === categoryName.toLocaleLowerCase('es-AR'))) continue;
      const { data: category } = await adminRequest('ingredient_category_upsert', { name: categoryName, sort_order: ingredientCategories.length * 10 + 10 });
      ingredientCategories.push(category);
    }

    const imported = [];
    const failures = [];
    for (let index = 0; index < valid.length; index++) {
      const recipe = valid[index];
      try {
        imported.push(await upsertRecipeToSupabase(recipe));
      } catch (error) {
        console.error('No se pudo importar:', recipe.name, error);
        failures.push(`${recipe.name}: ${error.message || 'error de guardado'}`);
      }
      prog.style.width = `${Math.round(((index + 1) / valid.length) * 100)}%`;
    }

    await loadAdminSupabaseData();
    renderRecipeTable(); updateBadges(); renderDashboard();
    if (imported.length) suggestWANotify();

    const detail = [
      `${imported.length} receta${imported.length === 1 ? '' : 's'} importada${imported.length === 1 ? '' : 's'}`,
      omitted ? `${omitted} sin nombre omitida${omitted === 1 ? '' : 's'}` : '',
      failures.length ? `${failures.length} con error` : ''
    ].filter(Boolean).join(' · ');
    result.textContent = detail;
    result.title = failures.join('\n');
    if (imported.length) area.value = '';
    toast(imported.length ? `Importación terminada: ${imported.length} recetas.` : 'No se pudo guardar ninguna receta.');
  } catch (error) {
    console.error('Error importando JSON', error);
    result.textContent = error.message || 'No se pudo leer el JSON.';
    toast(`Error al importar: ${error.message || 'revisá el formato'}`);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Importar recetas';
    progWrap.style.display = 'none';
  }
}
