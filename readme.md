# TimeTrack AI - Activity Logger & Analytics Dashboard

**Short Description:**  
TimeTrack AI is a web-based time tracking application that allows users to log daily activities, track time spent in different categories, and visualize productivity through a detailed analytics dashboard.

---

## 🌐 Live Demo

[View Live Demo](#) <!-- Replace # with your deployed link -->

---

## 🎥 Video Walkthrough

[Watch Video Walkthrough](#) https://drive.google.com/file/d/1Ie7h5cwzLAY-reSSZFqfZldjg-vC5GEQ/view?usp=sharing
In the video, you will see:

- Logging in and signing up with Email/Password and Google
- Adding, editing, and deleting activities
- The dashboard and "No Data Available" state
- Overview of AI-assisted planning or insights (if applicable)

---

## 🛠️ Tech Stack

- HTML, CSS, JavaScript (ES Modules)
- Firebase:
  - Authentication (Email/Password, Google Sign-In)
  - Realtime Database
- Chart.js for data visualization

---

## ✨ Features

- User authentication: Email/password & Google sign-in
- Add, edit, and delete daily activities
- Track total time and time by category
- Analytics dashboard with:
  - Pie chart (time by category)
  - Bar chart (activity durations)
  - Category breakdown and activity timeline
- Responsive UI with modern design
- “No data available” state for empty days

---

## ⚙️ How to Run the Project Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/timetrack-ai.git
   cd timetrack-ai
2. **Set up Firebase:**

- Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
- Enable **Authentication**:
  - Go to Authentication → Sign-in method → Enable Email/Password and Google.
- Enable **Realtime Database**:
  - Go to Realtime Database → Create database → Start in test mode.
- Copy your Firebase configuration and paste it into `firebase.js`:

```javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

> This is all the Firebase setup needed for your project.

---

3. **Open the project in your browser:**
- Simply double-click `index.html` or open it in your browser.
(Optional: For modules to work in all browsers, use a local server such as the VS Code Live Server extension.)
