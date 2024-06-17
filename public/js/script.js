const socket = io();
let editingMessageId = null;
let mediaRecorder;
let audioChunks = [];

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;
    if (message.trim() !== '') {
        if (editingMessageId) {
            socket.emit('edit_message', { id: editingMessageId, text: message });
            editingMessageId = null;
        } else {
            socket.emit('message', { text: message });
        }
        messageInput.value = '';
    }
}

socket.on('initial_messages', (msgs) => {
    msgs.forEach(msg => displayMessage(msg));
});

socket.on('message', (msg) => {
    displayMessage(msg);
    notifyUser(msg.text);
});

socket.on('message_deleted', (messageId) => {
    const messageElement = document.getElementById(messageId);
    if (messageElement) {
        messageElement.remove();
    }
});

socket.on('message_edited', (editedMessage) => {
    const messageElement = document.getElementById(editedMessage.id);
    if (messageElement) {
        messageElement.querySelector('p').innerText = editedMessage.text;
    }
});

function displayMessage(msg) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    const senderClass = msg.senderId === socket.id ? 'me' : 'others';
    messageElement.classList.add('chat-message', senderClass);
    messageElement.id = msg.id;
    if (msg.text) {
        messageElement.innerHTML = `<p>${msg.text}</p><p class="timestamp">${msg.time}</p>`;
    } else if (msg.audio) {
        messageElement.innerHTML = `<audio controls src="${msg.audio}"></audio><p class="timestamp">${msg.time}</p>`;
    }
    if (msg.senderId === socket.id) {
        messageElement.innerHTML += `<button class="edit-btn" onclick="editMessage(${msg.id}, '${msg.text}')"><i class="fas fa-edit"></i></button>`;
        messageElement.innerHTML += `<button class="delete-btn" onclick="deleteMessage(${msg.id})"><i class="fas fa-trash-alt"></i></button>`;
    }
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function editMessage(messageId, text) {
    editingMessageId = messageId;
    document.getElementById('message-input').value = text;
}

function deleteMessage(messageId) {
    if (confirm('Are you sure you want to delete this message?')) {
        socket.emit('delete_message', messageId);
    }
}

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    if (confirm('Are you sure you want to upload this file?')) {
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                document.getElementById('message-status').innerText = data.message;
                loadFiles();
                alert('File uploaded successfully!');
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('message-status').innerText = 'Error uploading file.';
                alert('Error uploading file.');
            });
    }
}

socket.on('file_uploaded', (data) => {
    loadFiles();
});

socket.on('file_deleted', (data) => {
    const fileList = document.getElementById('fileList');
    const fileElement = document.querySelector(`li[data-filename="${data.filename}"]`);
    if (fileElement) {
        fileElement.remove();
    }
});

async function loadFiles() {
    try {
        const response = await fetch('/files');
        const files = await response.json();
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';
        files.forEach(file => {
            const li = document.createElement('li');
            li.classList.add('list-group-item');
            li.setAttribute('data-filename', file.name);
            const link = document.createElement('a');
            link.href = file.url;
            link.innerText = file.name;
            link.target = "_blank";
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteBtn.onclick = () => deleteFile(file.name);
            li.appendChild(link);
            li.appendChild(deleteBtn);
            fileList.appendChild(li);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

function toggleFileList() {
    const fileList = document.getElementById('fileList');
    if (fileList.style.display === 'none' || fileList.style.display === '') {
        loadFiles();
        fileList.style.display = 'block';
    } else {
        fileList.style.display = 'none';
    }
}

function deleteFile(filename) {
    if (confirm('Are you sure you want to delete this file?')) {
        fetch(`/delete/${filename}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                alert('File deleted successfully!');
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error deleting file.');
            });
    }
}

function notifyUser(message) {
    if (Notification.permission === "granted") {
        new Notification("New Message", {
            body: message
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (Notification.permission !== "granted") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                notifyUser("Notifications enabled");
            }
        });
    }
});

// Voice Note functions
function startRecording() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    audioChunks = [];
                    const formData = new FormData();
                    formData.append('file', audioBlob, 'voice_note.wav');
                    fetch('/upload', {
                        method: 'POST',
                        body: formData
                    })
                        .then(response => response.json())
                        .then(data => {
                            socket.emit('message', { audio: `/uploads/voice_note.wav` });
                            alert('Voice note uploaded successfully!');
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('Error uploading voice note.');
                        });
                };
                mediaRecorder.start();
                setTimeout(stopRecording, 5000); // Stop recording after 5 seconds
            })
            .catch(error => {
                console.error('Error accessing media devices.', error);
            });
    } else {
        alert('Your browser does not support audio recording');
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
}
