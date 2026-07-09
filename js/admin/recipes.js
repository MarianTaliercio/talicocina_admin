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
  ['rf-name','rf-yt','rf-cals'].forEach(fid=>document.getElementById(fid).value='');
  document.getElementById('rf-porciones').value='2';
  document.getElementById('rf-yt-prev').innerHTML='';
  document.getElementById('mo-recipe-title').textContent=id?'Editar receta':'Nueva receta';
  renderTagsUI('ingr'); renderTagsUI('pasos');
  if(id){
    const r=recipes.find(x=>x.id===id);if(!r) return;
    document.getElementById('rf-name').value=r.name||'';
    document.getElementById('rf-yt').value=r.ytUrl||'';
    document.getElementById('rf-cals').value=r.cals||'';
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
      ingrTags.push({n:p[0]||val, c:p[1]||'1', u:p[2]||'u'});
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
      u:p[2]||'u'
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
    porciones:parseInt(document.getElementById('rf-porciones').value)||2,
    ingredientes:[...ingrTags],
    pasos:[...pasosTags]
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

    await upsertRecipeToSupabase(recipe);
    
    

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

    toast('Error al guardar en Supabase');
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
