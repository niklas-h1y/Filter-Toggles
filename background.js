const DEFAULT_SCHEDULE={autoScheduleEnabled:false,nightStart:"19:00",dayStart:"07:00",nightPreset:"night",dayPreset:"original",autoLastPeriod:""};
const PRESETS={
original:{grayscale:0,contrast:100,invert:0,hue:0,sepia:0,saturate:100,brightness:100,blur:0,opacity:100,shadow:0,temperature:0,blueLight:0,vignette:0,grain:0,tintStrength:0,tintColor:"#ff9a5c"},
warm:{grayscale:0,contrast:105,invert:0,hue:0,sepia:18,saturate:112,brightness:100,blur:0,opacity:100,shadow:0,temperature:35,blueLight:0,vignette:0,grain:0,tintStrength:0,tintColor:"#ff9a5c"},
night:{grayscale:0,contrast:112,invert:0,hue:0,sepia:0,saturate:100,brightness:78,blur:0,opacity:100,shadow:0,temperature:22,blueLight:75,vignette:18,grain:0,tintStrength:0,tintColor:"#ff9a5c"},
mono:{grayscale:100,contrast:118,invert:0,hue:0,sepia:0,saturate:100,brightness:100,blur:0,opacity:100,shadow:0,temperature:0,blueLight:0,vignette:24,grain:0,tintStrength:0,tintColor:"#ff9a5c"},
cinema:{grayscale:0,contrast:128,invert:0,hue:0,sepia:0,saturate:118,brightness:100,blur:0,opacity:100,shadow:2,temperature:0,blueLight:0,vignette:35,grain:12,tintStrength:0,tintColor:"#ff9a5c"},
soft:{grayscale:0,contrast:88,invert:0,hue:0,sepia:0,saturate:88,brightness:108,blur:0,opacity:100,shadow:0,temperature:12,blueLight:0,vignette:0,grain:0,tintStrength:0,tintColor:"#ff9a5c"}};
function minutesOfDay(v,f){if(typeof v!=="string"||!/^([01]\d|2[0-3]):[0-5]\d$/.test(v))return f;const [h,m]=v.split(":").map(Number);return h*60+m;}
function currentPeriod(s,now=new Date()){const n=now.getHours()*60+now.getMinutes(),night=minutesOfDay(s.nightStart,1140),day=minutesOfDay(s.dayStart,420);return (night>day?(n>=night||n<day):(n>=night&&n<day))?"night":"day";}
async function applyPresetEverywhere(name,period){const filters=PRESETS[name]||PRESETS.original;await chrome.storage.local.set({...filters,autoLastPeriod:period});const tabs=await chrome.tabs.query({});await Promise.all(tabs.filter(t=>t.id!=null).map(async t=>{try{await chrome.tabs.sendMessage(t.id,{type:"UPDATE_FILTERS",filters});}catch{try{await chrome.scripting.executeScript({target:{tabId:t.id},files:["content.js"]});await chrome.tabs.sendMessage(t.id,{type:"UPDATE_FILTERS",filters});}catch{/* Restricted browser pages cannot be styled. */}}}));}
async function evaluateSchedule(force=false){const s={...DEFAULT_SCHEDULE,...await chrome.storage.local.get(DEFAULT_SCHEDULE)};if(!s.autoScheduleEnabled)return;const p=currentPeriod(s);if(!force&&s.autoLastPeriod===p)return;await applyPresetEverywhere(p==="night"?s.nightPreset:s.dayPreset,p);}
async function ensureAlarm(){await chrome.alarms.create("filter-matrix-schedule",{periodInMinutes:1});await evaluateSchedule(true);}
chrome.runtime.onInstalled.addListener(ensureAlarm);chrome.runtime.onStartup.addListener(ensureAlarm);
chrome.alarms.onAlarm.addListener(a=>{if(a.name==="filter-matrix-schedule")evaluateSchedule(false);});
chrome.runtime.onMessage.addListener((m,s,reply)=>{if(m?.type!=="FILTER_MATRIX_SCHEDULE_CHANGED")return;evaluateSchedule(true).then(()=>reply({success:true})).catch(e=>reply({success:false,error:e.message}));return true;});
