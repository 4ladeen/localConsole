# localConsole

A local multiplayer console web application built with Node.js, Express, and Socket.IO. 

This project allows a main screen (the "Host") to create a room, while players can join as "Controllers" using their smartphones or other browser-enabled devices to interact with the host in real-time.

## Features

- **Host Mode:** Generates a unique 4-digit room code and displays connected players and their actions in real time.
- **Controller Mode:** Players join using the room code and their name, and are assigned a unique color.
- **Real-time Interaction:** Controller inputs (Up, Down, Left, Right, Button A) are sent instantly to the host via WebSockets.
- **Responsive UI:** Web-based controller designed for mobile devices.

## Getting Started

### Prerequisites

- Node.js
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/4ladeen/localConsole.git
   cd localConsole
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`.
3. Click on **"Host a Game"** on your main screen (e.g., PC/Smart TV).
4. On your mobile devices, navigate to the host's local IP address (e.g., `http://192.168.x.x:3000`), click **"Join a Game"**, and enter the 4-digit room code displayed on the host screen.

## Technologies Used

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Socket.IO](https://socket.io/)
- HTML / CSS / Vanilla JavaScript

## License

This project is licensed under the ISC License.
