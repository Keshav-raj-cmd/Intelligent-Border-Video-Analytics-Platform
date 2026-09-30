# Intelligent Border Video Analytics Platform

A comprehensive video analytics platform designed for border security. This platform leverages deep learning, computer vision, and real-time processing to detect, track, and analyze entities in video feeds.

## Features

- **Thermal Human Detection**: Utilizes YOLOv8 on thermal imagery to detect humans in challenging lighting conditions.
- **Night Vision Enhancement**: Implements CLAHE (Contrast Limited Adaptive Histogram Equalization) to improve visibility in dark/green-tinted video feeds.
- **Face Recognition**: Registers and recognizes faces using computer vision algorithms, matching them against a database of known threats.
- **Automatic Number Plate Recognition (ANPR)**: Detects vehicles, tracks them, extracts license plates using OCR, and checks them against a watchlist/database with a risk scoring engine.
- **Virtual Fence**: Defines virtual boundaries and triggers alerts when entities cross them.
- **Action Recognition**: Uses MotionBERT to recognize actions of detected individuals.
- **IP Camera Streaming Support**: Processes live RTSP/HTTP streams from IP cameras.
- **Chatbot Integration**: Features an AI chatbot for assisting operators.

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Machine Learning**: PyTorch, Ultralytics YOLOv8
- **Computer Vision**: OpenCV, Supervision
- **Database**: SQLite
- **Other**: Pandas, python-multipart, HuggingFace Hub

### Frontend
- **Framework**: React 19, Vite
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Charting**: Recharts
- **Icons**: Lucide React

## Setup & Installation

### Backend Setup

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup

1. Navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

- Access the frontend dashboard by navigating to the URL provided by Vite (typically `http://localhost:5173`).
- The backend API documentation (Swagger UI) is available at `http://localhost:8000/docs`.

## License

This project is licensed under the MIT License.
