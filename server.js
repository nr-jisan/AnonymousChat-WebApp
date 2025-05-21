const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");
const http = require("http");
const socketIo = require("socket.io");
const bcrypt = require("bcryptjs");

const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));

app.set("view engine", "ejs");

// Redirect root to login
app.get("/", (req, res) => res.redirect("/login"));
app.get("/register", (req, res) => res.render("register", { error: null }));
app.get("/login", (req, res) => res.render("login", { error: null }));
app.get("/chat", (req, res) => {
    if (!req.session.user) return res.redirect("/login");
    res.render("chat", { username: req.session.user.username });
});
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

// ---------- USER REGISTRATION ----------
app.post("/register", (req, res) => {
    const { username, password } = req.body;

    fs.readFile("./data/users.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Server error.");
        let users = [];
        try {
            users = JSON.parse(data);
        } catch (parseErr) {
            console.error("Parse error on users file:", parseErr);
            return res.status(500).send("Server error.");
        }

        if (users.find(user => user.username === username)) {
            return res.render("register", { error: "Username already taken." });
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return res.status(500).send("Internal error.");

            const newUser = { id: Date.now(), username, password: hashedPassword };
            users.push(newUser);
            fs.writeFile("./data/users.json", JSON.stringify(users, null, 2), err => {
                if (err) return res.status(500).send("Failed to save user.");
                res.redirect("/login");
            });
        });
    });
});

// ---------- USER LOGIN ----------
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    fs.readFile("./data/users.json", "utf8", (err, data) => {
        if (err) return res.status(500).send("Server error.");
        let users = [];
        try {
            users = JSON.parse(data);
        } catch (parseErr) {
            console.error("Parse error on users file:", parseErr);
            return res.status(500).send("Server error.");
        }

        const user = users.find(u => u.username === username);

        if (!user) return res.render("login", { error: "Invalid username or password." });

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).send("Error.");
            if (!isMatch) return res.render("login", { error: "Invalid username or password." });

            req.session.user = user;
            res.redirect("/chat");
        });
    });
});

// ---------- CREATE GROUP (Creates a group file) ----------
app.post("/createGroup", (req, res) => {
    const { groupName, groupSize } = req.body;
    const groupId = uuidv4();
    const filePath = path.join(__dirname, "data", "groups", `${groupId}.json`);

    const groupData = {
        name: groupName,
        max_members: groupSize,
        adminId: req.session.user.id,
        members: [],
        messages: []
    };

    fs.writeFile(filePath, JSON.stringify(groupData, null, 2), (err) => {
        if (err) return res.status(500).json({ error: "Failed to create group" });
        res.json({ groupId });
    });
});

// ---------- JOIN GROUP ----------
app.get("/group/:groupId", (req, res) => {
    const groupId = req.params.groupId;
    const filePath = path.join(__dirname, "data", "groups", `${groupId}.json`);

    if (!fs.existsSync(filePath)) return res.send("Group not found");

    let groupData;
    try {
        groupData = JSON.parse(fs.readFileSync(filePath));
    } catch (err) {
        console.error("Error reading group file:", err);
        return res.send("Error loading group.");
    }

    let userId, username;

    // If logged in, use session info
    if (req.session.user) {
        userId = req.session.user.id;
        const existing = groupData.members.find(m => m.userId === userId);
        if (!existing) {
            username = `Anon${Math.floor(1000 + Math.random() * 9000)}`;
            groupData.members.push({ userId, anon_name: username });
            fs.writeFileSync(filePath, JSON.stringify(groupData, null, 2));
        } else {
            username = existing.anon_name;
        }
    } else {
        // Guest user
        userId = `guest-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        username = `Guest${Math.floor(1000 + Math.random() * 9000)}`;
        groupData.members.push({ userId, anon_name: username });
        fs.writeFileSync(filePath, JSON.stringify(groupData, null, 2));
    }

    res.render("groupChat", {
        groupId,
        username,
        userId
    });
});

// ---------- LEAVE GROUP (Admin deletes group file) ----------
app.get("/leaveGroup/:groupId", (req, res) => {
    if (!req.session.user) return res.redirect("/login");

    const groupId = req.params.groupId;
    const filePath = path.join(__dirname, "data", "groups", `${groupId}.json`);

    if (!fs.existsSync(filePath)) return res.redirect("/chat");

    let groupData = {};
    try {
        groupData = JSON.parse(fs.readFileSync(filePath));
    } catch (err) {
        console.error("Error reading group file:", err);
        return res.redirect("/chat");
    }
    
    if (req.session.user.id === groupData.adminId) {
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting group file:", err);
        });
    }
    res.redirect("/chat");
});

// ---------- SOCKET.IO for messaging ----------
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinGroup", ({ groupId, username, userId }) => {
        socket.join(groupId);
        socket.groupId = groupId;
        socket.username = username;
        socket.userId = userId;
    });
    
    socket.on("message", (message) => {
        const { groupId, username } = socket;
        if (!groupId) return;

        const filePath = path.join(__dirname, "data", "groups", `${groupId}.json`);
        if (!fs.existsSync(filePath)) return;

        let groupData = {};
        try {
            groupData = JSON.parse(fs.readFileSync(filePath));
        } catch (err) {
            console.error("Error parsing group file:", err);
            return;
        }
        const newMessage = {
            username,
            message,
            time: new Date().toISOString()
        };
        groupData.messages.push(newMessage);
        fs.writeFileSync(filePath, JSON.stringify(groupData, null, 2));
        io.to(groupId).emit("message", newMessage);
    });
});

server.listen(3000, () => console.log("Server running on port 3000"));
