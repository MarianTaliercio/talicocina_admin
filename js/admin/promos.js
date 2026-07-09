// PROMOS
// ══════════════════════════════════════════
function renderPromoTable(){
  document.getElementById('promo-tbody').innerHTML=promos.map(p=>{
    const s=STORES[p.super]||{name:p.super,color:'#555'};
    return `<tr>
      <td><div style="display:flex;align-items:center;gap:8px"><div style="width:30px;height:30px;border-radius:6px;background:${s.color};display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:white">${s.name.slice(0,4)}</div>${s.name}</div></td>
      <td><span class="badge badge-blue">${p.banco}</span></td>
      <td style="max-width:220px">${p.desc}</td>
      <td>${p.disc?`<span style="font-weight:700;color:var(--red)">-${p.disc}%</span>`:'—'}</td>
      <td style="font-size:12px">${p.dias||'—'}</td>
      <td style="font-size:12px">${p.vigencia||'—'}</td>
      <td><div style="display:flex;gap:5px">
        <button class="btn-icon btn-e" onclick="openPromoForm('${p.id}')">✏️</button>
        <button class="btn-icon btn-d" onclick="delPromo('${p.id}')">🗑</button>
      </div></td>
    </tr>`;
  }).join('')||`<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--ink4)">Sin promos. Agregá la primera.</td></tr>`;
}

function openPromoForm(id){
  editPid=id;
  ['pf-desc','pf-disc','pf-dias','pf-vigencia'].forEach(fid=>document.getElementById(fid).value='');
  document.getElementById('mo-promo-title').textContent=id?'Editar promo':'Nueva promo';
  if(id){
    const p=promos.find(x=>x.id===id);if(!p) return;
    document.getElementById('pf-super').value=p.super||'coto';
    document.getElementById('pf-banco').value=p.banco||'';
    document.getElementById('pf-desc').value=p.desc||'';
    document.getElementById('pf-disc').value=p.disc||'';
    document.getElementById('pf-dias').value=p.dias||'';
    document.getElementById('pf-vigencia').value=p.vigencia||'';
  }
  openMo('mo-promo');
}

async function savePromo(){

  const desc=document.getElementById('pf-desc').value.trim();

  if(!desc){
    toast('Escribí la descripción');
    return;
  }

  const data={
    super:document.getElementById('pf-super').value,
    banco:document.getElementById('pf-banco').value,
    desc,
    disc:parseInt(document.getElementById('pf-disc').value)||0,
    dias:document.getElementById('pf-dias').value.trim(),
    vigencia:document.getElementById('pf-vigencia').value.trim()
  };

  try{

    let promo;

    if(editPid){

      const idx=promos.findIndex(p=>p.id===editPid);

      promo={
        ...promos[idx],
        ...data
      };

      promos[idx]=promo;

    }else{

      promo={
        id:uid(),
        ...data
      };

      promos.push(promo);
    }

    await upsertPromoToSupabase(promo);

    save('tc_promos',promos);

    closeMo('mo-promo');

    renderPromoTable();
    updateBadges();

    toast(
      editPid
        ? 'Promo actualizada ✓'
        : 'Promo guardada ✓'
    );

  }catch(err){

    console.error(err);
    toast('Error al guardar en Supabase');

  }
}

async function delPromo(id){

  if(!confirm('¿Eliminar esta promo?')) return;

  try{

    await deletePromoFromSupabase(id);

    promos=promos.filter(p=>p.id!==id);

    save('tc_promos',promos);

    renderPromoTable();
    updateBadges();

    toast('Promo eliminada');

  }catch(err){

    console.error(err);
    toast('Error al eliminar de Supabase');

  }
}

// ══════════════════════════════════════════
