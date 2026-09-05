/* DHR Companion: browser-only local RAG demo. No API key or network request is needed. */
const landmarks = [
  {id:'njp', name:'New Jalpaiguri', short:'The mountain journey begins', distance:'at the starting point', built:'1964', known:'Gateway to the hills', altitude:'390 ft', progress:0, coords:[26.6827,88.4457], insight:'Your narrow-gauge journey begins on the plains before it starts its remarkable climb into the Himalayan foothills.'},
  {id:'sukna', name:'Sukna Forest', short:'Where the railway enters the foothills', distance:'within 300 m', built:'1880s', known:'Forest & steep gradient', altitude:'500 ft', progress:15, coords:[26.842,88.384], insight:'Beyond Sukna, the line leaves the plains and begins threading through sal forest towards the mountains.'},
  {id:'tindharia', name:'Tindharia', short:'The railway’s engineering heart', distance:'within 240 m', built:'1881', known:'Historic workshop', altitude:'2,820 ft', progress:36, coords:[26.879,88.304], insight:'This is where the DHR’s workshop has kept its famous little locomotives and rolling stock alive for generations.'},
  {id:'kurseong', name:'Kurseong', short:'The town of white orchids', distance:'within 120 m', built:'1880', known:'Hill station & tea', altitude:'4,864 ft', progress:52, coords:[26.882,88.278], insight:'Kurseong is a cool hill town where the railway shares the street with everyday life, tea gardens, and mist.'},
  {id:'ghum', name:'Ghum Station', short:'India’s highest railway station', distance:'within 95 m', built:'1881', known:'India’s highest station', altitude:'7,407 ft', progress:82, coords:[26.733,88.263], insight:'At 7,407 feet, Ghum is India’s highest railway station and one of the most atmospheric pauses on the route.'},
  {id:'batasia', name:'Batasia Loop', short:'A graceful spiral beneath Kanchenjunga', distance:'within 180 m', built:'1919', known:'A full 360° loop', altitude:'6,700 ft', progress:72, coords:[26.7284,88.2543], insight:'The railway spirals through a garden to gain height gracefully — with Kanchenjunga watching over the curve.'},
  {id:'darjeeling', name:'Darjeeling', short:'The railway’s hill-top finale', distance:'at the destination', built:'1881', known:'Toy Train terminus', altitude:'6,700 ft', progress:100, coords:[27.036,88.262], insight:'You have reached Darjeeling, where a mountain railway built for transport became a living heritage experience.'}
];

const knowledgeBase = [
  {title:'Batasia Loop', tags:['batasia','loop','spiral','curve','why','turn','climb','gradient','garden'], text:'Batasia Loop was built in 1919 so the Darjeeling Himalayan Railway could gain height over a short distance without making its gradient too steep. The track makes a complete 360-degree loop through a landscaped garden. From it, visitors can often see Darjeeling town and Kanchenjunga. A Gorkha war memorial stands in the garden today.', landmark:'batasia'},
  {title:'Ghum: a station in the clouds', tags:['ghum','highest','station','altitude','museum','cloud'], text:'Ghum station, at about 7,407 feet or 2,258 metres, is India’s highest railway station. Opened in 1881, it is a key stop just before the final descent toward Batasia and Darjeeling. The nearby railway museum helps tell the story of the line and its people.', landmark:'ghum'},
  {title:'The Z-reverses', tags:['z','reverse','reverses','zigzag','back','forth','engineering','gradient','climb'], text:'A Z-reverse is an ingenious railway manoeuvre for climbing steep ground. The train runs forward into a dead-end spur, then reverses out on a different track, forming a zigzag shape. The DHR used reverses near the early route, alongside loops, to gain elevation without rack rails.', landmark:'tindharia'},
  {title:'A railway built for the mountains', tags:['history','built','1881','construction','franklin','prestage','start','old'], text:'Construction of the Darjeeling Himalayan Railway began in 1879 under the guidance of Franklin Prestage, and the line reached Darjeeling in 1881. Its 2-foot narrow gauge, tight curves, loops and reverses made an affordable route through exceptionally difficult Himalayan terrain.', landmark:'njp'},
  {title:'UNESCO World Heritage', tags:['unesco','world','heritage','important','special','listed','recognition'], text:'The Darjeeling Himalayan Railway was inscribed as a UNESCO World Heritage Site in 1999, later becoming part of the Mountain Railways of India. UNESCO recognises it as an outstanding example of a hill passenger railway that used bold, innovative engineering to influence later mountain railways.', landmark:'darjeeling'},
  {title:'The famous B-class locomotive', tags:['locomotive','engine','steam','b class','b-class','toy','train','coal'], text:'The DHR is closely associated with its B-class 0-4-0ST steam locomotives. Built from 1889 onwards, these compact saddle-tank engines were designed for sharp curves and steep Himalayan work. Their small size and rhythmic exhaust are why many visitors affectionately call this the Toy Train.', landmark:'tindharia'},
  {title:'Tindharia workshop', tags:['tindharia','workshop','repair','maintenance','engineers','locomotive'], text:'Tindharia has long been the operational and engineering heart of the DHR. Its historic workshop has maintained locomotives, coaches and railway equipment that cope with a demanding mountain line. It represents the living craft knowledge behind the heritage railway.', landmark:'tindharia'},
  {title:'Kurseong and street running', tags:['kurseong','street','road','town','tea','orchid'], text:'At Kurseong, the DHR is woven into the town rather than kept apart from it. The track runs close to roads and shops, a memorable example of how this railway has always been part of everyday hill life. Kurseong is also known as the Land of White Orchids.', landmark:'kurseong'},
  {title:'Why the DHR is narrow gauge', tags:['narrow','gauge','two','feet','track','small','why','curves'], text:'The DHR uses a 2-foot or 610 mm narrow gauge. A narrow gauge was practical and economical in the Himalayan foothills: it could negotiate extremely tight bends, fit along difficult slopes, and need less heavy earthwork than a standard-gauge railway.', landmark:'sukna'},
  {title:'Sukna: foothills to forest', tags:['sukna','forest','plains','foothills','start','gradient','sal'], text:'Sukna marks a dramatic transition. Beyond the plains, the DHR begins its mountain ascent through forested foothills. The engineering challenge changes quickly here: the railway must rise while respecting the contours of a landscape that is both steep and rain-soaked.', landmark:'sukna'}
];

const state = { location: landmarks.find(l => l.id === 'batasia'), mode:'demo', sound:false };
const $ = selector => document.querySelector(selector);
const escapeHTML = value => value.replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

function tokenise(value) { return value.toLowerCase().replace(/[^a-z0-9\s-]/g,' ').split(/\s+/).filter(Boolean); }
function retrieve(question) {
  const query = tokenise(question);
  const locTokens = tokenise(state.location.name);
  return knowledgeBase.map(doc => {
    const tags = [...doc.tags, ...tokenise(doc.title), ...tokenise(doc.text)];
    const overlap = query.reduce((score, term) => score + (tags.includes(term) ? 3 : 0), 0);
    const locationBias = doc.landmark === state.location.id ? 4 : locTokens.some(term => tags.includes(term)) ? 1 : 0;
    return {...doc, score:overlap + locationBias};
  }).sort((a,b) => b.score - a.score).slice(0,2);
}

// This adapter is intentionally model-ready: add the locally hosted MediaPipe/Gemma runtime
// and expose window.DHRLocalLLM.generate({question, context}) to replace the deterministic fallback.
async function createAnswer(question) {
  const sources = retrieve(question);
  const context = sources.map(s => s.text).join('\n');
  if (window.DHRLocalLLM?.generate) {
    try { return await window.DHRLocalLLM.generate({question, context, location:state.location.name}); } catch (_) { /* keep the guide useful if local model initialization fails */ }
  }
  const primary = sources[0];
  const localCue = primary.landmark === state.location.id ? `Right here at ${state.location.name}, ` : `As you travel near ${state.location.name}, `;
  if (!primary.score) return `${localCue}${state.location.insight} The offline guide is most useful for the railway’s history, engineering, stations, locomotives, and UNESCO story. Try a question about what you see around you.`;
  return `${localCue}${primary.text} ${sources[1] && sources[1].score > 0 ? `There’s a useful connection too: ${sources[1].text.split('. ')[0]}.` : ''}`;
}

function renderSuggestions() {
  const choices = state.location.id === 'batasia'
    ? ['Why does the train loop here?', 'How does a Z-reverse work?', 'What can I see from here?', 'Why is this UNESCO heritage?']
    : [`What is special about ${state.location.name}?`, 'Why was this railway built?', 'Tell me about the locomotives', 'Why is the track so narrow?'];
  $('#suggestions').innerHTML = choices.map(choice => `<button class="suggestion">${choice}</button>`).join('');
  document.querySelectorAll('.suggestion').forEach(button => button.addEventListener('click', () => ask(button.textContent)));
}

function renderLocation({showToast=true} = {}) {
  const loc = state.location;
  $('#locationTitle').textContent = `You’re near ${loc.name}`;
  $('#locationInsight').textContent = loc.insight;
  $('#distanceLabel').textContent = loc.distance;
  $('#contextName').textContent = loc.name;
  $('#contextBuilt').textContent = loc.built;
  $('#contextKnown').textContent = loc.known;
  $('#contextAltitude').textContent = loc.altitude;
  $('#journeyPercent').textContent = `${loc.progress}%`;
  $('#altitude').textContent = loc.altitude;
  renderSuggestions(); renderMap();
  if (showToast) {
    $('#toastTitle').textContent = `🚂 You’re near ${loc.name}`;
    $('#toastText').textContent = loc.short;
    $('#toast').classList.remove('hidden');
    clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => $('#toast').classList.add('hidden'), 6500);
  }
}

function addMessage(text, kind='guide') {
  const article = document.createElement('article');
  article.className = `message ${kind === 'user' ? 'user-message' : 'guide-message'}`;
  article.innerHTML = kind === 'user' ? `<p>${escapeHTML(text)}</p>` : `<div class="guide-face">D</div><div><span class="message-label">DHR COMPANION · LOCAL RAG</span><p>${escapeHTML(text)}</p></div>`;
  $('#conversation').append(article); $('#conversation').scrollTop = $('#conversation').scrollHeight;
}

async function ask(question) {
  const clean = question.trim(); if (!clean) return;
  $('#questionInput').value = ''; addMessage(clean, 'user');
  const thinking = document.createElement('article'); thinking.className = 'message guide-message'; thinking.id = 'thinking'; thinking.innerHTML = '<div class="guide-face">D</div><div><span class="message-label">SEARCHING ON DEVICE</span><p>Finding the right railway story…</p></div>';
  $('#conversation').append(thinking); $('#conversation').scrollTop = $('#conversation').scrollHeight;
  await new Promise(resolve => setTimeout(resolve, 380));
  thinking.remove(); addMessage(await createAnswer(clean));
}

function renderMap() {
  const board = $('#mapBoard'); if (!board) return;
  board.innerHTML = landmarks.map((loc,index) => `<div class="map-stop"><small>${String(index+1).padStart(2,'0')}</small><button class="${loc.id === state.location.id ? 'active' : ''}" data-location="${loc.id}"><strong>${loc.name}</strong><br/><span>${loc.short}</span></button><small>${loc.altitude}</small></div>`).join('');
  board.querySelectorAll('[data-location]').forEach(button => button.addEventListener('click', () => selectLocation(button.dataset.location)));
}

function selectLocation(id, showToast=true) {
  state.location = landmarks.find(l => l.id === id) || state.location;
  renderLocation({showToast});
  document.querySelectorAll('.location-choice').forEach(button => button.classList.toggle('active', button.dataset.location === id));
}

function renderLocationOptions() {
  $('#locationOptions').innerHTML = landmarks.map(loc => `<button class="location-choice ${loc.id === state.location.id ? 'active' : ''}" data-location="${loc.id}">${loc.name}<small> · ${loc.altitude}</small></button>`).join('');
  document.querySelectorAll('.location-choice').forEach(button => button.addEventListener('click', () => selectLocation(button.dataset.location)));
}

function nearestLandmark(position) {
  const {latitude, longitude} = position.coords;
  const distance = ([a,b]) => Math.hypot((a-latitude)*111000, (b-longitude)*111000*Math.cos(latitude*Math.PI/180));
  return landmarks.map(loc => ({loc,distance:distance(loc.coords)})).sort((a,b) => a.distance-b.distance)[0];
}

function useGPS() {
  if (!navigator.geolocation) { $('#gpsNote').textContent = 'GPS is unavailable in this browser. Simulation mode is still fully active.'; return; }
  $('#gpsNote').textContent = 'Looking for your position…';
  navigator.geolocation.getCurrentPosition(position => {
    const nearest = nearestLandmark(position); state.mode = 'gps'; selectLocation(nearest.loc.id);
    $('#gpsNote').textContent = `GPS active. Nearest curated landmark: ${nearest.loc.name} (${Math.round(nearest.distance)} m away).`;
  }, () => $('#gpsNote').textContent = 'We could not access GPS. Simulation mode remains ready for your journey.', {enableHighAccuracy:true,timeout:7000,maximumAge:30000});
}

function showView(view) {
  ['companion','journey','library'].forEach(name => $(`#${name}View`).classList.toggle('hidden', name !== view));
  document.querySelectorAll('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.nav === view));
  if(view === 'journey') renderMap();
  if(view === 'library') $('#libraryGrid').innerHTML = knowledgeBase.map(item => `<article class="library-item"><p class="eyebrow">LOCAL SOURCE</p><h3>${item.title}</h3><p>${item.text}</p></article>`).join('');
}

function init() {
  $('#factCount').textContent = knowledgeBase.length;
  renderLocation({showToast:false}); renderLocationOptions();
  $('#askForm').addEventListener('submit', event => {event.preventDefault(); ask($('#questionInput').value);});
  $('#tellMeButton').addEventListener('click', () => ask(`Tell me more about ${state.location.name}`));
  $('#learnButton').addEventListener('click', () => ask(`What is special about ${state.location.name}?`));
  $('#dismissToast').addEventListener('click', () => $('#toast').classList.add('hidden'));
  $('#settingsButton').addEventListener('click', () => $('#settingsModal').classList.remove('hidden'));
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => $('#settingsModal').classList.add('hidden')));
  $('#settingsModal').addEventListener('click', event => {if(event.target === $('#settingsModal')) $('#settingsModal').classList.add('hidden');});
  document.querySelectorAll('.mode-choice').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.mode-choice').forEach(b => b.classList.toggle('active', b === button)); if(button.dataset.mode === 'gps') useGPS(); else {state.mode='demo'; $('#gpsNote').textContent = 'Simulation is active. All heritage guidance works fully offline.';} }));
  $('#mapButton').addEventListener('click', () => showView('journey'));
  document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => showView(button.dataset.nav)));
  $('#soundButton').addEventListener('click', () => {state.sound=!state.sound; $('#soundButton').style.color=state.sound?'#c96943':'';});
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  setTimeout(() => {$('#toast').classList.remove('hidden'); window.toastTimer=setTimeout(() => $('#toast').classList.add('hidden'),6500);}, 850);
}
document.addEventListener('DOMContentLoaded', init);
