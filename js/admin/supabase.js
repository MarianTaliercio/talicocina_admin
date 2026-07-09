const SUPABASE_URL = 'https://cvqhrbeophtkersnpsxr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_sEhwuKxRQodMSWCBaiQamg_wuFqqxwm';

window.db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

console.log('Cliente:', window.db);

function parseJsonField(value, fallback){
  if(Array.isArray(value)) return value;
  if(!value) return fallback;
  if(typeof value === 'string'){
    try { return JSON.parse(value); }
    catch { return fallback; }
  }
  return fallback;
}

function normalizeRecipe(row){
  return {
    id: row.id,
    name: row.name || row.nombre || '',
    ytUrl: row.ytUrl || row.yt_url || row.youtube_url || '',
    ytId: row.ytId || row.yt_id || row.youtube_id || '',
    cals: parseInt(row.cals ?? row.calorias ?? row.calories) || 0,
    porciones: parseInt(row.porciones ?? row.portions) || 2,
    ingredientes: parseJsonField(row.ingredientes ?? row.ingredients, []),
    pasos: parseJsonField(row.pasos ?? row.steps, []),
  };
}

function normalizePromo(row){
  return {
    id: row.id,
    super: row.super || row.store || row.supermercado || 'coto',
    banco: row.banco || row.bank || '',
    desc: row.desc || row.description || row.descripcion || '',
    disc: parseInt(row.disc ?? row.discount ?? row.descuento) || 0,
    dias: row.dias || row.days || '',
    vigencia: row.vigencia || row.valid_until || row.validity || '',
  };
}

async function fetchSupabaseTable(table, mapper){
  if(!window.db) return null;
  const { data, error } = await window.db.from(table).select('*');
  if(error){
    console.warn(`No se pudo cargar ${table} desde Supabase`, error);
    return null;
  }
  return (data || []).map(mapper);
}

async function loadAdminSupabaseData(){

  const [remoteRecipes, remotePromos, remoteUsers] = await Promise.all([
    fetchSupabaseTable('recipes', normalizeRecipe),
    fetchSupabaseTable('promos', normalizePromo),
    fetchSupabaseTable('users', user => user),
  ]);

  if(remoteRecipes !== null){
    recipes = remoteRecipes;
    save('tc_recipes', recipes);
  }

  if(remotePromos !== null){
    promos = remotePromos;
    save('tc_promos', promos);
  }

  if(remoteUsers !== null){
    users = remoteUsers;
    save('tc_users', users);
  }

}

function toRecipeRow(recipe){
  return {
    id: recipe.id,
    name: recipe.name || '',
    ytUrl: recipe.ytUrl || '',
    ytId: recipe.ytId || '',
    cals: parseInt(recipe.cals) || 0,
    porciones: parseInt(recipe.porciones) || 2,
    ingredientes: recipe.ingredientes || [],
    pasos: recipe.pasos || [],
  };
}

function toPromoRow(promo){
  return {
    id: promo.id,
    super: promo.super || 'coto',
    banco: promo.banco || '',
    desc: promo.desc || '',
    disc: parseInt(promo.disc) || 0,
    dias: promo.dias || '',
    vigencia: promo.vigencia || '',
  };
}

async function upsertRecipeToSupabase(recipe){
  const { error } = await window.db
    .from('recipes')
    .upsert(toRecipeRow(recipe), { onConflict: 'id' });
  if(error) throw error;
}

async function deleteRecipeFromSupabase(id){
  const { error } = await window.db.from('recipes').delete().eq('id', id);
  if(error) throw error;
}

async function upsertPromoToSupabase(promo){
  const { error } = await window.db
    .from('promos')
    .upsert(toPromoRow(promo), { onConflict: 'id' });
  if(error) throw error;
}

async function deletePromoFromSupabase(id){
  const { error } = await window.db.from('promos').delete().eq('id', id);
  if(error) throw error;
}
