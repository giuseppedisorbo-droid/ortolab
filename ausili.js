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
    btnCloseModal.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);
    
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
    
    inputs.forEach(input => input.disabled = readOnly);
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
                    <button class="btn-icon action-view" onclick="window.viewModal('${scheda.id}')" title="Visualizza"><i class="ph ph-eye"></i></button>
                    <button class="btn-icon action-edit" onclick="window.editModal('${scheda.id}')" title="Modifica"><i class="ph ph-pencil-simple"></i></button>
                    <button class="btn-icon action-delete" onclick="window.deleteCard('${scheda.id}')" title="Elimina"><i class="ph ph-trash"></i></button>
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
