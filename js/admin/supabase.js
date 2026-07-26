const SUPABASE_URL = 'https://cvqhrbeophtkersnpsxr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_sEhwuKxRQodMSWCBaiQamg_wuFqqxwm';
window.db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const ADMIN_API_URL = `${SUPABASE_URL}/functions/v1/admin-api`;
async function adminRequest(action, payload = {}) {
  const response = await fetch(ADMIN_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-user': sessionStorage.getItem('tc_admin_user') || '', 'x-admin-password': sessionStorage.getItem('tc_admin_password') || '' }, body: JSON.stringify({ action, payload }) });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'No se pudo comunicar con el backend');
  return body;
}

let banks = []; let supermarkets = []; let subscriptions = [];
const WEEKDAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
function parseJsonField(value, fallback = []) { if (Array.isArray(value)) return value; try { return JSON.parse(value || '[]'); } catch (_) { return fallback; } }
function normalizeRecipe(row) { return { id: row.id, name: row.name || '', ytUrl: row.youtube_url || '', ytId: row.youtube_id || '', cals: Number(row.calories) || 0, porciones: Number(row.servings) || 1, durationMinutes: Number(row.duration_minutes) || 0, ingredientes: parseJsonField(row.ingredients), pasos: parseJsonField(row.steps), allergens: parseJsonField(row.allergens), dietaryTags: parseJsonField(row.dietary_tags), isActive: row.is_active !== false }; }
function normalizePromo(row) {
  const weekdays = (row.promotion_weekdays || []).map(item => item.weekday).sort((a,b) => a-b);
  return { id: row.id, name: row.name, super: row.supermarkets?.name || '', banco: row.banks?.name || '', desc: row.description || '', disc: Number(row.discount_percentage) || 0, dias: weekdays.length ? weekdays.map(day => WEEKDAY_NAMES[day - 1]).join(', ') : 'Todos los días', vigencia: `${formatDate(row.valid_from)} al ${formatDate(row.valid_to)}`, bankId: row.bank_id, supermarketId: row.supermarket_id, validFrom: row.valid_from, validTo: row.valid_to, discountCap: row.discount_cap, minimumPurchase: row.minimum_purchase, weekdays };
}
function formatDate(value) { return value ? new Date(`${value}T00:00:00`).toLocaleDateString('es-AR') : ''; }
async function select(table, query = '*') { const { data, error } = await window.db.from(table).select(query); if (error) throw error; return data || []; }

async function loadAdminSupabaseData() {
  try {
    const data = await adminRequest('data');
    recipes = data.recipes.map(normalizeRecipe); promos = data.promotions.map(normalizePromo); users = data.users; banks = data.banks; supermarkets = data.supermarkets; subscriptions = data.subscriptions; referralCodes = data.referralCodes; adminPlans = data.plans; referralUses = data.referralUses; foodOptions = data.foodOptions || []; recipeFeedback = data.feedback || []; recipeFavorites = data.favorites || []; recipeSelections = data.selections || []; promotionReports = data.promotionReports || []; ingredientCategories = data.ingredientCategories || [];
  } catch (error) { console.error('No se pudo cargar la base de datos', error); toast(`No se pudo cargar datos: ${error.message || 'revisar backend'}`); }
}
function toRecipeRow(recipe) { const row = { name: recipe.name || '', youtube_url: recipe.ytUrl || null, youtube_id: recipe.ytId || null, calories: Number(recipe.cals) || null, servings: Number(recipe.porciones) || 1, duration_minutes: Number(recipe.durationMinutes) || null, ingredients: recipe.ingredientes || [], steps: recipe.pasos || [], allergens: recipe.allergens || [], dietary_tags: recipe.dietaryTags || [], is_active: recipe.isActive !== false }; if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(recipe.id || '')) row.id = recipe.id; return row; }
async function upsertRecipeToSupabase(recipe) { const { data } = await adminRequest('recipe_upsert', { row: toRecipeRow(recipe) }); return normalizeRecipe(data); }
async function deleteRecipeFromSupabase(id) { await adminRequest('recipe_delete', { id }); }
async function ensureNamedEntity(table, name) { if (!name) return null; const found = (await select(table, 'id,name')).find(item => item.name.toLowerCase() === name.toLowerCase()); if (found) return found.id; const { data, error } = await window.db.from(table).insert({ name }).select('id').single(); if (error) throw error; return data.id; }
async function upsertPromoToSupabase(promo) {
  const { data } = await adminRequest('promo_upsert', { promo }); return data;
  /*
  const bankId = await ensureNamedEntity('banks', promo.banco); const supermarketId = await ensureNamedEntity('supermarkets', promo.super);
  const row = { id: promo.id || undefined, name: promo.name || promo.desc, description: promo.desc || null, bank_id: bankId, supermarket_id: supermarketId, discount_percentage: Number(promo.disc), discount_cap: promo.discountCap === '' ? null : promo.discountCap, minimum_purchase: Number(promo.minimumPurchase) || 0, valid_from: promo.validFrom, valid_to: promo.validTo, is_active: true };
  const { data, error } = await window.db.from('promotions').upsert(row, { onConflict: 'id' }).select().single(); if (error) throw error;
  const { error: deleteError } = await window.db.from('promotion_weekdays').delete().eq('promotion_id', data.id); if (deleteError) throw deleteError;
  if ((promo.weekdays || []).length) { const { error: weekdayError } = await window.db.from('promotion_weekdays').insert(promo.weekdays.map(weekday => ({ promotion_id: data.id, weekday }))); if (weekdayError) throw weekdayError; }
  return data; */
}
async function deletePromoFromSupabase(id) { await adminRequest('promo_delete', { id }); }
