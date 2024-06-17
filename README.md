# Local Chat and File Exchange

This is a real-time chat and file exchange application built with Node.js, Express, and Socket.IO. The application allows users to send messages, upload and download files, edit and delete messages, and delete files.
![Screenshot of the Application](https://github.com/Rivoldy/Local-Chat-File-Exchange/blob/master/Screenshot%20(260).png)
## Features

### Real-time Messaging
- **Send Messages**: Users can send messages in real-time to other users connected to the same local network.
- **Edit Messages**: Users can edit their sent messages to correct mistakes or update information.
- **Delete Messages**: Users can delete their sent messages if necessary.
- **Message Timestamps**: Each message is timestamped for better context.

### File Exchange
- **Upload Files**: Users can upload files to the server. A confirmation prompt ensures intentional uploads.
- **Download Files**: Users can download files that have been uploaded by others.
- **Delete Files**: Users can delete uploaded files. A confirmation prompt ensures intentional deletions.
- **Show Files**: Users can toggle the display of uploaded files to keep the interface clean and organized.

### Notifications
- **Message Notifications**: Users receive desktop notifications for new messages, ensuring no message is missed.
- **File Upload Notification**: Users receive an alert notification when a file is successfully uploaded.
- **File Delete Notification**: Users receive an alert notification when a file is successfully deleted.

## Detailed Description

This application is designed to facilitate efficient communication and file sharing within a local network. It is particularly useful for small to medium-sized businesses, project teams, or any group of individuals who need a reliable, real-time communication tool without relying on external servers.

### Use Cases
1. **Business Teams**: Enhance internal communication and file sharing within the office environment.
2. **Project Teams**: Share project files and updates quickly and efficiently.
3. **Educational Institutions**: Facilitate communication between students and teachers, and share study materials.
4. **Events and Conferences**: Enable participants to communicate and share resources seamlessly.

### Benefits
- **Data Security**: Since the application runs on a local network, data does not leave the premises, ensuring higher security and privacy.
- **No Internet Dependency**: Operates fully within a local network, making it ideal for environments with limited or no internet access.
- **Cost-Efficient**: No need for external server hosting or third-party services, reducing operational costs.

## Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/Rivoldy/Local-Chat-File-Exchange.git
   cd Local-Chat-File-Exchange
2. **Install dependencies**
   ```sh
   npm install
3. **Run the server**
   ```sh
   node server.js
4. **Open your browser and navigate to**
    ```sh
    http://localhost:3000
5. Alternatively, use the local network IP address to allow other devices on the same network to connect:
     ```sh
     http://<your_local_ip_address>:3000
     
#### This program was created and developed by myself. If you have any questions or suggestions, feel free to reach out to me at rivoldydaya@gmail.com.
