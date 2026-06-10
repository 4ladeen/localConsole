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
    
    // Setup UI colors based on assigned player color
    document.documentElement.style.setProperty('--primary', playerInfo.color);
    playerNameDisplay.innerText = playerInfo.name;
    playerNameDisplay.style.color = playerInfo.color;
});

socket.on('error', (msg) => {
    errorMsg.innerText = msg;
});

socket.on('host_disconnected', () => {
    alert("Connection lost with the console.");
    location.reload();
});

// Setup continuous actions for D-Pad
const actions = {
    'up': false,
    'down': false,
    'left': false,
    'right': false
};

let actionLoop = null;

function updateActions() {
    if (!currentRoomCode) return;
    
    for (const [action, isActive] of Object.entries(actions)) {
        if (isActive) {
            socket.emit('player_action', { roomCode: currentRoomCode, action });
        }
    }
}

function startActionLoop() {
    if (!actionLoop) {
        actionLoop = setInterval(updateActions, 50);
    }
}

function stopActionLoop() {
    if (actionLoop) {
        clearInterval(actionLoop);
        actionLoop = null;
    }
}

function setupButton(id, actionName, isContinuous = true) {
    const btn = document.getElementById(id);
    
    const triggerStart = (e) => {
        e.preventDefault();
        btn.classList.add('active');
        if (navigator.vibrate) navigator.vibrate(15);
        
        if (isContinuous) {
            actions[actionName] = true;
            startActionLoop();
        } else {
            if (currentRoomCode) {
                socket.emit('player_action', { roomCode: currentRoomCode, action: actionName });
            }
        }
    };
    
    const triggerEnd = (e) => {
        e.preventDefault();
        btn.classList.remove('active');
        if (isContinuous) {
            actions[actionName] = false;
            
            // Check if any action is still active
            if (!Object.values(actions).some(v => v)) {
                stopActionLoop();
            }
        }
    };

    btn.addEventListener('touchstart', triggerStart, { passive: false });
    btn.addEventListener('mousedown', triggerStart);
    
    btn.addEventListener('touchend', triggerEnd);
    btn.addEventListener('mouseup', triggerEnd);
    btn.addEventListener('mouseleave', triggerEnd);
}

setupButton('btn-up', 'up');
setupButton('btn-down', 'down');
setupButton('btn-left', 'left');
setupButton('btn-right', 'right');
setupButton('btn-a', 'buttonA', false);

// Prevent default touch behaviors like scrolling
document.addEventListener('touchmove', function(e) {
    if (padScreen.style.display === 'block') {
        e.preventDefault();
    }
}, { passive: false });

// Haptic feedback fallback for non-mobile devices
if (!window.navigator.vibrate) {
    window.navigator.vibrate = function() {};
}
