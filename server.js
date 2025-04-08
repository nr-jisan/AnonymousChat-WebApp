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

server.listen(3000, () => console.log("Server running on port 3000"));
