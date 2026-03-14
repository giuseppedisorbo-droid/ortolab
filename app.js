// --- State Management ---
let schede = [];

// --- DOM Elements ---
const grid = document.getElementById('cards-grid');
const searchInput = document.getElementById('search-input');
const btnNewCard = document.getElementById('btn-new-card');
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
const inputPellami = document.getElementById('pellami');
const inputInteriMezzo = document.getElementById('interi-mezzo');
const inputScarico = document.getElementById('scarico');
const inputSostegnoMet = document.getElementById('sostegno-met');
const inputSostegnoVolte = document.getElementById('sostegno-volte');
const inputPianoInc = document.getElementById('piano-inc');
const inputNote = document.getElementById('note');

// --- Initialization ---
function init() {
    loadData();
    setupEventListeners();
    renderCards();
}

function loadData() {
    const saved = localStorage.getItem('ortos_plantari_v2');
    if (saved) {
        schede = JSON.parse(saved);
    } else {
        // Dati importati dal file Plantari.gsheet originale
        schede = [
            { id: generateId(), progressivo: 2, data: '2026-03-05', paziente: 'RENZI (CASEF)', misura: '42', codice: 'COR 1366X2', rivestimento: 'SI', pellami: 'SI', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 3, data: '2026-03-05', paziente: 'DELL AQUILA', misura: '42', codice: 'COR-1366X2', rivestimento: 'SI', pellami: 'SI', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 4, data: '2026-02-27', paziente: 'SCIELZO FRA...', misura: '37', codice: 'POD-PL515B', rivestimento: 'SI', pellami: 'SI', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 5, data: '2026-03-05', paziente: 'CALABRESE S', misura: '38', codice: 'COR-1366X', rivestimento: 'SI', pellami: 'SI', interiMezzo: '', scarico: '9L', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 6, data: '2026-03-05', paziente: 'SANTANGELO ROSALIA', misura: '', codice: 'LEVI-LASTRA NERA', rivestimento: 'SI', pellami: 'SI', interiMezzo: '', scarico: '9L', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 7, data: '2026-03-05', paziente: 'CERBO RAFFA', misura: '43', codice: 'PED-B550VHE', rivestimento: '', pellami: '', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 8, data: '2026-03-05', paziente: 'SPOSATO GIO', misura: '39', codice: 'POD-515B', rivestimento: 'SI', pellami: 'SI', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 9, data: '2026-02-27', paziente: 'APICE MICHEL', misura: '37', codice: 'COR-1366X2', rivestimento: 'SI', pellami: 'NO', interiMezzo: '', scarico: '9L', sostegnoMet: '54L', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 10, data: '2026-02-27', paziente: 'LAUDADIO RU', misura: '37', codice: 'COR-1366X2', rivestimento: 'SI', pellami: 'SI', interiMezzo: '37L', scarico: '9L', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 11, data: '2026-03-05', paziente: 'Salvati Dario', misura: '43', codice: '1366x corazza', rivestimento: 'SI', pellami: 'NO', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '60L', pianoInc: '', note: 'Più materiale p' },
            { id: generateId(), progressivo: 12, data: '2026-03-06', paziente: 'Zippo angela (', misura: '39', codice: 'Baurefiend', rivestimento: 'NO', pellami: 'SI', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 13, data: '2026-03-06', paziente: 'Perugino Paola', misura: '38', codice: 'Pl515b', rivestimento: 'SI', pellami: 'SI', interiMezzo: '', scarico: '9L', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 14, data: '2026-03-06', paziente: 'Sacco domenic', misura: '41', codice: 'Black 25 leviso', rivestimento: 'SI', pellami: 'NO', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: 'Cad cam' },
            { id: generateId(), progressivo: 15, data: '2026-03-06', paziente: 'Galardo', misura: '38', codice: 'Cad cam lastra', rivestimento: 'SI', pellami: '', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 16, data: '2026-03-06', paziente: 'Cocca Maria', misura: '38', codice: 'Pl850', rivestimento: '', pellami: '', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 17, data: '2026-03-06', paziente: 'Luigi audio pro', misura: '41', codice: 'Cor 13366 x', rivestimento: 'NO', pellami: 'SI', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 18, data: '2026-03-06', paziente: 'Lavoretano Cas', misura: '35', codice: 'Corazza memory', rivestimento: 'SI', pellami: 'SI', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 19, data: '2026-03-06', paziente: 'D angelo', misura: '43', codice: 'Pedsan', rivestimento: '', pellami: '', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 20, data: '2026-03-06', paziente: 'Longo', misura: '41', codice: 'Corazza memory', rivestimento: '', pellami: '', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 21, data: '2026-03-10', paziente: 'Ianniciello Roc', misura: '44', codice: 'Black 25 leviso', rivestimento: 'SI', pellami: '', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 22, data: '2026-03-10', paziente: 'Greco anna', misura: '41', codice: 'Corazza bidensita', rivestimento: '', pellami: '', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 23, data: '2026-03-10', paziente: 'Del giudice', misura: '43', codice: 'Scocca 13366x', rivestimento: 'SI', pellami: 'NO', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 24, data: '2026-03-10', paziente: 'De vivo', misura: '36', codice: 'Corazza SBLRF', rivestimento: 'NO', pellami: 'NO', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 25, data: '2026-03-10', paziente: 'Lettera', misura: '39', codice: 'Cor 1366x', rivestimento: 'NO', pellami: 'SI', interiMezzo: '', scarico: '9L', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 26, data: '2026-03-12', paziente: 'Pisciotta france', misura: '44', codice: 'Corazza lastra nera', rivestimento: '', pellami: '', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 27, data: '2026-03-13', paziente: 'Pendolino', misura: '44', codice: 'Corazza 16633', rivestimento: 'SI', pellami: 'SI', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 28, data: '2026-03-13', paziente: 'Ferraro Antoni', misura: '41', codice: 'Cor 1366x', rivestimento: 'SI', pellami: '', interiMezzo: '', scarico: '3L', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' },
            { id: generateId(), progressivo: 29, data: '2026-03-13', paziente: 'Landi Alfonso', misura: '41', codice: 'Levisole deserto', rivestimento: '', pellami: '', interiMezzo: '', scarico: '', sostegnoMet: '', sostegnoVolte: '', pianoInc: '', note: '' }
        ];
        // Sort by progressivo desc just as default view
        schede.sort((a,b) => b.progressivo - a.progressivo);
        saveData();
    }
}

function saveData() {
    localStorage.setItem('ortos_plantari_v2', JSON.stringify(schede));
}

function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

// --- Event Listeners ---
function setupEventListeners() {
    btnNewCard.addEventListener('click', () => openModal());
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
            inputMisura.value = scheda.misura || '';
            inputSchiuma.value = scheda.schiuma || '';
            inputCodice.value = scheda.codice || '';
            
            inputRivestimento.value = scheda.rivestimento || '';
            inputPellami.value = scheda.pellami || '';
            inputInteriMezzo.value = scheda.interiMezzo || '';
            inputScarico.value = scheda.scarico || '';
            inputSostegnoMet.value = scheda.sostegnoMet || '';
            inputSostegnoVolte.value = scheda.sostegnoVolte || '';
            inputPianoInc.value = scheda.pianoInc || '';
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
        pellami: inputPellami.value,
        interiMezzo: inputInteriMezzo.value,
        scarico: inputScarico.value,
        sostegnoMet: inputSostegnoMet.value,
        sostegnoVolte: inputSostegnoVolte.value,
        pianoInc: inputPianoInc.value,
        note: inputNote.value
    };

    if (id) {
        const index = schede.findIndex(s => s.id === id);
        if(index !== -1) schede[index] = nuovaScheda;
    } else {
        schede.unshift(nuovaScheda); // Add to top
    }
    
    // Sort by progressivo desc
    schede.sort((a,b) => b.progressivo - a.progressivo);

    saveData();
    closeModal();
    renderCards(searchInput.value);
}

// Expose delete to global scope for inline onclick handler
window.deleteCard = function(id) {
    if(confirm("Sei sicuro di voler eliminare questa scheda? L'operazione non è reversibile.")) {
        schede = schede.filter(s => s.id !== id);
        saveData();
        renderCards(searchInput.value);
    }
}

window.openModal = openModal;
window.viewModal = function(id) { openModal(id, true); };
window.editModal = function(id) { openModal(id, false); };

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
        if(scheda.rivestimento) details.push(`Rivestimento: ${scheda.rivestimento}`);
        if(scheda.pellami) details.push(`Pellami: ${scheda.pellami}`);
        if(scheda.scarico) details.push(`Scarico: ${scheda.scarico}`);
        if(scheda.sostegnoMet) details.push(`Sost.Met.: ${scheda.sostegnoMet}`);
        if(scheda.sostegnoVolte) details.push(`Sost.Volte: ${scheda.sostegnoVolte}`);
        if(scheda.interiMezzo) details.push(`Int/Mezzo: ${scheda.interiMezzo}`);

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
