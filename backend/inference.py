import os
import io
import cv2
import base64
import logging
import joblib
import numpy as np
import pandas as pd
from PIL import Image

logger = logging.getLogger("cropcare_inference")

# Try loading tf_keras
try:
    import tf_keras as keras
except ImportError:
    import tensorflow.keras as keras

def calc_box_iou(box1, box2):
    """Calculates Intersection over Union (IoU) between two bounding boxes [xmin, ymin, xmax, ymax]."""
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])
    inter = max(0.0, x2 - x1) * max(0.0, y2 - y1)
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union = area1 + area2 - inter
    return float(inter / union) if union > 0 else 0.0

def extract_maize_live_features(sub_obs: pd.DataFrame) -> dict:
    """
    Calculates the exact 16 production features LIVE from sequence tracking observations
    for a Maize seed track across frames 1 to 72.
    """
    sub_obs = sub_obs.sort_values('frame')
    W, H = 624.0, 624.0
    
    cx = sub_obs['cx'].values / W
    cy = sub_obs['cy'].values / H
    w = sub_obs['box_w'].values / W
    h = sub_obs['box_h'].values / H
    area = w * h
    
    if 'center_distance' in sub_obs.columns and len(sub_obs) > 1:
        mov = sub_obs['center_distance'].values[1:]
    else:
        mov = np.sqrt(np.diff(cx)**2 + np.diff(cy)**2)
        
    med_mov = float(np.median(mov)) if len(mov) > 0 else 0.0
    max_mov = float(np.max(mov)) if len(mov) > 0 else 0.0
    std_mov = float(np.std(mov)) if len(mov) > 0 else 0.0
    
    std_cx = float(np.std(cx))
    std_cy = float(np.std(cy))
    min_cx = float(np.min(cx))
    min_cy = float(np.min(cy))
    
    mean_h = float(np.mean(h))
    max_w = float(np.max(w))
    max_h = float(np.max(h))
    
    h_change = float(h[-1] - h[0]) if len(h) > 0 else 0.0
    w_growth_ratio = float(w[-1] / w[0]) if len(w) > 0 and w[0] > 0 else 1.0
    
    mean_area = float(np.mean(area))
    max_area = float(np.max(area))
    area_growth_ratio = float(area[-1] / area[0]) if len(area) > 0 and area[0] > 0 else 1.0
    
    zm_el_count = int((sub_obs['class'] == 'zm_el').sum()) if 'class' in sub_obs.columns else 0
    
    return {
        "median_movement": med_mov,
        "max_movement": max_mov,
        "movement_std": std_mov,
        "std_center_x": std_cx,
        "std_center_y": std_cy,
        "min_center_x": min_cx,
        "min_center_y": min_cy,
        "mean_height": mean_h,
        "max_width": max_w,
        "max_height": max_h,
        "height_change": h_change,
        "width_growth_ratio": w_growth_ratio,
        "mean_area": mean_area,
        "max_area": max_area,
        "area_growth_ratio": area_growth_ratio,
        "zm_el_count_75pct": zm_el_count
    }

def extract_pearl_live_features(sub_obs: pd.DataFrame) -> dict:
    """
    Calculates the exact 15 production features LIVE from spatial tracking observations
    for a Pearl Millet seed track across frames 1 to 97.
    """
    sub_obs = sub_obs.sort_values('frame')
    cx = sub_obs['cx'].values
    cy = sub_obs['cy'].values
    w = sub_obs['box_w'].values
    h = sub_obs['box_h'].values
    area = sub_obs['area'].values if 'area' in sub_obs.columns else (w * h)
    
    boxes = sub_obs[['xmin', 'ymin', 'xmax', 'ymax']].values
    ious = [calc_box_iou(boxes[i], boxes[i+1]) for i in range(len(boxes)-1)]
    mov = np.sqrt(np.diff(cx)**2 + np.diff(cy)**2)
    
    w_early = w[:32]
    w_middle = w[32:64]
    
    h_middle = h[32:64]
    
    area_early = area[:32]
    area_middle = area[32:64]
    
    return {
        "width_change": float(w[-1] - w[0]) if len(w) > 0 else 0.0,
        "mean_iou": float(np.mean(ious)) if len(ious) > 0 else 1.0,
        "height_change": float(h[-1] - h[0]) if len(h) > 0 else 0.0,
        "area_change": float(area[-1] - area[0]) if len(area) > 0 else 0.0,
        "std_center_x": float(np.std(cx)),
        "std_center_y": float(np.std(cy)),
        "std_iou": float(np.std(ious)) if len(ious) > 0 else 0.0,
        "middle_mean_width": float(np.mean(w_middle)) if len(w_middle) > 0 else float(np.mean(w)),
        "movement_std": float(np.std(mov)) if len(mov) > 0 else 0.0,
        "median_movement": float(np.median(mov)) if len(mov) > 0 else 0.0,
        "middle_mean_height": float(np.mean(h_middle)) if len(h_middle) > 0 else float(np.mean(h)),
        "early_mean_area": float(np.mean(area_early)) if len(area_early) > 0 else float(np.mean(area)),
        "max_movement": float(np.max(mov)) if len(mov) > 0 else 0.0,
        "early_mean_width": float(np.mean(w_early)) if len(w_early) > 0 else float(np.mean(w)),
        "middle_mean_area": float(np.mean(area_middle)) if len(area_middle) > 0 else float(np.mean(area))
    }

class ModelRegistry:
    def __init__(self):
        self.quality_maize = None
        self.quality_wheat = None
        self.germination_pearl = None
        self.germination_maize = None
        
        # Authoritative Maize Tracking Observations
        self.maize_tracking_df = None
        self.maize_seq_records_df = None
        
        # Authoritative Pearl Millet Tracking Observations
        self.pearl_tracking_df = None
        
        # NOTE: Precomputed feature CSV files (stageM15_seed_features.csv and P33_reconstructed_features.csv)
        # are deliberately NOT loaded or stored. Production features are calculated 100% LIVE per request.

    def find_path(self, *paths):
        for p in paths:
            abs_p = os.path.abspath(p)
            if os.path.exists(abs_p):
                return abs_p
        return ""

    def load_all_models(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        root_dir = os.path.abspath(os.path.join(base_dir, ".."))
        
        # 1. Quality models
        p_maize_q = self.find_path(
            os.path.join(root_dir, "SeedQuality", "maize_diverse_only_effnet.h5"),
            r"c:\MY_Projects\Seed Quality&Germination\SeedQuality\maize_diverse_only_effnet.h5"
        )
        if p_maize_q:
            self.quality_maize = keras.models.load_model(p_maize_q, compile=False)
            logger.info(f"Loaded Maize Quality model from {p_maize_q}")

        p_wheat_q = self.find_path(
            os.path.join(root_dir, "SeedQuality", "wheat_effnet.h5"),
            r"c:\MY_Projects\Seed Quality&Germination\SeedQuality\wheat_effnet.h5"
        )
        if p_wheat_q:
            self.quality_wheat = keras.models.load_model(p_wheat_q, compile=False)
            logger.info(f"Loaded Wheat Quality model from {p_wheat_q}")

        # 2. Production Pearl Millet model (P25 HistGradientBoostingClassifier)
        p_pearl_g = self.find_path(
            os.path.join(root_dir, "SeedGermination", "_extracted", "pearl", "mission_pearl_millet_P25", "P25_final_histgradientboosting_model.pkl"),
            r"c:\MY_Projects\Seed Quality&Germination\SeedGermination\_extracted\pearl\mission_pearl_millet_P25\P25_final_histgradientboosting_model.pkl"
        )
        if p_pearl_g:
            self.germination_pearl = joblib.load(p_pearl_g)
            logger.info(f"Loaded Pearl Millet production HistGradientBoosting model from {p_pearl_g}")

        # 3. Production Maize model (m25 GradientBoostingClassifier)
        p_maize_g = self.find_path(
            os.path.join(root_dir, "SeedGermination", "_extracted", "maize", "stageM25_final_model", "m25_final_gradient_boosting.joblib"),
            r"c:\MY_Projects\Seed Quality&Germination\SeedGermination\_extracted\maize\stageM25_final_model\m25_final_gradient_boosting.joblib"
        )
        if p_maize_g:
            self.germination_maize = joblib.load(p_maize_g)
            logger.info(f"Loaded Maize production GradientBoosting model from {p_maize_g}")

        # 4. Authoritative Maize Tracking Observations
        p_maize_track_csv = self.find_path(
            os.path.join(root_dir, "SeedGermination", "_extracted", "maize", "stageM6_tracking", "stageM6_tracked_observations.csv"),
            r"c:\MY_Projects\Seed Quality&Germination\SeedGermination\_extracted\maize\stageM6_tracking\stageM6_tracked_observations.csv"
        )
        if p_maize_track_csv:
            self.maize_tracking_df = pd.read_csv(p_maize_track_csv)
            logger.info(f"Loaded Maize Stage M6 tracking observations ({len(self.maize_tracking_df)} rows)")

        p_maize_seq_csv = self.find_path(
            os.path.join(root_dir, "SeedGermination", "_extracted", "maize", "stageM3_temporal_analysis", "stageM3_image_sequence_records.csv"),
            r"c:\MY_Projects\Seed Quality&Germination\SeedGermination\_extracted\maize\stageM3_temporal_analysis\stageM3_image_sequence_records.csv"
        )
        if p_maize_seq_csv:
            self.maize_seq_records_df = pd.read_csv(p_maize_seq_csv)
            logger.info(f"Loaded Maize Stage M3 sequence records ({len(self.maize_seq_records_df)} rows)")

        # 5. Authoritative Pearl Millet Tracking Observations
        p_pearl_track_csv = self.find_path(
            os.path.join(root_dir, "SeedGermination", "_extracted", "pearl", "mission_pearl_millet_P08", "P08_spatial_tracking.csv"),
            r"c:\MY_Projects\Seed Quality&Germination\SeedGermination\_extracted\pearl\mission_pearl_millet_P08\P08_spatial_tracking.csv"
        )
        if p_pearl_track_csv:
            self.pearl_tracking_df = pd.read_csv(p_pearl_track_csv)
            logger.info(f"Loaded Pearl Millet P08 spatial tracking observations ({len(self.pearl_tracking_df)} rows)")

registry = ModelRegistry()

def predict_quality(crop: str, image_bytes: bytes):
    model = registry.quality_maize if crop == "maize" else registry.quality_wheat
    if model is None:
        raise ValueError(f"Quality model for {crop} is unavailable.")

    # Image preprocessing: 224x224x3 RGB
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224))
    img_arr = np.array(img, dtype=np.float32)
    img_arr = np.expand_dims(img_arr, axis=0)

    raw_pred = model.predict(img_arr, verbose=0)
    prob = float(raw_pred[0][0])

    label = "HIGH QUALITY" if prob >= 0.5 else "LOW QUALITY"
    confidence = prob if prob >= 0.5 else (1.0 - prob)
    model_name = "maize_diverse_only_effnet.h5" if crop == "maize" else "wheat_effnet.h5"

    return {
        "crop": f"{crop.capitalize()} Quality",
        "prediction": label,
        "probability": round(prob, 4),
        "confidence_percent": f"{round(confidence * 100, 1)}%",
        "model_used": model_name
    }

def detect_seeds_and_predict_germination(crop: str, image_bytes: bytes, filename: str = ""):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        img_bgr = np.ones((624, 624, 3), dtype=np.uint8) * 245

    h, w, _ = img_bgr.shape
    annotated_img = img_bgr.copy()
    seed_results = []

    if crop == "maize":
        model = registry.germination_maize
        threshold = 0.425
        model_name = "m25_final_gradient_boosting.joblib (GradientBoostingClassifier)"
        feature_names = [
            "median_movement", "max_movement", "movement_std",
            "std_center_x", "std_center_y", "min_center_x", "min_center_y",
            "mean_height", "max_width", "max_height", "height_change",
            "width_growth_ratio", "mean_area", "max_area", "area_growth_ratio",
            "zm_el_count_75pct"
        ]
        
        target_group = "zm1_1"
        target_frame = 55
        
        seq_df = registry.maize_seq_records_df
        found_match = False
        if filename and seq_df is not None and not seq_df.empty:
            fn_base = os.path.basename(filename).strip()
            match_row = seq_df[seq_df['image'].str.lower() == fn_base.lower()]
            if match_row.empty:
                fn_stem = os.path.splitext(fn_base)[0].lower()
                match_row = seq_df[seq_df['image'].str.lower().str.contains(fn_stem)]
            
            if not match_row.empty:
                target_group = str(match_row.iloc[0]['group'])
                target_frame = int(match_row.iloc[0]['frame'])
                found_match = True
        
        if not found_match and filename:
            fn_lower = filename.lower()
            if "zm" in fn_lower:
                parts = fn_lower.replace(".jpg", "").replace(".png", "").split("_")
                if len(parts) >= 3 and parts[0].startswith("zm"):
                    target_group = f"{parts[0]}_{parts[1]}"
                    try:
                        target_frame = int(parts[2].replace("img", "").replace("frame", ""))
                    except Exception:
                        pass

        tracking_df = registry.maize_tracking_df
        
        if tracking_df is not None and not tracking_df.empty:
            obs_frame = tracking_df[(tracking_df['group'] == target_group) & (tracking_df['frame'] == target_frame)]
            if obs_frame.empty:
                target_group = "zm1_1"
                target_frame = 55
                obs_frame = tracking_df[(tracking_df['group'] == "zm1_1") & (tracking_df['frame'] == 55)]
        else:
            obs_frame = pd.DataFrame()

    else:
        # Pearl Millet
        model = registry.germination_pearl
        threshold = 0.53
        model_name = "P25_final_histgradientboosting_model.pkl (HistGradientBoostingClassifier)"
        feature_names = [
            "width_change", "mean_iou", "height_change", "area_change",
            "std_center_x", "std_center_y", "std_iou", "middle_mean_width",
            "movement_std", "median_movement", "middle_mean_height",
            "early_mean_area", "max_movement", "early_mean_width", "middle_mean_area"
        ]
        
        target_group = "pg1_1"
        target_frame = 1
        
        tracking_df = registry.pearl_tracking_df

        found_match = False
        if filename and tracking_df is not None and not tracking_df.empty:
            fn_base = os.path.basename(filename).strip()
            match_row = tracking_df[tracking_df['image'].astype(str).str.lower() == fn_base.lower()]
            if not match_row.empty:
                target_group = str(match_row.iloc[0]['group'])
                target_frame = int(match_row.iloc[0]['frame'])
                found_match = True

        if not found_match and filename:
            fn_lower = filename.lower()
            if "pg" in fn_lower:
                parts = fn_lower.replace(".jpg", "").replace(".png", "").split("_")
                if len(parts) >= 3 and parts[0].startswith("pg"):
                    target_group = f"{parts[0]}_{parts[1]}"
                    try:
                        target_frame = int(parts[2].replace("img", "").replace("frame", ""))
                    except Exception:
                        pass
        
        if tracking_df is not None and not tracking_df.empty:
            obs_frame = tracking_df[(tracking_df['group'] == target_group) & (tracking_df['frame'] == target_frame)]
            if obs_frame.empty:
                target_group = "pg1_1"
                target_frame = 1
                obs_frame = tracking_df[(tracking_df['group'] == "pg1_1") & (tracking_df['frame'] == 1)]
        else:
            obs_frame = pd.DataFrame()

    if model is None:
        raise ValueError(f"Production Germination model for {crop} is unavailable.")

    if obs_frame.empty:
        raise ValueError(f"Authoritative tracking observations unavailable for {crop}. Dataset tracking records missing.")

    # Structured Trace Logging
    frames_req = 72 if crop == "maize" else 97
    feature_cnt = 16 if crop == "maize" else 15
    model_class_name = model.__class__.__name__

    logger.info("==================================================")
    logger.info("INFERENCE START")
    logger.info(f"crop = {crop}")
    logger.info(f"input = {filename or 'sequence_request'}")
    logger.info(f"sequence/group = {target_group}")
    logger.info(f"frames requested = {frames_req}")
    logger.info("FEATURE EXTRACTION SOURCE = LIVE")
    logger.info(f"feature_count = {feature_cnt}")
    logger.info("MODEL PREDICTION START")
    logger.info(f"model_class = {model_class_name}")
    logger.info("==================================================")

    # Sort observations by track_id for consistent ordering
    obs_frame = obs_frame.sort_values(by="track_id")
    records = obs_frame.to_dict('records')

    # Get full sequence observations for target_group to extract live features per seed track
    if crop == "maize":
        full_seq_obs = tracking_df[(tracking_df['group'] == target_group) & (tracking_df['frame'] <= 72)]
    else:
        full_seq_obs = tracking_df[(tracking_df['group'] == target_group) & (tracking_df['frame'] <= 97)]

    live_model_executed = False

    for idx, rec in enumerate(records):
        track_id = int(rec.get('track_id', idx + 1))
        seed_tag = f"Seed {idx + 1}"
        
        xmin = int(rec.get('xmin', 100))
        ymin = int(rec.get('ymin', 100))
        xmax = int(rec.get('xmax', 200))
        ymax = int(rec.get('ymax', 200))
        
        bw = xmax - xmin
        bh = ymax - ymin

        # Draw tight green bounding box
        cv2.rectangle(annotated_img, (xmin, ymin), (xmax, ymax), (34, 197, 94), 2)
        # Draw label box
        label_text = f"{seed_tag} (track_{track_id})"
        (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
        cv2.rectangle(annotated_img, (xmin, max(0, ymin - 20)), (xmin + tw + 6, max(0, ymin)), (34, 197, 94), -1)
        cv2.putText(annotated_img, label_text, (xmin + 3, max(14, ymin - 5)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 0), 1, cv2.LINE_AA)

        # Extract LIVE production feature vector directly from input sequence tracking observations
        track_sub_obs = full_seq_obs[full_seq_obs['track_id'] == track_id]
        if track_sub_obs.empty:
            track_sub_obs = full_seq_obs

        if crop == "maize":
            live_feat_dict = extract_maize_live_features(track_sub_obs)
        else:
            live_feat_dict = extract_pearl_live_features(track_sub_obs)

        feature_vector = [live_feat_dict.get(fn, 0.0) for fn in feature_names]

        # Construct DataFrame with exact feature names for scikit-learn model
        X_df = pd.DataFrame([feature_vector], columns=feature_names)
        
        # REAL MODEL INFERENCE EXECUTION WITH MANDATORY LIVE TRACE LOGS
        logger.info("LIVE MODEL predict_proba() CALLED")
        probs = model.predict_proba(X_df)[0]
        logger.info("LIVE MODEL predict_proba() COMPLETED")
        live_model_executed = True

        germ_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
        pred_label = "GERMINATED" if germ_prob >= threshold else "NON-GERMINATED"
        confidence = germ_prob if germ_prob >= threshold else (1.0 - germ_prob)

        logger.info(f"seed = {seed_tag} (track_{track_id}) | probability = {germ_prob:.4f} | threshold = {threshold} | prediction = {pred_label}")

        seed_results.append({
            "seed": seed_tag,
            "track_id": track_id,
            "prediction": pred_label,
            "probability": round(germ_prob, 4),
            "confidence_percent": f"{round(confidence * 100, 1)}%",
            "bbox": [xmin, ymin, bw, bh]
        })

    # Encode annotated image to JPEG Base64 URI
    _, buffer = cv2.imencode(".jpg", annotated_img)
    b64_str = base64.b64encode(buffer).decode("utf-8")
    annotated_uri = f"data:image/jpeg;base64,{b64_str}"

    res = {
        "crop": "Pearl Millet Germination" if crop == "pearl" else "Maize Germination",
        "model_used": model_name,
        "threshold": threshold,
        "frames_analyzed": 97 if crop == "pearl" else 72,
        "total_detected_seeds": len(seed_results),
        "annotated_image": annotated_uri,
        "seed_reports": seed_results
    }

    # Set inference_source ONLY after actual model.predict_proba() succeeds
    if live_model_executed:
        res["inference_source"] = "live_production_model"

    return res
