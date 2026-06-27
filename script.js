// On s'assure que tout le HTML est chargé avant de lancer le code
document.addEventListener('DOMContentLoaded', () => {
    
    console.log("Rap Contenders : Fichier JS bien connecté !");

    // =========================================================
    // 1. ÉLÉMENTS DU DOM & ÉTAT GLOBAL
    // =========================================================
    const views = {
        home: document.getElementById('view-home'),
        rooms: document.getElementById('view-rooms'),
        lobby: document.getElementById('view-lobby'),
        game: document.getElementById('view-game')
    };

    const gameState = {
        pseudo: "Anonyme",
        role: "spectator",
        isHost: false,
        mode: "clash",
        timerSetting: 30,
        currentTheme: "En attente...",
        scoreR1: 50,
        scoreR2: 50,
        punchlines: [],
        forbiddenWords: ["wesh", "frère", "pute"]
    };

    // =========================================================
    // 2. NAVIGATION (SPA)
    // =========================================================
    function switchView(viewName) {
        Object.values(views).forEach(view => {
            if(view) view.classList.add('hidden');
        });
        if(views[viewName]) views[viewName].classList.remove('hidden');
    }

    // Le "?" empêche le code de crasher si le bouton n'existe pas dans le HTML
    document.getElementById('btn-quick-play')?.addEventListener('click', () => {
        const inputPseudo = document.getElementById('player-pseudo');
        gameState.pseudo = inputPseudo && inputPseudo.value ? inputPseudo.value : "Anonyme";
        switchView('lobby');
    });

    document.getElementById('btn-browse-rooms')?.addEventListener('click', () => switchView('rooms'));
    document.getElementById('btn-back-home')?.addEventListener('click', () => switchView('home'));

    document.getElementById('btn-create-room')?.addEventListener('click', () => {
        const inputPseudo = document.getElementById('player-pseudo');
        gameState.pseudo = inputPseudo && inputPseudo.value ? inputPseudo.value : "Host";
        gameState.isHost = true;
        gameState.role = "rapper"; 
        setupLobbyAsHost();
        switchView('lobby');
    });

    // =========================================================
    // 3. LOGIQUE DU LOBBY
    // =========================================================
    const timerInput = document.getElementById('game-timer');
    const timerDisplay = document.getElementById('timer-display');
    const btnGenerateTheme = document.getElementById('btn-generate-theme');
    const themeDisplay = document.getElementById('lobby-theme-display');
    const btnStartGame = document.getElementById('btn-start-game');

    timerInput?.addEventListener('input', (e) => {
        if(timerDisplay) timerDisplay.textContent = e.target.value;
        gameState.timerSetting = parseInt(e.target.value);
    });

    function setupLobbyAsHost() {
        if(timerInput) timerInput.disabled = false;
        const gameMode = document.getElementById('game-mode');
        const gameRounds = document.getElementById('game-rounds');
        if(gameMode) gameMode.disabled = false;
        if(gameRounds) gameRounds.disabled = false;
        if(btnGenerateTheme) btnGenerateTheme.style.display = 'block';
        if(btnStartGame) btnStartGame.disabled = false;
    }

    btnGenerateTheme?.addEventListener('click', () => {
        const themes = [
            "Mbappé devant la devanture de Hermès",
            "La vie d'une abeille dépressive",
            "Le Soleil VS La Lune",
            "Un braquage qui tourne mal au supermarché"
        ];
        if(themeDisplay) themeDisplay.textContent = "Génération en cours 🤖...";
        setTimeout(() => {
            const randomTheme = themes[Math.floor(Math.random() * themes.length)];
            gameState.currentTheme = randomTheme;
            if(themeDisplay) themeDisplay.textContent = `Thème : ${randomTheme}`;
        }, 800);
    });

    btnStartGame?.addEventListener('click', () => {
        initGame();
        switchView('game');
    });

    document.querySelectorAll('.btn-join-role').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const role = e.target.getAttribute('data-role');
            gameState.role = role;
            alert(`Tu es maintenant : ${role === 'rapper' ? 'Rappeur 🎤' : 'Spectateur 👀'}`);
        });
    });

    // =========================================================
    // 4. LOGIQUE DE JEU
    // =========================================================
    let liveTimerInterval;

    function initGame() {
        const currentThemeEl = document.getElementById('current-theme');
        if(currentThemeEl) currentThemeEl.textContent = `Thème : ${gameState.currentTheme}`;
        
        const interfaceRapper = document.getElementById('interface-rapper');
        const interfaceSpectator = document.getElementById('interface-spectator');

        if (gameState.role === 'rapper') {
            if(interfaceRapper) interfaceRapper.classList.remove('hidden');
            if(interfaceSpectator) interfaceSpectator.classList.add('hidden');
        } else {
            if(interfaceRapper) interfaceRapper.classList.add('hidden');
            if(interfaceSpectator) interfaceSpectator.classList.remove('hidden');
        }

        updateScoreBar();
        renderLyrics();
        startTurnTimer();
    }

    function startTurnTimer() {
        clearInterval(liveTimerInterval);
        let timeLeft = gameState.timerSetting;
        const timerUI = document.getElementById('live-timer');
        if(!timerUI) return;
        
        timerUI.textContent = timeLeft;

        liveTimerInterval = setInterval(() => {
            timeLeft--;
            timerUI.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(liveTimerInterval);
                console.log("Tour terminé !");
            }
        }, 1000);
    }

    document.getElementById('btn-vote-1')?.addEventListener('click', () => handleVote(1));
    document.getElementById('btn-vote-2')?.addEventListener('click', () => handleVote(2));

    function handleVote(rapperNum) {
        if (rapperNum === 1) gameState.scoreR1 += 10;
        if (rapperNum === 2) gameState.scoreR2 += 10;
        addChatMessage("Système", `Le public vote pour le Rappeur ${rapperNum} !`, true);
        updateScoreBar();
    }

    function updateScoreBar() {
        const total = gameState.scoreR1 + gameState.scoreR2;
        const percentageR1 = total === 0 ? 50 : (gameState.scoreR1 / total) * 100;
        
        const bar1 = document.getElementById('score-bar-1');
        const bar2 = document.getElementById('score-bar-2');
        
        if(bar1) bar1.style.width = `${percentageR1}%`;
        if(bar2) bar2.style.width = `${100 - percentageR1}%`;
    }

    // =========================================================
    // 5. PUNCHLINES & CHAT
    // =========================================================
    const lyricsInput = document.getElementById('lyrics-input');
    const btnSendLyrics = document.getElementById('btn-send-lyrics');
    const warningBox = document.getElementById('constraint-warning');

    btnSendLyrics?.addEventListener('click', submitPunchline);
    lyricsInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitPunchline();
    });

    function submitPunchline() {
        const text = lyricsInput.value.trim();
        if (!text) return;

        const hasForbiddenWord = gameState.forbiddenWords.some(word => text.toLowerCase().includes(word));
        const constraintCheck = document.getElementById('constraint-words');
        
        if (hasForbiddenWord && constraintCheck && constraintCheck.checked) {
            if(warningBox) {
                warningBox.textContent = "Mot interdit utilisé !";
                warningBox.classList.remove('hidden');
                setTimeout(() => warningBox.classList.add('hidden'), 2000);
            }
            return; 
        }

        gameState.punchlines.push({ text: text, author: gameState.pseudo });
        lyricsInput.value = '';
        renderLyrics();
        startTurnTimer();
    }

    function renderLyrics() {
        const board = document.getElementById('lyrics-board');
        if(!board) return;
        board.innerHTML = '';
        
        const visibleLines = gameState.punchlines.slice(-4);
        visibleLines.forEach((lineObj, index) => {
            const div = document.createElement('div');
            div.textContent = lineObj.text;
            div.className = 'lyric-line';
            if (index === visibleLines.length - 1) div.classList.add('active');
            board.appendChild(div);
        });
    }

    const chatInput = document.getElementById('chat-input');
    const btnSendChat = document.getElementById('btn-send-chat');

    btnSendChat?.addEventListener('click', sendChatMessage);
    chatInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    function sendChatMessage() {
        if(!chatInput) return;
        const text = chatInput.value.trim();
        if (!text) return;
        
        addChatMessage(gameState.pseudo, text, false);
        chatInput.value = '';
    }

    function addChatMessage(author, text, isSystem = false) {
        const chatBox = document.getElementById('chat-box');
        if(!chatBox) return;
        
        const msgDiv = document.createElement('div');
        if (isSystem) {
            msgDiv.className = 'sys-msg';
            msgDiv.textContent = text;
        } else {
            msgDiv.style.marginBottom = "8px";
            msgDiv.innerHTML = `<strong style="color: var(--secondary)">${author}:</strong> ${text}`;
        }
        
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight; 
    }
});
