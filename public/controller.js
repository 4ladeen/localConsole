const socket = io();

const joinScreen = document.getElementById('join-screen');
const padScreen = document.getElementById('pad-screen');
const roomInput = document.getElementById('room-input');
const nameInput = document.getElementById('name-input');
const joinBtn = document.getElementById('join-btn');
const errorMsg = document.getElementById('error-msg');
const playerNameDisplay = document.getElementById('player-name-display');

let currentRoomCode = null;

joinBtn.addEventListener('click', () => {
    const code = roomInput.value.trim();
    const name = nameInput.value.trim();
    
    if (code.length === 4) {
        currentRoomCode = code;
        socket.emit('join_room', code, name);
    } else {
        errorMsg.innerText = "Please enter a valid 4-digit code.";
    }
});

socket.on('joined_room', (playerInfo) => {
    joinScreen.style.display = 'none';
    padScreen.style.display = 'block';
    
    padScreen.style.backgroundColor = playerInfo.color;
    playerNameDisplay.innerText = playerInfo.name;
    document.body.style.backgroundColor = '#121212';
});

socket.on('error', (msg) => {
    errorMsg.innerText = msg;
});

socket.on('host_disconnected', () => {
    alert("The host disconnected. Game over!");
    location.reload();
});

function sendAction(action) {
    if (currentRoomCode) {
        socket.emit('player_action', {
            roomCode: currentRoomCode,
            action: action
        });
    }
}

// Prevent default touch behaviors like scrolling while using the d-pad
document.addEventListener('touchmove', function(e) {
    if (padScreen.style.display === 'block') {
        e.preventDefault();
    }
}, { passive: false });
