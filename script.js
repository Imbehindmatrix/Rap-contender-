// ==========================================
// ÉLÉMENTS DU DOM
// ==========================================
const screenHome = document.getElementById('screen-home');
const screenGame = document.getElementById('screen-game');
const modalRules = document.getElementById('modal-rules');

const btnJouer = document.getElementById('btn-jouer');
const btnConfirmRules = document.getElementById('btn-confirm-rules');
const btnSend = document.getElementById('btn-send');
const punchlineInput = document.getElementById('punchline-input');
const lyricsDisplay = document.getElementById('lyrics-display');
const timerFill = document.getElementById('timer-fill');

// ==========================================
// ÉTAT DU JEU (State)
// ==========================================
let punchlines = [
    "T'es la lune, tu brilles que grâce à ma lumière",
    "Sans moi t'es dans l'ombre, une caillasse dans l'univers"
]; // Historique des punchlines
let timeLeft = 30;
let timerInterval;

// ==========================================
// NAVIGATION & AFFICHAGE
// ==========================================

// 1. Clic sur "Jouer" -> Ouvre la modale des règles
btnJouer.addEventListener('click', () => {
    modalRules.classList.remove('hidden');
});

// 2. Clic sur "Confirmer" -> Lance le jeu
btnConfirmRules.addEventListener('click', () => {
    modalRules.classList.add('hidden');
    screenHome.classList.remove('active');
    screenGame.classList.add('active');
    
    initGame();
});

// ==========================================
// LOGIQUE DU JEU
// ==========================================

function initGame() {
    renderLyrics();
    startTimer();
    punchlineInput.focus();
}

// Gère l'envoi d'une punchline
btnSend.addEventListener('click', submitPunchline);
punchlineInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitPunchline();
});

function submitPunchline() {
    const text = punchlineInput.value.trim();
    if (text === '') return;

    // Ajoute la punchline à l'historique
    punchlines.push(text);
    punchlineInput.value = '';
    
    // Met à jour l'affichage
    renderLyrics();
    
    // Réinitialise le timer pour le prochain tour (simulation)
    resetTimer();
}

// Fonction magique pour l'effet "Amazon Music"
function renderLyrics() {
    lyricsDisplay.innerHTML = ''; // On vide le conteneur

    punchlines.forEach((line, index) => {
        const div = document.createElement('div');
        div.textContent = line;
        div.classList.add('lyric-line');

        // Si c'est la toute dernière punchline envoyée, elle est "active"
        if (index === punchlines.length - 1) {
            div.classList.add('active');
        }

        lyricsDisplay.appendChild(div);
    });

    // Auto-scroll vers le bas pour toujours voir la dernière punchline
    lyricsDisplay.scrollTop = lyricsDisplay.scrollHeight;
}

// ==========================================
// GESTION DU TIMER
// ==========================================

function startTimer() {
    timeLeft = 30;
    timerFill.style.width = '100%';
    
    timerInterval = setInterval(() => {
        timeLeft--;
        const percentage = (timeLeft / 30) * 100;
        timerFill.style.width = `${percentage}%`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            // Ici on gèrerait le passage au joueur suivant si le temps est écoulé
            console.log("Temps écoulé ! Tour du joueur suivant.");
            resetTimer();
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    startTimer();
}