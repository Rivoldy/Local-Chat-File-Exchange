const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Konfigurasi multer untuk menyimpan file dengan nama aslinya
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    io.emit('file_uploaded', { filename: file.originalname, filepath: `/uploads/${file.originalname}` });
    res.status(201).json({ message: 'File successfully uploaded' });
});

app.delete('/delete/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'uploads', filename);
    fs.unlink(filepath, err => {
        if (err) {
            return res.status(404).json({ error: 'File not found' });
        }
        io.emit('file_deleted', { filename });
        res.status(200).json({ message: 'File successfully deleted' });
    });
});

app.get('/files', (req, res) => {
    fs.readdir('uploads', (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Could not list files' });
        }
        res.json(files.map(file => ({ name: file, url: `/uploads/${file}` })));
    });
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'uploads', filename);
    res.download(filepath, err => {
        if (err) {
            res.status(404).json({ error: 'File not found' });
        }
    });
});

let messages = [];

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.emit('initial_messages', messages);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

    socket.on('message', (msg) => {
        const message = { id: Date.now(), text: msg.text, time: new Date().toLocaleTimeString(), senderId: socket.id };
        messages.push(message);
        io.emit('message', message);
    });

    socket.on('delete_message', (messageId) => {
        messages = messages.filter(message => message.id !== messageId);
        io.emit('message_deleted', messageId);
    });

    socket.on('edit_message', (editedMessage) => {
        messages = messages.map(message => message.id === editedMessage.id ? { ...message, text: editedMessage.text } : message);
        io.emit('message_edited', editedMessage);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
