document.addEventListener("DOMContentLoaded", () => {
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
  const recordButton = document.getElementById("record-button");
  const chatWindow = document.getElementById("chat-window");
  const fileInput = document.getElementById("file-input");
  const uploadButton = document.getElementById("upload-button");

  let username = prompt("Enter your username:");
  let socket = new WebSocket("wss://echo-chat-backend.onrender.com/ws");
  let mediaRecorder;
  let chunks = [];
  let messageCounter = 0;

  socket.onmessage = (event) => {
    const receivedData = JSON.parse(event.data);

    if (receivedData.type === "system") {
      addSystemMessage(receivedData.message);
    } else if (receivedData.type === "edit") {
      const { id, newMessage } = receivedData;
      const messageElement = document.querySelector(`[data-id="${id}"]`);
      if (messageElement) {
        messageElement.querySelector(".message-text").innerText = newMessage;
      }
    } else if (receivedData.type === "chat") {
      const sender = receivedData.username;
      const text = receivedData.message;
      const id = receivedData.id;

      if (sender === username) {
        addMessage("You", text, id);
      } else {
        addMessage(sender, text, id);
      }
    } else if (receivedData.type === "voice") {
      const sender = receivedData.username;
      const audioData = receivedData.audio;
      addVoiceMessage(sender, audioData);
    } else if (receivedData.type === "file") {
      const sender = receivedData.username;
      const filename = receivedData.filename;
      const filedata = receivedData.filedata;
      const filetype = receivedData.filetype;

      if (filetype.startsWith("image/")) {
        addImageMessage(sender, filedata, filetype);
      } else {
        addFileMessage(sender, filename, filedata, filetype);
      }
    }
  };

  socket.onopen = () => {
    console.log("✅ Connected to Echo server");
    const payload = {
      type: "join",
      username: username,
    };
    socket.send(JSON.stringify(payload));
  };

  socket.onclose = () => {
    console.log("❌ Disconnected from Echo server");
  };

  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  recordButton.addEventListener("click", toggleRecording);

  uploadButton.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", handleFileUpload);

  // Drag-and-drop support
  chatWindow.addEventListener("dragover", (event) => {
    event.preventDefault();
    chatWindow.style.backgroundColor = "#1e1e1e";
  });

  chatWindow.addEventListener("dragleave", (event) => {
    event.preventDefault();
    chatWindow.style.backgroundColor = "";
  });

  chatWindow.addEventListener("drop", (event) => {
    event.preventDefault();
    chatWindow.style.backgroundColor = "";

    const file = event.dataTransfer.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64data = reader.result.split(',')[1];

      const payload = {
        type: "file",
        username: username,
        filename: file.name,
        filedata: base64data,
        filetype: file.type
      };

      socket.send(JSON.stringify(payload));
    };
    reader.readAsDataURL(file);
  });

  function sendMessage() {
    const message = messageInput.value.trim();
    if (message === "") return;

    const payload = {
      type: "chat",
      username: username,
      message: message,
      id: messageCounter++
    };

    socket.send(JSON.stringify(payload));
    messageInput.value = "";
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64data = reader.result.split(',')[1];

      const payload = {
        type: "file",
        username: username,
        filename: file.name,
        filedata: base64data,
        filetype: file.type
      };

      socket.send(JSON.stringify(payload));
    };
    reader.readAsDataURL(file);
  }

  function toggleRecording() {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        chunks = [];
  
        mediaRecorder.ondataavailable = (e) => {
          chunks.push(e.data);
        };
  
        mediaRecorder.onstop = (e) => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result.split(',')[1];
            const payload = {
              type: "voice",
              username: username,
              audio: base64data
            };
            socket.send(JSON.stringify(payload));
          };
          reader.readAsDataURL(blob);
        };
  
        recordButton.innerText = "🛑 Stop";
      });
    } else if (mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      recordButton.innerText = "🎙️ Record";
    }
  }  

  function addMessage(sender, text, id = null) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    if (sender === "You") {
      messageElement.classList.add("you");
      if (id !== null) {
        messageElement.setAttribute("data-id", id);
        messageElement.addEventListener("click", () => editMessage(id, messageElement));
      }
    } else {
      messageElement.classList.add("other");
    }

    messageElement.innerHTML = `<div class="bubble"><strong>${sender}:</strong><br><span class="message-text">${text}</span></div>`;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function addVoiceMessage(sender, audioBase64) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    if (sender === "You") {
      messageElement.classList.add("you");
    } else {
      messageElement.classList.add("other");
    }

    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = `data:audio/webm;base64,${audioBase64}`;

    messageElement.innerHTML = `<div class="bubble"><strong>${sender}:</strong><br></div>`;
    messageElement.querySelector(".bubble").appendChild(audio);

    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function addImageMessage(sender, base64data, filetype) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    if (sender === "You") {
      messageElement.classList.add("you");
    } else {
      messageElement.classList.add("other");
    }

    const img = document.createElement("img");
    img.src = `data:${filetype};base64,${base64data}`;
    img.style.maxWidth = "200px";
    img.style.borderRadius = "10px";
    img.style.marginTop = "5px";

    messageElement.innerHTML = `<div class="bubble"><strong>${sender}:</strong><br></div>`;
    messageElement.querySelector(".bubble").appendChild(img);

    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function addFileMessage(sender, filename, base64data, filetype) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
  
    if (sender === "You") {
      messageElement.classList.add("you");
    } else {
      messageElement.classList.add("other");
    }
  
    const bubble = document.createElement("div");
    bubble.classList.add("bubble");
    const senderName = document.createElement("strong");
    senderName.innerText = sender + ":";
    bubble.appendChild(senderName);
    bubble.appendChild(document.createElement("br"));
  
    if (filetype.startsWith("text/")) {
      // 📝 If it's a text file, decode and display content!
      const textContent = atob(base64data); // Decode base64 to readable text
      const pre = document.createElement("pre");
      pre.innerText = textContent;
      pre.style.whiteSpace = "pre-wrap";
      pre.style.maxHeight = "200px";
      pre.style.overflowY = "auto";
      bubble.appendChild(pre);
    } else {
      // 📄 Otherwise, just make it downloadable
      const link = document.createElement("a");
      link.href = `data:${filetype};base64,${base64data}`;
      link.download = filename;
      link.innerText = `📎 ${filename}`;
      link.style.color = "#00c853";
      link.style.display = "inline-block";
      bubble.appendChild(link);
    }
  
    messageElement.appendChild(bubble);
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }  

  function addSystemMessage(text) {
    const systemMessage = document.createElement("div");
    systemMessage.classList.add("system-message");
    systemMessage.innerText = text;
    chatWindow.appendChild(systemMessage);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function editMessage(id, messageElement) {
    const currentText = messageElement.querySelector(".message-text").innerText;
    const newText = prompt("Edit your message:", currentText);

    if (newText !== null && newText.trim() !== "") {
      const payload = {
        type: "edit",
        id: id,
        newMessage: newText
      };
      socket.send(JSON.stringify(payload));
      messageElement.querySelector(".message-text").innerText = newText;
    }
  }  
});