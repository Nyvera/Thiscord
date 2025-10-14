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
    await auth.createUserWithEmailAndPassword(email, password);
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      await auth.signInWithEmailAndPassword(email, password);
    } else {
      alert(err.message);
    }
  }
});

// AUTH STATE
auth.onAuthStateChanged(user => {
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
  auth.signOut();
});

// SEND MESSAGE
messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in!");

  await db.collection("messages").add({
    text: messageInput.value,
    uid: user.uid,
    email: user.email,
    channel: currentChannel,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  messageInput.value = "";
});

// REAL-TIME MESSAGES
function loadMessages() {
  db.collection("messages")
    .where("channel", "==", currentChannel)
    .orderBy("timestamp")
    .onSnapshot(snapshot => {
      messagesDiv.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const msgEl = document.createElement("div");
        msgEl.textContent = `${data.email}: ${data.text}`;
        messagesDiv.appendChild(msgEl);
      });
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}

// CHANNELS
function loadChannels() {
  db.collection("channels").onSnapshot(snapshot => {
    channelList.innerHTML = "";
    snapshot.forEach(doc => {
      const channelName = doc.id;
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
  db.collection("channels").doc("general").set({}, { merge: true });
  loadMessages();
}

addChannelBtn.addEventListener("click", async () => {
  const name = newChannelInput.value.trim();
  if (!name) return;
  await db.collection("channels").doc(name).set({});
  newChannelInput.value = "";
});
