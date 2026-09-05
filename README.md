# CropCare — Seed Quality & Germination AI Prototype

A clean, human-designed agricultural software prototype for **CropCare** that demonstrates live inference of seed quality and germination machine learning models through a modern React frontend and FastAPI backend.

---

## 1. What the Prototype Does

This single-page prototype allows agricultural users to select between two core modules:

- **QUALITY MODULE**:
  - **Maize Quality**: Runs `maize_diverse_only_effnet.h5` (Keras EfficientNetB0)
  - **Wheat Quality**: Runs `wheat_effnet.h5` (Keras EfficientNetB0)

- **GERMINATION MODULE**:
  - **Pearl Millet**: Runs production model `P25_final_histgradientboosting_model.pkl` (`HistGradientBoostingClassifier`) with threshold **0.53** and 15 spatial/temporal features.
  - **Maize**: Runs production model `m25_final_gradient_boosting.joblib` (`GradientBoostingClassifier`) with threshold **0.425** and 16 spatial/temporal features.

For Germination, OpenCV detects individual seeds, draws green bounding boxes with `Seed 1`, `Seed 2`, ... tags, and outputs an Individual Seed Report table for up to 10 seeds with live probabilities and confidence percentages.

---

## 2. Design System & Aesthetics

- **Primary Colors**: White background (`bg-white`), dark green headings (`text-green-900`), and emerald/green accents (`bg-green-600`).
- **UI Components**: `shadcn/ui` + Tailwind CSS (`Card`, `Button`, `Badge`, `Progress`, `Alert`, `Skeleton`, `Separator`).
- **Clean Agricultural Software Style**: Minimal decoration, readable typography, subtle borders, and professional layout.

---

## 3. How to Run the Prototype

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

## 4. Model Architecture & Threshold Summary

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
