const socket = io();

const roomCodeElement = document.getElementById('room-code');
const playersListElement = document.getElementById('players-list');
const gameArea = document.getElementById('game-area');

const players = {};
let GAME_WIDTH = gameArea.clientWidth;
let GAME_HEIGHT = gameArea.clientHeight;

window.addEventListener('resize', () => {
    GAME_WIDTH = gameArea.clientWidth;
    GAME_HEIGHT = gameArea.clientHeight;
});

socket.emit('create_room');

socket.on('room_created', (code) => {
    roomCodeElement.innerText = code;
});

socket.on('player_joined', (playerInfo) => {
    players[playerInfo.id] = {
        ...playerInfo,
        x: GAME_WIDTH / 2 - 24 + (Math.random() * 100 - 50),
        y: GAME_HEIGHT / 2 - 24 + (Math.random() * 100 - 50)
    };
    
    updatePlayersList();
    createPlayerAvatar(playerInfo.id);
});

socket.on('player_disconnected', (playerId) => {
    if (players[playerId]) {
        delete players[playerId];
        updatePlayersList();
        
        const avatar = document.getElementById(`player-${playerId}`);
        if (avatar) {
            avatar.style.transform = 'scale(0)';
            avatar.style.opacity = '0';
            setTimeout(() => avatar.remove(), 300);
        }
    }
});

socket.on('player_action', (data) => {
    const player = players[data.playerId];
    if (!player) return;
    
    const speed = 15;
    
    switch (data.action) {
        case 'up': player.y = Math.max(0, player.y - speed); break;
        case 'down': player.y = Math.min(GAME_HEIGHT - 48, player.y + speed); break;
        case 'left': player.x = Math.max(0, player.x - speed); break;
        case 'right': player.x = Math.min(GAME_WIDTH - 48, player.x + speed); break;
        case 'buttonA':
            const avatar = document.getElementById(`player-${data.playerId}`);
            if (avatar) {
                avatar.style.transform = 'scale(1.4)';
                avatar.style.boxShadow = `0 0 30px ${player.color}`;
                setTimeout(() => {
                    avatar.style.transform = 'scale(1)';
                    avatar.style.boxShadow = `0 0 15px ${player.color}`;
                }, 150);
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
        badge.style.backgroundColor = 'rgba(255,255,255,0.1)';
        
        const dot = document.createElement('div');
        dot.className = 'player-color-dot';
        dot.style.backgroundColor = p.color;
        dot.style.color = p.color;
        
        const nameNode = document.createTextNode(p.name);
        
        badge.appendChild(dot);
        badge.appendChild(nameNode);
        playersListElement.appendChild(badge);
    }
}

function createPlayerAvatar(id) {
    const p = players[id];
    const avatar = document.createElement('div');
    avatar.id = `player-${id}`;
    avatar.className = 'player-avatar';
    avatar.style.backgroundColor = p.color;
    avatar.style.color = p.color;
    // Darken actual bg, glow border
    avatar.style.background = `radial-gradient(circle at center, #222 0%, #000 100%)`;
    avatar.style.borderColor = p.color;
    avatar.innerText = p.name.charAt(0).toUpperCase();
    avatar.style.left = `${p.x}px`;
    avatar.style.top = `${p.y}px`;
    
    // Animate in
    avatar.style.transform = 'scale(0)';
    gameArea.appendChild(avatar);
    
    requestAnimationFrame(() => {
        avatar.style.transform = 'scale(1)';
    });
}

function updatePlayerAvatar(id) {
    const p = players[id];
    const avatar = document.getElementById(`player-${id}`);
    if (avatar) {
        avatar.style.left = `${p.x}px`;
        avatar.style.top = `${p.y}px`;
    }
}
