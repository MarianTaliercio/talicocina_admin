// MODALS / TOAST
// ══════════════════════════════════════════
function openMo(id){document.getElementById(id).classList.add('on');}
function closeMo(id,e){if(!e||e.target.id===id)document.getElementById(id).classList.remove('on');}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),2600);}

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
