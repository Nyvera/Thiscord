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
    chatContainer.style.display = "block";
    userEmail.textContent = user.email;
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
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  messageInput.value = "";
});

// REAL-TIME MESSAGES
db.collection("messages")
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
