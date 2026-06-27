/* =========================================================
   1. ÉLÉMENTS DU DOM & ÉTAT GLOBAL (STATE)
   ========================================================= */

// Vues SPA
const views = {
    home: document.getElementById('view-home'),
    rooms: document.getElementById('view-rooms'),
    lobby: document.getElementById('view-lobby'),
    game: document.getElementById('view-game')
};

// État global de l'application (Simulé localement pour le prototype)
const gameState = {
    pseudo: "Anonyme",
    role: "spectator", // 'rapper' ou 'spectator'
    isHost: false,
    mode: "clash",
    timerSetting: 30,
    currentTheme: "En attente...",
    scoreR1: 50,
    scoreR2: 50,
    punchlines: [], // Historique des paroles
    forbiddenWords: ["wesh", "frère", "pute"] // Exemple de contraintes
};

/* =========================================================
   2. NAVIGATION (SINGLE PAGE APPLICATION)
   ========================================================= */

function switchView(viewName) {
    // Cache toutes les vues
    Object.values(views).forEach(view => view.classList.add('hidden'));
    // Affiche la vue demandée
    views[viewName].classList.remove('hidden');
}

// Boutons d'accueil
document.getElementById('btn-quick-play').addEventListener('click', () => {
    gameState.pseudo = document.getElementById('player-pseudo').value || "Anonyme";
    switchView('lobby');
});

document.getElementById('btn-browse-rooms').addEventListener('click', () => {
    switchView('rooms');
});

document.getElementById('btn-back-home').addEventListener('click', () => {
    switchView('home');
});

document.getElementById('btn-create-room').addEventListener('click', () => {
    gameState.pseudo = document.getElementById('player-pseudo').value || "Host";
    gameState.isHost = true;
    gameState.role = "rapper"; // Le host est souvent le premier rappeur
    setupLobbyAsHost();
    switchView('lobby');
});

/* =========================================================
   3. LOGIQUE DU LOBBY (CONFIGURATION & RÔLES)
   ========================================================= */

const timerInput = document.getElementById('game-timer');
const timerDisplay = document.getElementById('timer-display');
const btnGenerateTheme = document.getElementById('btn-generate-theme');
const themeDisplay = document.getElementById('lobby-theme-display');
const btnStartGame = document.getElementById('btn-start-game');

// Met à jour l'affichage du timer quand le host bouge le curseur
timerInput.addEventListener('input', (e) => {
    timerDisplay.textContent = e.target.value;
    gameState.timerSetting = parseInt(e.target.value);
});

function setupLobbyAsHost() {
    // Active les options uniquement pour le Host
    timerInput.disabled = false;
    document.getElementById('game-mode').disabled = false;
    document.getElementById('game-rounds').disabled = false;
    btnGenerateTheme.style.display = 'block';
    btnStartGame.disabled = false; // Normalement, on attend 2 rappeurs pour activer
}

// Simulation d'une IA générant un thème
btnGenerateTheme.addEventListener('click', () => {
    const themes = [
        "Mbappé devant la devanture de Hermès",
        "La vie d'une abeille dépressive",
        "Le Soleil VS La Lune",
        "Un braquage qui tourne mal au supermarché",
        "L'Amour à l'ère des réseaux sociaux"
    ];
    // Simule un appel API avec un petit délai
    themeDisplay.textContent = "Génération en cours 🤖...";
    setTimeout(() => {
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        gameState.currentTheme = randomTheme;
        themeDisplay.textContent = `Thème : ${randomTheme}`;
    }, 800);
});

// Lancement de la partie
btnStartGame.addEventListener('click', () => {
    initGame();
    switchView('game');
});

// Simulation : Rejoindre un rôle
document.querySelectorAll('.btn-join-role').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const role = e.target.getAttribute('data-role');
        gameState.role = role;
        alert(`Tu es maintenant : ${role === 'rapper' ? 'Rappeur 🎤' : 'Spectateur 👀'}`);
    });
});

/* =========================================================
   4. LOGIQUE DE JEU (L'ARÈNE)
   ========================================================= */

let liveTimerInterval;

function initGame() {
    // 1. Mise en place de l'interface selon le rôle
    document.getElementById('current-theme').textContent = `Thème : ${gameState.currentTheme}`;
    
    if (gameState.role === 'rapper') {
        document.getElementById('interface-rapper').classList.remove('hidden');
        document.getElementById('interface-spectator').classList.add('hidden');
    } else {
        document.getElementById('interface-rapper').classList.add('hidden');
        document.getElementById('interface-spectator').classList.remove('hidden');
    }

    // 2. Initialisation des scores et du tableau
    updateScoreBar();
    renderLyrics();
    startTurnTimer();
}

// --- GESTION DU CHRONO ---
function startTurnTimer() {
    clearInterval(liveTimerInterval);
    let timeLeft = gameState.timerSetting;
    const timerUI = document.getElementById('live-timer');
    timerUI.textContent = timeLeft;

    liveTimerInterval = setInterval(() => {
        timeLeft--;
        timerUI.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(liveTimerInterval);
            // Logique de fin de tour à implémenter (passer au joueur suivant)
            console.log("Tour terminé !");
        }
    }, 1000);
}

// --- SYSTÈME DE VOTES (Tir à la corde) ---
document.getElementById('btn-vote-1').addEventListener('click', () => handleVote(1));
document.getElementById('btn-vote-2').addEventListener('click', () => handleVote(2));

function handleVote(rapperNum) {
    if (rapperNum === 1) gameState.scoreR1 += 10;
    if (rapperNum === 2) gameState.scoreR2 += 10;
    
    // Ajoute un message dans le chat pour dynamiser
    addChatMessage("Système", `Le public vote pour le Rappeur ${rapperNum} !`, true);
    updateScoreBar();
}

function updateScoreBar() {
    const total = gameState.scoreR1 + gameState.scoreR2;
    // Si 0, on met à 50% pour centrer la barre
    const percentageR1 = total === 0 ? 50 : (gameState.scoreR1 / total) * 100;
    
    document.getElementById('score-bar-1').style.width = `${percentageR1}%`;
    document.getElementById('score-bar-2').style.width = `${100 - percentageR1}%`;
}

// --- GESTION DES PUNCHLINES & CONTRAINTES ---
const lyricsInput = document.getElementById('lyrics-input');
const btnSendLyrics = document.getElementById('btn-send-lyrics');
const warningBox = document.getElementById('constraint-warning');

btnSendLyrics.addEventListener('click', submitPunchline);
lyricsInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitPunchline();
});

function submitPunchline() {
    const text = lyricsInput.value.trim();
    if (!text) return;

    // Vérification des contraintes (Mots interdits)
    const hasForbiddenWord = gameState.forbiddenWords.some(word => text.toLowerCase().includes(word));
    
    if (hasForbiddenWord && document.getElementById('constraint-words').checked) {
        warningBox.textContent = "Mot interdit utilisé !";
        warningBox.classList.remove('hidden');
        setTimeout(() => warningBox.classList.add('hidden'), 2000);
        return; // On bloque l'envoi
    }

    // Si tout est bon, on ajoute la punchline
    gameState.punchlines.push({ text: text, author: gameState.pseudo });
    lyricsInput.value = '';
    renderLyrics();
    
    // Optionnel : Relance le chrono pour simuler le tour suivant
    startTurnTimer();
}

// --- AFFICHAGE AMAZON MUSIC STYLE ---
function renderLyrics() {
    const board = document.getElementById('lyrics-board');
    board.innerHTML = '';
    
    // On ne garde que les 3 ou 4 dernières pour l'esthétique
    const visibleLines = gameState.punchlines.slice(-4);

    visibleLines.forEach((lineObj, index) => {
        const div = document.createElement('div');
        div.textContent = lineObj.text;
        div.className = 'lyric-line';
        
        // La toute dernière phrase devient active (grosse et blanche)
        if (index === visibleLines.length - 1) {
            div.classList.add('active');
        }
        
        board.appendChild(div);
    });
}

// --- SYSTÈME DE CHAT ---
const chatInput = document.getElementById('chat-input');
const btnSendChat = document.getElementById('btn-send-chat');

btnSendChat.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
});

function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    addChatMessage(gameState.pseudo, text, false);
    chatInput.value = '';
}

function addChatMessage(author, text, isSystem = false) {
    const chatBox = document.getElementById('chat-box');
    const msgDiv = document.createElement('div');
    
    if (isSystem) {
        msgDiv.className = 'sys-msg';
        msgDiv.textContent = text;
    } else {
        msgDiv.style.marginBottom = "8px";
        msgDiv.innerHTML = `<strong style="color: var(--secondary)">${author}:</strong> ${text}`;
    }
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll
}
