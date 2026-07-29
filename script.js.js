import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyDU1-Rs0MUP430RzavsLJLGtCfEVQkHer4",
    authDomain: "montadordegrade.firebaseapp.com",
    projectId: "montadordegrade",
    storageBucket: "montadordegrade.firebasestorage.app",
    messagingSenderId: "11497734553",
    appId: "1:11497734553:web:26287ecaa2b41617c2d308",
    measurementId: "G-8XL1F5XR4K"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

let currentUser = null;

const METAS = { "Obrigatória": 840, "Optativa": 840, "Estágio": 360, "TCC": 180 };
const TOTAL_CURSO = 2220;
const MAX_PERIODOS = 12;

const DAYS = [
    { key: "SEG", label: "Segunda-feira" },
    { key: "TER", label: "Terça-feira" },
    { key: "QUA", label: "Quarta-feira" },
    { key: "QUI", label: "Quinta-feira" },
    { key: "SEX", label: "Sexta-feira" },
    { key: "FORA", label: "Fora da Grade" }
];

const database = [
    // 1º Período
    { id: "HEA0028", name: "Introdução à Arquivologia", category: "Obrigatória", hours: 60, day: "SEG" },
    { id: "HEA0039", name: "Construção do Pensamento Arquivístico", category: "Obrigatória", hours: 60, day: "TER" },
    { id: "HFC0082", name: "Metodologia Científica", category: "Optativa", hours: 60, day: "QUI" },
    { id: "HFC0066", name: "Introdução à Sociologia", category: "Optativa", hours: 60, day: "SEX" },
    { id: "HH10053", name: "Cultura Histórica e Documento", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HTD0051", name: "Expressão Oral e Escrita", category: "Optativa", hours: 60, day: "TER" },
    { id: "TUT0013", name: "Tutoria Português II", category: "Optativa", hours: 60, day: "FORA" },
    { id: "TUT0014", name: "Tutoria Português III", category: "Optativa", hours: 60, day: "FORA" },

    // 2º Período
    { id: "HEA0029", name: "Gestão da Informação Arquivística", category: "Obrigatória", hours: 60, day: "QUI" },
    { id: "HEA0055", name: "Metodologia da Pesquisa Arquivística", category: "Obrigatória", hours: 60, day: "SEX" },
    { id: "HFC0206", name: "Gestão de Processos", category: "Optativa", hours: 60, day: "QUA" },
    { id: "HEA0030", name: "Ética Profissional Arquivística", category: "Optativa", hours: 30, day: "FORA" },
    { id: "HEB0038", name: "Teoria da Classificação", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HFC0067", name: "Antropologia Cultural", category: "Optativa", hours: 60, day: "SEG" },
    { id: "HTD0052", name: "Leitura e Produção de Texto", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HEA0015", name: "Usos e Usuários da Informação Arquivística", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HEA0016", name: "Arquivologia e Ciência da Informação", category: "Optativa", hours: 60, day: "TER" },
    { id: "HTD0035", name: "Análise da Informação", category: "Optativa", hours: 60, day: "QUA" },
    { id: "HEB0075", name: "Gestão Estratégica da Informação e do Conhecimento", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HTD0031", name: "Técnicas de Recuperação e Disseminação da Informação", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HF10006", name: "Teoria do Conhecimento", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HTD0002", name: "Introdução à Linguística", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HTD0017", name: "Organização de Conceitos em Linguagens Documentárias", category: "Optativa", hours: 60, day: "TER" },
    { id: "HEB0016", name: "Organização do Conhecimento I", category: "Optativa", hours: 60, day: "QUA" },
    { id: "HEB0017", name: "Organização do Conhecimento II", category: "Optativa", hours: 60, day: "SEX" },
    { id: "HTD0009", name: "Tecnologia da Informação e Processos de Automação", category: "Optativa", hours: 60, day: "QUI" },
    { id: "HFE0001", name: "Desenvolvimento das Relações Interpessoais", category: "Optativa", hours: 30, day: "FORA" },
    { id: "JFJ0032", name: "Direitos Autorais", category: "Optativa", hours: 30, day: "FORA" },
    { id: "HF10050", name: "Filosofia e Informação na Contemporaneidade", category: "Optativa", hours: 60, day: "FORA" },
    { id: "TIN0001", name: "Introdução à Ciência da Computação", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HEM0137", name: "Acondicionamento de Acervos", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HF10004", name: "Lógica", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HTD0046", name: "Introdução à Ciência da Informação", category: "Optativa", hours: 60, day: "TER" },
    { id: "HH10039", name: "Memória, Cultura e Sociedade", category: "Optativa", hours: 60, day: "QUA" },
    { id: "SER0012", name: "Educação Ambiental e Cidadania", category: "Optativa", hours: 45, day: "FORA" },
    { id: "HD10142", name: "Língua Brasileira de Sinais", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HD10164", name: "Culturas Afro-Brasileiras em Sala de Aula", category: "Optativa", hours: 30, day: "FORA" },

    // 3º Período
    { id: "HEA0031", name: "Classificação de Documentos Arquivísticos", category: "Obrigatória", hours: 60, day: "TER" },
    { id: "HEA0032", name: "Avaliação de Documentos Arquivísticos", category: "Obrigatória", hours: 60, day: "QUA" },
    { id: "HEA0034", name: "Seminário de Arquivística I", category: "Optativa", hours: 30, day: "QUI" },
    { id: "HEA0035", name: "Tópicos Especiais", category: "Optativa", hours: 30, day: "FORA" },
    { id: "HEA0033", name: "Redes e Sistemas de Informação Arquivística", category: "Optativa", hours: 30, day: "FORA" },
    { id: "HFC0048", name: "Administração I", category: "Optativa", hours: 60, day: "QUA" },
    { id: "HF10039", name: "Epistemologia", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HTD0054", name: "Informação, Memória e Documento", category: "Optativa", hours: 60, day: "TER" },

    // 4º Período
    { id: "HEA0036", name: "Arranjo e Descrição de Documentos", category: "Obrigatória", hours: 60, day: "SEG" },
    { id: "HEA0008", name: "Diplomática", category: "Obrigatória", hours: 60, day: "TER" },
    { id: "HEA0037", name: "Conservação Preventiva de Documentos", category: "Obrigatória", hours: 60, day: "QUI" },
    { id: "HTD0003", name: "Estatística Aplicada a Processos Técnicos Documentais", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HF10018", name: "Filosofia da Cultura", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HEA0058", name: "Arquivos Médicos", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HFC0049", name: "Administração II", category: "Optativa", hours: 60, day: "QUI" },
    { id: "HTD0055", name: "Tecnologia de Reprodução e Armazenamento de Documentos", category: "Optativa", hours: 60, day: "QUA" },
    { id: "HEA0038", name: "Estágio Supervisionado I", category: "Estágio", hours: 120, day: "SEX" },

    // 5º Período
    { id: "HEA0042", name: "Pesquisa em Arquivística", category: "Obrigatória", hours: 60, day: "TER" },
    { id: "HEA0005", name: "Arquivos Contábeis", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HEA0025", name: "Paleografia", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HEA0040", name: "Restauração de Documentos", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HEA0044", name: "Informática Aplicada à Arquivística", category: "Optativa", hours: 60, day: "SEG" },
    { id: "HEA0043", name: "Seminário de Arquivística II", category: "Optativa", hours: 30, day: "QUI" },
    { id: "HTD0049", name: "Fundamentos de Inglês Instrumental", category: "Optativa", hours: 60, day: "SEX" },
    { id: "HTD0058", name: "Teoria e Prática Discursiva na Esfera Acadêmica", category: "Optativa", hours: 60, day: "SEG" },
    { id: "HH10135", name: "História do Brasil Contemporâneo", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HEA0041", name: "Estágio Supervisionado II", category: "Estágio", hours: 120, day: "SEX" },

    // 6º Período
    { id: "HEA0056", name: "Gestão de Documentos Arquivísticos", category: "Obrigatória", hours: 60, day: "SEG" },
    { id: "HEA0047", name: "Documentação Audiovisual e Digital", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HEA0057", name: "Gestão Arquivística de Documentos Eletrônicos", category: "Optativa", hours: 60, day: "QUI" },
    { id: "HFC0008", name: "Comunicação", category: "Optativa", hours: 60, day: "TER" },
    { id: "HFE0066", name: "Educação Especial", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HEA0046", name: "Estágio Supervisionado III", category: "Estágio", hours: 120, day: "SEX" },
    { id: "HEA0045", name: "Trabalho de Conclusão de Curso I", category: "TCC", hours: 90, day: "QUA" },

    // 7º Período
    { id: "HEA0049", name: "Organização Prática de Arquivos", category: "Obrigatória", hours: 120, day: "TER" },
    { id: "HEA0017", name: "Gestão de Serviços Arquivísticos", category: "Obrigatória", hours: 60, day: "QUI" },
    { id: "HEA0050", name: "Legislação Arquivística", category: "Optativa", hours: 30, day: "FORA" },
    { id: "HD10084", name: "Educação a Distância", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HFC0009", name: "Comunicação Técnica e Científica", category: "Optativa", hours: 60, day: "FORA" },
    { id: "HEA0048", name: "Trabalho de Conclusão de Curso II", category: "TCC", hours: 90, day: "SEX" },

    // 8º Período
    { id: "HEA0052", name: "Gestão de Instituições Arquivísticas", category: "Optativa", hours: 60, day: "QUI" },
    { id: "HEA0051", name: "Projetos Arquivísticos", category: "Optativa", hours: 30, day: "QUA" },
    { id: "HEA0053", name: "Políticas de Acesso à Informação Arquivística", category: "Optativa", hours: 60, day: "SEX" },
    { id: "HEA0054", name: "Seminário de Arquivística III", category: "Optativa", hours: 30, day: "FORA" }
];

let periodAllocations = {};
for (let i = 1; i <= MAX_PERIODOS; i++) {
    periodAllocations[i] = [];
}

const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const userNameDisplay = document.getElementById('user-name-display');

document.getElementById('btn-register').addEventListener('click', async () => {
    if (!emailInput.value || !passwordInput.value) return alert("Preencha e-mail e senha.");
    try {
        await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    } catch (error) {
        alert("Erro ao criar conta: " + error.message);
    }
});

document.getElementById('btn-login').addEventListener('click', async () => {
    if (!emailInput.value || !passwordInput.value) return alert("Preencha e-mail e senha.");
    try {
        await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    } catch (error) {
        alert("Erro ao entrar: E-mail ou senha incorretos.");
    }
});

document.getElementById('btn-logout').addEventListener('click', async () => {
    await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loginScreen.style.display = 'none';
        appScreen.style.display = 'block';
        
        if(userNameDisplay) {
            userNameDisplay.textContent = "Rafael do N. Vieira";
        }
        
        loadData(); 
    } else {
        currentUser = null;
        loginScreen.style.display = 'flex';
        appScreen.style.display = 'none';
        
        emailInput.value = '';
        passwordInput.value = '';
        for (let p = 1; p <= MAX_PERIODOS; p++) periodAllocations[p] = [];
        updateAllDropdowns();
        for (let p = 1; p <= MAX_PERIODOS; p++) renderPeriodCourses(p);
        updateCalculations();
    }
});

async function saveData() {
    if (!currentUser) return;
    try {
        await setDoc(doc(db, "grades", currentUser.uid), {
            periodAllocations: periodAllocations,
            startYear: document.getElementById('start-year').value,
            startSem: document.getElementById('start-sem').value
        });
    } catch (e) {
        console.error("Erro ao salvar no Firebase", e);
    }
}

async function loadData() {
    if (!currentUser) return;
    try {
        const docSnap = await getDoc(doc(db, "grades", currentUser.uid));
        if (docSnap.exists()) {
            const data = docSnap.data();
            periodAllocations = data.periodAllocations || periodAllocations;
            
            if (data.startYear) document.getElementById('start-year').value = data.startYear;
            if (data.startSem) document.getElementById('start-sem').value = data.startSem;
        }
    } catch (e) {
        console.error("Erro ao carregar do Firebase", e);
    }
    
    for (let p = 1; p <= MAX_PERIODOS; p++) {
        renderPeriodCourses(p);
    }
    updateAllDropdowns();
    updateSemesterDates();
}

function initYearOptions() {
    const selectYear = document.getElementById('start-year');
    const currentYear = new Date().getFullYear();
    selectYear.innerHTML = "";
    for (let y = currentYear - 6; y <= currentYear + 4; y++) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        if (y === currentYear) opt.selected = true;
        selectYear.appendChild(opt);
    }
}

function calculateSemesterInfo(startYear, startSem, periodNum) {
    const totalSemesters = (startSem - 1) + (periodNum - 1);
    const year = startYear + Math.floor(totalSemesters / 2);
    const sem = (totalSemesters % 2) + 1;
    const month = sem === 1 ? "Julho" : "Dezembro";
    return {
        year: year, sem: sem, month: month,
        labelShort: `${year}.${sem}`,
        labelFull: `${sem}º Semestre de ${year} (${month}/${year})`
    };
}

function updateSemesterDates() {
    const startYear = parseInt(document.getElementById('start-year').value) || 2024;
    const startSem = parseInt(document.getElementById('start-sem').value) || 1;

    for (let p = 1; p <= MAX_PERIODOS; p++) {
        const info = calculateSemesterInfo(startYear, startSem, p);
        const badgeEl = document.getElementById(`period-date-badge-${p}`);
        if (badgeEl) badgeEl.innerText = `${info.labelShort} (${info.month}/${info.year})`;
    }
    updateCalculations();
    saveData();
}

function initApp() {
    initYearOptions();
    renderPeriodsStructure();
    updateAllDropdowns();
    updateSemesterDates();
}

function handleCourseSelection(p) {
    const selectEl = document.getElementById(`select-period-${p}`);
    const dayEl = document.getElementById(`select-day-${p}`);
    const courseId = selectEl.value;
    
    if (!courseId) {
        dayEl.style.display = 'none';
        return;
    }
    
    const course = database.find(c => c.id === courseId);
    if (course && course.day === "FORA") {
        dayEl.style.display = 'inline-block';
    } else {
        dayEl.style.display = 'none';
    }
}

function renderPeriodsStructure() {
    const container = document.getElementById('periods-container');
    container.innerHTML = "";

    for (let p = 1; p <= MAX_PERIODOS; p++) {
        const periodCard = document.createElement('div');
        periodCard.className = 'period-card';
        periodCard.innerHTML = `
            <div class="period-header">
                <div>
                    <span>${p}º Período Cursado</span>
                    <span class="period-date-badge" id="period-date-badge-${p}">--.--</span>
                </div>
                <span class="period-hours-badge" id="period-badge-${p}">0h acumuladas</span>
            </div>
            <div class="period-body">
                <div class="select-box-container">
                    <select id="select-period-${p}" onchange="handleCourseSelection(${p})">
                        <option value="">-- Selecione uma disciplina para este período --</option>
                    </select>
                    
                    <select id="select-day-${p}" style="display: none; max-width: 150px; padding: 10px; border: 1px solid var(--border); border-radius: 8px; background-color: #fff;">
                        <option value="SEG">Segunda</option>
                        <option value="TER">Terça</option>
                        <option value="QUA">Quarta</option>
                        <option value="QUI">Quinta</option>
                        <option value="SEX">Sexta</option>
                        <option value="FORA">Manter Livre</option>
                    </select>

                    <button class="btn-add" onclick="addCourseToPeriod(${p})">Adicionar</button>
                </div>
                <div class="week-grid">
                    ${DAYS.map(day => `
                        <div class="day-slot ${day.key === 'FORA' ? 'day-slot-extra' : ''}">
                            <div class="day-header">${day.label}</div>
                            <div id="period-${p}-day-${day.key}" style="flex-grow:1; display:flex; flex-direction:column;">
                                <p class="empty-day-msg">Livre</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        container.appendChild(periodCard);
    }
}

function getAllSelectedCourseIds() {
    let all = [];
    Object.values(periodAllocations).forEach(arr => {
        arr.forEach(item => {
            all.push(typeof item === 'string' ? item : item.id);
        });
    });
    return new Set(all);
}

function updateAllDropdowns() {
    const selectedIds = getAllSelectedCourseIds();
    const sortedDatabase = [...database].sort((a, b) => a.name.localeCompare(b.name));

    for (let p = 1; p <= MAX_PERIODOS; p++) {
        const selectEl = document.getElementById(`select-period-${p}`);
        const currentValue = selectEl.value;
        selectEl.innerHTML = `<option value="">-- Selecione uma disciplina para este período --</option>`;

        sortedDatabase.forEach(course => {
            if (!selectedIds.has(course.id)) {
                const opt = document.createElement('option');
                opt.value = course.id;
                const dayLabel = course.day === "FORA" ? "Fora da Grade" : course.day;
                opt.textContent = `${course.name} [${course.id}] (${course.hours}h) - ${course.category} | Dia: ${dayLabel}`;
                selectEl.appendChild(opt);
            }
        });
        selectEl.value = currentValue;
    }
}

function addCourseToPeriod(periodNumber) {
    if (!currentUser) return alert("Você precisa fazer login para editar e salvar a grade.");
    
    const selectEl = document.getElementById(`select-period-${periodNumber}`);
    const dayEl = document.getElementById(`select-day-${periodNumber}`);
    const courseId = selectEl.value;
    
    if (!courseId) return;

    const courseToAdd = database.find(c => c.id === courseId);
    if (!courseToAdd) return;

    let assignedDay = courseToAdd.day;
    if (assignedDay === "FORA") {
        assignedDay = dayEl.value;
    }

    const currentPeriodCourses = (periodAllocations[periodNumber] || []).map(item => {
        const id = typeof item === 'string' ? item : item.id;
        const customDay = typeof item === 'string' ? null : item.customDay;
        const c = database.find(dbC => dbC.id === id);
        return { ...c, assignedDay: customDay || c.day };
    });

    const conflictingCourse = currentPeriodCourses.find(c => c && c.assignedDay === assignedDay && assignedDay !== "FORA");

    if (conflictingCourse) {
        const dayObj = DAYS.find(d => d.key === assignedDay);
        return alert(`⚠️ CONFLITO DE HORÁRIO!\n\nVocê já adicionou "${conflictingCourse.name}" no dia de ${dayObj.label} neste período.`);
    }

    periodAllocations[periodNumber].push({ 
        id: courseId, 
        customDay: courseToAdd.day === "FORA" ? dayEl.value : null 
    });
    
    selectEl.value = "";
    dayEl.style.display = 'none';

    renderPeriodCourses(periodNumber);
    updateAllDropdowns();
    updateCalculations();
    saveData();
}

function removeCourseFromPeriod(periodNumber, courseId) {
    periodAllocations[periodNumber] = (periodAllocations[periodNumber] || []).filter(item => {
        const id = typeof item === 'string' ? item : item.id;
        return id !== courseId;
    });
    renderPeriodCourses(periodNumber);
    updateAllDropdowns();
    updateCalculations();
    saveData();
}

function renderPeriodCourses(periodNumber) {
    DAYS.forEach(day => {
        const container = document.getElementById(`period-${periodNumber}-day-${day.key}`);
        if (container) container.innerHTML = `<p class="empty-day-msg">Livre</p>`;
    });

    const coursesInPeriod = periodAllocations[periodNumber] || [];

    coursesInPeriod.forEach(item => {
        const id = typeof item === 'string' ? item : item.id;
        const customDay = typeof item === 'string' ? null : item.customDay;
        const course = database.find(c => c.id === id);
        
        if (course) {
            const dayKey = customDay || course.day || "FORA";
            const container = document.getElementById(`period-${periodNumber}-day-${dayKey}`);
            
            if (container) {
                if (container.querySelector('.empty-day-msg')) container.innerHTML = "";

                const card = document.createElement('div');
                card.className = 'day-course-card';
                card.innerHTML = `
                    <div class="day-course-title">${course.name}</div>
                    <div class="day-course-meta">Cód: ${course.id} • ${course.hours}h</div>
                    <div class="day-course-footer">
                        <span class="badge-cat cat-${course.category}">${course.category}</span>
                        <button class="btn-remove" title="Remover" onclick="removeCourseFromPeriod(${periodNumber}, '${course.id}')">&times;</button>
                    </div>
                `;
                container.appendChild(card);
            }
        }
    });
}

function clearAllSelections() {
    if (!currentUser) return alert("Você precisa estar logado para alterar a grade.");
    if (confirm("Tem certeza que deseja limpar toda a sua grade montada?")) {
        for (let p = 1; p <= MAX_PERIODOS; p++) {
            periodAllocations[p] = [];
            renderPeriodCourses(p);
        }
        updateAllDropdowns();
        updateCalculations();
        saveData(); 
    }
}

function updateCalculations() {
    let done = { "Obrigatória": 0, "Optativa": 0, "Estágio": 0, "TCC": 0 };
    let grandTotalDone = 0;
    let lastActivePeriod = 0;

    for (let p = 1; p <= MAX_PERIODOS; p++) {
        let periodHours = 0;
        (periodAllocations[p] || []).forEach(item => {
            const id = typeof item === 'string' ? item : item.id;
            const course = database.find(c => c.id === id);
            if (course) {
                done[course.category] += course.hours;
                periodHours += course.hours;
                grandTotalDone += course.hours;
            }
        });

        if (periodAllocations[p] && periodAllocations[p].length > 0) lastActivePeriod = p;

        const badgeEl = document.getElementById(`period-badge-${p}`);
        if (badgeEl) {
            badgeEl.innerText = `${periodHours}h acumuladas`;
            badgeEl.style.backgroundColor = periodHours > 0 ? "rgba(16, 185, 129, 0.4)" : "rgba(255, 255, 255, 0.2)";
        }
    }

    const percent = Math.min(100, Math.round((grandTotalDone / TOTAL_CURSO) * 100));
    document.getElementById('progress-bar').style.width = `${percent}%`;
    document.getElementById('total-progress-text').innerText = `${grandTotalDone}h / ${TOTAL_CURSO}h (${percent}%)`;
    
    const totalRemaining = Math.max(0, TOTAL_CURSO - grandTotalDone);
    document.getElementById('total-remaining-text').innerText = `${totalRemaining} horas`;

    const updateCategoryCard = (cat, doneHours, suf) => {
        const meta = METAS[cat];
        const faltam = Math.max(0, meta - doneHours);

        document.getElementById(`done-${suf}`).innerText = doneHours;
        const remEl = document.getElementById(`rem-${suf}`);
        
        if (faltam === 0) {
            remEl.innerText = "CONCLUÍDO! ✅";
            remEl.classList.add("done");
        } else {
            remEl.innerText = `Faltam: ${faltam}h`;
            remEl.classList.remove("done");
        }
    };

    updateCategoryCard("Obrigatória", done["Obrigatória"], "obr");
    updateCategoryCard("Optativa", done["Optativa"], "opt");
    updateCategoryCard("Estágio", done["Estágio"], "est");
    updateCategoryCard("TCC", done["TCC"], "tcc");

    const startYear = parseInt(document.getElementById('start-year').value) || 2024;
    const startSem = parseInt(document.getElementById('start-sem').value) || 1;
    const gradBadge = document.getElementById('grad-period-badge');
    const gradText = document.getElementById('grad-date-text');

    if (lastActivePeriod > 0) {
        const gradInfo = calculateSemesterInfo(startYear, startSem, lastActivePeriod);
        gradBadge.innerText = `${lastActivePeriod}º Período`;
        gradText.innerText = `${gradInfo.sem}º Sem/${gradInfo.year} (${gradInfo.month})`;
    } else {
        const defaultGradInfo = calculateSemesterInfo(startYear, startSem, 8);
        gradBadge.innerText = `Estimado (8º P)`;
        gradText.innerText = `${defaultGradInfo.sem}º Sem/${defaultGradInfo.year} (${defaultGradInfo.month})`;
    }
}

window.updateSemesterDates = updateSemesterDates;
window.clearAllSelections = clearAllSelections;
window.addCourseToPeriod = addCourseToPeriod;
window.removeCourseFromPeriod = removeCourseFromPeriod;
window.handleCourseSelection = handleCourseSelection;

document.addEventListener('DOMContentLoaded', initApp);