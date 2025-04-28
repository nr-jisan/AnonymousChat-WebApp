const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.urlencoded({ extended: true }));
app.use(express.json())

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));

// Database connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "anonymouschat"
});

db.connect(err => {
    if (err) throw err;
    console.log("Connected to MySQL");
});

app.set("view engine", "ejs");

// Routes
app.get("/", (req, res) => res.redirect("/login"));
app.get("/register", (req, res) => res.render("register"));
app.get("/login", (req, res) => res.render("login"));
app.get("/chat", (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    res.render("chat", { username: req.session.user.username });
});
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

// Handle registration form submission
app.post("/register", (req, res) => {
    const { username, email, password } = req.body;
    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(sql, [username, email, password], (err) => {
        if (err) {
            console.error("Registration Error:", err);
            return res.status(500).send("Registration failed.");
        }
        res.redirect("/login");
    });
});

// Handle login form submission
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error("Login Error:", err);
            return res.status(500).send("Login failed.");
        }
        if (results.length > 0) {
            req.session.user = results[0];
            res.redirect("/chat");
        } else {
            res.send("Invalid username or password. <a href='/login'>Try again</a>");
        }
    });
});

// Rest of your code (groups, sockets, etc.)
app.get("/group/:groupId", (req, res) => {
    if (!req.session.user) return res.redirect("/login");

    const groupId = req.params.groupId;
    const sql = "SELECT * FROM groups WHERE id = ?";
    db.query(sql, [groupId], (err, results) => {
        if (err || results.length === 0) {
            return res.send("Group not found");
        }

        const group = results[0];
        const userId = req.session.user.id;

        // Check if already in group
        const checkSql = "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?";
        db.query(checkSql, [groupId, userId], (err, memberResults) => {
            if (err) return res.send("Error checking group membership");

            if (memberResults.length === 0) {
                // Assign anonymous name
                const anonName = `Anon${Math.floor(1000 + Math.random() * 9000)}`;
                const insertSql = "INSERT INTO group_members (group_id, user_id, anon_name) VALUES (?, ?, ?)";
                db.query(insertSql, [groupId, userId, anonName], (err) => {
                    if (err) return res.send("Error joining group");
                    res.render("groupChat", { groupId, username: anonName, userId: req.session.user.id });

                });
            } else {
                const anonName = memberResults[0].anon_name;
                res.render("groupChat", { groupId, username: anonName, userId: req.session.user.id });

            }
        });
    });
});

app.post("/createGroup", (req, res) => {
    const { groupName, groupSize } = req.body;
    const groupId = uuidv4();

    const sql = "INSERT INTO groups (id, name, max_members) VALUES (?, ?, ?)";
    db.query(sql, [groupId, groupName, groupSize], (err) => {
        if (err) return res.status(500).json({ error: "Failed to create group" });

        res.json({ groupId });
    });
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinGroup", ({ groupId, username, userId }) => {
        socket.join(groupId);
        socket.groupId = groupId;
        socket.username = username;
        socket.userId = userId; // ✅ Save this too!
    });
    

    socket.on("message", (message) => {
        const { groupId, username, userId } = socket;
    
        // Broadcast the message
        io.to(groupId).emit("message", {
            username,
            message
        });
    
        // Save to database
        const sql = "INSERT INTO messages (group_id, user_id, anon_name, message) VALUES (?, ?, ?, ?)";
        db.query(sql, [groupId, userId, username, message], (err) => {
            if (err) console.error("Message insert error:", err);
        });
    });
    

    socket.on("groupMessage", ({ groupId, message, username }) => {
        io.to(groupId).emit("groupMessage", {
            username,
            message
        });
    });
});

server.listen(3000, () => console.log("Server running on port 3000"));