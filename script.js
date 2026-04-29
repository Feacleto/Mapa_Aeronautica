/* ---------- State centroid coordinates (Brazilian UFs) ---------- */
const UF_COORDS = {
  AC: [-8.77, -70.55],  AL: [-9.62, -36.82],  AM: [-3.47, -65.10],
  AP: [ 1.41, -51.77],  BA: [-13.29, -41.71], CE: [-5.20, -39.53],
  DF: [-15.83, -47.86], ES: [-19.19, -40.34], GO: [-15.98, -49.86],
  MA: [-5.42, -45.44],  MG: [-18.10, -44.38], MS: [-20.51, -54.54],
  MT: [-12.64, -55.42], PA: [-3.79, -52.48],  PB: [-7.28, -36.72],
  PE: [-8.38, -37.86],  PI: [-7.72, -42.73],  PR: [-24.89, -51.55],
  RJ: [-22.25, -42.66], RN: [-5.81, -36.59],  RO: [-10.83, -63.34],
  RR: [ 1.99, -61.33],  RS: [-30.17, -53.50], SC: [-27.45, -50.95],
  SE: [-10.57, -37.45], SP: [-22.19, -48.79], TO: [-9.46, -48.26]
};

/* ---------- ICAO airport coordinates (Brazilian aerodromes) ---------- */
const ICAO_COORDS = {
  SBAR:[-10.984,-37.070], SBBE:[-1.379,-48.476],  SBBH:[-19.851,-43.951],
  SBBI:[-25.405,-49.232], SBBP:[-22.979,-46.538], SBBR:[-15.870,-47.921],
  SBBU:[-22.345,-49.054], SBBV:[ 2.842,-60.692],  SBCA:[-25.000,-53.501],
  SBCF:[-19.634,-43.969], SBCG:[-20.469,-54.673], SBCT:[-25.529,-49.176],
  SBCY:[-15.653,-56.117], SBCZ:[-7.600,-72.770],  SBEG:[-3.039,-60.050],
  SBFI:[-25.600,-54.486], SBFL:[-27.671,-48.548], SBFN:[-3.855,-32.423],
  SBFZ:[-3.776,-38.533],  SBGL:[-22.809,-43.244], SBGO:[-16.632,-49.221],
  SBGR:[-23.436,-46.473], SBGW:[-22.792,-45.205], SBJC:[-1.414,-48.461],
  SBJD:[-23.181,-46.944], SBJF:[-21.791,-43.387], SBJP:[-7.146,-34.949],
  SBJR:[-22.987,-43.370], SBJV:[-26.225,-48.797], SBKG:[-7.270,-35.896],
  SBKP:[-23.007,-47.135], SBLO:[-23.334,-51.130], SBME:[-22.343,-41.766],
  SBMG:[-23.479,-52.014], SBMK:[-16.706,-43.819], SBMO:[-9.511,-35.792],
  SBMQ:[ 0.051,-51.072],  SBMT:[-23.509,-46.638], SBNF:[-26.880,-48.652],
  SBNT:[-5.911,-35.248],  SBPA:[-29.994,-51.171], SBPB:[-2.894,-41.732],
  SBPJ:[-10.292,-48.357], SBPK:[-31.718,-52.328], SBPL:[-9.362,-40.569],
  SBPP:[-22.550,-55.703], SBPR:[-19.900,-43.991], SBPS:[-16.439,-39.081],
  SBPV:[-8.709,-63.902],  SBRB:[-9.869,-67.894],  SBRF:[-8.126,-34.924],
  SBRJ:[-22.910,-43.163], SBRP:[-21.134,-47.777], SBSJ:[-23.229,-45.863],
  SBSL:[-2.585,-44.234],  SBSP:[-23.627,-46.657], SBSR:[-20.817,-49.407],
  SBSV:[-12.909,-38.323], SBTE:[-5.060,-42.824],  SBTF:[-3.383,-64.724],
  SBTT:[-4.257,-69.936],  SBUL:[-18.883,-48.226], SBUR:[-19.765,-47.966],
  SBVT:[-20.258,-40.286], SBYS:[-21.985,-47.334],
  SDAM:[-22.857,-47.108], SDCO:[-23.479,-47.490], SDIO:[-21.793,-46.566],
  SDLP:[-22.179,-50.426], SDOV:[-23.586,-48.935], SDTB:[-22.451,-48.843],
  SDLY:[-22.658,-46.954], SDPW:[-23.014,-46.969], SDUN:[-23.521,-46.767],
  SSAK:[-25.520,-49.307], SSBL:[-26.831,-49.090], SSKM:[-25.470,-49.150],
  SSKW:[-11.496,-61.451], SSNG:[-26.989,-48.668], SSZW:[-23.040,-49.620],
  SWFN:[-3.146,-58.249],  SWFR:[-12.612,-55.708], SWLC:[-10.061,-55.951],
  SWNS:[-15.029,-59.458], SWNV:[-13.025,-55.658], SWRD:[-16.585,-54.724],
  SWUZ:[-7.724,-72.733],
  SIMK:[-23.181,-44.694], SJOG:[-9.913,-62.918],  SNED:[-2.879,-39.984]
};

/* ---------- Globals ---------- */
const STORAGE_KEY = 'cenipa.curation.v1';
const CLASS_KEYS = ['ACIDENTE', 'INCIDENTE GRAVE', 'INCIDENTE'];
let allRecords = [];
let filtered = [];
let selectedId = null;
let focusedId = null;
let curadasOnly = false;
let fatalOnly = false;
let activeClasses = new Set(CLASS_KEYS);
let curation = loadCuration();
let map, markerLayer, lineLayer;
let lightLayer, darkLayer;

/* ---------- Utilities ---------- */
function loadCuration() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}
function saveCuration() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(curation));
}
function isCurated(id) {
  const c = curation[id];
  return !!(c && (c.narrativa || c.foto || c.link));
}
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
function cleanVal(v) {
  if (v == null) return '';
  const s = String(v).trim();
  if (!s || s === 'NULL' || s === '***' || s === '****') return '';
  return s;
}
function classKey(c) {
  const x = (c || '').toUpperCase();
  if (x.includes('GRAVE') || x.includes('SERIOUS')) return 'INCIDENTE GRAVE';
  if (x.includes('ACIDENTE') || x.includes('ACCIDENT')) return 'ACIDENTE';
  if (x.includes('INCIDENTE') || x.includes('INCIDENT')) return 'INCIDENTE';
  return '';
}

/* Status da investigação → chave canônica usada na classe CSS do badge.
   Reconhece variantes em português e inglês para que a cor funcione
   independente da fonte de dados ativa. */
function statusKey(s) {
  const x = (s || '').toUpperCase();
  if (x.includes('FINISH') || x.includes('ENCERR')) return 'finished';
  if (x.includes('PROGRESS') || x.includes('ANDAMENTO')) return 'in-progress';
  if (x.includes('REOPEN') || x.includes('REABERT')) return 'reopened';
  return 'undefined';
}
function classColor(c) {
  const k = classKey(c);
  if (k === 'INCIDENTE GRAVE') return '#f08c00';
  if (k === 'ACIDENTE') return '#e63946';
  return '#1971c2';
}
function fmtDate(d) {
  if (!d) return '—';
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : d;
}
function getYear(d) {
  if (!d) return '';
  const m = d.match(/^(\d{4})/);
  return m ? m[1] : '';
}
function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function naOrVal(v) { return v && v.trim() ? v : 'N/A'; }

function operadorLabel(r) {
  // Combina operador + categoria de aviação em um texto curto.
  // Ex.: "Operador #123 · INSTRUÇÃO" ou "REGULAR" se sem operador.
  const parts = [];
  if (r.operador) parts.push('Operador #' + r.operador);
  if (r.categoria_aviacao) parts.push(r.categoria_aviacao);
  return parts.join(' · ');
}

/* ---------- Compute coordinates for accident point ----------
   Aceita registros do CSV antigo (uf/localidade/codigo_ocorrencia)
   ou já normalizados (uf/localidade/id) — em ambos os casos
   resolvemos um ponto plausível a partir do centróide da UF. */
function computeCoords(rec) {
  if (rec.latitude && rec.longitude) {
    const la = parseFloat(String(rec.latitude).replace(',', '.'));
    const lo = parseFloat(String(rec.longitude).replace(',', '.'));
    if (!isNaN(la) && !isNaN(lo)) return [la, lo];
  }
  const ufRaw = rec.uf || rec.fu || '';
  const uf = ufRaw.toUpperCase();
  const center = UF_COORDS[uf];
  if (!center) return null;
  const localidade = rec.localidade || rec.localization || '';
  const id = rec.id || rec.codigo_ocorrencia || rec.occurrence_id || '';
  const seed = hashStr(localidade + '|' + id);
  const jLat = ((seed % 1000) / 1000 - 0.5) * 1.8;
  const jLng = (((seed >> 10) % 1000) / 1000 - 0.5) * 1.8;
  return [center[0] + jLat, center[1] + jLng];
}
function icaoCoords(code) {
  if (!code) return null;
  const c = code.trim().toUpperCase();
  return ICAO_COORDS[c] || null;
}

/* ---------- Data load ----------
   Os dois pares de CSVs (occurrences/aircrafts em inglês e
   ocorrencia/aeronave em português) são traduções do mesmo dataset
   CENIPA. Damos preferência ao português porque os valores já estão
   em PT — não precisam passar pelo dicionário de tradução. Se ele
   não existir, caímos no conjunto inglês como fallback. */
let dataFormat = 'old';

function fetchCSV(path) {
  return fetch(path).then(r => {
    if (!r.ok) return null;
    return r.text().then(text => new Promise((resolve) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => resolve(res.data),
      });
    }));
  }).catch(() => null);
}

/* ---------- Tradução EN → PT ----------
   Os termos vêm do dicionário de dados do CENIPA. Quando um valor não
   estiver no mapa, usamos o original (assim qualquer dado novo aparece
   sem precisar editar o dicionário). */
const PT_TRANSLATIONS = {
  // classificação
  'ACCIDENT': 'ACIDENTE',
  'SERIOUS INCIDENT': 'INCIDENTE GRAVE',
  'INCIDENT': 'INCIDENTE',
  // equipamento
  'AIRPLANE': 'AVIÃO',
  'HELICOPTER': 'HELICÓPTERO',
  'GLIDER': 'PLANADOR',
  'ULTRALIGHT': 'ULTRALEVE',
  'AMPHIBIOUS': 'ANFÍBIO',
  'AIRSHIP': 'DIRIGÍVEL',
  'TRIKE': 'TRIKE',
  // motor
  'PISTON': 'PISTÃO',
  'JET': 'JATO',
  'TURBOSHAFT': 'TURBOEIXO',
  'TURBOPROP': 'TURBOÉLICE',
  'WITHOUT TRACTION': 'SEM TRAÇÃO',
  // dano
  'NONE': 'NENHUM',
  'LIGHT': 'LEVE',
  'SUBSTANTIAL': 'SUBSTANCIAL',
  'DESTROYED': 'DESTRUÍDO',
  'UNKNOWN': 'INDETERMINADO',
  // categoria de aviação / tipo de operação
  'INSTRUCTION': 'INSTRUÇÃO',
  'PRIVATE': 'PRIVADA',
  'AEROTAXI': 'TÁXI AÉREO',
  'REGULAR': 'REGULAR',
  'NOT REGULAR': 'NÃO REGULAR',
  'AGRICULTURAL': 'AGRÍCOLA',
  'POLICIAL': 'POLICIAL',
  'EXPERIMENTAL': 'EXPERIMENTAL',
  'DIRECT ADMINISTRATION': 'ADMINISTRAÇÃO DIRETA',
  'INDIRECT ADMINISTRATION': 'ADMINISTRAÇÃO INDIRETA',
  'MULTIPLE': 'MÚLTIPLA',
  'SPECIALIZED': 'ESPECIALIZADA',
  'HISTORIC': 'HISTÓRICA',
  // status investigação
  'FINISHED': 'ENCERRADA',
  'IN PROGRESS': 'EM ANDAMENTO',
  'REOPENED': 'REABERTA',
  'UNDEFINED': 'INDEFINIDA',
  // sera investigada
  'YES': 'SIM',
  'NO': 'NÃO',
  // fase de operação
  'TAKEOFF': 'DECOLAGEM',
  'LANDING': 'POUSO',
  'CRUISE': 'CRUZEIRO',
  'ASCENSION': 'SUBIDA',
  'DESCEND': 'DESCIDA',
  'TAXI': 'TÁXI',
  'RUN AFTER LANDING': 'CORRIDA APÓS POUSO',
  'FINAL APPROXIMATION': 'APROXIMAÇÃO FINAL',
  'HOVERING': 'PAIRADO',
  'MANEUVER': 'MANOBRA',
  'TRAFFIC CIRCUIT': 'CIRCUITO DE TRÁFEGO',
  'LOW ALTITUDE NAVIGATION': 'NAVEGAÇÃO A BAIXA ALTURA',
  'ANOTHER PHASE': 'OUTRA FASE',
  'ENGINE START': 'PARTIDA DO MOTOR',
  'PARKING': 'ESTACIONAMENTO',
  'RUSH ON THE GROUND': 'ARREMETIDA NO SOLO',
  'RUSH IN THE AIR': 'ARREMETIDA NO AR',
  'VERTICAL TAKEOFF': 'DECOLAGEM VERTICAL',
  'FINAL STRETCH': 'RETA FINAL',
  'ENGINE OR ROTOR CHECKING': 'CHEQUE DE MOTOR OU ROTOR',
  'GROUND OPERATION': 'OPERAÇÃO DE SOLO',
  // tipo da ocorrência
  'ENGINE FAILURE DURING THE FLIGHT': 'FALHA DO MOTOR EM VOO',
  'ENGINE FAILURE IN THE GROUND': 'FALHA DO MOTOR EM SOLO',
  'INVOLUNTARY ENGINE CUT OFF': 'CORTE INVOLUNTÁRIO DO MOTOR',
  'LANDING WITHOUT LANDING GEAR': 'POUSO SEM TREM',
  'LANDING ON UNPREDICTABLE PLACE': 'POUSO EM LOCAL NÃO PREVISTO',
  'LANDING BEFORE THE TRACK AREA': 'POUSO ANTES DA PISTA',
  'LEAVING THE TRACK': 'SAÍDA DE PISTA',
  'TRACK INCURSION': 'INCURSÃO EM PISTA',
  'HARD LANDING': 'POUSO DURO',
  'SLOW LANDING': 'POUSO LONGO',
  'LOSS OF CONTROL ON THE GROUND': 'PERDA DE CONTROLE NO SOLO',
  'LOSS OF CONTROL IN THE AIR': 'PERDA DE CONTROLE EM VOO',
  'TIRE BURST': 'ESTOURO DE PNEU',
  'ABOUT LANDING GEAR': 'COM TREM DE POUSO',
  'ABOUT WINDOWS / DOORS / WINDSHIELD': 'COM PÁRA-BRISAS / JANELA / PORTA',
  'ABOUT ROTOR': 'COM ROTOR',
  'ABOUT PROPELLER': 'COM HÉLICE',
  'ABOUT PASSENGERS/CREW DURING THE FLIGHT': 'COM PESSOAL EM VOO',
  'ANOTHER TYPES': 'OUTROS',
  'COLLISION AGAINST OBSTACLE DURING THE FLIGHT': 'COLISÃO EM VOO COM OBSTÁCULO',
  'COLLISION AGAINST OBSTACLE ON THE GROUND': 'COLISÃO COM OBSTÁCULO NO SOLO',
  'TERRAIN COLLISION': 'CFIT - COLISÃO EM VOO CONTROLADO COM O TERRENO',
  'COLLISION AGAINST BIRD': 'COLISÃO COM PÁSSARO',
  'AIRCRAFTS COLLISION ON THE GROUND': 'COLISÃO COM AERONAVE NO SOLO',
  'AIRCRAFTS COLLISION IN THE AIR': 'COLISÃO DE AERONAVES EM VOO',
  'COLLISION DURING THE FLIGHT AGAINST TOWED OBJECT': 'COLISÃO EM VOO COM OBJETO REBOCADO',
  'VEHICLE COLLISION AGAINST AIRCRAFT': 'COLISÃO DE VEÍCULO COM AERONAVE',
  'METEOROLOGICAL PHENOMENOM IN THE AIR': 'CAUSADO POR FENÔMENO METEOROLÓGICO EM VOO',
  'METEOROLOGICAL PHENOMENOM ON THE GROUND': 'CAUSADO POR FENÔMENO METEOROLÓGICO NO SOLO',
  'LOSS OF COMPONENT DURING THE FLIGHT': 'PERDA DE COMPONENTE EM VOO',
  'COMPONENT LOSS ON THE GROUND': 'PERDA DE COMPONENTE NO SOLO',
  'SYSTEM / COMPONENT FAILURE': 'FALHA DE SISTEMA / COMPONENTE',
  'FUEL STARVATION': 'COMBUSTÍVEL EXAURIDO',
  'FIRE DURING THE FLIGHT': 'INCÊNDIO EM VOO',
  'FIRE ON THE GROUND': 'INCÊNDIO NO SOLO',
  'AIR TRAFFIC': 'TRÁFEGO AÉREO',
  'LOW ALTITUDE MANEUVERS': 'MANOBRAS EM BAIXA ALTITUDE',
  'FOD - DAMAGE CAUSED BY UNKNOWN OBJECT': 'FOD - DANO POR OBJETO DESCONHECIDO',
  'LOAD LAUNCH': 'COM LANÇAMENTO DE CARGA',
  'PEOPLE LAUNCH': 'COM LANÇAMENTO DE PESSOAS',
  'SPATIAL UNAWARENESS': 'DESORIENTAÇÃO ESPACIAL',
  'STRUCTURAL FAILURE': 'FALHA ESTRUTURAL',
  'FLIGHT COMMANDS': 'COM COMANDOS DE VOO',
  'SMOKE IN THE CABIN': 'FUMAÇA NA CABINE',
  'FLUID LEAKS': 'VAZAMENTO DE FLUIDOS',
  'AIRCRAFT HIT BY OBJECT': 'AERONAVE ATINGIDA POR OBJETO',
  'EXPLOSIVE / NOT INTENTIONAL DECOMPRESSION': 'DESCOMPRESSÃO EXPLOSIVA / NÃO INTENCIONAL',
  'PHYSIOLOGICAL PROBLEMS': 'PROBLEMAS FISIOLÓGICOS',
};
function tr(value) {
  if (!value) return '';
  const v = String(value).trim();
  if (!v) return '';
  return PT_TRANSLATIONS[v.toUpperCase()] || v;
}

function normalizeNew(o, a) {
  const origemCode = cleanVal(a.origin_flight);
  const destinoCode = cleanVal(a.destination_flight);
  const classifPT = tr(cleanVal(o.classification));
  return {
    id: o.occurrence_id,
    classificacao: classifPT,
    classKey: classKey(classifPT || o.classification),
    tipo: tr(cleanVal(o['type of occurrence'])),
    localidade: cleanVal(o.localization),
    uf: cleanVal(o.fu),
    pais: cleanVal(o.country),
    aerodromo: cleanVal(o.aerodrome),
    data: cleanVal(o.occurrence_day),
    ano: getYear(o.occurrence_day),
    hora: cleanVal(o.time),
    em_investigacao: tr(cleanVal(o.under_investigation)),
    comando: cleanVal(o.investigating_command),
    status_inv: tr(cleanVal(o.investigation_status)),
    num_relatorio: cleanVal(o.report_number),
    relatorio_publ: cleanVal(o.published_report),
    data_publ: cleanVal(o.publication_day),
    recomendacoes: parseInt(cleanVal(o.recommendation_amount)) || 0,
    num_aeronaves: parseInt(cleanVal(o.aircrafts_involved)) || 1,
    modelo: cleanVal(a.model),
    fabricante: cleanVal(a.manufacturer),
    fatalidades: cleanVal(a.fatalities_amount) || '0',
    nivel_dano: tr(cleanVal(a.damage_level)),
    matricula: cleanVal(a.registration),
    equipamento: tr(cleanVal(a.equipment)),
    operador: cleanVal(a.operator_id),
    categoria_aviacao: tr(cleanVal(a.registration_aviation)),
    tipo_operacao: tr(cleanVal(a.type_operation)),
    origem: origemCode,
    destino: destinoCode,
    tipo_motor: tr(cleanVal(a.engine_type)),
    num_motores: cleanVal(a.engines_amount),
    max_weight: cleanVal(a['takeoff_max_weight (Lbs)']),
    num_assentos: cleanVal(a.seatings_amount),
    ano_fab: cleanVal(a.year_manufacture),
    pais_registro: cleanVal(a.registration_country),
    categoria_registro: cleanVal(a.registration_category),
    fase_operacao: tr(cleanVal(a.operation_phase)),
  };
}

/* O CSV português também tem todos os campos ricos (mesmo dataset
   do inglês, só com colunas em pt e valores já em português). */
function normalizeOld(o, a) {
  const origemCode = cleanVal(a.origem_voo);
  const destinoCode = cleanVal(a.destino_voo);
  return {
    id: o.codigo_ocorrencia,
    classificacao: cleanVal(o.classificacao),
    classKey: classKey(o.classificacao),
    tipo: cleanVal(o.tipo),
    localidade: cleanVal(o.localidade),
    uf: cleanVal(o.uf),
    pais: cleanVal(o.pais),
    aerodromo: cleanVal(o.aerodromo),
    data: cleanVal(o.dia_ocorrencia),
    ano: getYear(o.dia_ocorrencia),
    hora: cleanVal(o.horario),
    em_investigacao: cleanVal(o.sera_investigada),
    comando: cleanVal(o.comando_investigador),
    status_inv: cleanVal(o.status_investigacao),
    num_relatorio: cleanVal(o.numero_relatorio),
    relatorio_publ: cleanVal(o.relatorio_publicado),
    data_publ: cleanVal(o.dia_publicacao),
    recomendacoes: parseInt(cleanVal(o.quantidade_recomendacoes)) || 0,
    num_aeronaves: parseInt(cleanVal(o.aeronaves_envolvidas)) || 1,
    modelo: cleanVal(a.modelo),
    fabricante: cleanVal(a.fabricante),
    fatalidades: cleanVal(a.quantidade_fatalidades) || '0',
    nivel_dano: cleanVal(a.nivel_dano),
    matricula: cleanVal(a.matricula),
    equipamento: cleanVal(a.equipamento),
    operador: cleanVal(a.codigo_operador),
    categoria_aviacao: cleanVal(a.categoria_aviacao),
    tipo_operacao: cleanVal(a.tipo_operacao),
    origem: origemCode,
    destino: destinoCode,
    tipo_motor: cleanVal(a.tipo_motor),
    num_motores: cleanVal(a.quantidade_motores),
    max_weight: cleanVal(a.peso_maximo_decolagem),
    num_assentos: cleanVal(a.quantidade_assentos),
    ano_fab: cleanVal(a.ano_fabricacao),
    pais_registro: cleanVal(a.pais_registro),
    categoria_registro: cleanVal(a.categoria_registro),
    fase_operacao: cleanVal(a.fase_operacao),
  };
}

async function bootstrap() {
  try {
    // Tenta o par português primeiro (valores já em PT, sem tradução).
    let [ocorr, aero] = await Promise.all([
      fetchCSV('data/ocorrencia.csv'),
      fetchCSV('data/aeronave.csv')
    ]);
    let format = 'old';

    if (!ocorr || !aero || !ocorr.length || !aero.length) {
      // Fallback: par inglês, com tradução EN → PT aplicada no normalizeNew.
      [ocorr, aero] = await Promise.all([
        fetchCSV('data/occurrences.csv'),
        fetchCSV('data/aircrafts.csv')
      ]);
      format = 'new';
    }

    if (!ocorr || !aero || !ocorr.length) {
      throw new Error('Nenhum CSV encontrado. Coloque ocorrencia.csv + aeronave.csv (ou occurrences.csv + aircrafts.csv) na pasta data/.');
    }

    dataFormat = format;
    document.body.dataset.format = format;

    const occurIdKey = format === 'new' ? 'occurrence_id' : 'codigo_ocorrencia';
    const aeroByOcorr = {};
    for (const a of aero) {
      const key = a[occurIdKey];
      if (!key) continue;
      if (!aeroByOcorr[key]) aeroByOcorr[key] = a;
    }

    allRecords = ocorr.map(o => {
      const a = aeroByOcorr[o[occurIdKey]] || {};
      const rec = format === 'new' ? normalizeNew(o, a) : normalizeOld(o, a);
      const coords = computeCoords(rec);
      rec.lat = coords ? coords[0] : null;
      rec.lng = coords ? coords[1] : null;
      rec.origemCoords = icaoCoords(rec.origem);
      rec.destinoCoords = icaoCoords(rec.destino);
      return rec;
    }).filter(r => r.lat != null && r.lng != null);

    updateTitle();
    populateFilters();
    applyFilters();
    document.getElementById('stat-total').textContent = allRecords.length.toLocaleString('pt-BR');
    document.getElementById('loader').style.display = 'none';
  } catch (err) {
    document.getElementById('loader').innerHTML =
      '<div style="color:var(--accent-red);font-weight:600">Erro ao carregar CSVs</div>' +
      '<div style="font-size:12px;color:var(--muted);max-width:420px">' + escapeHtml(err.message || String(err)) + '</div>' +
      '<div style="font-size:12px;color:var(--muted);max-width:420px">Abra este arquivo via servidor local (ex.: <code>python -m http.server</code>) — navegadores bloqueiam fetch de CSV via file://</div>';
    console.error(err);
  }
}

function updateTitle() {
  const ys = allRecords.map(r => parseInt(r.ano)).filter(n => !isNaN(n));
  if (!ys.length) return;
  const min = Math.min(...ys), max = Math.max(...ys);
  document.getElementById('brand-text').firstChild.nodeValue =
    `Monitoramento e Curadorias de Acidentes Aéreos `;
  document.getElementById('brand-sub').textContent = `(dados de ${min} até ${max})`;
  document.title = `CENIPA — Monitoramento e Curadoria (${min}–${max})`;
}

/* ---------- Filters ---------- */
let modelOptions = [];
let fabricanteOptions = [];

function populateFilters() {
  const years = [...new Set(allRecords.map(r => r.ano).filter(Boolean))].sort((a,b) => b - a);
  const ufs = [...new Set(allRecords.map(r => r.uf).filter(Boolean))].sort();
  modelOptions = [...new Set(allRecords.map(r => r.modelo).filter(Boolean))].sort();
  fabricanteOptions = [...new Set(allRecords.map(r => r.fabricante).filter(Boolean))].sort();

  const yearSel = document.getElementById('f-year');
  const ufSel = document.getElementById('f-uf');
  years.forEach(y => yearSel.insertAdjacentHTML('beforeend', `<option value="${y}">${y}</option>`));
  ufs.forEach(u => ufSel.insertAdjacentHTML('beforeend', `<option value="${u}">${u}</option>`));

  yearSel.addEventListener('change', applyFilters);
  ufSel.addEventListener('change', applyFilters);

  setupAutocomplete('f-model', 'f-model-list', () => modelOptions, 'modelo');
  setupAutocomplete('f-fabricante', 'f-fabricante-list', () => fabricanteOptions, 'fabricante');

  document.getElementById('btn-clear').addEventListener('click', () => {
    yearSel.value = '';
    ufSel.value = '';
    document.getElementById('f-model').value = '';
    document.getElementById('f-fabricante').value = '';
    curadasOnly = false;
    fatalOnly = false;
    activeClasses = new Set(CLASS_KEYS);
    updateLegendUI();
    updateCuratedChip();
    exitFocus();
    applyFilters();
  });
}

/* Autocomplete genérico — recebe IDs do input/lista, getter das opções
   (lazy, para sempre refletir o estado atual de allRecords) e um label
   para a mensagem de "nada encontrado". */
function setupAutocomplete(inputId, listId, getOptions, label) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  if (!input || !list) return;
  let kbdIdx = -1;

  function score(option, q) {
    const m = option.toUpperCase();
    const s = q.toUpperCase();
    if (m === s) return 1000;
    if (m.startsWith(s)) return 500 - (m.length - s.length);
    const i = m.indexOf(s);
    if (i >= 0) return 200 - i;
    let j = 0, cnt = 0;
    for (let k = 0; k < m.length && j < s.length; k++) {
      if (m[k] === s[j]) { cnt++; j++; }
    }
    return j === s.length ? 50 + cnt : 0;
  }

  function render(q) {
    const opts = getOptions();
    const ql = q.trim();
    let results;
    if (!ql) {
      results = opts.slice(0, 50);
    } else {
      results = opts
        .map(m => ({ m, s: score(m, ql) }))
        .filter(x => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 30)
        .map(x => x.m);
    }
    if (!results.length) {
      list.innerHTML = `<div class="opt" style="color:var(--muted);cursor:default">Nenhum ${label} encontrado</div>`;
    } else {
      list.innerHTML = results.map((m, i) => {
        const high = ql ? m.replace(new RegExp('(' + ql.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<b>$1</b>') : m;
        return `<div class="opt ${i === kbdIdx ? 'kbd-active' : ''}" data-val="${escapeHtml(m)}">${high}</div>`;
      }).join('');
    }
    list.classList.add('show');
  }

  input.addEventListener('focus', () => { kbdIdx = -1; render(input.value); });
  input.addEventListener('input', () => { kbdIdx = -1; render(input.value); applyFilters(); });
  input.addEventListener('keydown', (e) => {
    const opts = list.querySelectorAll('.opt[data-val]');
    if (e.key === 'ArrowDown') { e.preventDefault(); kbdIdx = Math.min(kbdIdx + 1, opts.length - 1); render(input.value); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); kbdIdx = Math.max(kbdIdx - 1, 0); render(input.value); }
    else if (e.key === 'Enter') {
      if (kbdIdx >= 0 && opts[kbdIdx]) {
        e.preventDefault();
        input.value = opts[kbdIdx].dataset.val;
        list.classList.remove('show');
        applyFilters();
      }
    } else if (e.key === 'Escape') {
      list.classList.remove('show');
    }
  });
  list.addEventListener('mousedown', (e) => {
    const opt = e.target.closest('.opt[data-val]');
    if (!opt) return;
    e.preventDefault();
    input.value = opt.dataset.val;
    list.classList.remove('show');
    applyFilters();
  });
}

/* Fechar qualquer autocomplete ao clicar fora — registrado uma única vez. */
document.addEventListener('click', (e) => {
  if (e.target.closest('.autocomplete-wrap')) return;
  document.querySelectorAll('.autocomplete-list.show').forEach(el => el.classList.remove('show'));
});

function applyFilters() {
  const y = document.getElementById('f-year').value;
  const u = document.getElementById('f-uf').value;
  const m = document.getElementById('f-model').value.trim().toUpperCase();
  const f = document.getElementById('f-fabricante').value.trim().toUpperCase();
  filtered = allRecords.filter(r =>
    (!y || r.ano === y) &&
    (!u || r.uf === u) &&
    (!m || (r.modelo && r.modelo.toUpperCase().includes(m))) &&
    (!f || (r.fabricante && r.fabricante.toUpperCase().includes(f))) &&
    (activeClasses.has(r.classKey)) &&
    (!curadasOnly || isCurated(r.id)) &&
    (!fatalOnly || (parseInt(r.fatalidades) || 0) > 0)
  );
  if (focusedId && !filtered.some(r => r.id === focusedId)) {
    focusedId = null;
    updateFocusBanner();
  }
  renderMap();
  renderList();
  document.getElementById('stat-filtered').textContent = filtered.length.toLocaleString('pt-BR');
  document.getElementById('filter-count').textContent =
    `${filtered.length.toLocaleString('pt-BR')} de ${allRecords.length.toLocaleString('pt-BR')} ocorrências`;
  document.getElementById('list-count').textContent = `(${filtered.length.toLocaleString('pt-BR')})`;
  updateCuratedStat();
  updateFatalStat();
  updateLegendUI();
}

function updateCuratedStat() {
  const n = Object.keys(curation).filter(isCurated).length;
  document.getElementById('stat-curated').textContent = n.toLocaleString('pt-BR');
  document.getElementById('stat-curated-wrap').classList.toggle('active', curadasOnly);
}

function updateFatalStat() {
  const n = allRecords.filter(r => (parseInt(r.fatalidades) || 0) > 0).length;
  document.getElementById('stat-fatal').textContent = n.toLocaleString('pt-BR');
  document.getElementById('stat-fatal-wrap').classList.toggle('active', fatalOnly);
}

function updateCuratedChip() {
  let title = 'Ocorrências';
  if (curadasOnly && fatalOnly) title = 'Curadas com fatalidades';
  else if (curadasOnly) title = 'Ocorrências curadas';
  else if (fatalOnly) title = 'Ocorrências com fatalidades';
  document.getElementById('list-title').textContent = title;
  document.getElementById('list-curated-chip').style.display = (curadasOnly || fatalOnly) ? 'inline' : 'none';
  const chip = document.querySelector('#list-curated-chip .filter-chip');
  if (chip) {
    let label = '';
    if (curadasOnly && fatalOnly) label = 'Curadas + fatalidades';
    else if (curadasOnly) label = 'Apenas curadas';
    else if (fatalOnly) label = 'Apenas fatalidades';
    chip.firstChild.nodeValue = label + ' ';
  }
}

document.getElementById('stat-curated-wrap').addEventListener('click', () => {
  curadasOnly = !curadasOnly;
  updateCuratedChip();
  exitFocus();
  applyFilters();
});

document.getElementById('stat-fatal-wrap').addEventListener('click', () => {
  fatalOnly = !fatalOnly;
  updateCuratedChip();
  exitFocus();
  applyFilters();
});

document.getElementById('btn-clear-curated').addEventListener('click', (e) => {
  e.stopPropagation();
  curadasOnly = false;
  fatalOnly = false;
  updateCuratedChip();
  applyFilters();
});

/* ---------- Legend filter ---------- */
function classCountsIgnoringClass() {
  // Conta registros que passariam em todos os filtros EXCETO o de classificação,
  // separados por classKey. Permite ao usuário ver quantos haveria de cada tipo.
  const y = document.getElementById('f-year').value;
  const u = document.getElementById('f-uf').value;
  const m = document.getElementById('f-model').value.trim().toUpperCase();
  const f = document.getElementById('f-fabricante').value.trim().toUpperCase();
  const counts = { 'ACIDENTE': 0, 'INCIDENTE GRAVE': 0, 'INCIDENTE': 0 };
  for (const r of allRecords) {
    if (y && r.ano !== y) continue;
    if (u && r.uf !== u) continue;
    if (m && (!r.modelo || !r.modelo.toUpperCase().includes(m))) continue;
    if (f && (!r.fabricante || !r.fabricante.toUpperCase().includes(f))) continue;
    if (curadasOnly && !isCurated(r.id)) continue;
    if (fatalOnly && (parseInt(r.fatalidades) || 0) === 0) continue;
    if (counts[r.classKey] != null) counts[r.classKey]++;
  }
  return counts;
}

function updateLegendUI() {
  const counts = classCountsIgnoringClass();
  document.querySelectorAll('.legend-item[data-cls]').forEach(el => {
    const cls = el.dataset.cls;
    const n = counts[cls] || 0;
    el.classList.toggle('disabled', !activeClasses.has(cls));
    el.classList.toggle('empty', n === 0);
    el.querySelector('.cnt').textContent = n.toLocaleString('pt-BR');
  });
}
document.querySelectorAll('.legend-item[data-cls]').forEach(el => {
  el.addEventListener('click', (e) => {
    const cls = el.dataset.cls;
    // Ignora clique se não há registros dessa classe nos filtros atuais.
    if (el.classList.contains('empty')) return;
    // Click = solo (mostra apenas essa classe). Clique de novo = restaura todas.
    // Ctrl/Cmd+click = adicionar/remover múltiplas (toggle).
    if (e.ctrlKey || e.metaKey) {
      if (activeClasses.has(cls)) {
        activeClasses.delete(cls);
        if (activeClasses.size === 0) activeClasses = new Set(CLASS_KEYS);
      } else {
        activeClasses.add(cls);
      }
    } else {
      if (activeClasses.size === 1 && activeClasses.has(cls)) {
        activeClasses = new Set(CLASS_KEYS);
      } else {
        activeClasses = new Set([cls]);
      }
    }
    updateLegendUI();
    exitFocus();
    applyFilters();
  });
});

/* ---------- Map ---------- */
function initMap() {
  map = L.map('map', { zoomControl: true, preferCanvas: true })
    .setView([-14.5, -53], 4);

  lightLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 18
  });
  darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© CARTO © OpenStreetMap',
    maxZoom: 19, subdomains: 'abcd'
  });
  lightLayer.addTo(map);

  lineLayer = L.layerGroup().addTo(map);
  markerLayer = L.layerGroup().addTo(map);

  document.getElementById('btn-light').addEventListener('click', () => setTheme('light'));
  document.getElementById('btn-dark').addEventListener('click', () => setTheme('dark'));
  document.getElementById('btn-exit-focus').addEventListener('click', exitFocus);
}

function setTheme(t) {
  if (t === 'dark') {
    map.removeLayer(lightLayer);
    darkLayer.addTo(map);
    document.getElementById('btn-dark').classList.add('active');
    document.getElementById('btn-light').classList.remove('active');
  } else {
    map.removeLayer(darkLayer);
    lightLayer.addTo(map);
    document.getElementById('btn-light').classList.add('active');
    document.getElementById('btn-dark').classList.remove('active');
  }
}

function buildTooltipHTML(r) {
  const c = curation[r.id] || {};
  const photo = c.foto;
  const img = photo
    ? `<img class="tip-img" src="${escapeHtml(photo)}" onerror="this.style.display='none'">`
    : '';
  const op = operadorLabel(r);
  const opRow = op ? `<div class="tip-row"><span class="k">Operador</span><span class="v">${escapeHtml(op)}</span></div>` : '';
  // Motor + ano (compacto). Só aparece se houver dado.
  const motor = engineLabel(r);
  const ano = (r.ano_fab && r.ano_fab !== '0') ? r.ano_fab : '';
  const techParts = [motor, ano].filter(Boolean).join(' · ');
  const techRow = techParts ? `<div class="tip-row"><span class="k">Motor · Ano</span><span class="v">${escapeHtml(techParts)}</span></div>` : '';
  return `
    ${img}
    <div class="tip-body">
      <div class="tip-title">${escapeHtml(r.modelo || r.equipamento || 'Aeronave não especificada')}</div>
      <div class="tip-row"><span class="k">Tipo</span><span class="v">${escapeHtml(naOrVal(r.tipo))}</span></div>
      <div class="tip-row"><span class="k">Modelo</span><span class="v">${escapeHtml(naOrVal(r.modelo))}</span></div>
      ${opRow}
      ${techRow}
      <div class="tip-row"><span class="k">Origem</span><span class="v">${escapeHtml(naOrVal(r.origem))}</span></div>
      <div class="tip-row"><span class="k">Destino</span><span class="v">${escapeHtml(naOrVal(r.destino))}</span></div>
      <div class="tip-row"><span class="k">Fatalidades</span><span class="v ${r.fatalidades !== '0' ? 'danger' : ''}">${escapeHtml(r.fatalidades)}</span></div>
      <div class="tip-row"><span class="k">Local</span><span class="v">${escapeHtml((r.localidade || '—') + '/' + (r.uf || '—'))}</span></div>
    </div>
  `;
}

function renderMap() {
  markerLayer.clearLayers();
  lineLayer.clearLayers();

  const records = focusedId
    ? filtered.filter(r => r.id === focusedId)
    : filtered;

  for (const r of records) {
    // route line — navy color, dashed, clickable to select related record
    if (r.origemCoords && r.destinoCoords) {
      const same = r.origemCoords[0] === r.destinoCoords[0] && r.origemCoords[1] === r.destinoCoords[1];
      if (!same) {
        const isFocus = focusedId === r.id;
        const line = L.polyline([r.origemCoords, r.destinoCoords], {
          color: '#000080',
          weight: isFocus ? 3 : 1.6,
          opacity: isFocus ? 0.95 : 0.55,
          dashArray: '6,6'
        });
        line.bindTooltip(
          `<b>${escapeHtml(r.classificacao || 'OCORRÊNCIA')}</b><br>${escapeHtml(r.origem)} → ${escapeHtml(r.destino)}<br><span style="color:#6a7388">Clique para abrir</span>`,
          { sticky: true, className: 'cenipa-tip', opacity: 1 }
        );
        line.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          if (focusedId === r.id) exitFocus();
          else selectRecord(r.id, true);
        });
        lineLayer.addLayer(line);
      }
      if (focusedId === r.id) {
        L.circleMarker(r.origemCoords, { radius: 5, color: '#fff', weight: 2, fillColor: '#2b8a3e', fillOpacity: 1 })
          .bindTooltip('Origem: ' + r.origem, { direction: 'top' })
          .addTo(lineLayer);
        L.circleMarker(r.destinoCoords, { radius: 5, color: '#fff', weight: 2, fillColor: '#000080', fillOpacity: 1 })
          .bindTooltip('Destino: ' + r.destino, { direction: 'top' })
          .addTo(lineLayer);
      }
    }

    const color = classColor(r.classificacao);
    const curatedCls = isCurated(r.id) ? ' curated' : '';
    const focusedCls = focusedId === r.id ? ' focused' : '';
    const icon = L.divIcon({
      className: '',
      html: `<div class="marker-pin${curatedCls}${focusedCls}" style="background:${color};position:relative"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
    const marker = L.marker([r.lat, r.lng], { icon });
    marker.bindTooltip(buildTooltipHTML(r), {
      direction: 'top',
      offset: [0, -6],
      className: 'cenipa-tip',
      opacity: 1
    });
    // Toggle focus on click
    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      if (focusedId === r.id) {
        exitFocus();
      } else {
        selectRecord(r.id, true);
      }
    });
    markerLayer.addLayer(marker);
  }

  if (focusedId) {
    const r = filtered.find(x => x.id === focusedId);
    if (r) {
      const pts = [[r.lat, r.lng]];
      if (r.origemCoords) pts.push(r.origemCoords);
      if (r.destinoCoords) pts.push(r.destinoCoords);
      if (pts.length > 1) {
        map.flyToBounds(L.latLngBounds(pts).pad(0.4), { duration: .6 });
      }
    }
  }
}

/* ---------- List ---------- */
function renderList() {
  const wrap = document.getElementById('list-wrap');
  const view = filtered.slice(0, 300);
  if (!view.length) {
    wrap.innerHTML = '<div style="padding:20px;text-align:center;color:var(--muted);font-size:12px">Nenhuma ocorrência encontrada com os filtros atuais.</div>';
    return;
  }
  wrap.innerHTML = view.map(r => {
    const c = classColor(r.classificacao);
    const op = operadorLabel(r);
    const title = r.modelo || r.equipamento || 'Aeronave não especificada';
    const titleFull = op ? `${title} <span style="color:var(--muted);font-weight:500">· ${escapeHtml(op)}</span>` : escapeHtml(title);
    return `
      <div class="list-item ${selectedId === r.id ? 'active' : ''}" data-id="${escapeHtml(r.id)}">
        <span class="dot" style="background:${c}"></span>
        <div class="body">
          <div class="ttl">${op ? titleFull : escapeHtml(title)}</div>
          <div class="sub">${escapeHtml(r.localidade || '—')}/${escapeHtml(r.uf || '—')} · ${fmtDate(r.data)}</div>
        </div>
        ${isCurated(r.id) ? '<span class="curated">●</span>' : ''}
      </div>`;
  }).join('') + (filtered.length > view.length
    ? `<div style="text-align:center;color:var(--muted);font-size:11px;padding:6px">Exibindo 300 de ${filtered.length.toLocaleString('pt-BR')}. Refine os filtros para ver mais.</div>`
    : '');

  wrap.querySelectorAll('.list-item').forEach(el => {
    el.addEventListener('click', () => selectRecord(el.dataset.id, true));
  });
}

/* ---------- Detail / Curation / Focus ---------- */
function fmtDateTime(d, t) {
  const date = fmtDate(d);
  if (!t) return date;
  const m = t.match(/^(\d{2}):(\d{2})/);
  return m ? `${date} ${m[1]}:${m[2]}` : date;
}

function engineLabel(r) {
  if (!r.tipo_motor) return '';
  const n = parseFloat(r.num_motores);
  if (!isNaN(n) && n > 0) return `${r.tipo_motor} (${n.toFixed(0)})`;
  return r.tipo_motor;
}

function yearLabel(r) {
  if (!r.ano_fab || r.ano_fab === '0') return '';
  const yr = parseInt(r.ano_fab);
  if (isNaN(yr)) return r.ano_fab;
  const accidentYear = parseInt(r.ano);
  if (!isNaN(accidentYear) && accidentYear >= yr) {
    const age = accidentYear - yr;
    return `${yr} (${age} ${age === 1 ? 'ano' : 'anos'} na época)`;
  }
  return String(yr);
}

function setOpt(id, value, fallback = 'N/A') {
  const el = document.getElementById(id);
  if (!el) return;
  const has = value && String(value).trim() && value !== '0';
  el.textContent = has ? value : fallback;
  // Esconde a célula inteira quando não há dado disponível (cor mais clara)
  const cell = el.closest('.it');
  if (cell) cell.classList.toggle('na', !has);
}

function selectRecord(id, focus = false) {
  const r = allRecords.find(x => x.id === id);
  if (!r) return;
  selectedId = id;
  if (focus) focusedId = id;

  // open panel automatically when selecting
  setPanelCollapsed(false);

  document.getElementById('detail-empty').style.display = 'none';
  document.getElementById('detail-content').style.display = 'block';

  document.getElementById('d-title').textContent = r.modelo || r.equipamento || 'Aeronave não especificada';
  document.getElementById('d-sub').textContent = `Ocorrência #${r.id} · ${r.matricula || 'matrícula não informada'}`;

  const badge = document.getElementById('d-badge');
  badge.textContent = r.classificacao || 'OCORRÊNCIA';
  badge.style.background = classColor(r.classificacao);

  document.getElementById('d-modelo').textContent = naOrVal(r.modelo);
  document.getElementById('d-fab').textContent = naOrVal(r.fabricante);
  document.getElementById('d-operador').textContent = operadorLabel(r) || 'N/A';
  document.getElementById('d-data').textContent = fmtDateTime(r.data, r.hora);
  document.getElementById('d-loc').textContent = `${r.localidade || '—'}/${r.uf || '—'}`;
  document.getElementById('d-fat').textContent = r.fatalidades || '0';
  document.getElementById('d-tipo').textContent = naOrVal(r.tipo);
  document.getElementById('d-route').textContent = `${naOrVal(r.origem)} → ${naOrVal(r.destino)}`;

  // Demais campos do CSV — usam setOpt() para mostrar "N/A" cinza
  // quando o registro não tem aquele dado.
  setOpt('d-classification', r.classificacao);
  setOpt('d-aero', r.aerodromo);
  setOpt('d-country', r.pais);
  setOpt('d-aircrafts', r.num_aeronaves > 1 ? String(r.num_aeronaves) : '1');
  setOpt('d-engines', engineLabel(r));
  setOpt('d-year', yearLabel(r));
  // PT csv usa kg, EN csv usa lb (a coluna lá é "takeoff_max_weight (Lbs)").
  setOpt('d-weight', r.max_weight ? `${parseInt(r.max_weight).toLocaleString('pt-BR')} ${dataFormat === 'new' ? 'lb' : 'kg'}` : '');
  setOpt('d-seats', r.num_assentos && parseFloat(r.num_assentos) > 0 ? parseFloat(r.num_assentos).toFixed(0) : '');
  setOpt('d-damage', r.nivel_dano);
  setOpt('d-phase', r.fase_operacao);
  setOpt('d-equipment', r.equipamento);
  setOpt('d-matricula', r.matricula);
  setOpt('d-reg-country', r.pais_registro);
  setOpt('d-reg-category', r.categoria_registro);
  setOpt('d-tipo-op', r.tipo_operacao);

  // Bloco de investigação: só aparece quando há ao menos um campo com dado.
  const hasInvestigation = r.status_inv || r.comando || r.recomendacoes || r.num_relatorio;
  const invSection = document.getElementById('d-investigation');
  if (invSection) {
    invSection.style.display = hasInvestigation ? 'block' : 'none';
    if (hasInvestigation) {
      const statusBadge = document.getElementById('d-status');
      if (statusBadge) {
        const inAndamento = (r.em_investigacao || '').toUpperCase().match(/^(SIM|YES)$/);
        statusBadge.textContent = r.status_inv || (inAndamento ? 'EM ANDAMENTO' : '—');
        statusBadge.className = 'inv-badge ' + statusKey(r.status_inv || (inAndamento ? 'EM ANDAMENTO' : ''));
      }
      setOpt('d-command', r.comando);
      setOpt('d-recommendations', r.recomendacoes ? String(r.recomendacoes) : '0');
      const reportEl = document.getElementById('d-report');
      if (reportEl) {
        // O CSV do CENIPA não traz URL para o PDF — só o NÚMERO do relatório
        // (ex.: "A-001/CENIPA/2012") e um flag 0/1 indicando se foi
        // publicado. Para encontrar o arquivo, abrimos uma busca dirigida
        // ao site do CENIPA filtrando por filetype:pdf.
        const num = (r.num_relatorio || '').trim();
        if (!num || /^A DEFINIR$/i.test(num)) {
          reportEl.textContent = num ? 'A definir' : 'Não publicado';
        } else {
          const flag = String(r.relatorio_publ || '').trim();
          const published = /^(1|SIM|YES|TRUE)$/i.test(flag);
          const dateStr = r.data_publ ? ` em ${fmtDate(r.data_publ)}` : '';
          const statusLabel = published ? `Publicado${dateStr}` : 'Pendente de publicação';
          const statusCls = published ? 'published' : 'pending';
          const query = encodeURIComponent(`"${num}" CENIPA relatório filetype:pdf`);
          const searchUrl = `https://www.google.com/search?q=${query}`;
          reportEl.innerHTML =
            `<span class="report-num">${escapeHtml(num)}</span>` +
            `<span class="report-status ${statusCls}">${escapeHtml(statusLabel)}</span>` +
            (published
              ? ` <a class="report-search" href="${searchUrl}" target="_blank" rel="noopener">Buscar PDF ↗</a>`
              : '');
        }
      }
    }
  }

  const c = curation[r.id] || {};
  document.getElementById('c-narr').value = c.narrativa || '';
  document.getElementById('c-photo').value = c.foto || '';
  document.getElementById('c-link').value = c.link || '';
  renderDetailPhoto(c.foto);

  updateFocusBanner();
  renderMap();
  renderList();
}

function renderDetailPhoto(url) {
  const el = document.getElementById('d-photo');
  if (!url) { el.style.display = 'none'; el.innerHTML = ''; return; }
  el.style.display = 'block';
  el.classList.remove('broken');
  el.innerHTML = `<img src="${escapeHtml(url)}" alt="Foto da ocorrência" onerror="this.parentElement.classList.add('broken');this.parentElement.innerHTML='Imagem não pôde ser carregada'">`;
}

function exitFocus() {
  focusedId = null;
  updateFocusBanner();
  renderMap();
}

function updateFocusBanner() {
  const banner = document.getElementById('focus-banner');
  if (!focusedId) { banner.classList.remove('show'); return; }
  const r = allRecords.find(x => x.id === focusedId);
  if (!r) return;
  document.getElementById('focus-banner-text').textContent =
    `Foco: #${r.id} · ${r.localidade || '—'}/${r.uf || '—'}`;
  banner.classList.add('show');
}

document.getElementById('btn-save').addEventListener('click', () => {
  if (!selectedId) return;
  const data = {
    narrativa: document.getElementById('c-narr').value.trim(),
    foto: document.getElementById('c-photo').value.trim(),
    link: document.getElementById('c-link').value.trim(),
    updatedAt: new Date().toISOString()
  };
  if (!data.narrativa && !data.foto && !data.link) {
    delete curation[selectedId];
  } else {
    curation[selectedId] = data;
  }
  saveCuration();
  renderDetailPhoto(data.foto);
  updateCuratedStat();
  renderList();
  renderMap();

  const s = document.getElementById('save-status');
  s.classList.add('show');
  setTimeout(() => s.classList.remove('show'), 1600);
});

document.getElementById('btn-clear-curation').addEventListener('click', () => {
  if (!selectedId) return;
  if (!confirm('Apagar a curadoria desta ocorrência?')) return;
  delete curation[selectedId];
  saveCuration();
  document.getElementById('c-narr').value = '';
  document.getElementById('c-photo').value = '';
  document.getElementById('c-link').value = '';
  renderDetailPhoto('');
  updateCuratedStat();
  renderList();
  renderMap();
});

/* ---------- Sidebar drawer ---------- */
function setPanelCollapsed(collapsed) {
  const panel = document.getElementById('panel');
  panel.classList.toggle('collapsed', collapsed);
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  // Leaflet must recalculate size after layout shift
  setTimeout(() => map && map.invalidateSize(), 320);
}

document.getElementById('btn-close-panel').addEventListener('click', () => setPanelCollapsed(true));
document.getElementById('sidebar-toggle').addEventListener('click', () => setPanelCollapsed(false));

/* ---------- Boot ---------- */
initMap();
bootstrap();
