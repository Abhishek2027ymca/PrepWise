# PrepWise – AI-Powered Mock Interview Platform

An intelligent interview preparation platform leveraging AI to simulate real-world interview scenarios and provide personalized feedback.

## 🎯 Overview

PrepWise is a full-stack web application designed to help students and professionals prepare for technical and behavioral interviews. It uses **Gemini AI** to generate dynamic interview questions, conduct realistic mock interviews, and deliver actionable feedback to improve interview performance.

## 🚀 Features

- **AI-Generated Questions**: Dynamic interview questions tailored to different domains (DSA, System Design, Behavioral, etc.)
- **Real-Time Mock Interviews**: Interactive interview sessions with AI interviewer
- **Instant Feedback**: AI-powered analysis and suggestions for improvement
- **Multiple Interview Types**: Technical, behavioral, and domain-specific interviews
- **User-Friendly Interface**: Clean, responsive UI for seamless interview experience
- **Progress Tracking**: Monitor your interview performance over time

## 🛠️ Tech Stack

### Frontend
- **Next.js** – React-based framework for SSR and static generation
- **React** – Component-based UI development
- **Tailwind CSS** – Utility-first styling
- **TypeScript** – Type-safe development

### Backend
- **Next.js API Routes** – Serverless backend
- **Gemini AI API** – LLM for question generation and feedback

### Deployment
- **Vercel** – Frontend deployment

## 📦 Project Structure

```
PrepWise/
├── pages/
│   ├── index.js           # Home page
│   ├── interview/         # Interview session pages
│   └── api/               # API routes for backend logic
├── components/            # Reusable React components
├── public/                # Static assets
├── styles/                # Global styles
└── lib/                   # Utility functions and API helpers
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Gemini API key

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abhishek2027ymca/PrepWise.git
   cd PrepWise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 💡 How It Works

1. **User selects interview type** (Technical, Behavioral, DSA, etc.)
2. **AI generates contextual questions** based on the selected domain
3. **User responds** to interview questions in real-time
4. **AI analyzes responses** for clarity, completeness, and technical accuracy
5. **Instant feedback** is provided with areas of improvement

## 🎓 Interview Categories

- **Data Structures & Algorithms** – LeetCode-style problems and explanations
- **System Design** – Large-scale architecture discussions
- **Behavioral** – STAR method, conflict resolution, teamwork
- **Frontend** – React, CSS, JavaScript concepts
- **Backend** – APIs, databases, scalability
- **Company-Specific** – Interview patterns from top tech companies

## 📊 API Integration

### Gemini AI Integration
- Generates interview questions dynamically
- Evaluates user responses
- Provides detailed feedback and improvement suggestions
- Supports multi-turn conversations for realistic interview flow

## 🚀 Deployment

PrepWise is deployed on **Vercel** for optimal performance:

```bash
vercel deploy
```

Visit the live app: [PrepWise Live](#) (add your deployed URL here)

## 🔐 Security

- Environment variables are kept secure in `.env.local`
- API keys are not exposed in client-side code
- Sensitive operations are handled server-side via Next.js API routes

## 📈 Future Enhancements

- [ ] User authentication and profile management
- [ ] Interview history and performance analytics
- [ ] Video recording and playback
- [ ] Peer comparison and leaderboards
- [ ] Mobile app version
- [ ] Multiple language support
- [ ] Custom question creation by users

## 🤝 Contributing

Contributions are welcome! Feel free to fork, create issues, and submit pull requests.

## 📝 License

This project is open source and available under the MIT License.

## 👤 Author

**Abhishek** – Full-Stack Developer & AI Enthusiast  
GitHub: [@Abhishek2027ymca](https://github.com/Abhishek2027ymca)

## 📧 Contact

For queries or feedback, reach out via GitHub or email.

---

**Made with ❤️ to help you ace your interviews!**




