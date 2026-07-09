// SIDEBAR MOBILE TOGGLE
function toggleSidebar(){
  const sb=document.querySelector('.sidebar');
  const ov=document.getElementById('sidebar-overlay');
  const open=sb.classList.toggle('open');
  ov.classList.toggle('on',open);
  document.body.style.overflow=open?'hidden':'';
}

function closeSidebar(){
  document.querySelector('.sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('on');
  document.body.style.overflow='';
}

document.querySelectorAll('.nav-item').forEach(item=>{
  item.addEventListener('click',()=>{
    if(window.innerWidth<=768) closeSidebar();
  });
});

window.addEventListener('resize',()=>{
  if(window.innerWidth>768) closeSidebar();
});
