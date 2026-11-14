# 🎵 Naavix – Music Streaming & AI-Powered Recommendation System

A full-stack music streaming application inspired by Spotify, featuring personalized music recommendations, dynamic music discovery, and an interactive listening experience.

Naavix combines modern web technologies with machine learning to help users discover music based on their interests and listening preferences.

## 🚀 Features

### 🎧 Music Streaming
- Browse and explore songs, albums, and artists.
- Search for music dynamically.
- Stream songs using integrated music data APIs.
- View song details, album information, and artist profiles.

### 🎼 Personalized Music Recommendations
- AI-powered music recommendation system.
- Recommends songs based on a selected song and its characteristics.
- Uses machine learning to identify similarities and discover relevant tracks.
- Python-based recommendation service exposed through FastAPI.

### 📚 Music Library
- Explore Telugu music collections.
- Browse songs and albums.
- Access dynamically integrated music information.

### 🔗 Dynamic Music Data Integration
- Integrates with the JioSaavn API for music search and metadata.
- Retrieves song information, album details, artist information, and cover images.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Machine Learning | Python |
| ML API | FastAPI |
| Music API | JioSaavn API |
| Tools | Git, GitHub, VS Code |

## 🏗️ Project Architecture

The application consists of four major components:

1. **Frontend (naavix-app):** Provides the user interface for music discovery, browsing, and streaming.
2. **Backend (backend):** Handles application APIs, business logic, and database communication.
3. **Machine Learning Service (ml-services):** Handles music recommendation functionality using Python and FastAPI.
4. **Admin (admin):** Separate admin application component.

### System Workflow

1. Users interact with the React frontend.
2. The frontend communicates with the Node.js backend.
3. The backend handles application requests and communicates with MongoDB.
4. Music information is dynamically retrieved through the JioSaavn API.
5. When a user requests recommendations, the backend communicates with the FastAPI machine learning service.
6. The recommendation service processes the selected song and returns recommended tracks.
7. The frontend displays the recommendations to the user.

## 📂 Project Structure

```text
mini-project/
│
├── admin/
│   └── Admin application
│
├── backend/
│   └── Node.js backend
│
├── ml-services/
│   └── Python recommendation service
│
├── naavix-app/
│   └── React frontend
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/venkatarajesh016/mini-project.git

cd mini-project
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

Configure the required environment variables in your `.env` file.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Start the backend using the start command defined in its `package.json`.

### 3. Setup the Frontend

Open another terminal:

```bash
cd naavix-app
npm install
npm run dev
```

### 4. Setup the Machine Learning Service

Open another terminal:

```bash
cd ml-services
```

Create and activate a Python virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install the Python dependencies using the project's requirements file:

```bash
pip install -r requirements.txt
```

Start the FastAPI service using the actual application module configured in the project:

```bash
uvicorn main:app --reload
```

**Note:** Update the module name and environment variable names according to your actual project configuration.

## 🧠 Machine Learning Integration

The project incorporates a Python-based recommendation service to improve music discovery.

The recommendation workflow:

1. Receives a selected song as input.
2. Processes the song information.
3. Uses the trained recommendation model to identify relevant songs.
4. Returns recommended songs through the FastAPI endpoint.
5. Displays the recommendations in the React application.

The machine learning service is separated from the main backend, making the recommendation functionality easier to maintain and integrate.

## 🎯 Project Objectives

- Build a full-stack music streaming platform.
- Integrate external music APIs for dynamic music discovery.
- Implement machine learning-based music recommendations.
- Connect a Python ML service with a Node.js backend.
- Provide an interactive and user-friendly music listening experience.

## 🔮 Future Enhancements

- User authentication and personalized profiles.
- Personalized recommendations based on listening history.
- Like, save, and create custom playlists.
- Advanced music recommendation techniques.
- Improved music discovery based on user preferences.

## 👨‍💻 Developer

**D. Venkata Rajesh**

- GitHub: [venkatarajesh016](https://github.com/venkatarajesh016)
- LinkedIn: [Venkata Rajesh](https://www.linkedin.com/in/venkata-rajesh-danta-266597293/)

---

⭐ If you find this project interesting, consider giving the repository a star!
