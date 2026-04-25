/* SIRDE-310 | Logic & Wizard Blindaje v1.0.2 */
const SUPABASE_URL = 'https://uvnetpnjinxzhggoqmwz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oBpidcqpYzP_JMU-xYi9ZQ_HXYouwyL';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {});

let globalAlumnos = [];
let globalPersonal = [];
let currentStep = 1;
let lastGroupSelected = "";
let studentSelections = {}; // Almacena selecciones por ID: { checked, behaviors: { tipo: nivel } }

const DASHBOARD_ALLOWED_ROLES = new Set(['directivo', 'subdireccion']);
const SASE_ALLOWED_ROLES = new Set(['teacher', 'docente', 'docente_tutor', 'orientacion', 'trabajo_social', 'directivo', 'subdireccion', 'developer', 'system_admin']);

function isDashboardPage() {
    return window.location.pathname.toLowerCase().endsWith('/dashboard.html') || window.location.pathname.toLowerCase().endsWith('dashboard.html');
}

function isInvitationPage() {
    return window.location.pathname.toLowerCase().endsWith('/invitacion.html') || window.location.pathname.toLowerCase().endsWith('invitacion.html');
}

function isAdminPage() {
    return isDashboardPage() || isInvitationPage();
}

function isIndexPage() {
    const path = window.location.pathname.toLowerCase();
    return path === '/' || path.endsWith('/index.html') || path.endsWith('index.html');
}

function hideAuthWall() {
    const authWall = document.getElementById('auth-wall');
    if (!authWall) return;
    authWall.classList.add('hidden');
    authWall.style.display = 'none';
}

function showAuthWall() {
    const authWall = document.getElementById('auth-wall');
    if (!authWall) return;
    authWall.classList.remove('hidden');
    authWall.style.display = '';
}

function clearDashboardSession() {
    sessionStorage.removeItem('auth_sirde');
    sessionStorage.removeItem('sirde_user_name');
    sessionStorage.removeItem('sirde_session_pin');
    sessionStorage.removeItem('sirde_sase_role');
    sessionStorage.removeItem('sirde_sase_email');
    sessionStorage.removeItem('sirde_sase_session');
}

function decodeBase64UrlJson(value) {
    try {
        const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
        return JSON.parse(atob(padded));
    } catch (error) {
        console.warn('Token SASE no legible.', error);
        return null;
    }
}

function parseSaseToken(token) {
    if (!token || typeof token !== 'string') return null;
    const [payload] = token.split('.');
    const parsed = decodeBase64UrlJson(payload || '');
    if (!parsed || parsed.module !== 'diagnostico') return null;
    if (parsed.exp && Date.now() >= Number(parsed.exp) * 1000) return null;

    const role = String(parsed.role || '').trim().toLowerCase();
    if (!SASE_ALLOWED_ROLES.has(role)) return null;

    return {
        name: String(parsed.name || parsed.email || 'Personal SASE').trim(),
        email: String(parsed.email || '').trim().toLowerCase(),
        role,
    };
}

function startSaseSession(payload) {
    sessionStorage.setItem('auth_sirde', 'true');
    sessionStorage.setItem('sirde_user_name', payload.name);
    sessionStorage.setItem('sirde_sase_role', payload.role);
    sessionStorage.setItem('sirde_sase_email', payload.email);
    sessionStorage.setItem('sirde_sase_session', 'true');
    sessionStorage.removeItem('sirde_session_pin');
}

function getSaseSession() {
    if (sessionStorage.getItem('sirde_sase_session') !== 'true') return null;
    const role = String(sessionStorage.getItem('sirde_sase_role') || '').toLowerCase();
    const name = sessionStorage.getItem('sirde_user_name') || 'Personal SASE';
    if (!SASE_ALLOWED_ROLES.has(role)) return null;
    return { role, name };
}

function isDashboardAdmin(user) {
    if (!user?.nombre || !user?.rol) return false;
    const normalizedName = user.nombre.toUpperCase();
    return DASHBOARD_ALLOWED_ROLES.has(user.rol) && normalizedName.includes('SANCHEZ') && normalizedName.includes('HUGO');
}

async function fetchUserByPin(pin) {
    if (!pin) return { data: null, error: new Error('PIN requerido') };

    return supabaseClient
        .from('colectivo_personal')
        .select('nombre, departamento, rol')
        .ilike('acceso_pin', pin.trim())
        .single();
}

async function validateAdminSession() {
    const saseSession = getSaseSession();
    if (saseSession && ['directivo', 'subdireccion', 'developer', 'system_admin'].includes(saseSession.role)) {
        hideAuthWall();
        return true;
    }

    const pin = sessionStorage.getItem('sirde_session_pin');
    if (!pin) {
        clearDashboardSession();
        return false;
    }

    const { data: user, error } = await fetchUserByPin(pin);
    if (error || !isDashboardAdmin(user)) {
        clearDashboardSession();
        return false;
    }

    sessionStorage.setItem('auth_sirde', 'true');
    sessionStorage.setItem('sirde_user_name', user.nombre);
    hideAuthWall();
    return true;
}

async function checkAccess(pin) {
    if (!pin) return;
    try {
        console.log("LOG: Verificando PIN institucional...");
        const sanitizedPin = pin.trim();
        const { data: user, error } = await fetchUserByPin(sanitizedPin);
        if (error || !user) { 
            alert("PIN NO VÁLIDO. Verifique sus credenciales institucionales o contacte a la Dirección."); 
            console.warn("LOG: Intento de acceso fallido.");
            return; 
        }

        if (user.rol === 'secretaria') {
            alert("Usted no participa en el diagnóstico colectivo. El acceso es solo para docentes y servicios educativos.");
            return;
        }

        if (DASHBOARD_ALLOWED_ROLES.has(user.rol)) {
            if (!isDashboardAdmin(user)) {
                alert("ACCESO RESTRINGIDO: Actualmente el acceso administrativo está limitado a la cuenta autorizada del sistema por razones de privacidad.");
                return;
            }

            console.log("LOG: Acceso concedido al Administrador.");
            sessionStorage.setItem('auth_sirde', 'true');
            sessionStorage.setItem('sirde_user_name', user.nombre);
            sessionStorage.setItem('sirde_session_pin', sanitizedPin);

            if (isDashboardPage()) {
                hideAuthWall();
                if (typeof runAnalysis === 'function') await runAnalysis();
            } else if (isInvitationPage()) {
                hideAuthWall();
                if (typeof initInvitationPage === 'function') await initInvitationPage();
            } else {
                window.location.href = 'dashboard.html';
            }
            return;
        }

        if (isAdminPage()) {
            clearDashboardSession();
            alert("ACCESO RESTRINGIDO: Esta pantalla solo está disponible para la cuenta administradora autorizada.");
            return;
        }
        
        console.log("LOG: Acceso concedido a:", user.nombre);
        sessionStorage.removeItem('auth_sirde');
        sessionStorage.removeItem('sirde_user_name');
        sessionStorage.setItem('sirde_session_pin', sanitizedPin);
        await initData();

        const docInput = document.getElementById('docente');
        if(docInput) {
            docInput.value = user.nombre;
            docInput.disabled = true;
            onTeacherChange();
        }
        hideAuthWall();
        if (typeof updateProgress === 'function') updateProgress(1);
    } catch (e) { console.error("Critical error in checkAccess:", e); }
}

async function applySaseAccess() {
    const saseSession = getSaseSession();
    if (!saseSession) return false;

    if (isAdminPage()) {
        return validateAdminSession();
    }

    await initData();

    const docInput = document.getElementById('docente');
    if (docInput) {
        const existingOption = Array.from(docInput.options || []).find(option => option.value === saseSession.name);
        if (!existingOption) {
            docInput.add(new Option(saseSession.name, saseSession.name));
        }
        docInput.value = saseSession.name;
        docInput.disabled = true;
        onTeacherChange();
    }

    hideAuthWall();
    if (typeof updateProgress === 'function') updateProgress(1);
    return true;
}

async function initData() {
    console.log("Iniciando carga de datos escolar...");
    const { data: p, error: ep } = await supabaseClient.from('colectivo_personal').select('nombre, departamento, rol').order('nombre');
    globalPersonal = p || [];
    if (ep) console.error("Error cargando personal:", ep);
    
    const { data: a, error: ea } = await supabaseClient.from('colectivo_alumnos').select('*').order('nombre_completo');
    globalAlumnos = a || [];
    if (ea) console.error("Error cargando alumnos:", ea);
    
    console.log(`Cargados ${globalPersonal.length} docentes y ${globalAlumnos.length} alumnos.`);
    
    const d = document.getElementById('docente');
    if (d) {
        d.innerHTML = '<option value="">Seleccionar Personal...</option>';
        // Filtramos para que solo el personal participante (docentes/servicios) aparezca en la lista
        globalPersonal.filter(x => x.rol !== 'secretaria' && x.rol !== 'directivo' && x.rol !== 'subdireccion')
                      .forEach(x => d.add(new Option(x.nombre, x.nombre)));
    }
}

function updateProgress(step) {
    const bar = document.getElementById('prog-bar');
    if (!bar) return;
    const pct = ((step - 1) / 3) * 100;
    bar.style.width = pct + "%";
    
    for (let i = 1; i <= 4; i++) {
        const dot = document.getElementById(`step-dot-${i}`);
        const lbl = document.getElementById(`step-lbl-${i}`);
        if (!dot || !lbl) continue; // SEGURIDAD: evitar crash si no existen

        if (i < step) {
            dot.className = 'stepper-dot rounded-full bg-primary-green border-2 border-primary-green flex items-center justify-center text-[10px] font-black text-slate-900 transition-all';
            lbl.className = 'stepper-label font-bold text-primary-green uppercase tracking-tighter';
        } else if (i === step) {
            dot.className = 'stepper-dot rounded-full bg-white border-2 border-primary-green flex items-center justify-center text-[10px] font-black text-primary-green transition-all scale-110 shadow-[0_0_0_4px_rgba(14,165,233,0.18)]';
            dot.style.backgroundColor = '';
            lbl.className = 'stepper-label font-bold text-primary-green uppercase tracking-tighter';
        } else {
            dot.className = 'stepper-dot rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 transition-all';
            dot.style.backgroundColor = '';
            lbl.className = 'stepper-label font-bold text-slate-500 uppercase tracking-tighter';
        }
    }
}

function validateNext(from, to) {
    if (from === 1) {
        const valDocente = document.getElementById('docente').value;
        const valGrupo = document.getElementById('grupo').value;
        const valAsignatura = document.getElementById('asignatura').value;
        if (!valDocente || !valGrupo || !valAsignatura) { 
            alert("Por favor complete Docente, Grupo y Asignatura para continuar."); 
            return; 
        }
    }
    
    document.getElementById(`step-${from}`).classList.add('hidden');
    document.getElementById(`step-${to}`).classList.remove('hidden');
    
    if (to === 2) {
        calculateImpact();
    }
    
    if (to === 3) {
        const valGrupo = document.getElementById('grupo').value;
        // Solo re-renderizar si el grupo cambió o es la primera vez
        if (valGrupo !== lastGroupSelected) {
            lastGroupSelected = valGrupo;
            studentSelections = {}; // Limpiar si cambia de grupo
            renderStudents();
        }
    }
    updateProgress(to);
    window.scrollTo(0, 0);
}

function prevSection(to) {
    const current = document.querySelector('section.card:not(.hidden)');
    if (current) current.classList.add('hidden');
    document.getElementById(`step-${to}`).classList.remove('hidden');
    updateProgress(to);
}

function toggleOtroFactor(checked) {
    document.getElementById('otro-factor-container').classList.toggle('hidden', !checked);
}

function toggleOtraEstrategia(checked) {
    document.getElementById('otra-est-container').classList.toggle('hidden', !checked);
}

function onTeacherChange() {
    const name = document.getElementById('docente').value;
    const p = globalPersonal.find(x => x.nombre === name);
    if (p) {
        const asig = document.getElementById('asignatura');
        asig.value = p.departamento || '';
        asig.readOnly = true;
        updateCampo();
    }
}

function updateCampo() {
    const val = document.getElementById('asignatura').value.toUpperCase();
    const map = { 
        'MATEMÁTICAS': 'Saberes y P. Científico', 
        'BIOLOGÍA': 'Saberes y P. Científico', 
        'FÍSICA': 'Saberes y P. Científico',
        'QUÍMICA': 'Saberes y P. Científico',
        'TECNOLOGÍA': 'Saberes y P. Científico',
        'ESPAÑOL': 'Lenguajes', 
        'ARTES': 'Lenguajes', 
        'INGLÉS': 'Lenguajes',
        'HISTORIA': 'Ética, Naturaleza y Sociedades',
        'GEOGRAFÍA': 'Ética, Naturaleza y Sociedades',
        'FCYE': 'Ética, Naturaleza y Sociedades',
        'VIDA SALUDABLE': 'De lo Humano y lo Comunitario',
        'EDUCACIÓN FÍSICA': 'De lo Humano y lo Comunitario',
        'SOCIOEMOCIONAL': 'De lo Humano y lo Comunitario'
    };
    document.getElementById('campo_formativo').value = map[val] || 'De lo Humano y lo Comunitario';
}

function renderStudents() {
    const grupo = document.getElementById('grupo').value;
    const list = document.getElementById('student-list');
    const badge = document.getElementById('group-name-badge');
    const instruction = document.getElementById('student-list-instruction');
    if (!list) return;

    if (badge) badge.textContent = `GRUPO: ${grupo || '---'}`;
    if (instruction) instruction.classList.toggle('hidden', !grupo);

    console.log("LOG: renderStudents para grupo ->", grupo);
    
    if (!grupo) {
        list.innerHTML = '<p class="text-center text-slate-500 text-[10px] uppercase font-black py-10">Seleccione un grupo en el Paso 1 para ver el listado</p>';
        return;
    }

    if (!globalAlumnos || globalAlumnos.length === 0) {
        list.innerHTML = '<div class="p-8 text-center text-slate-500 text-xs italic">Cargando base de datos escolar...</div>';
        return;
    }

    const filtered = globalAlumnos.filter(s => {
        if (!s.grupo) return false;
        return s.grupo.toString().trim().toUpperCase() === grupo.toString().trim().toUpperCase();
    });

    if (filtered.length === 0) {
        list.innerHTML = `<div class="p-8 text-center text-slate-500 text-xs italic font-black uppercase text-red-500/50">No se encontraron alumnos para el grupo ${grupo}</div>`;
        return;
    }
    
    console.log("LOG: Alumnos filtrados ->", filtered.length);
    list.innerHTML = '';
    console.log(`Renderizando ${filtered.length} alumnos para el grupo ${grupo}`);
    
    filtered.forEach(al => {
            const data = studentSelections[al.id] || { 
                checked: false, 
                behaviors: { 'Atención': 'Nula', 'Trabajo en Clase': 'Nula', 'Lenguaje Inapropiado': 'Nula', 'Sigue Indicaciones': 'Nula' },
                citatorio: 'No',
                acudio: 'No',
                cumplio: 'No',
                intervencion_tutor: 'No',
                intervencion_orientacion: 'No',
                escalado_direccion: 'No'
            };
            
            // Si no estaba en la tienda, agrégalo para que no se pierda al re-renderizar
            if (!studentSelections[al.id]) studentSelections[al.id] = data;

            const div = document.createElement('div');
            div.className = 'p-4 bg-surface-container-low border border-white/10 rounded-2xl flex flex-col gap-3 transition-all hover:border-primary-green/30 mb-3';
            div.innerHTML = `
                <div class="flex items-start justify-between gap-3">
                    <label class="flex items-start gap-3 cursor-pointer w-full min-w-0">
                        <input type="checkbox" onchange="toggleStudentSub('${al.id}', this.checked)" data-id="${al.id}" class="chk-student mt-0.5 w-6 h-6 rounded-lg accent-primary-green shrink-0" ${data.checked ? 'checked' : ''}>
                        <span class="font-bold text-[13px] text-on-surface tracking-tight leading-tight break-words">${al.nombre_completo}</span>
                    </label>
                </div>
                <div id="sub-${al.id}" class="${data.checked ? '' : 'hidden'} space-y-4 pt-2 border-t border-white/5 mt-1">
                    ${['Atención', 'Trabajo en Clase', 'Lenguaje Inapropiado', 'Sigue Indicaciones'].map(b => {
                        const uniqueId = `behav-${al.id}-${b.replace(/\s+/g, '')}`;
                        const currentLevel = data.behaviors[b] || 'Nula';
                        return `
                            <div class="flex flex-col gap-2">
                                <label for="${uniqueId}" class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">${b}</label>
                                <select id="${uniqueId}" name="${uniqueId}" onchange="saveBehavior('${al.id}', '${b}', this.value)" class="behav-sel w-full text-xs p-3 bg-surface-container-low rounded-xl text-on-surface border border-white/10" data-name="${b}">
                                    <option value="Nula" ${currentLevel === 'Nula' ? 'selected' : ''}>NIVEL: NULO</option>
                                    <option value="Baja" ${currentLevel === 'Baja' ? 'selected' : ''}>BAJO</option>
                                    <option value="Media" ${currentLevel === 'Media' ? 'selected' : ''}>MEDIO</option>
                                    <option value="Alta" ${currentLevel === 'Alta' ? 'selected' : ''}>ALTO</option>
                                </select>
                            </div>
                        `;
                    }).join('')}

                    <!-- Seguimiento de Citatorios y Padres -->
                    <div class="space-y-4 pt-4 border-t border-white/10 mt-2">
                        <div class="flex flex-col gap-2">
                            <label for="cit-${al.id}" class="text-[10px] font-black text-primary-green uppercase italic tracking-tighter">¿Se han enviado citatorios?</label>
                            <select onchange="saveExtraField('${al.id}', 'citatorio', this.value); syncConditionalFields('${al.id}')" id="cit-${al.id}" class="w-full text-xs p-3 bg-surface-container-low rounded-xl text-on-surface border border-white/10">
                                <option value="No" ${data.citatorio === 'No' ? 'selected' : ''}>No, ninguno</option>
                                <option value="Sí" ${data.citatorio === 'Sí' ? 'selected' : ''}>Sí, formalmente</option>
                            </select>
                        </div>
                        
                        <div id="cond-acudierom-${al.id}" class="${data.citatorio === 'Sí' ? '' : 'hidden'} animate-fade-in flex flex-col gap-2">
                            <label for="acu-${al.id}" class="text-[10px] font-black text-primary-green uppercase italic tracking-tighter">¿Han acudido sus papás?</label>
                            <select onchange="saveExtraField('${al.id}', 'acudio', this.value); syncConditionalFields('${al.id}')" id="acu-${al.id}" class="w-full text-xs p-3 bg-surface-container-low rounded-xl text-on-surface border border-white/10">
                                <option value="No" ${data.acudio === 'No' ? 'selected' : ''}>No han asistido</option>
                                <option value="Sí" ${data.acudio === 'Sí' ? 'selected' : ''}>Sí, asistieron</option>
                            </select>
                        </div>

                        <div id="cond-cumplio-${al.id}" class="${data.acudio === 'Sí' ? '' : 'hidden'} animate-fade-in flex flex-col gap-2">
                            <label for="cum-${al.id}" class="text-[10px] font-black text-primary-green uppercase italic tracking-tighter">¿Han cumplido acuerdos?</label>
                            <select onchange="saveExtraField('${al.id}', 'cumplio', this.value)" id="cum-${al.id}" class="w-full text-xs p-3 bg-surface-container-low rounded-xl text-on-surface border border-white/10">
                                <option value="No" ${data.cumplio === 'No' ? 'selected' : ''}>Incumplimiento</option>
                                <option value="Sí" ${data.cumplio === 'Sí' ? 'selected' : ''}>Cumplimiento parcial/total</option>
                            </select>
                        </div>

                        <!-- NUEVOS CAMPOS DE ESTATUS DE SEGUIMIENTO -->
                        <div class="pt-4 border-t border-white/10 mt-2 space-y-3">
                            <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Estatus de Intervención Institucional</p>
                            
                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-white/5 rounded-xl">
                                <label for="tut-${al.id}" class="text-[10px] font-bold text-on-surface uppercase sm:flex-1">¿Intervención Tutor de Grupo?</label>
                                <select id="tut-${al.id}" onchange="saveExtraField('${al.id}', 'intervencion_tutor', this.value)" class="w-full sm:w-auto sm:min-w-[118px] text-[10px] p-2 bg-surface-container-high rounded border border-white/10 text-on-surface">
                                    <option value="No" ${data.intervencion_tutor === 'No' ? 'selected' : ''}>No</option>
                                    <option value="Sí" ${data.intervencion_tutor === 'Sí' ? 'selected' : ''}>Sí</option>
                                </select>
                            </div>

                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-white/5 rounded-xl">
                                <label for="ori-${al.id}" class="text-[10px] font-bold text-on-surface uppercase sm:flex-1">¿Orientación / T. Social?</label>
                                <select id="ori-${al.id}" onchange="saveExtraField('${al.id}', 'intervencion_orientacion', this.value)" class="w-full sm:w-auto sm:min-w-[118px] text-[10px] p-2 bg-surface-container-high rounded border border-white/10 text-on-surface">
                                    <option value="No" ${data.intervencion_orientacion === 'No' ? 'selected' : ''}>No</option>
                                    <option value="Sí" ${data.intervencion_orientacion === 'Sí' ? 'selected' : ''}>Sí</option>
                                </select>
                            </div>

                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-red-50 rounded-xl border border-red-500/20">
                                <label for="dir-${al.id}" class="text-[10px] font-bold text-red-500 uppercase sm:flex-1">¿Escaló a Dirección?</label>
                                <select id="dir-${al.id}" onchange="saveExtraField('${al.id}', 'escalado_direccion', this.value)" class="w-full sm:w-auto sm:min-w-[118px] text-[10px] p-2 bg-white rounded border border-red-500/20 text-red-500 font-black">
                                    <option value="No" ${data.escalado_direccion === 'No' ? 'selected' : ''}>No</option>
                                    <option value="Sí" ${data.escalado_direccion === 'Sí' ? 'selected' : ''}>SÍ (URGENTE)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            list.appendChild(div);
    });
}

function toggleStudentSub(id, v) { 
    const sub = document.getElementById(`sub-${id}`);
    if (sub) sub.classList.toggle('hidden', !v); 

    if (!studentSelections[id]) {
        studentSelections[id] = { 
            checked: v, 
            behaviors: { 'Atención': 'Nula', 'Trabajo en Clase': 'Nula', 'Lenguaje Inapropiado': 'Nula', 'Sigue Indicaciones': 'Nula' },
            citatorio: 'No',
            acudio: 'No',
            cumplio: 'No',
            intervencion_tutor: 'No',
            intervencion_orientacion: 'No',
            escalado_direccion: 'No'
        };
    } else {
        studentSelections[id].checked = v;
    }
}

function saveBehavior(id, behavior, level) {
    if (!studentSelections[id]) {
        studentSelections[id] = { 
            checked: true, 
            behaviors: { 'Atención': 'Nula', 'Trabajo en Clase': 'Nula', 'Lenguaje Inapropiado': 'Nula', 'Sigue Indicaciones': 'Nula' },
            citatorio: 'No', acudio: 'No', cumplio: 'No'
        };
    }
    studentSelections[id].behaviors[behavior] = level;
}

function saveExtraField(id, field, value) {
    if (!studentSelections[id]) {
        studentSelections[id] = { 
            checked: true, 
            behaviors: { 'Atención': 'Nula', 'Trabajo en Clase': 'Nula', 'Lenguaje Inapropiado': 'Nula', 'Sigue Indicaciones': 'Nula' },
            citatorio: 'No', acudio: 'No', cumplio: 'No',
            intervencion_tutor: 'No', intervencion_orientacion: 'No', escalado_direccion: 'No'
        };
    }
    studentSelections[id][field] = value;
}

function syncConditionalFields(studentId) {
    const data = studentSelections[studentId];
    if (!data) return;

    const acuContainer = document.getElementById(`cond-acudierom-${studentId}`);
    const cumContainer = document.getElementById(`cond-cumplio-${studentId}`);

    if (acuContainer) acuContainer.classList.toggle('hidden', data.citatorio !== 'Sí');
    if (cumContainer) cumContainer.classList.toggle('hidden', data.acudio !== 'Sí' || data.citatorio !== 'Sí');
}

async function addManualStudent() {
    const grupo = document.getElementById('grupo').value;
    if (!grupo) { alert("Primero seleccione un grupo en el Paso 1."); return; }
    
    const nombre = prompt("Ingrese el NOMBRE COMPLETO del alumno:");
    if (!nombre || nombre.trim().length < 5) return;

    const newAl = {
        id: 'manual-' + Date.now(),
        nombre_completo: nombre.trim().toUpperCase(),
        grupo: grupo
    };
    
    globalAlumnos.push(newAl);
    renderStudents();
    alert("Alumno agregado temporalmente a la lista.");
}


function calculateImpact() {
    const sum = Array.from(document.querySelectorAll('.impact-factor')).reduce((a, b) => a + parseInt(b.value), 0);
    document.getElementById('impacto').value = (sum <= 4) ? 'Crítico' : (sum <= 6) ? 'Alto' : (sum <= 8) ? 'Medio' : 'Bajo';
}

async function handleFormSubmit(e) {
    if (e) e.preventDefault();
    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.textContent = "REGISTRANDO...";

    const reported = [];
    Object.keys(studentSelections).forEach(id => {
        const s = studentSelections[id];
        if (s.checked) {
            reported.push({
                alumno_id: id,
                nombre: globalAlumnos.find(a => String(a.id) === id)?.nombre_completo,
                behaviors: s.behaviors,
                seguimiento_padres: {
                    citatorio_enviado: s.citatorio,
                    padres_asistieron: s.acudio,
                    acuerdos_cumplidos: s.cumplio,
                    intervencion_tutor: s.intervencion_tutor || 'No',
                    intervencion_orientacion: s.intervencion_orientacion || 'No',
                    escalado_direccion: s.escalado_direccion || 'No'
                }
            });
        }
    });

    if (reported.length === 0 && !confirm("No ha seleccionado ningún alumno focalizado. ¿Desea enviar el reporte general de grupo solamente?")) {
        btn.disabled = false;
        btn.textContent = "REGISTRAR DIAGNÓSTICO FINAL";
        return;
    }

    const estrategias = Array.from(document.querySelectorAll('.estrategia-chk:checked')).map(c => c.value);
    if (document.getElementById('chk-otra-est')?.checked) {
        const otraVal = document.getElementById('otra-est-text')?.value;
        if (otraVal) estrategias.push(`OTRA: ${otraVal}`);
    }

    const payload = {
        docente: document.getElementById('docente').value,
        grupo: document.getElementById('grupo').value,
        asignatura: document.getElementById('asignatura').value,
        campo_formativo: document.getElementById('campo_formativo').value,
        periodo: document.getElementById('current-periodo')?.value || 'T2-2026',
        impacto: document.getElementById('impacto').value,
        tiempo_conducta: document.getElementById('tiempo_conducta').value,
        ambiente: {
            atencion: document.getElementById('amb-atencion').value,
            respeto: document.getElementById('amb-respeto').value,
            participacion: document.getElementById('amb-participacion').value
        },
        factores_externos: {
            lista: Array.from(document.querySelectorAll('.fact-ext-chk:checked')).map(c => c.value),
            otro: document.getElementById('fact-ext-otro-chk').checked ? document.getElementById('fact-ext-text').value : null,
            incluye: (document.querySelectorAll('.fact-ext-chk:checked').length > 0 || document.getElementById('fact-ext-otro-chk').checked) ? 'Sí' : 'No'
        },
        alumnos_reportados: reported,
        intervenciones: {
            estrategias: estrategias,
            eficacia: document.getElementById('est-eficacia').value === 'Alto' ? 'Sí' : 
                     (document.getElementById('est-eficacia').value === 'Medio' ? 'Parcialmente' : 'No'),
            otra_estrategia: document.getElementById('chk-otra-est')?.checked ? document.getElementById('otra-est-text')?.value : null
        },
        comentarios: document.getElementById('comentarios').value,
        fecha: new Date().toISOString()
    };

    try {
        const { error } = await supabaseClient.from('colectivo_respuestas_docentes').insert([payload]);
        if (error) throw error;
        
        document.body.innerHTML = `
            <div class="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 text-center">
                <div id="success-card" class="card max-w-lg w-full border-2 border-primary-green/20 animate-fade-in">
                    <div class="mb-8">
                        <div class="w-20 h-20 bg-primary-green text-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-green/20">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h1 class="text-3xl font-black mb-2 tracking-tighter text-primary-green">DIAGNÓSTICO REGISTRADO</h1>
                        <p class="text-[10px] text-slate-400 uppercase tracking-widest">Respaldo Institucional para ${payload.grupo} - ${payload.asignatura}</p>
                    </div>

                    <div class="grid grid-cols-1 gap-3 sm:gap-4 mb-2">
                        <button onclick="window.print()" class="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-3">
                            <span>Imprimir reporte</span>
                        </button>
                        <button onclick="exportResultPDF()" class="w-full px-6 py-4 bg-surface-container-high text-on-surface font-bold rounded-2xl border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                            <span>Guardar PDF</span>
                        </button>
                        <a href="dashboard.html" class="block w-full px-6 py-4 bg-secondary-orange font-bold rounded-2xl hover:opacity-90 transition-all text-xs text-center">
                            Ver análisis del grupo
                        </a>
                        <button onclick="location.reload()" class="w-full px-6 py-4 bg-white/10 text-on-surface font-bold rounded-2xl border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-3 text-xs">
                            <span class="text-xs">Capturar otro reporte</span>
                        </button>
                    </div>
                </div>
            </div>`;
    } catch (err) {
        alert("Error al guardar: " + err.message);
        btn.disabled = false;
        btn.textContent = "REINTENTAR REGISTRO";
    }
}

function exportResultPDF() {
    const element = document.getElementById('success-card');
    const opt = { 
        margin: 10, 
        filename: 'SIRDE-310-Reporte.pdf', 
        image: { type: 'jpeg', quality: 1 }, 
        html2canvas: { scale: 3 }, 
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } 
    };
    html2pdf().set(opt).from(element).save();
}

function togglePinVisibility(id = 'entry-pin') {
    const i = document.getElementById(id);
    if (!i) return;
    i.type = (i.type === 'password' ? 'text' : 'password');
}
function logoutSIRDE() { sessionStorage.clear(); location.reload(); }

window.addEventListener('DOMContentLoaded', async () => {
    // SOPORTE PARA INTEGRACIÓN (IFRAME/URL PARAMS)
    const urlParams = new URLSearchParams(window.location.search);
    const saseToken = urlParams.get('sase_token');
    const pinFromUrl = urlParams.get('pin');
    const sasePayload = parseSaseToken(saseToken);
    
    if (sasePayload) {
        console.log('LOG: Sesión SASE recibida. Omitiendo pantalla de PIN del módulo.');
        startSaseSession(sasePayload);
        urlParams.delete('sase_token');
        const cleanSearch = urlParams.toString();
        const newUrl = window.location.pathname + (cleanSearch ? '?' + cleanSearch : '') + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
    }
    
    if (pinFromUrl) {
        console.log("LOG: PIN recibido vía URL. Configurando sesión de módulo...");
        sessionStorage.setItem('sirde_session_pin', pinFromUrl.trim());
        // Limpiamos la URL por seguridad para no dejar el PIN expuesto en el historial
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
    }

    if (isAdminPage()) {
        const hasAccess = await validateAdminSession();
        if (hasAccess) {
            if (isDashboardPage() && typeof runAnalysis === 'function') {
                await runAnalysis();
            }
            if (isInvitationPage() && typeof initInvitationPage === 'function') {
                await initInvitationPage();
            }
        } else {
            showAuthWall();
        }
        return;
    }

    if (isIndexPage()) {
        if (await applySaseAccess()) {
            if (document.querySelector('.impact-factor')) calculateImpact();
            return;
        }

        const pin = sessionStorage.getItem('sirde_session_pin');
        if (pin) checkAccess(pin);
        if (document.querySelector('.impact-factor')) calculateImpact();
    }
});

