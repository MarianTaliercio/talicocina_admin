const STORES = { coto:{name:'COTO',color:'#e31e24'}, toledo:{name:'Toledo',color:'#1a5ca8'}, disco:{name:'Disco',color:'#e65100'}, vital:{name:'Vital',color:'#2e7d2e'}, changomas:{name:'Changomás',color:'#6a1b9a'}, carrefour:{name:'Carrefour',color:'#004a97'}, dia:{name:'Día%',color:'#cc0000'} };
let recipes = [];
let promos = [];
let users = [];
let waHistory = JSON.parse(localStorage.getItem('tc_wa_hist') || '[]');
let editRid = null;
let editPid = null;
let editUid = null;
let ingrTags = [];
let pasosTags = [];
let referralCodes = [];
let adminPlans = [];
let referralUses = [];
let editReferralId = null;
let foodOptions = [];
let recipeFeedback = [];
let recipeFavorites = [];
let recipeSelections = [];
let promotionReports = [];
let ingredientCategories = [];
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function uid() { return crypto.randomUUID ? crypto.randomUUID() : undefined; }
