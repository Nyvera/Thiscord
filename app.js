// app.js
import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { collection, addDoc, query, orderBy, onSnapshot, doc, setDoc, where } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// DOM elements
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

let currentChannel = "general";

// LOGIN / SIGNUP
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

// AUTH STATE
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginContainer.style.display = "none";
    chatContainer.style.display = "flex";
    userEmail.textContent = user.email;
    loadChannels();
  } else {
    loginContainer.style.display = "block";
    chatContainer.style.display = "none";
  }
});

// LOGOUT
logoutBtn.addEventListener("click", () => {
  signOut(auth);
});

// SEND MESSAGE
messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in!");

  await addDoc(collection(db, "messages"), {
    text: messageInput.value,
    uid: user.uid,
    email: user.email,
    channel: currentChannel,
    timestamp: new Date()
  });

  messageInput.value = "";
});

// REAL-TIME MESSAGES
function loadMessages() {
  const q = query(collection(db, "messages"), where("channel", "==", currentChannel), orderBy("timestamp"));
  onSnapshot(q, (snapshot) => {
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

// CHANNELS
async function loadChannels() {
  const channelsCol = collection(db, "channels");
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
        loadMessages();
      });
      channelList.appendChild(li);
    });
  });

  // Add default channel if none
  await setDoc(doc(db, "channels", "general"), {});
  loadMessages();
}

// Add new channel
addChannelBtn.addEventListener("click", async () => {
  const name = newChannelInput.value.trim();
  if (!name) return;
  await setDoc(doc(db, "channels", name), {});
  newChannelInput.value = "";
});
