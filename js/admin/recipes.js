// RECIPES
// ══════════════════════════════════════════
function renderRecipeTable(){
  const q=(document.getElementById('recipe-search')?.value||'').toLowerCase();
  const filtered=recipes.filter(r=>!q||r.name.toLowerCase().includes(q));
  document.getElementById('recipes-count-lbl').textContent=`${filtered.length} receta${filtered.length!==1?'s':''} cargada${filtered.length!==1?'s':''}`;
  document.getElementById('recipe-tbody').innerHTML=filtered.map(r=>{
    const ytOk=r.ytId&&r.ytId.length===11;
    return `<tr>
      <td>${ytOk?`<img class="td-thumb" src="https://img.youtube.com/vi/${r.ytId}/mqdefault.jpg" loading="lazy">`:`<div class="td-ph">🍽</div>`}</td>
      <td class="td-name">${r.name}</td>
      <td>${r.cals?`<span class="badge badge-amber">${r.cals} kcal</span>`:'—'}</td>
      <td><span class="badge badge-green">${(r.ingredientes||[]).length} ingr.</span></td>
      <td>${(r.pasos||[]).length} paso${(r.pasos||[]).length!==1?'s':''}</td>
      <td>${ytOk?`<a href="${r.ytUrl}" target="_blank" style="font-size:12px;color:var(--red)">▶ YouTube</a>`:'<span style="color:var(--ink4)">—</span>'}</td>
      <td><div style="display:flex;gap:5px">
        <button class="btn-icon btn-e" onclick="openRecipeForm('${r.id}')">✏️</button>
        <button class="btn-icon btn-d" onclick="delRecipe('${r.id}')">🗑</button>
      </div></td>
    </tr>`;
  }).join('')||`<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--ink4)">Sin recetas. Agregá la primera.</td></tr>`;
}

function renderIngredientCategoryOptions(selectedName = '') {
  const select = document.getElementById('ingr-category');
  if (!select) return;
  const active = ingredientCategories.filter(item => item.is_active !== false);
  select.innerHTML = active.map(item => `<option value="${item.name}">${item.name}</option>`).join('');
  const preferred = active.find(item => item.name === selectedName)?.name
    || active.find(item => item.name === 'Almacén')?.name
    || active[0]?.name || '';
  select.value = preferred;
}

async function addIngredientCategory() {
  const input = document.getElementById('new-ingr-category');
  const name = input.value.trim();
  if (!name) return toast('Escribí el nombre de la categoría');
  const existing = ingredientCategories.find(item => item.name.toLocaleLowerCase('es-AR') === name.toLocaleLowerCase('es-AR'));
  if (existing) {
    renderIngredientCategoryOptions(existing.name);
    input.value = '';
    return toast('Esa categoría ya existe');
  }
  try {
    const { data } = await adminRequest('ingredient_category_upsert', { name, sort_order: ingredientCategories.length * 10 + 10 });
    ingredientCategories.push(data);
    ingredientCategories.sort((a, b) => Number(a.sort_order) - Number(b.sort_order) || a.name.localeCompare(b.name));
    renderIngredientCategoryOptions(data.name);
    input.value = '';
    toast('Categoría agregada');
  } catch (error) { toast(error.message); }
}

async function deleteIngredientCategory() {
  const select = document.getElementById('ingr-category');
  const category = ingredientCategories.find(item => item.name === select.value);
  if (!category) return;
  if (!confirm(`¿Eliminar "${category.name}" del selector? Los ingredientes ya guardados conservarán esa categoría.`)) return;
  try {
    await adminRequest('ingredient_category_delete', { id: category.id });
    ingredientCategories = ingredientCategories.filter(item => item.id !== category.id);
    renderIngredientCategoryOptions();
    toast('Categoría eliminada del selector');
  } catch (error) { toast(error.message); }
}

async function delRecipe(id){

  if(!confirm('¿Eliminar esta receta?')) return;

  try{

    await deleteRecipeFromSupabase(id);

    recipes=recipes.filter(r=>r.id!==id);

    save('tc_recipes',recipes);

    renderRecipeTable();
    updateBadges();
    renderDashboard();

    toast('Receta eliminada');

  }catch(err){

    console.error(err);

    toast('Error al eliminar de Supabase');
  }
}

function openRecipeForm(id){
  editRid=id; ingrTags=[]; pasosTags=[];
  ['rf-name','rf-yt','rf-cals','rf-duration','rf-allergens','rf-dietary-tags'].forEach(fid=>document.getElementById(fid).value='');
  document.getElementById('rf-porciones').value='2';
  document.getElementById('rf-yt-prev').innerHTML='';
  document.getElementById('mo-recipe-title').textContent=id?'Editar receta':'Nueva receta';
  renderIngredientCategoryOptions();
  renderTagsUI('ingr'); renderTagsUI('pasos');
  if(id){
    const r=recipes.find(x=>x.id===id);if(!r) return;
    document.getElementById('rf-name').value=r.name||'';
    document.getElementById('rf-yt').value=r.ytUrl||'';
    document.getElementById('rf-cals').value=r.cals||'';
    document.getElementById('rf-duration').value=r.durationMinutes||'';
    document.getElementById('rf-allergens').value=(r.allergens||[]).join(', ');
    document.getElementById('rf-dietary-tags').value=(r.dietaryTags||[]).join(', ');
    document.getElementById('rf-porciones').value=r.porciones||2;
    ingrTags=[...(r.ingredientes||[]).map(i=>({...i}))];
    pasosTags=[...(r.pasos||[])];
    renderTagsUI('ingr'); renderTagsUI('pasos');
    if(r.ytId&&r.ytId.length===11) showYTPrev(r.ytId);
  }
  openMo('mo-recipe');
}

function handleTag(e, type){
  if(e.key==='Enter'){
    e.preventDefault();
    const val=e.target.value.trim();
    if(!val) return;
    if(type==='ingr'){
      const p=val.split(',').map(s=>s.trim());
      ingrTags.push({n:p[0]||val, c:p[1]||'1', u:p[2]||'u', category:p[3]||document.getElementById('ingr-category')?.value||''});
    } else {
      pasosTags.push(val);
    }
    e.target.value='';
    renderTagsUI(type);
  } else if(e.key==='Backspace'&&!e.target.value){
    if(type==='ingr'&&ingrTags.length){ ingrTags.pop(); renderTagsUI('ingr'); }
    if(type==='pasos'&&pasosTags.length){ pasosTags.pop(); renderTagsUI('pasos'); }
  }
}

function renderTagsUI(type){
  const isIngr=type==='ingr';
  const wrap=document.getElementById(type+'-wrap');
  const inp=document.getElementById(type+'-inp');
  wrap.querySelectorAll('.tag').forEach(t=>t.remove());
  const arr=isIngr?ingrTags:pasosTags;
  arr.forEach((t,i)=>{
    const div=document.createElement('div');
    div.className=`tag ${isIngr?'tag-green':'tag-blue'}`;
    if(isIngr && t.category) {
      div.dataset.category=t.category;
      div.title=`Categoría: ${t.category}`;
    }
    div.innerHTML=isIngr
      ?`${t.n} <span style="opacity:.65">${t.c} ${t.u}</span><button onclick="rmTag('${type}',${i})">×</button>`
      :`<span style="opacity:.6;margin-right:3px">${i+1}.</span>${t.length>50?t.slice(0,50)+'…':t}<button onclick="rmTag('${type}',${i})">×</button>`;
    wrap.insertBefore(div,inp);
  });
}

function rmTag(type,i){
  if(type==='ingr') ingrTags.splice(i,1);
  else pasosTags.splice(i,1);
  renderTagsUI(type);
}

function prevYT(url){
  const id=getYTId(url);
  if(id) showYTPrev(id);
  else document.getElementById('rf-yt-prev').innerHTML='';
}
function showYTPrev(id){
  document.getElementById('rf-yt-prev').innerHTML=`<div class="yt-prev"><img src="https://img.youtube.com/vi/${id}/mqdefault.jpg"><div class="yt-prev-lbl">Vista previa del thumbnail</div></div>`;
}
function getYTId(url){
  if(!url) return null;

  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/shorts\/|[?&]v=|embed\/)([A-Za-z0-9_-]{11})/
  );

  return match ? match[1] : null;
}
async function saveRecipe(){
  const name=document.getElementById('rf-name').value.trim();

  if(!name){
    toast('Escribí el nombre de la receta');
    return;
  }

  const rawIngr=document.getElementById('ingr-inp').value.trim();
  if(rawIngr){
    const p=rawIngr.split(',').map(s=>s.trim());
    ingrTags.push({
      n:p[0],
      c:p[1]||'1',
      u:p[2]||'u',
      category:p[3]||document.getElementById('ingr-category')?.value||''
    });
  }

  const rawPaso=document.getElementById('pasos-inp').value.trim();
  if(rawPaso) pasosTags.push(rawPaso);

  const ytUrl=document.getElementById('rf-yt').value.trim();
  const ytId=getYTId(ytUrl)||'';

  const recipeData={
    name,
    ytUrl,
    ytId,
    cals:parseInt(document.getElementById('rf-cals').value)||0,
    durationMinutes:parseInt(document.getElementById('rf-duration').value)||0,
    porciones:parseInt(document.getElementById('rf-porciones').value)||2,
    ingredientes:[...ingrTags],
    pasos:[...pasosTags],
    allergens:document.getElementById('rf-allergens').value.split(',').map(value=>value.trim()).filter(Boolean),
    dietaryTags:document.getElementById('rf-dietary-tags').value.split(',').map(value=>value.trim()).filter(Boolean)
  };

  try{

    let recipe;

    if(editRid){

      const idx=recipes.findIndex(r=>r.id===editRid);

      recipe={
        ...recipes[idx],
        ...recipeData
      };

      recipes[idx]=recipe;

    }else{

      recipe={
        id:uid(),
        ...recipeData
      };

      recipes.push(recipe);
    }

    recipe = await upsertRecipeToSupabase(recipe);
    if(editRid) recipes[recipes.findIndex(r => r.id === editRid)] = recipe;
    else recipes[recipes.length - 1] = recipe;
    
    

    save('tc_recipes',recipes);

    closeMo('mo-recipe');

    renderRecipeTable();
    updateBadges();
    renderDashboard();

    toast(
      editRid
        ? 'Receta actualizada ✓'
        : 'Receta guardada ✓'
    );

    if(!editRid){
      suggestWANotify();
    }

  }catch(err){

    console.error(err);

    toast(`Error al guardar: ${err.message || 'revisar permisos de Supabase'}`);
  }
}

function suggestWANotify(){
  setTimeout(()=>{
    if(confirm('¿Querés enviar la notificación de WhatsApp a los usuarios ahora?')){
      goView('notificaciones',document.getElementById('ni-notificaciones'));
      renderNotificaciones();
    }
  },400);
}

// ══════════════════════════════════════════
