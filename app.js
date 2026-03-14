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
const dataCollection = db.collection('plantari_records');

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
const form = document.getElementById('plantari-form');
const modalTitle = document.getElementById('modal-title');

// Form inputs
const inputId = document.getElementById('card-id');
const inputProgressivo = document.getElementById('progressivo');
const inputData = document.getElementById('data-ordine');
const inputPaziente = document.getElementById('paziente');
const inputMisura = document.getElementById('misura');
const inputSchiuma = document.getElementById('schiuma');
const inputCodice = document.getElementById('codice');
const inputRivestimento = document.getElementById('rivestimento');
const inputRivestimentoLato = document.getElementById('rivestimento-lato');
const inputPellami = document.getElementById('pellami');
const inputPellamiLato = document.getElementById('pellami-lato');
const inputInteriMezzo = document.getElementById('interi-mezzo');
const inputInteriMezzoLato = document.getElementById('interi-mezzo-lato');
const inputScarico = document.getElementById('scarico');
const inputScaricoLato = document.getElementById('scarico-lato');
const inputSostegnoMet = document.getElementById('sostegno-met');
const inputSostegnoMetLato = document.getElementById('sostegno-met-lato');
const inputSostegnoVolte = document.getElementById('sostegno-volte');
const inputSostegnoVolteLato = document.getElementById('sostegno-volte-lato');
const inputPianoInc = document.getElementById('piano-inc');
const inputPianoIncLato = document.getElementById('piano-inc-lato');
const inputNote = document.getElementById('note');

// --- Initialization ---
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
            const saved = localStorage.getItem('ortos_plantari_v2');
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
            if(localStorage.getItem('ortos_plantari_v2')) {
                localStorage.removeItem('ortos_plantari_v2');
                console.log("Cronologia locale rimossa: si opererà solo sul Cloud!");
            }
        }
    }, error => {
        console.error("Errore di connessione a Firebase:", error);
        alert("Errore di connessione al Cloud. Il sistema proverà a usare i dati salvati offline in precedenza.");
        
        // Offline Fallback
        const saved = localStorage.getItem('ortos_plantari_v2');
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
    btnCloseModal.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);
    
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
    
    // Close modal by clicking outside
    modal.addEventListener('click', (e) => {
        if(e.target === modal) closeModal();
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
        input.style.display = ''; // Reimposta visualizzazione
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
            inputMisura.value = scheda.misura || '';
            inputSchiuma.value = scheda.schiuma || '';
            inputCodice.value = scheda.codice || '';
            
            inputRivestimento.value = scheda.rivestimento || '';
            inputRivestimentoLato.value = scheda.rivestimentoLato || 'Cp.';
            inputPellami.value = scheda.pellami || '';
            inputPellamiLato.value = scheda.pellamiLato || 'Cp.';
            inputInteriMezzo.value = scheda.interiMezzo || '';
            inputInteriMezzoLato.value = scheda.interiMezzoLato || 'Cp.';
            inputScarico.value = scheda.scarico || '';
            inputScaricoLato.value = scheda.scaricoLato || 'Cp.';
            inputSostegnoMet.value = scheda.sostegnoMet || '';
            inputSostegnoMetLato.value = scheda.sostegnoMetLato || 'Cp.';
            inputSostegnoVolte.value = scheda.sostegnoVolte || '';
            inputSostegnoVolteLato.value = scheda.sostegnoVolteLato || 'Cp.';
            inputPianoInc.value = scheda.pianoInc || '';
            inputPianoIncLato.value = scheda.pianoIncLato || 'Cp.';
            inputNote.value = scheda.note || '';
        }
    } else {
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
            let isFilled = input.value && input.value.trim() !== '';
            
            // Hide "Cp." and others if the main choice is empty
            if (input.tagName === 'SELECT' && input.id && input.id.endsWith('-lato')) {
                const mainId = input.id.replace('-lato', '');
                const mainInput = document.getElementById(mainId);
                if (!mainInput || !mainInput.value || mainInput.value.trim() === '') {
                    isFilled = false;
                    input.style.display = 'none';
                }
            }

            if (isFilled) {
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
    modal.classList.add('hidden');
    document.body.style.overflow = '';
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
        misura: inputMisura.value,
        schiuma: inputSchiuma.value,
        codice: inputCodice.value,
        rivestimento: inputRivestimento.value,
        rivestimentoLato: inputRivestimentoLato.value,
        pellami: inputPellami.value,
        pellamiLato: inputPellamiLato.value,
        interiMezzo: inputInteriMezzo.value,
        interiMezzoLato: inputInteriMezzoLato.value,
        scarico: inputScarico.value,
        scaricoLato: inputScaricoLato.value,
        sostegnoMet: inputSostegnoMet.value,
        sostegnoMetLato: inputSostegnoMetLato.value,
        sostegnoVolte: inputSostegnoVolte.value,
        sostegnoVolteLato: inputSostegnoVolteLato.value,
        pianoInc: inputPianoInc.value,
        pianoIncLato: inputPianoIncLato.value,
        note: inputNote.value
    };

    // Firebase Save
    dataCollection.doc(nuovaScheda.id).set(nuovaScheda)
        .then(() => {
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
    const formatComp = (val, lato) => val ? `${val}${lato && lato !== 'Cp.' ? ` (${lato})` : ''}` : '';
    
    const dataToExport = schede.map(s => ({
        "Prog.": s.progressivo || '',
        "Data": s.data || '',
        "Cognome Nome": s.paziente || '',
        "Calzata": s.misura || '',
        "Schiuma": s.schiuma || '',
        "Codice Plantare": s.codice || '',
        "Rivestimento": formatComp(s.rivestimento, s.rivestimentoLato),
        "Pellami": formatComp(s.pellami, s.pellamiLato),
        "Interi/Mezzo": formatComp(s.interiMezzo, s.interiMezzoLato),
        "Scarico": formatComp(s.scarico, s.scaricoLato),
        "Sost. Met.": formatComp(s.sostegnoMet, s.sostegnoMetLato),
        "Volte": formatComp(s.sostegnoVolte, s.sostegnoVolteLato),
        "Piano Inc.": formatComp(s.pianoInc, s.pianoIncLato),
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

// --- Export Functions ---
function exportToExcel() {
    if(schede.length === 0) {
        alert("Nessun dato da esportare.");
        return;
    }
    
    const formatExport = (val, lato) => val ? `${val}${lato && lato !== 'Cp.' ? ` (${lato})` : ''}` : '';

    // Mappa per tradurre chiavi in intestazioni belle
    const dataToExport = schede.map(s => ({
        "N. Progressivo": s.progressivo,
        "Data": s.data,
        "Cognome Nome": s.paziente,
        "Numero Calzata": s.misura,
        "Schiuma": s.schiuma,
        "Codice Plantare": s.codice,
        "Rivestimento": formatExport(s.rivestimento, s.rivestimentoLato),
        "Pellami": formatExport(s.pellami, s.pellamiLato),
        "Plantari Interi/Mezzo": formatExport(s.interiMezzo, s.interiMezzoLato),
        "Scarico Calca.": formatExport(s.scarico, s.scaricoLato),
        "Sostegno Met.": formatExport(s.sostegnoMet, s.sostegnoMetLato),
        "Sostegno Volte": formatExport(s.sostegnoVolte, s.sostegnoVolteLato),
        "Piano Inclinato": formatExport(s.pianoInc, s.pianoIncLato),
        "Note": s.note
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantari");
    
    // Genera nome file
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Archivio_Plantari_${dateStr}.xlsx`;
    
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
            {text: 'Misura', style: 'tableHeader'},
            {text: 'Codice', style: 'tableHeader'},
            {text: 'Riv/Pell', style: 'tableHeader'},
            {text: 'Interi/Mezzo', style: 'tableHeader'},
            {text: 'Scarico', style: 'tableHeader'},
            {text: 'Sost. Met', style: 'tableHeader'},
            {text: 'Volte', style: 'tableHeader'}
        ]
    ];
    
    const formatExport = (val, lato) => val ? `${val}${lato && lato !== 'Cp.' ? ` (${lato})` : ''}` : '';

    schede.forEach(s => {
        tableBody.push([
            s.progressivo?.toString() || '',
            s.data || '',
            s.paziente || '',
            s.misura || '',
            s.codice || '',
            `${formatExport(s.rivestimento, s.rivestimentoLato)} / ${formatExport(s.pellami, s.pellamiLato)}`,
            formatExport(s.interiMezzo, s.interiMezzoLato),
            formatExport(s.scarico, s.scaricoLato),
            formatExport(s.sostegnoMet, s.sostegnoMetLato),
            formatExport(s.sostegnoVolte, s.sostegnoVolteLato)
        ]);
    });

    const docDefinition = {
        pageOrientation: 'landscape',
        content: [
            { text: 'Archivio Gestione Plantari', style: 'header' },
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
    const fileName = `Archivio_Plantari_${dateStr}.pdf`;

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
        s.paziente.toLowerCase().includes(term) || 
        s.codice.toLowerCase().includes(term) ||
        (s.progressivo && s.progressivo.toString().includes(term))
    );

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="ph-fill ph-folder-dashed"></i>
                <h3>Nessun plantare trovato</h3>
                <p>Nessun risultato corrisponde alla tua ricerca o l'archivio è vuoto.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(scheda => {
        const card = document.createElement('div');
        card.className = `card`;
        // Usiamo un accento di colore base (verde) se non ci sono stati
        card.style.borderTop = "4px solid var(--p-green)";
        
        let details = [];
        if(scheda.schiuma) details.push(`Schiuma: ${scheda.schiuma}`);
        
        const formatComp = (val, lato) => val ? `${val}${lato && lato !== 'Cp.' ? ` (${lato})` : ''}` : null;
        
        const riv = formatComp(scheda.rivestimento, scheda.rivestimentoLato);
        if(riv) details.push(`Rivestimento: ${riv}`);
        
        const pell = formatComp(scheda.pellami, scheda.pellamiLato);
        if(pell) details.push(`Pellami: ${pell}`);
        
        const intMez = formatComp(scheda.interiMezzo, scheda.interiMezzoLato);
        if(intMez) details.push(`Int/Mezzo: ${intMez}`);
        
        const scar = formatComp(scheda.scarico, scheda.scaricoLato);
        if(scar) details.push(`Scarico: ${scar}`);
        
        const sostM = formatComp(scheda.sostegnoMet, scheda.sostegnoMetLato);
        if(sostM) details.push(`Sost.Met.: ${sostM}`);
        
        const sostV = formatComp(scheda.sostegnoVolte, scheda.sostegnoVolteLato);
        if(sostV) details.push(`Sost.Volte: ${sostV}`);
        
        const piano = formatComp(scheda.pianoInc, scheda.pianoIncLato);
        if(piano) details.push(`Piano Inc.: ${piano}`);

        const detailsStr = details.length > 0 ? details.join(' | ') : 'Nessun parametro aggiuntivo';
        
        card.innerHTML = `
            <div class="card-header">
                <!-- Cliccando sull'intestazione si apre in sola lettura -->
                <div style="cursor: pointer;" onclick="window.viewModal('${scheda.id}')">
                    <h3 class="card-title">${scheda.paziente}</h3>
                    <div class="card-subtitle">
                        <span style="color: var(--p-orange); font-weight: 600; margin-right: 8px;">#${scheda.progressivo}</span>
                        <i class="ph ph-calendar-blank"></i> ${formatDate(scheda.data)}
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-icon action-view" onclick="window.viewModal('${scheda.id}')" title="Visualizza"><i class="ph ph-eye"></i></button>
                    <button class="btn-icon action-edit" onclick="window.editModal('${scheda.id}')" title="Modifica"><i class="ph ph-pencil-simple"></i></button>
                    <button class="btn-icon action-delete" onclick="window.deleteCard('${scheda.id}')" title="Elimina"><i class="ph ph-trash"></i></button>
                </div>
            </div>
            
            <div class="card-body">
                <div class="data-row">
                    <span class="data-label">Codice Plantare</span>
                    <span class="data-value" style="color: var(--p-green);">${scheda.codice}</span>
                </div>
                <div class="data-row">
                    <span class="data-label">Misura/Calzata</span>
                    <span class="data-value">${scheda.misura || '-'}</span>
                </div>
            </div>
            
            <div class="card-footer" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                <div style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4;">
                    ${detailsStr}
                </div>
                ${scheda.note ? `<div style="font-size: 0.8rem; background: var(--bg-light); padding: 0.5rem; border-radius: 4px; width: 100%;"><strong>Note:</strong> ${scheda.note}</div>` : ''}
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Start application
init();
