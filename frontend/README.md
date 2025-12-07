# 🏙️ City Sticker Generator

An AI-powered sticker generator that creates unique, city-themed souvenir stickers using Google's Gemini AI and OpenAI's DALL-E. Generate, collect, and arrange custom stickers featuring iconic landmarks, local culture, and humorous city stereotypes.

![Sticker Generator Demo](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Sticker+Generator+Demo)

## ✨ Features

- **AI-Powered Generation**: Uses Google's Gemini AI to create creative concepts and OpenAI's DALL-E to generate stunning artwork
- **City-Themed Content**: Generates stickers based on city landmarks, local food, transportation, fauna, and cultural stereotypes
- **Interactive Canvas**: Drag, rotate, and scale stickers on a digital canvas
- **Animated Printer Interface**: Fun printing animation that "produces" each new sticker
- **Background Removal**: Automatic background removal and white border addition for professional sticker appearance
- **Modern UI**: Built with React, Framer Motion animations, and Konva.js for canvas manipulation

## 🚀 Quick Start

### Prerequisites

- Python 3.8+ (for backend)
- Node.js 16+ (for frontend)
- API Keys from:
  - [Google AI Studio](https://aistudio.google.com/) (Gemini API)
  - [OpenAI](https://platform.openai.com/) (DALL-E API)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Sticker-App
   ```

2. **Set up the backend**
   ```bash
   cd backend

   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt

   # Create .env file with your API keys
   echo "GOOGLE_API_KEY=your_google_api_key_here" > .env
   echo "OPENAI_API_KEY=your_openai_api_key_here" >> .env
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend

   # Install dependencies
   npm install

   # Start development server
   npm run dev
   ```

4. **Run the backend**
   ```bash
   # In a separate terminal, from backend directory
   source venv/bin/activate
   python main.py
   ```

5. **Access the application**
   - Frontend: http://localhost:5173 (Vite dev server)
   - Backend API: http://localhost:8000

## 🔧 Configuration

### API Keys Setup

Create `.env` files in the backend directory:

```bash
# backend/.env
GOOGLE_API_KEY=your_actual_google_api_key
OPENAI_API_KEY=your_actual_openai_api_key
```

**⚠️ Security Note**: Never commit `.env` files to version control. They are automatically ignored by `.gitignore`.

### Environment Variables

The backend requires these environment variables:
- `GOOGLE_API_KEY`: Your Google AI Studio API key for Gemini AI
- `OPENAI_API_KEY`: Your OpenAI API key for DALL-E image generation

## 🏗️ Architecture

```
Sticker-App/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Printer.jsx      # Animated sticker printing interface
│   │   │   ├── StickerCanvas.jsx # Interactive canvas for arranging stickers
│   │   └── App.jsx
│   └── package.json
└── backend/           # FastAPI Python server
    ├── main.py        # Main API server with AI integration
    ├── requirements.txt
    └── .env           # API keys (not committed)
```

### Backend Flow

1. **Concept Generation**: Gemini AI creates creative sticker concepts based on city aspects
2. **Image Generation**: DALL-E generates artwork based on the concept
3. **Image Processing**: PIL and rembg remove backgrounds and add white borders
4. **Response**: Base64-encoded PNG returned to frontend

### Frontend Flow

1. **Input**: User enters a city name
2. **API Call**: Request sent to backend for sticker generation
3. **Animation**: Printer animation shows "printing" process
4. **Display**: Sticker slides out and can be added to canvas
5. **Collection**: Stickers can be dragged, rotated, and scaled on canvas

## 🎨 AI Generation Details

The app uses a sophisticated multi-step AI pipeline:

### City Aspects
- **Iconic Landmarks**: Famous buildings and structures
- **Local Food**: Regional dishes and street food
- **Local Fauna**: City-associated animals
- **Transportation**: Unique vehicles and transit
- **Street Objects**: Common urban items
- **Local Stereotypes**: Humorous cultural caricatures

### Art Styles
- Classic bold vector stickers
- Satirical caricature illustrations
- Funny cartoon styles
- Bold line art with flat colors
- Retro souvenir decal styles

## 📦 Dependencies

### Backend
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `google-generativeai` - Gemini AI integration
- `openai` - DALL-E integration
- `pillow` - Image processing
- `rembg` - Background removal
- `python-dotenv` - Environment variable management

### Frontend
- `react` - UI framework
- `framer-motion` - Animations
- `konva` / `react-konva` - Canvas manipulation
- `axios` - HTTP client
- `use-image` - Image loading hook

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting platform
```

### Backend (Railway/Render/Fly.io)
```bash
cd backend
# Set environment variables in your hosting platform
# Deploy main.py as your entry point
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Icons and inspiration from various sticker design communities
- AI models powered by Google DeepMind and OpenAI
- Built with modern web technologies

---

**Made with ❤️ and lots of AI-generated stickers**
