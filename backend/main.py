import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Robust import supporting both project root startup and package relative startup
try:
    from backend.inference import registry, predict_quality, detect_seeds_and_predict_germination
except ImportError:
    from inference import registry, predict_quality, detect_seeds_and_predict_germination

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("cropcare_backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("CropCare backend starting. Loading production models...")
    registry.load_all_models()
    yield
    logger.info("CropCare backend shutting down.")

app = FastAPI(title="CropCare Prototype API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "models": {
            "maize_quality": registry.quality_maize is not None,
            "wheat_quality": registry.quality_wheat is not None,
            "germination_pearl": registry.germination_pearl is not None,
            "germination_maize": registry.germination_maize is not None,
        }
    }

@app.post("/api/quality/maize")
async def quality_maize(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a valid image.")
    contents = await file.read()
    try:
        return predict_quality("maize", contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/quality/wheat")
async def quality_wheat(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a valid image.")
    contents = await file.read()
    try:
        return predict_quality("wheat", contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/germination/pearl-millet")
async def germination_pearl(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a valid image.")
    contents = await file.read()
    try:
        return detect_seeds_and_predict_germination("pearl", contents, filename=file.filename or "")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/germination/maize")
async def germination_maize(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a valid image.")
    contents = await file.read()
    try:
        return detect_seeds_and_predict_germination("maize", contents, filename=file.filename or "")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

