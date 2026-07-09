// STATE
// ══════════════════════════════════════════
const STORES={coto:{name:'COTO',color:'#e31e24'},toledo:{name:'Toledo',color:'#1a5ca8'},disco:{name:'Disco',color:'#e65100'},vital:{name:'Vital',color:'#2e7d2e'},changomas:{name:'Changomás',color:'#6a1b9a'},'la-anonima':{name:'La Anónima',color:'#c8960c'},carrefour:{name:'Carrefour',color:'#004a97'},dia:{name:'Día%',color:'#cc0000'}};
let recipes = [];
let promos = [];
let users = [];
let waHistory = JSON.parse(localStorage.getItem('tc_wa_hist') || '[]');

let editRid = null;
let editPid = null;
let editUid = null;

let ingrTags = [];
let pasosTags = [];
ensureUserPasswords();

// function initDemoRecipes(){
//   recipes=[
//     {id:'r1',name:'Milanesas napolitanas',ytUrl:'',ytId:'',cals:540,porciones:2,
//      ingredientes:[{n:'Carne milanesa',c:'500',u:'g'},{n:'Huevos',c:'2',u:'unidades'},{n:'Pan rallado',c:'100',u:'g'},{n:'Tomate',c:'2',u:'unidades'},{n:'Mozzarella',c:'200',u:'g'}],
//      pasos:['Batir los huevos en un plato hondo.','Pasar la carne por huevo y pan rallado.','Freír hasta dorar.','Gratinar con toppings a 200°C.']},
//     {id:'r2',name:'Fideos al tuco casero',ytUrl:'',ytId:'',cals:480,porciones:4,
//      ingredientes:[{n:'Fideos',c:'400',u:'g'},{n:'Carne picada',c:'300',u:'g'},{n:'Tomate triturado',c:'400',u:'g'},{n:'Cebolla',c:'1',u:'unidades'}],
//      pasos:['Rehogar cebolla.','Agregar carne.','Añadir tomate y cocinar 20 min.','Servir con fideos cocidos.']},
//     {id:'r3',name:'Pollo al limón y romero',ytUrl:'',ytId:'',cals:380,porciones:2,
//      ingredientes:[{n:'Pollo (muslos)',c:'600',u:'g'},{n:'Limón',c:'1',u:'unidades'},{n:'Papa',c:'4',u:'unidades'}],
//      pasos:['Marinar 30 min.','Hornear a 200°C por 45 min.']},
//   ];
//   save('tc_recipes',recipes);
// }
// function initDemoPromos(){
//   promos=[
//     {id:'p1',super:'coto',banco:'Banco Nación',desc:'25% OFF con débito',disc:25,dias:'Martes',vigencia:'Hasta 31/05'},
//     {id:'p2',super:'toledo',banco:'Santander',desc:'30% OFF en el total',disc:30,dias:'Jueves',vigencia:'Hasta 15/06'},
//     {id:'p3',super:'disco',banco:'HSBC',desc:'20% descuento 2do turno',disc:20,dias:'Lun a Vie',vigencia:'Hasta 31/05'},
//     {id:'p4',super:'vital',banco:'Banco Provincia',desc:'25% OFF débito',disc:25,dias:'Todos los días',vigencia:'Hasta 30/06'},
//     {id:'p5',super:'changomas',banco:'Mercado Pago',desc:'10% cashback',disc:10,dias:'Todos los días',vigencia:'Hasta 30/05'},
//   ];
//   save('tc_promos',promos);
// }
// function initDemoUsers(){
//   const now=new Date();
//   const addMon=(d,n)=>{const x=new Date(d);x.setMonth(x.getMonth()+n);return x.toLocaleDateString('es-AR');};
//   users=[
//     {id:'u1',name:'María',apellido:'García',email:'maria@demo.com',password:'maria123',wapp:'+54 9 223 444-5678',plan:'mensual',city:'Mar del Plata',banco:'Santander',joined:now.toLocaleDateString('es-AR'),nextBill:addMon(now,1),status:'activo'},
//     {id:'u2',name:'Carlos',apellido:'López',email:'carlos@demo.com',password:'carlos123',wapp:'+54 9 223 111-2222',plan:'anual',city:'Mar del Plata',banco:'Galicia',joined:addMon(now,-2),nextBill:addMon(now,10),status:'activo'},
//     {id:'u3',name:'Ana',apellido:'Rodríguez',email:'ana@demo.com',password:'ana123',wapp:'+54 9 223 333-4444',plan:'mensual',city:'Balcarce',banco:'BBVA',joined:addMon(now,-1),nextBill:addMon(now,0),status:'activo'},
//     {id:'u4',name:'Lucas',apellido:'Martínez',email:'lucas@demo.com',password:'lucas123',wapp:'+54 9 223 555-6666',plan:'inactivo',city:'Mar del Plata',banco:'',joined:addMon(now,-3),nextBill:'—',status:'inactivo'},
//   ];
//   save('tc_users',users);
// }

function ensureUserPasswords(){
  let changed=false;
  users=users.map(u=>{
    if(u.password) return u;
    const base=(u.email||u.name||'usuario').split('@')[0].toLowerCase().replace(/[^a-z0-9]/g,'')||'usuario';
    changed=true;
    return {...u,password:`${base}123`};
  });
  if(changed) save('tc_users',users);
}

function save(k,v){localStorage.setItem(k,JSON.stringify(v));}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}

// ══════════════════════════════════════════







console.log('supabase =', supabase);
console.log('typeof supabase.from =', typeof supabase.from);




async function testSupabase() {
  const { data, error } = await window.db
    .from('users')
    .select('*');

  console.log('DATA:', data);
  console.log('ERROR:', error);
}

testSupabase();