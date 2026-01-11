# 🎈 FreeSun Hot Air Ballooning Club

Welcome to the future of FreeSun. This project is a high-performance, mobile-first redesign of the FreeSun Hot Air Ballooning Club's digital presence. It features a stunning public landing page and a specialized **Pilot & Crew Dashboard** powered by **Gemini AI**.

---

## 🚀 Key Features

### 🌍 Public Experience
- **Rocky Mountain Fly**: Immersive hero section with smooth animations.
- **Mobile-First Design**: Fully responsive across all devices using adaptive layout techniques.
- **Safety Documentation**: Integrated safety and club history showcases.

### 🧑‍✈️ Pilot & Crew Dashboard
- **AI-Powered Briefings**: Real-time flight safety analysis generated via the **Gemini 3 Flash** model.
- **Live Weather Integration**: Surface wind, direction, and visibility tracking with threshold warnings.
- **Crew Management**: Directory with availability toggles and advanced search/filtering.
- **Flight Logs**: Sortable, archivable history of all club flight operations.
- **Pre-Flight Checklists**: Interactive safety checks with launch status validation.

---

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/) (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS with custom `bricolage-grotesque` typography.
- **AI Engine**: Google Gemini API via `@google/genai`.
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: React Router DOM.

---

## 📦 Getting Started

### 1. Prerequisites
- A Google Gemini API Key.

### 2. Environment Setup
Create a `.env` file in the root directory (Git will ignore this):
```env
API_KEY=your_gemini_api_key_here
```

### 3. Installation
```bash
npm install
```

### 4. Running the App
```bash
npm run dev
```

---

## 🛡️ Safety & Architecture

- **Accessibility**: Built with semantic HTML and ARIA standards.
- **Performance**: Optimized asset loading and progressive enhancement.
- **Theming**: Seamless Light/Dark mode transitions with no flicker.

---

*Designed and Developed for the FreeSun Ballooning Club. Elevate your perspective.*
