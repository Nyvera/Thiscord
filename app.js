import { auth, db } from "./firebase-config.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  setDoc, 
  where, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// ------------------ DOM Elements ------------------
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginContainer = document.getElementById("login-container");
const chatContainer = document.getElementById("chat-container");
const userEmail = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout-btn");

const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const messagesDiv = document.getElementById("messages");

const channelList = document.getElementById("channel-list");
const addChannelBtn = document.getElementById("add-channel-btn");
const newChannelInput = document.getElementById("new-channel-input");
const currentChannelSpan = document.getElementById("current-channel");

// ------------------ Global State ------------------
let currentChannel = "general"; // default channel

// ------------------ AUTH ------------------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      alert(err.message);
    }
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginContainer.style.display = "none";
    chatContainer.style.display = "flex";
    userEmail.textContent = user.email;
    currentChannelSpan.textContent = `#${currentChannel}`;
    loadChannels();
  } else {
    loginContainer.style.display = "block";
    chatContainer.style.display = "none";
  }
});

logoutBtn.addEventListener("click", () => {
  signOut(auth);
});

// ------------------ MESSAGES ------------------
messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in!");
  if (!currentChannel) currentChannel = "general";

  await addDoc(collection(db, "messages"), {
    text: messageInput.value,
    uid: user.uid,
    email: user.email,
    channel: currentChannel,
    timestamp: serverTimestamp(),  // Firestore timestamp
    clientTime: new Date()          // JS fallback timestamp
  });

  messageInput.value = "";
});

function loadMessages() {
  if (!currentChannel) return;

  const messagesQuery = query(
    collection(db, "messages"),
    where("channel", "==", currentChannel),
    orderBy("clientTime")  // use fallback timestamp for immediate display
  );

  onSnapshot(messagesQuery, (snapshot) => {
    messagesDiv.innerHTML = "";

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const msgEl = document.createElement("div");
      msgEl.textContent = `${data.email}: ${data.text}`;
      messagesDiv.appendChild(msgEl);
    });

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// ------------------ CHANNELS ------------------
async function loadChannels() {
  const channelsCol = collection(db, "channels");

  // Listen for channels real-time
  onSnapshot(channelsCol, (snapshot) => {
    channelList.innerHTML = "";

    snapshot.forEach(docSnap => {
      const channelName = docSnap.id;
      const li = document.createElement("li");
      li.textContent = `#${channelName}`;
      if (channelName === currentChannel) li.classList.add("active");

      li.addEventListener("click", () => {
        currentChannel = channelName;
        currentChannelSpan.textContent = `#${currentChannel}`;
        loadMessages(); // reload messages for selected channel
      });

      channelList.appendChild(li);
    });
  });

  // Ensure default channel exists
  await setDoc(doc(db, "channels", "general"), {}, { merge: true });
  loadMessages();
}

// Add new channel
addChannelBtn.addEventListener("click", async () => {
  const name = newChannelInput.value.trim();
  if (!name) return;

  await setDoc(doc(db, "channels", name), {}, { merge: true });
  newChannelInput.value = "";
});
