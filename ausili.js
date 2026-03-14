// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyC0OFuNjPa8TrOGUfWMELBHS2tB07U7Pu4",
    authDomain: "eubiotech.firebaseapp.com",
    projectId: "eubiotech",
    storageBucket: "eubiotech.firebasestorage.app",
    messagingSenderId: "55119431815",
    appId: "1:55119431815:web:5b5ab02b59b1ce51119022"
};
const _firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const dataCollection = db.collection('ausili_records');

// --- State Management ---
let schede = [];

// --- DOM Elements ---
const grid = document.getElementById('cards-grid');
const searchInput = document.getElementById('search-input');
const btnNewCard = document.getElementById('btn-new-card');
const btnExportExcel = document.getElementById('btn-export-excel');
const btnExportPdf = document.getElementById('btn-export-pdf');
const modal = document.getElementById('modal-card');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCancel = document.getElementById('btn-cancel');
const form = document.getElementById('ausili-form');
const modalTitle = document.getElementById('modal-title');
const btnSinglePdf = document.getElementById('btn-single-pdf');

// Form inputs
const inputId = document.getElementById('card-id');
const inputProgressivo = document.getElementById('progressivo');
const inputData = document.getElementById('data-ordine');
const inputPaziente = document.getElementById('paziente');
const inputTecnico = document.getElementById('tecnico');
const inputAltezza = document.getElementById('altezza');
const inputPeso = document.getElementById('peso');
const inputMisura1 = document.getElementById('misura1');
const inputMisura2 = document.getElementById('misura2');
const inputMisura3 = document.getElementById('misura3');
const inputMisura4 = document.getElementById('misura4');
const inputMisura5 = document.getElementById('misura5');
const inputMisura6 = document.getElementById('misura6');
const inputMisura7 = document.getElementById('misura7');
const inputMisura8 = document.getElementById('misura8');
const inputMisura9 = document.getElementById('misura9');
const inputMisura10 = document.getElementById('misura10');
const inputMisura11 = document.getElementById('misura11');
const inputPersonalizzazioni = document.getElementById('personalizzazioni');
const inputRichieste = document.getElementById('richieste');
const inputNote = document.getElementById('note');

// --- Initialization ---
let isFormDirty = false;

function init() {
    loadData();
    setupEventListeners();
    renderCards();
}

function loadData() {
    grid.innerHTML = '<div class="empty-state"><h3>Connessione al Cloud in corso... <span style="display:inline-block; animation: spin 1s linear infinite;">⚙️</span></h3></div>';

    dataCollection.onSnapshot(snapshot => {
        if (snapshot.empty) {
            // Fallback migrazione iniziale se cloud vuoto ma locale pieno
            const saved = localStorage.getItem('ortos_ausili_v2');
            if (saved) {
                const localSchede = JSON.parse(saved);
                if (localSchede && localSchede.length > 0) {
                    console.log("Migrazione dati locali verso Firebase in corso...");
                    let batch = db.batch();
                    let count = 0;
                    localSchede.forEach(s => {
                        batch.set(dataCollection.doc(s.id), s);
                        count++;
                    });
                    if (count > 0) batch.commit().then(() => console.log("Migrazione completata."));
                }
            } else {
                // Se proprio non c'è NULLA, mostro stato vuoto
                schede = [];
                renderCards();
            }
        } else {
            let tempSchede = [];
            snapshot.forEach(doc => {
                tempSchede.push(doc.data());
            });
            // Ordina per progressivo decrescente
            tempSchede.sort((a,b) => b.progressivo - a.progressivo);
            schede = tempSchede;
            renderCards(searchInput.value);
            
            // Clean local save after successful cloud sync
            if(localStorage.getItem('ortos_ausili_v2')) {
                localStorage.removeItem('ortos_ausili_v2');
                console.log("Cronologia locale rimossa: si opererà solo sul Cloud!");
            }
        }
    }, error => {
        console.error("Errore di connessione a Firebase:", error);
        alert("Errore di connessione al Cloud. Il sistema proverà a usare i dati salvati offline in precedenza.");
        
        // Offline Fallback
        const saved = localStorage.getItem('ortos_ausili_v2');
        if (saved) {
            schede = JSON.parse(saved);
            renderCards(searchInput.value);
        } else {
            schede = [];
            renderCards();
        }
    });
}

function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

// --- Event Listeners ---
function setupEventListeners() {
    btnNewCard.addEventListener('click', () => openModal());
    btnExportExcel.addEventListener('click', exportToExcel);
    btnExportPdf.addEventListener('click', exportToPdf);

    // Track changes
    form.addEventListener('input', () => {
        isFormDirty = true;
    });

    btnCloseModal.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);
    
    // Close modal by clicking outside
    modal.addEventListener('click', (e) => {
        if(e.target === modal) closeModal();
    });

    const btnStats = document.getElementById('btn-stats');
    if (btnStats) btnStats.addEventListener('click', openStatsModal);
    
    const btnCloseStats = document.getElementById('btn-close-stats');
    if (btnCloseStats) btnCloseStats.addEventListener('click', closeStatsModal);

    document.addEventListener('click', (e) => {
        const drop = document.getElementById('export-dropdown');
        const btnDrop = document.getElementById('btn-export-menu');
        if (drop && btnDrop && !drop.contains(e.target) && !btnDrop.contains(e.target)) {
            drop.classList.add('hidden');
        }
    });

    form.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', () => renderCards(searchInput.value));
}

// --- Modal Logic ---
function openModal(id = null, readOnly = false) {
    const inputs = form.querySelectorAll('input, select, textarea');
    const btnSubmit = form.querySelector('button[type="submit"]');
    
    inputs.forEach(input => {
        input.disabled = readOnly;
        input.classList.remove('readonly-filled', 'readonly-empty');
    });
    btnSubmit.style.display = readOnly ? 'none' : 'inline-flex';

    if (id) {
        modalTitle.textContent = readOnly ? "Dettaglio Scheda Plantare" : "Modifica Scheda Plantare";
        const scheda = schede.find(s => s.id === id);
        if(scheda) {
            inputId.value = scheda.id || '';
            inputProgressivo.value = scheda.progressivo || '';
            inputData.value = scheda.data || '';
            inputPaziente.value = scheda.paziente || '';
            inputTecnico.value = scheda.tecnico || '';
            inputAltezza.value = scheda.altezza || '';
            inputPeso.value = scheda.peso || '';
            inputMisura1.value = scheda.misura1 || '';
            inputMisura2.value = scheda.misura2 || '';
            inputMisura3.value = scheda.misura3 || '';
            inputMisura4.value = scheda.misura4 || '';
            inputMisura5.value = scheda.misura5 || '';
            inputMisura6.value = scheda.misura6 || '';
            inputMisura7.value = scheda.misura7 || '';
            inputMisura8.value = scheda.misura8 || '';
            inputMisura9.value = scheda.misura9 || '';
            inputMisura10.value = scheda.misura10 || '';
            inputMisura11.value = scheda.misura11 || '';
            inputPersonalizzazioni.value = scheda.personalizzazioni || '';
            inputRichieste.value = scheda.richieste || '';
            inputNote.value = scheda.note || '';
            
            if (btnSinglePdf) {
                btnSinglePdf.style.display = 'inline-flex';
                btnSinglePdf.onclick = () => window.generateSinglePdf(scheda.id);
            }
        }
    } else {
        if (btnSinglePdf) btnSinglePdf.style.display = 'none';
        modalTitle.textContent = "Nuova Scheda Plantare";
        form.reset();
        inputId.value = '';
        inputData.value = new Date().toISOString().split('T')[0];
        // Auto-increment progressivo if schede exist
        let maxProg = 0;
        if(schede.length > 0) {
            maxProg = Math.max(...schede.map(s => parseInt(s.progressivo) || 0));
        }
        inputProgressivo.value = maxProg + 1;
    }
    
    // Assegna classi per evidenziare campi compilati/vuoti se in readonly
    if (readOnly) {
        inputs.forEach(input => {
            if (input.value && input.value.trim() !== '') {
                input.classList.add('readonly-filled');
            } else {
                input.classList.add('readonly-empty');
            }
        });
    }
    
    document.body.style.overflow = 'hidden'; 
    modal.classList.remove('hidden');
    if (!readOnly) inputPaziente.focus();
}

function closeModal() {
    if (isFormDirty) {
        if (!confirm("Hai delle modifiche non salvate. Sei sicuro di voler chiudere? I dati andranno persi.")) {
            return;
        }
    }
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    isFormDirty = false;
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const btnSubmit = form.querySelector('button[type="submit"]');
    const originalText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = 'Salvataggio...';
    btnSubmit.disabled = true;

    const id = inputId.value;
    const nuovaScheda = {
        id: id || generateId(),
        progressivo: parseInt(inputProgressivo.value) || 0,
        data: inputData.value,
        paziente: inputPaziente.value,
        tecnico: inputTecnico.value,
        altezza: inputAltezza.value,
        peso: inputPeso.value,
        misura1: inputMisura1.value,
        misura2: inputMisura2.value,
        misura3: inputMisura3.value,
        misura4: inputMisura4.value,
        misura5: inputMisura5.value,
        misura6: inputMisura6.value,
        misura7: inputMisura7.value,
        misura8: inputMisura8.value,
        misura9: inputMisura9.value,
        misura10: inputMisura10.value,
        misura11: inputMisura11.value,
        personalizzazioni: inputPersonalizzazioni.value,
        richieste: inputRichieste.value,
        note: inputNote.value
    };

    // Firebase Save
    dataCollection.doc(nuovaScheda.id).set(nuovaScheda)
        .then(() => {
            isFormDirty = false;
            closeModal();
            // renderCards comes automatically via onSnapshot!
        })
        .catch(err => {
            console.error("Errore salvataggio Firebase:", err);
            alert("Impossibile salvare sul Cloud al momento. Controlla la connessione.");
        })
        .finally(() => {
            btnSubmit.innerHTML = originalText;
            btnSubmit.disabled = false;
        });
}

// Expose delete to global scope for inline onclick handler
window.deleteCard = function(id) {
    if(confirm("Sei sicuro di voler eliminare questa scheda definivamente dal Cloud?")) {
        dataCollection.doc(id).delete().catch(err => {
            console.error("Errore eliminazione:", err);
            alert("Non è stato possibile eliminare la scheda al momento.");
        });
    }
}

window.openModal = openModal;
window.viewModal = function(id) { openModal(id, true); };
window.editModal = function(id) { openModal(id, false); };

// --- Stats Modal Logic ---
const modalStats = document.getElementById('modal-stats');
const statsYearSelect = document.getElementById('stats-year');
const btnGenerateTable = document.getElementById('btn-generate-table');
const statsTableContainer = document.getElementById('stats-table-container');

function openStatsModal() {
    const years = new Set();
    schede.forEach(s => {
        if(s.data) {
            const y = s.data.substring(0,4);
            if(y) years.add(y);
        }
    });
    
    const sortedYears = Array.from(years).sort((a,b) => b.localeCompare(a));
    
    if (statsYearSelect) {
        statsYearSelect.innerHTML = '<option value="all">Tutti gli anni</option>';
        sortedYears.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            statsYearSelect.appendChild(opt);
        });
    }
    
    refreshStats();
    if (statsTableContainer) statsTableContainer.style.display = 'none';
    
    document.body.style.overflow = 'hidden';
    if (modalStats) modalStats.classList.remove('hidden');
}

function closeStatsModal() {
    if (modalStats) modalStats.classList.add('hidden');
    document.body.style.overflow = '';
}

function refreshStats() {
    if (!statsYearSelect) return;
    const selectedYear = statsYearSelect.value;
    const now = new Date();
    const currentYearStr = now.getFullYear().toString();
    const currentMonthStr = (now.getMonth() + 1).toString().padStart(2, '0');
    const currentQuarterStr = Math.floor(now.getMonth() / 3) + 1;

    let tot = 0, totYear = 0, totQuarter = 0, totMonth = 0;

    schede.forEach(s => {
        tot++;
        if (!s.data) return;
        
        const y = s.data.substring(0, 4);
        const m = s.data.substring(5, 7);
        const q = Math.floor((parseInt(m, 10) - 1) / 3) + 1;
        
        if (selectedYear === 'all' || y === selectedYear) {
            totYear++;
        }
        
        if (y === currentYearStr && q === currentQuarterStr) {
            totQuarter++;
        }
        
        if (y === currentYearStr && m === currentMonthStr) {
            totMonth++;
        }
    });

    const elTot = document.getElementById('stat-total');
    if (elTot) elTot.textContent = tot;
    const elYear = document.getElementById('stat-year');
    if (elYear) elYear.textContent = totYear;
    const elQuarter = document.getElementById('stat-quarter');
    if (elQuarter) elQuarter.textContent = totQuarter;
    const elMonth = document.getElementById('stat-month');
    if (elMonth) elMonth.textContent = totMonth;
}

if (statsYearSelect) {
    statsYearSelect.addEventListener('change', refreshStats);
}

if (btnGenerateTable) {
    btnGenerateTable.addEventListener('click', () => {
        renderStatsTable();
    });
}

function renderStatsTable() {
    const dataToExport = schede.map(s => ({
        "Prog.": s.progressivo || '',
        "Data": s.data || '',
        "Paziente": s.paziente || '',
        "Tecnico": s.tecnico || '',
        "Altezza (cm)": s.altezza || '',
        "Peso (kg)": s.peso || '',
        "1-Prof. seduta": s.misura1 || '',
        "2-Prof. torace": s.misura2 || '',
        "3-Seduta-cavo": s.misura3 || '',
        "4-Alt. spalle": s.misura4 || '',
        "5-Spalle-capo": s.misura5 || '',
        "6-Seduta-brac.": s.misura6 || '',
        "Personalizzazioni": s.personalizzazioni ? 'Sì' : 'No',
        "Richieste": s.richieste ? 'Sì' : 'No',
        "Note": s.note || ''
    }));
    
    const tHead = document.getElementById('stats-table-head');
    const tBody = document.getElementById('stats-table-body');
    if (!tHead || !tBody) return;
    
    tHead.innerHTML = '';
    tBody.innerHTML = '';
    
    if (dataToExport.length === 0) return;
    
    const keys = Object.keys(dataToExport[0]);
    keys.forEach(k => {
        const th = document.createElement('th');
        th.textContent = k;
        th.style.padding = "0.75rem 1rem";
        th.style.borderBottom = "1px solid var(--border-color)";
        tHead.appendChild(th);
    });
    
    dataToExport.forEach(row => {
        const tr = document.createElement('tr');
        keys.forEach(k => {
            const td = document.createElement('td');
            td.textContent = row[k] || '-';
            td.style.padding = "0.75rem 1rem";
            td.style.borderBottom = "1px solid var(--border-color)";
            tr.appendChild(td);
        });
        tBody.appendChild(tr);
    });
    
    if (statsTableContainer) statsTableContainer.style.display = 'block';
}

// --- Schema Interactive Logic ---
const modalSchema = document.getElementById('modal-schema');
const btnOpenSchema = document.getElementById('btn-open-schema');
const btnCloseSchema = document.getElementById('btn-close-schema');
const popover = document.getElementById('schema-popover');
const popoverInput = document.getElementById('schema-popover-input');
const btnSchemaSave = document.getElementById('btn-schema-save');
let currentPinMeasure = null;
let currentPinElement = null;

if(btnOpenSchema) {
    btnOpenSchema.addEventListener('click', () => {
        if(modalSchema) modalSchema.classList.remove('hidden');
        if(popover) popover.classList.add('hidden');
        updatePinsStatus();
        updateSchemaCounter();
    });
}

function countFilledMeasures() {
    let count = 0;
    for(let i=1; i<=11; i++) {
        const val = document.getElementById('misura' + i)?.value;
        if(val && val.trim() !== '') count++;
    }
    return count;
}

function updateSchemaCounter() {
    const counterEl = document.getElementById('schema-counter');
    if (counterEl) {
        const c = countFilledMeasures();
        counterEl.textContent = `Misure: ${c}/11`;
        if (c === 11) {
            counterEl.style.backgroundColor = 'var(--p-green)';
            counterEl.style.color = 'white';
        } else {
            counterEl.style.backgroundColor = 'var(--p-green-light)';
            counterEl.style.color = 'var(--p-green-hover)';
        }
    }
}

if(btnCloseSchema) {
    btnCloseSchema.addEventListener('click', () => {
        const count = countFilledMeasures();
        if(count < 11) {
            if(!confirm(`Hai inserito solo ${count} di 11 misure.\nSei sicuro di voler chiudere lo schema?`)) {
                return;
            }
        }
        if(modalSchema) modalSchema.classList.add('hidden');
    });
}

// Chiudi cliccando fuori dall'immagine o header
if(modalSchema) {
    modalSchema.addEventListener('click', (e) => {
        if(e.target === modalSchema) {
            modalSchema.classList.add('hidden');
        }
    });
}

function updatePinsStatus() {
    document.querySelectorAll('.schema-pin').forEach(pin => {
        const measureId = pin.getAttribute('data-measure');
        const inputEl = document.getElementById(measureId);
        
        let label = pin.querySelector('.pin-value-label');
        if (label) label.remove();

        if(inputEl && inputEl.value && inputEl.value.trim() !== '') {
            pin.classList.add('filled');
            
            label = document.createElement('div');
            label.className = 'pin-value-label';
            if (measureId === 'misura7') {
                label.classList.add('label-right');
            }
            label.textContent = inputEl.value;
            pin.appendChild(label);
        } else {
            pin.classList.remove('filled');
        }
    });
}

document.querySelectorAll('.schema-pin').forEach(pin => {
    pin.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing if click bubbles
        const measureId = pin.getAttribute('data-measure');
        currentPinMeasure = measureId;
        currentPinElement = pin;
        
        // Hide red label temporarily while editing
        const existingLabel = pin.querySelector('.pin-value-label');
        if (existingLabel) existingLabel.style.display = 'none';
        
        const mainInput = document.getElementById(measureId);
        if(popoverInput) popoverInput.value = mainInput ? mainInput.value : '';

        if(popover) {
            popover.style.left = pin.style.left;
            popover.style.top = pin.style.top;
            popover.classList.remove('hidden');
            setTimeout(() => { if(popoverInput) popoverInput.focus(); }, 50);
        }
    });
});

function savePopover() {
    if(currentPinMeasure && currentPinElement) {
        const mainInput = document.getElementById(currentPinMeasure);
        if(mainInput && popoverInput) {
            if(mainInput.value !== popoverInput.value) isFormDirty = true;
            mainInput.value = popoverInput.value;
        }
        if(popover) popover.classList.add('hidden');
        updatePinsStatus();
        updateSchemaCounter();
    }
}

if(btnSchemaSave) {
    btnSchemaSave.addEventListener('click', savePopover);
}

if(popoverInput) {
    popoverInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') {
            e.preventDefault();
            savePopover();
        }
    });
}

// Chiudi popover se si clicca altrove nell'immagine
const schemaContainer = document.getElementById('schema-container');
if(schemaContainer) {
    schemaContainer.addEventListener('click', (e) => {
        if(popover && !popover.classList.contains('hidden') && !e.target.closest('.schema-pin') && !e.target.closest('#schema-popover')) {
            popover.classList.add('hidden');
        }
    });
}

// --- Export Functions ---
function exportToExcel() {
    if(schede.length === 0) {
        alert("Nessun dato da esportare.");
        return;
    }
    
    // Mappa per tradurre chiavi in intestazioni belle
    const dataToExport = schede.map(s => ({
        "N. Progressivo": s.progressivo,
        "Data": s.data,
        "Paziente": s.paziente,
        "Tecnico": s.tecnico,
        "Altezza (cm)": s.altezza,
        "Peso (kg)": s.peso,
        "1-Prof. seduta": s.misura1,
        "2-Prof. torace": s.misura2,
        "3-Seduta-cavo": s.misura3,
        "4-Alt. spalle": s.misura4,
        "5-Spalle-capo": s.misura5,
        "6-Seduta-brac.": s.misura6,
        "7-Tallone-cavo": s.misura7,
        "8-Polso-gomito": s.misura8,
        "9-Largh. spalle": s.misura9,
        "10-Largh. torace": s.misura10,
        "11-Largh. bacino": s.misura11,
        "Personalizzazioni": s.personalizzazioni,
        "Richieste": s.richieste,
        "Note": s.note
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ausili");
    
    // Genera nome file
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Archivio_Ausili_${dateStr}.xlsx`;
    
    // Scrittura in buffer array
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Crea Blob e simula un click per il download (Fix per iOS/Mobile)
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

function exportToPdf() {
    if(schede.length === 0) {
        alert("Nessun dato da esportare.");
        return;
    }
    
    const tableBody = [
        [
            {text: 'Prog.', style: 'tableHeader'},
            {text: 'Data', style: 'tableHeader'},
            {text: 'Paziente', style: 'tableHeader'},
            {text: 'Tecnico', style: 'tableHeader'},
            {text: 'Alt (cm)', style: 'tableHeader'},
            {text: 'Peso (Kg)', style: 'tableHeader'},
            {text: 'Pers.', style: 'tableHeader'},
            {text: 'Richieste', style: 'tableHeader'}
        ]
    ];
    
    schede.forEach(s => {
        tableBody.push([
            s.progressivo?.toString() || '',
            s.data || '',
            s.paziente || '',
            s.tecnico || '',
            s.altezza?.toString() || '',
            s.peso?.toString() || '',
            s.personalizzazioni ? 'Sì' : 'No',
            s.richieste ? 'Sì' : 'No'
        ]);
    });

    const docDefinition = {
        pageOrientation: 'landscape',
        content: [
            { text: 'Archivio Valutazione Ausili', style: 'header' },
            {
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    body: tableBody
                }
            }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10]
            },
            tableHeader: {
                bold: true,
                fontSize: 11,
                color: 'black',
                fillColor: '#f3f4f6'
            }
        },
        defaultStyle: {
            fontSize: 9
        }
    };

    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Archivio_Ausili_${dateStr}.pdf`;

    const pdfGenerator = pdfMake.createPdf(docDefinition);
    
    // Specifica il download tramite Blob per compatibilità Mobile iOS/Safari
    pdfGenerator.getBlob((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    });
}

// --- Single PDF Export & Share ---
let base64LogoCache = null;

async function getBase64Logo() {
    if (base64LogoCache !== null) return base64LogoCache;
    try {
        const response = await fetch('logo.png');
        if (!response.ok) throw new Error('not found');
        const blob = await response.blob();
        base64LogoCache = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
        return base64LogoCache;
    } catch (e) {
        base64LogoCache = false;
        return false;
    }
}

async function getAnnotatedSchemaBase64(scheda) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, img.width, img.height);
            
            const pins = [
                {id: 'misura1', x: 0.48, y: 0.43},
                {id: 'misura2', x: 0.66, y: 0.22},
                {id: 'misura3', x: 0.20, y: 0.30},
                {id: 'misura4', x: 0.08, y: 0.30},
                {id: 'misura5', x: 0.08, y: 0.125},
                {id: 'misura6', x: 0.91, y: 0.31},
                {id: 'misura7', x: 0.61, y: 0.98},
                {id: 'misura8', x: 0.56, y: 0.045},
                {id: 'misura9', x: 0.185, y: 0.69},
                {id: 'misura10', x: 0.58, y: 0.72},
                {id: 'misura11', x: 0.19, y: 0.82}
            ];

            // Setup per i font
            ctx.font = 'bold 24px Arial';
            
            pins.forEach(pin => {
                const val = scheda[pin.id];
                if (val && val.toString().trim() !== '') {
                    const text = val.toString();
                    
                    let px = img.width * pin.x;
                    let py = img.height * pin.y;
                    
                    if (pin.id === 'misura7') {
                        px += 30; // Destra
                        py -= 5;
                    } else {
                        py += 40; // Sotto
                    }

                    const metrics = ctx.measureText(text);
                    const w = metrics.width + 16;
                    const h = 32;
                    
                    let rectX = pin.id === 'misura7' ? px : px - w/2;
                    let rectY = py - h/2;
                    
                    // Box rosso
                    ctx.fillStyle = 'red';
                    ctx.fillRect(rectX, rectY, w, h);
                    
                    // Bordo bianco
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'white';
                    ctx.strokeRect(rectX, rectY, w, h);
                    
                    // Testo blu
                    ctx.fillStyle = 'blue';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(text, rectX + w/2, rectY + h/2 + 2);
                }
            });
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
        img.src = 'schema_misure.png';
    });
}

window.generateSinglePdf = async function(id) {
    const scheda = schede.find(s => s.id === id);
    if (!scheda) return;

    // Get logo and drawn image
    const [logoBase64, imageBase64] = await Promise.all([
        getBase64Logo(),
        getAnnotatedSchemaBase64(scheda)
    ]);
    
    // Helper per le righe delle misure così son tutte uguali
    const makeMeasureRow = (label, valueId, unit) => {
        return [
            {text: label, fontSize: 9, margin: [0, 5, 0, 5]}, 
            {text: scheda[valueId] || '         ', alignment: 'center', decoration: 'underline', fontSize: 11, margin: [0, 4, 0, 4]}, 
            {text: unit, fontSize: 9, margin: [0, 5, 0, 5]}
        ];
    };

    const docDefinition = {
        pageOrientation: 'landscape',
        pageMargins: [30, 15, 30, 15],
        pageSize: 'A4',
        content: [
            // Header
            {
                columns: [
                    {
                        width: 170,
                        text: [
                            { text: 'Data: ', bold: true, fontSize: 10 }, {text: (formatDate(scheda.data) !== '-' ? formatDate(scheda.data) : '') + '\n', fontSize: 10, decoration: 'underline'},
                            { text: '\nTecnico: ', bold: true, fontSize: 10 }, {text: scheda.tecnico || '', fontSize: 10, decoration: 'underline'}
                        ],
                        margin: [0, 10, 0, 0]
                    },
                    {
                        width: '*',
                        text: 'Scheda Valutazione Ausili',
                        style: 'documentTitle',
                        alignment: 'center',
                        margin: [0, 8, 0, 0]
                    },
                    {
                        width: 170,
                        ...(logoBase64 ? { image: logoBase64, width: 120, alignment: 'right' } : { text: 'OrtoTek', style: 'logo', alignment: 'right', color: '#3b82f6', margin: [0, 5, 0, 0] })
                    }
                ]
            },
            { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 780, y2: 5, lineWidth: 1.5 }], margin: [0, 0, 0, 10] },
            // Main body
            {
                columns: [
                    // LEFT: Measures
                    {
                        width: 170,
                        layout: 'noBorders',
                        table: {
                            widths: [110, 30, 15],
                            body: [
                                makeMeasureRow('Altezza', 'altezza', 'cm'),
                                makeMeasureRow('Peso', 'peso', 'kg'),
                                [{text: '\n', colSpan: 3, margin: [0, 3, 0, 3]}, '', ''],
                                makeMeasureRow('1 - Profondità seduta', 'misura1', 'cm'),
                                makeMeasureRow('2 - Profondità torace', 'misura2', 'cm'),
                                makeMeasureRow('3 - Seduta-cavo ascellare', 'misura3', 'cm'),
                                makeMeasureRow('4 - Altezza spalle', 'misura4', 'cm'),
                                makeMeasureRow('5 - Spalle-capo', 'misura5', 'cm'),
                                makeMeasureRow('6 - Seduta-bracciolo', 'misura6', 'cm'),
                                makeMeasureRow('7 - Tallone-cavo popliteo', 'misura7', 'cm'),
                                makeMeasureRow('8 - Polso-gomito', 'misura8', 'cm'),
                                makeMeasureRow('9 - Larghezza spalle', 'misura9', 'cm'),
                                makeMeasureRow('10 - Larghezza torace', 'misura10', 'cm'),
                                makeMeasureRow('11 - Larghezza bacino', 'misura11', 'cm')
                            ]
                        }
                    },
                    // CENTER: Image
                    {
                        width: 250,
                        ...(imageBase64 ? { image: imageBase64, width: 200, alignment: 'center', margin: [10, -5, 5, 0] } : { text: 'Immagine Schema Non Trovata', alignment: 'center' })
                    },
                    // RIGHT: Text boxes
                    {
                        width: '*',
                        table: {
                            widths: ['50%', '50%'],
                            heights: [280],
                            body: [
                                [
                                    { text: [{text: 'Personalizzazioni:\n\n', bold: true, fontSize: 9}, {text: scheda.personalizzazioni || '', fontSize: 9}] },
                                    { text: [{text: 'Richieste:\n\n', bold: true, fontSize: 9}, {text: scheda.richieste || '', fontSize: 9}] }
                                ]
                            ]
                        },
                        layout: {
                            hLineWidth: function (i, node) { return 1.5; },
                            vLineWidth: function (i, node) { return 1.5; },
                            hLineColor: function (i, node) { return 'black'; },
                            vLineColor: function (i, node) { return 'black'; },
                        }
                    }
                ]
            },
            { text: '\n', fontSize: 4 },
            // BOTTOM: Annotazioni
            {
                table: {
                    widths: ['*'],
                    heights: [35],
                    body: [
                        [
                            { text: [{text: 'Annotazioni:\n\n', bold: true, fontSize: 9}, {text: scheda.note || '', fontSize: 9}] }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: function (i, node) { return 1.5; },
                    vLineWidth: function (i, node) { return 1.5; },
                    hLineColor: function (i, node) { return 'black'; },
                    vLineColor: function (i, node) { return 'black'; },
                }
            }
        ],
        styles: {
            documentTitle: {
                fontSize: 18,
                bold: true
            },
            logo: {
                fontSize: 20,
                bold: true
            }
        }
    };

    const fileName = `Scheda_Ausili_${(scheda.paziente||'').replace(/\s+/g, '_')}_${scheda.progressivo}.pdf`;
    const pdfGenerator = pdfMake.createPdf(docDefinition);

    pdfGenerator.getBlob(async (blob) => {
        const file = new File([blob], fileName, { type: 'application/pdf' });
        
        // 1. Prova prima con la Web Share API nativa (per iOS/Android: WhatsApp, Mail, Salva File)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: `Scheda ${scheda.paziente || ''}`,
                    text: 'In allegato la scheda di valutazione ausili.'
                });
                console.log('Condivisione nativa completata con successo');
                return; // Fermati qua se l'utente ha utilizzato con successo il menu nativo
            } catch (err) {
                console.log('Condivisione annullata dal menu nativo o fallita:', err);
                // Non blocchiamo, andiamo al fallback
            }
        }
        
        // 2. Fallback universale: classico download/salvataggio forzato del browser se il nativo non è supportato/fallisce
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 1000);
    });
}

// --- Rendering ---
function formatDate(dateString) {
    if(!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function renderCards(filterText = '') {
    grid.innerHTML = '';
    
    const term = filterText.toLowerCase();
    const filtered = schede.filter(s => 
        (s.paziente && s.paziente.toLowerCase().includes(term)) || 
        (s.tecnico && s.tecnico.toLowerCase().includes(term)) ||
        (s.progressivo && s.progressivo.toString().includes(term))
    );

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="ph-fill ph-folder-dashed"></i>
                <h3>Nessuna scheda trovata</h3>
                <p>Nessun risultato corrisponde alla tua ricerca o l'archivio è vuoto.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(scheda => {
        const card = document.createElement('div');
        card.className = `card`;
        card.style.borderTop = "4px solid var(--p-orange)";
        
        let details = [];
        if(scheda.altezza) details.push(`Altezza: ${scheda.altezza} cm`);
        if(scheda.peso) details.push(`Peso: ${scheda.peso} kg`);

        const detailsStr = details.length > 0 ? details.join(' | ') : 'Nessun parametro aggiuntivo';
        
        card.innerHTML = `
            <div class="card-header">
                <div style="cursor: pointer;" onclick="window.viewModal('${scheda.id}')">
                    <h3 class="card-title">${scheda.paziente}</h3>
                    <div class="card-subtitle">
                        <span style="color: var(--p-green); font-weight: 600; margin-right: 8px;">#${scheda.progressivo}</span>
                        <i class="ph ph-calendar-blank"></i> ${formatDate(scheda.data)}
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-icon action-pdf" onclick="event.stopPropagation(); window.generateSinglePdf('${scheda.id}')" title="Condividi / Scarica PDF"><i class="ph ph-file-pdf" style="color: #ef4444;"></i></button>
                    <button class="btn-icon action-view" onclick="event.stopPropagation(); window.viewModal('${scheda.id}')" title="Visualizza"><i class="ph ph-eye"></i></button>
                    <button class="btn-icon action-edit" onclick="event.stopPropagation(); window.editModal('${scheda.id}')" title="Modifica"><i class="ph ph-pencil-simple"></i></button>
                    <button class="btn-icon action-delete" onclick="event.stopPropagation(); window.deleteCard('${scheda.id}')" title="Elimina"><i class="ph ph-trash"></i></button>
                </div>
            </div>
            
            <div class="card-body">
                <div class="data-row">
                    <span class="data-label">Tecnico</span>
                    <span class="data-value" style="color: var(--p-orange);">${scheda.tecnico || '-'}</span>
                </div>
            </div>
            
            <div class="card-footer" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                <div style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4;">
                    ${detailsStr}
                </div>
                ${scheda.personalizzazioni ? `<div style="font-size: 0.8rem; color: var(--text-main);"><strong>Personalizzazioni:</strong> ${scheda.personalizzazioni.substring(0, 50)}${scheda.personalizzazioni.length > 50 ? '...' : ''}</div>` : ''}
                ${scheda.note ? `<div style="font-size: 0.8rem; background: var(--bg-light); padding: 0.5rem; border-radius: 4px; width: 100%;"><strong>Note:</strong> ${scheda.note}</div>` : ''}
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Start application
init();
