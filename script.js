
let playerCountInput = document.getElementById('playerCount');
let playerNamesContainer = document.getElementById('playerNamesContainer');
let startGameBtn = document.getElementById('startGameBtn');
let players = [];
let currentQuestionIndex = 0;
let currentPlayerIndex = 0;
let round = 1;
let totalRounds = 6;
let questions = [];

fetch('./data.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        localStorage.setItem('questions', JSON.stringify(questions));
    });

playerCountInput?.addEventListener('input', () => {
    let count = parseInt(playerCountInput.value);
    playerNamesContainer.innerHTML = '';
    players = [];
    for (let i = 0; i < count; i++) {
        let input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Nombre del jugador ${i + 1}`;
        input.classList.add('playerNameInput');
        playerNamesContainer.appendChild(input);
        players.push({ name: '', score: 0 });
    }
    startGameBtn.disabled = count <= 0;
});

startGameBtn?.addEventListener('click', () => {
    let nameInputs = document.querySelectorAll('.playerNameInput');
    nameInputs.forEach((input, index) => {
        players[index].name = input.value;
    });
    localStorage.setItem('players', JSON.stringify(players));
    window.location.href = './game.html';
});

document.addEventListener('DOMContentLoaded', () => {
    const game = document.querySelector('.game');
    if (game) {
        players = JSON.parse(localStorage.getItem('players'));
        displayPlayers();
        startRound();
    }
});

function displayPlayers() {
    let playersContainer = document.getElementById('playersContainer');
    players.forEach(player => {
        let playerDiv = document.createElement('div');
        playerDiv.classList.add('player');
        playerDiv.id = `player-${player.name}`;
        playerDiv.innerHTML = `
            <p>${player.name}</p>
            <p>Puntuacion: 
                <span id="score-${player.name}">
                    ${player.score}
                </span>
            </p>`;
        
        playersContainer.appendChild(playerDiv);
    });
}

function startRound() {
    const countRounds = document.getElementById('countRounds');
    countRounds.textContent = 'Ronda: ' + round;
    if (round > totalRounds) {
        endGame();
        return;
    }
    currentPlayerIndex = 0;
    startTurn();
}

function startTurn() {
    questions = JSON.parse(localStorage.getItem('questions'));
    let currentPlayer = players[currentPlayerIndex];

    document.querySelectorAll('.player').forEach(div => div.classList.remove('active'));
    document.getElementById(`player-${currentPlayer.name}`).classList.add('active');

    currentQuestionIndex = aleatorio(1, questions.length);
    let question = questions[currentQuestionIndex];
    document.getElementById('questionText').innerText = question.question;

    const timerText = document.getElementById('timerText');

    let timeLeft = 60;
    timerText.textContent = timeLeft + 's';
    const timerInterval = setInterval(() => {
        timeLeft--;
        timerText.textContent = timeLeft + 's';
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            nextTurn();
        }
    }, 1000);

    document.getElementById('skipBtn').onclick = () => {
        clearInterval(timerInterval);
        nextTurn();
    };

    document.getElementById('confirmBtn').onclick = () => {
        clearInterval(timerInterval);
        currentPlayer.score += question.score;
        document.getElementById(`score-${currentPlayer.name}`).innerText = currentPlayer.score;
        nextTurn();
    };
}

function nextTurn() {
    currentPlayerIndex++;
    if (currentPlayerIndex >= players.length) {
        currentQuestionIndex = aleatorio(1, questions.length);
        round++;
        startRound();
    } else {
        startTurn();
    }
}

function endGame() {
    players.sort((a, b) => b.score - a.score);

    let resultText = `Ganador: ${players[0].name} con ${players[0].score} puntos`;
    players.forEach(player => {
         resultText += `<p>${player.name}: ${player.score} puntos</p>`;
     });
    
    const game = document.querySelector('.game');
    game.innerHTML = '';
    if (game) {
        game.innerHTML = `
            <h1>Resultados</h1>
            <h3>${resultText}</h3>
            <button id="newGameBtn">Nuevo Juego</button>`;
    }

    document.getElementById('newGameBtn').onclick = () => {
        localStorage.removeItem('players');
        localStorage.removeItem('questions');
        window.location.href = './index.html';
    };
}

function aleatorio(inferior, superior) {
    var numPosibilidades = superior - inferior;
    var aleatorio = Math.random() * (numPosibilidades + 1);
    aleatorio = Math.floor(aleatorio);
    return inferior + aleatorio;
}
