# InterviewAce AI 🚀

> **Your Personal AI Interview Coach** — powered by Google Gemini, Firebase, and Next.js 15

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescript.org)
[![Firebase](https://img.shields.io/badge/Firebase-11-orange)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Gemini-1.5_Pro-8B5CF6)](https://deepmind.google/technologies/gemini)
[![Cloud Run](https://img.shields.io/badge/Cloud_Run-Ready-4285F4)](https://cloud.google.com/run)

---

## 🌟 Features

| Feature | Description |
|---------|-------------|
| **Resume Analyzer** | Upload PDF/text resume → get ATS score, skills analysis, gap identification, and improvement suggestions |
| **AI Mock Interviews** | 10-question sessions with Gemini acting as interviewer, with follow-up questions and context tracking |
| **Candidate Evaluation** | 5-dimension scoring (Technical, Communication, Problem Solving, Confidence, Industry Readiness) |
| **Learning Roadmaps** | Personalized 30-day plans based on resume gaps and interview weaknesses |
| **Analytics Dashboard** | Track progress across interviews with score trends |
| **Dark Mode** | Full dark/light mode with system preference detection |

---

## 🏗️ Tech Stack

```
Frontend:   Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Shadcn UI
Backend:    Next.js API Routes · Firebase Admin SDK · Gemini 1.5 Pro/Flash
Database:   Firestore (with security rules)
Auth:       Firebase Authentication (Google Sign-In)
Storage:    Firebase Storage (resume PDFs)
Deploy:     Docker · Google Cloud Run
Secrets:    Google Cloud Secret Manager
```

---

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd interviewace-ai
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project
2. Enable **Authentication** → Google Sign-In
3. Create a **Firestore Database** (Start in production mode)
4. Create a **Storage** bucket
5. Go to **Project Settings** → **Service Accounts** → Generate new private key

### 3. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key for Gemini 1.5 Pro

### 4. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`:

```env
# Firebase Public (from Firebase Console > Project Settings > General)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin (from Service Account JSON)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"

# Gemini
GEMINI_API_KEY=...
```

### 5. Deploy Firestore Rules

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deploy to Google Cloud Run

### Prerequisites

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed
- Docker installed
- A GCP project with Cloud Run API enabled

### Step 1: Store Secrets in Secret Manager

```bash
# Enable Secret Manager
gcloud services enable secretmanager.googleapis.com

# Store Gemini API key
echo -n "your-gemini-api-key" | gcloud secrets create GEMINI_API_KEY --data-file=-

# Store Firebase private key
echo -n "-----BEGIN RSA PRIVATE KEY-----..." | gcloud secrets create FIREBASE_PRIVATE_KEY --data-file=-

# Store Firebase client email
echo -n "firebase-adminsdk@project.iam.gserviceaccount.com" | gcloud secrets create FIREBASE_CLIENT_EMAIL --data-file=-
```

### Step 2: Build and Push Docker Image

```bash
# Set your project ID
export PROJECT_ID=your-gcp-project-id
export IMAGE=gcr.io/$PROJECT_ID/interviewace-ai

# Build with build args for public Firebase config
docker build \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=your-key \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id \
  -t $IMAGE .

# Push to Container Registry
docker push $IMAGE
```

### Step 3: Deploy to Cloud Run

```bash
gcloud run deploy interviewace-ai \
  --image $IMAGE \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --set-secrets "GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --set-secrets "FIREBASE_PRIVATE_KEY=FIREBASE_PRIVATE_KEY:latest" \
  --set-secrets "FIREBASE_CLIENT_EMAIL=FIREBASE_CLIENT_EMAIL:latest" \
  --set-env-vars "FIREBASE_PROJECT_ID=your-project-id" \
  --set-env-vars "NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id" \
  --min-instances 0 \
  --max-instances 10
```

### Step 4: Grant Secret Manager Access

```bash
# Get the Cloud Run service account
gcloud run services describe interviewace-ai \
  --platform managed \
  --region us-central1 \
  --format "value(spec.template.spec.serviceAccountName)"

# Grant access to secrets
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding FIREBASE_PRIVATE_KEY \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding FIREBASE_CLIENT_EMAIL \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 📁 Project Structure

```
interviewace-ai/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/           # Protected dashboard pages
│   │   ├── layout.tsx         # Sidebar + auth guard
│   │   ├── dashboard/         # Home with stats
│   │   ├── resume-analyzer/   # Resume upload + analysis
│   │   ├── mock-interview/    # AI interview chat
│   │   ├── reports/           # Interview history
│   │   ├── learning-roadmap/  # 30-day learning plan
│   │   └── profile/           # User profile
│   ├── api/
│   │   ├── auth/profile/      # Profile sync
│   │   ├── dashboard/stats/   # Dashboard statistics
│   │   ├── resume/analyze/    # Resume → Gemini
│   │   ├── interview/start/   # Start interview session
│   │   ├── interview/respond/ # Process answers
│   │   ├── interview/evaluate/# Generate evaluation
│   │   ├── roadmap/generate/  # Create learning plan
│   │   └── reports/           # Get report history
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Landing page
├── components/
│   ├── ui/                    # Button, Card, Badge, etc.
│   ├── layout/                # Navbar, Sidebar, Footer
│   ├── landing/               # Hero, Features, Pricing, FAQ, CTA
│   └── providers/             # AuthProvider, ThemeProvider
├── lib/
│   ├── firebase/client.ts     # Firebase client SDK
│   ├── firebase/admin.ts      # Firebase Admin SDK
│   ├── gemini/client.ts       # Gemini API client
│   ├── gemini/prompts.ts      # All AI prompts
│   ├── firestore/operations.ts# Database operations
│   ├── auth/server.ts         # Server auth helpers
│   └── utils.ts               # Utility functions
├── types/index.ts             # TypeScript types
├── middleware.ts              # Route protection
├── firestore.rules            # Security rules
├── Dockerfile                 # Multi-stage build
├── .dockerignore
└── .env.local.example         # Environment template
```

---

## 🔒 Security

- **Firestore Rules**: Each user can only access their own data. All writes to sensitive collections are server-only
- **Firebase Admin SDK**: Used exclusively on the server (API routes). Never sent to the client
- **Gemini API Key**: Server-side only, retrieved from Secret Manager in production
- **Route Protection**: Middleware redirects unauthenticated users to `/login`
- **ID Token Verification**: All API routes verify Firebase ID tokens using the Admin SDK

---

## 📋 Firestore Collections

| Collection | Description |
|-----------|-------------|
| `userProfiles` | User metadata (name, email, scores) |
| `resumes` | Resume file references |
| `resumeAnalyses` | Gemini-generated resume analysis results |
| `interviews` | Interview sessions with full message history |
| `interviewReports` | Post-interview evaluation and scores |
| `learningRoadmaps` | Personalized 30-day plans |
| `analytics` | Aggregated user performance metrics |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with ❤️ using Google Gemini AI, Firebase, and Next.js 15*
