<!-- HEADER -->
<h1 align="center">
  🌌 Anonymous Chat (ColorfulAuth) 🌌
</h1>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=24&pause=1000&color=00FFC0&center=true&vCenter=true&width=600&lines=Secure+Real-Time+Anonymous+Chat;Built+with+Node.js+%26+Socket.IO;Glowing+Dark+Theme+UI;Create+Groups+%7C+Invite+Users+Anonymously;Join+Chat+Without+Login" alt="Typing SVG" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-3C873A?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-Database-00758F?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.IO-Realtime-black?style=for-the-badge&logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/EJS+CSS-Frontend-F72B84?style=for-the-badge" />
</p>

---

## 🧠 Overview

> AnonymousChat is a secure and dynamic chat platform that blends privacy and real-time communication. Users can register/login or join group chats anonymously via invite links.

🌟 **Perfect for:** 
- Anonymous group discussions
- Secure real-time communication
- Creative collaboration without identities

---

## 🖼️ Screenshots

| Login | Register | Group Chat | Chat Interface |
|-------|----------|-------------|----------------|
| ![](public/images/login-screenshot.png) | ![](public/images/register-screenshot.png) | ![](public/images/group-screenshot.png) | ![](public/images/chat-screenshot.png) |

> 📌 _Make sure to add screenshots inside `/public/images/`._

---

## ⚙️ Folder Structure

```bash
COLORFULAUTH/
│
├── public/
│   ├── images/              # UI Assets
│   │   ├── background.jpg
│   │   ├── Homepage.jpg
│   │   └── logo.png
│   └── styles.css           # Glowing dark UI styles
│
├── views/
│   ├── login.ejs            # Login Page
│   ├── register.ejs         # Registration Page
│   ├── chat.ejs             # Main Chat UI
│   └── groupChat.ejs        # Group Chat UI
│
├── server.js                # Main server logic
├── package.json             # Dependencies
├── .gitignore
```

---

## 🚀 Features

| 💡 Feature                          | 🔍 Description |
|------------------------------------|----------------|
| 🧑‍💻 User Login/Register            | Login system using MySQL |
| 🕵️ Anonymous Join via Link         | No login required for guests |
| 🛡️ Group Access Control            | Only creator (admin) can remove users |
| 🧾 Stored Chat History             | Only visible to group admin |
| 🚫 Rejoin Restriction              | Removed users can’t rejoin the group |
| ✨ Glowing Buttons & Dark Theme    | Beautiful animated UI |
| 📱 Messenger-like Chat Layout      | Sidebar + Chat space |
| 🔗 Unique Invite Generation        | Custom group invite links |

---

## 🛠️ Tech Stack

| Tech         | Purpose                         |
|--------------|---------------------------------|
| Node.js      | Backend engine                  |
| Express.js   | HTTP server framework           |
| Socket.IO    | Real-time messaging             |
| MySQL        | Persistent storage              |
| EJS          | Server-side rendering engine    |
| CSS          | Glowing UI design               |

---

## 📦 Installation & Usage

```bash
# 1. Clone the repository
git clone https://github.com/nr-jisan/anonymous-chat.git
cd anonymous-chat

# 2. Install dependencies
npm install

# 3. Configure MySQL credentials in the code

# 4. Start the server
node server.js
```

🌐 Visit `http://localhost:3000` to test it on your browser.

---

## 🔐 Database Setup

> Replace with your actual credentials inside the server file.

### Sample MySQL Tables
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  admin_id INT,
  limit_members INT
);

CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_id INT,
  sender_name VARCHAR(50),
  message TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 💡 Future Improvements

- 📱 Fully mobile responsive
- 🔐 End-to-end encryption
- 🎨 Custom emoji support
- 🖼️ Image sharing
- 📊 User analytics for admin

---

## 🙋‍♂️ Developer

**Md. Naimur Rahman Jisan**  
🎓 B.Sc in CSE | 📘 4th Semester  
📍 Bangladesh  

[![GitHub](https://img.shields.io/badge/GitHub-nr--jisan-181717?style=for-the-badge&logo=github)](https://github.com/nr-jisan)

---

## 🤝 Support & Contribution

> Pull requests and issues are welcome!

If this project helped you, leave a ⭐ and share it.

---

## 📬 Let’s Connect!

<p align="center">
  <a href="https://github.com/nr-jisan"><img src="https://img.shields.io/badge/GitHub-nr--jisan-181717?style=for-the-badge&logo=github"></a>
  <a href="mailto:your@email.com"><img src="https://img.shields.io/badge/Email-Say%20Hello-D14836?style=for-the-badge&logo=gmail&logoColor=white"></a>
</p>

---
