# SPOROUS — Seed Quality & Germination AI Platform

**SPOROUS** is a modern agricultural software platform demonstrating live inference of seed quality and germination machine learning models through a clean React frontend and FastAPI backend.

---

## 1. Application Routing

The application features three main routes:

- **/auth**: Authentication page supporting Email/Password sign-in/sign-up and **Google OAuth** via Supabase Auth.
- **/home**: Landing and overview page with feature cards for **QUALITY** assessment and **GERMINATION** prediction.
- **/prediction**: Production inference pipeline allowing users to select modules, upload seed images, and inspect real-time predictions, OpenCV seed bounding boxes, and individual seed confidence reports.

Unauthenticated users attempting to access `/home` or `/prediction` are automatically redirected to `/auth`.

---

## 2. Supabase Authentication Setup

1. Create a project at [Supabase](https://supabase.com).
2. Copy your Supabase Project URL and Anon Key.
3. In the `frontend` folder, create a `.env` file based on `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. For Google OAuth, enable Google under **Supabase Dashboard -> Authentication -> Providers -> Google** and configure your Google Client ID and Secret. Redirect URLs should include:
`http://localhost:5173/home`

---

## 3. How to Run the Platform

### 1. Backend (FastAPI)
```bash
python -m uvicorn backend.main:app --reload --port 8000
```
Health status check available at: `http://localhost:8000/api/health`

### 2. Frontend (React + Vite)
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your web browser.

---

## 4. Locked Germination & Quality Prediction Models

The production ML pipeline is locked and untouched:

| Option | Section | Engine / Model File | Threshold | Output |
|---|---|---|---|---|
| **Maize Quality** | QUALITY | `maize_diverse_only_effnet.h5` | 0.50 | `HIGH QUALITY` / `LOW QUALITY` |
| **Wheat Quality** | QUALITY | `wheat_effnet.h5` | 0.50 | `HIGH QUALITY` / `LOW QUALITY` |
| **Pearl Millet** | GERMINATION | `P25_final_histgradientboosting_model.pkl` | **0.53** | `GERMINATED` / `NON-GERMINATED` |
| **Maize** | GERMINATION | `m25_final_gradient_boosting.joblib` | **0.425** | `GERMINATED` / `NON-GERMINATED` |

---

## 5. Seed Detection & Bounding Box Overlay

- Uploaded seed tray images are processed with OpenCV contour detection.
- Detected seeds are framed with green bounding boxes and labeled `Seed 1`, `Seed 2`, ... `Seed N`.
- The Individual Seed Report table lists each seed tag alongside its exact prediction, probability, and confidence score evaluated by the production scikit-learn model.
