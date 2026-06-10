const socket = io();

const roomCodeElement = document.getElementById('room-code');
const playersListElement = document.getElementById('players-list');
const gameArea = document.getElementById('game-area');

// Game state
const players = {};
const GAME_WIDTH = gameArea.clientWidth;
const GAME_HEIGHT = gameArea.clientHeight;

socket.emit('create_room');

socket.on('room_created', (code) => {
    roomCodeElement.innerText = code;
});

socket.on('player_joined', (playerInfo) => {
    // Add to game state
    players[playerInfo.id] = {
        ...playerInfo,
        x: Math.random() * (GAME_WIDTH - 40),
        y: Math.random() * (GAME_HEIGHT - 40)
    };
    
    // Update UI
    updatePlayersList();
    createPlayerAvatar(playerInfo.id);
});

socket.on('player_disconnected', (playerId) => {
    if (players[playerId]) {
        delete players[playerId];
        updatePlayersList();
        
        const avatar = document.getElementById(`player-${playerId}`);
        if (avatar) avatar.remove();
    }
});

socket.on('player_action', (data) => {
    const player = players[data.playerId];
    if (!player) return;
    
    const speed = 10;
    
    switch (data.action) {
        case 'up':
            player.y = Math.max(0, player.y - speed);
            break;
        case 'down':
            player.y = Math.min(GAME_HEIGHT - 40, player.y + speed);
            break;
        case 'left':
            player.x = Math.max(0, player.x - speed);
            break;
        case 'right':
            player.x = Math.min(GAME_WIDTH - 40, player.x + speed);
            break;
        case 'buttonA':
            // Visual feedback for action button
            const avatar = document.getElementById(`player-${data.playerId}`);
            if (avatar) {
                avatar.style.transform = 'scale(1.5)';
                setTimeout(() => {
                    avatar.style.transform = 'scale(1)';
                }, 200);
            }
            break;
    }
    
    updatePlayerAvatar(data.playerId);
});

function updatePlayersList() {
    playersListElement.innerHTML = '';
    for (const id in players) {
        const p = players[id];
        const badge = document.createElement('div');
        badge.className = 'player-badge';
        badge.style.backgroundColor = p.color;
        badge.innerText = p.name;
        playersListElement.appendChild(badge);
    }
}

function createPlayerAvatar(id) {
    const p = players[id];
    const avatar = document.createElement('div');
    avatar.id = `player-${id}`;
    avatar.className = 'player-avatar';
    avatar.style.backgroundColor = p.color;
    avatar.innerText = p.name.charAt(0);
    avatar.style.left = `${p.x}px`;
    avatar.style.top = `${p.y}px`;
    gameArea.appendChild(avatar);
}

function updatePlayerAvatar(id) {
    const p = players[id];
    const avatar = document.getElementById(`player-${id}`);
    if (avatar) {
        avatar.style.left = `${p.x}px`;
        avatar.style.top = `${p.y}px`;
    }
}
