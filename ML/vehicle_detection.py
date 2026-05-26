import cv2
import requests
import numpy as np
import time
import base64
import logging
from ultralytics import YOLO
from datetime import datetime
import easyocr

# ==============================
# CONFIG
# ==============================
BASE_URL = "http://127.0.0.1:5000"

VEHICLE_API = f"{BASE_URL}/api/v1/missing-vehicles"
DETECTION_API = f"{BASE_URL}/api/v1/detections"

RTSP_URL = 0

MIN_PLATE_CONFIDENCE = 0.50
DETECTION_COOLDOWN = 20 * 60

YOLO_MODEL = "yolov8n.pt"

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# ==============================
# LOAD MODELS
# ==============================
model = YOLO(YOLO_MODEL)
reader = easyocr.Reader(['en'])

# ==============================
# MISSING VEHICLES FETCHING & CACHING
# ==============================
last_vehicles_fetch = 0
cached_missing_vehicles = []

def fetch_missing_vehicles():
    try:
        res = requests.get(VEHICLE_API, timeout=5)
        if res.status_code == 200:
            data = res.json().get("data", [])
            logging.info(f"Successfully fetched {len(data)} missing vehicles from backend.")
            return data
    except Exception as e:
        logging.error(f"Error fetching missing vehicles: {e}")
    return []

def get_active_missing_vehicles():
    global last_vehicles_fetch, cached_missing_vehicles
    now = time.time()
    if now - last_vehicles_fetch > 30 or not cached_missing_vehicles:
        cached_missing_vehicles = fetch_missing_vehicles()
        last_vehicles_fetch = now
    return cached_missing_vehicles


last_detection = {}

# ==============================
# UTILS
# ==============================
def frame_to_base64(frame):
    # 🔥 FIX: smaller image to avoid payload overflow
    frame = cv2.resize(frame, (320, 240))

    _, buffer = cv2.imencode(
        ".jpg",
        frame,
        [cv2.IMWRITE_JPEG_QUALITY, 80]
    )

    return "data:image/jpeg;base64," + base64.b64encode(buffer).decode()


def should_send(plate):
    now = time.time()

    if plate in last_detection:
        if now - last_detection[plate] < DETECTION_COOLDOWN:
            logging.info(f"⏳ Cooldown active for {plate}")
            return False

    last_detection[plate] = now
    return True


def read_plate(vehicle_crop):
    try:
        results = reader.readtext(vehicle_crop)

        best_text = None
        best_conf = 0

        for (_, text, conf) in results:
            cleaned = text.upper().replace(" ", "").replace("-", "")

            if conf > best_conf:
                best_conf = conf
                best_text = cleaned

        return best_text, best_conf

    except Exception as e:
        logging.error(f"OCR Error: {e}")
        return None, 0


# ==============================
# SEND DETECTION (FIXED)
# ==============================
def send_detection(vehicle, plate, confidence, frame):

    data = {
        "type": "Car",
        "registrationId": str(vehicle["_id"]),
        "name": f"{vehicle.get('brand', '')} {vehicle.get('model', '')}",
        "licensePlate": plate,
        "vehicleBrand": vehicle.get("brand"),
        "vehicleModel": vehicle.get("model"),
        "vehicleColor": vehicle.get("color"),
        "confidence": round(float(confidence), 2),
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "behavior": "Vehicle Detected",
        "priority": "High" if confidence >= 0.85 else "Normal",

        # 🔥 FIXED IMAGE (smaller)
        "detectionImage": frame_to_base64(frame)
    }

    try:
        res = requests.post(DETECTION_API, json=data, timeout=10)

        # 🔥 IMPORTANT DEBUG FIX
        if res.status_code not in [200, 201]:

            logging.warning(f"API ERROR: {res.status_code}")
            logging.warning(f"Response: {res.text}")  # << KEY FIX

        else:
            logging.info(f"✅ SENT: {plate}")

    except Exception as e:
        logging.error(f"Send failed: {e}")


# ==============================
# MAIN SYSTEM
# ==============================
def run_vehicle_system():

    cap = cv2.VideoCapture(RTSP_URL)

    if not cap.isOpened():
        logging.error("Cannot open camera")
        return

    logging.info("🚗 Vehicle Detection Started")

    while True:

        ret, frame = cap.read()
        if not ret:
            continue

        results = model(frame)

        for result in results:
            for box in result.boxes:

                cls = int(box.cls[0])

                if cls not in [2, 3, 5, 7]:
                    continue

                x1, y1, x2, y2 = map(int, box.xyxy[0])
                crop = frame[y1:y2, x1:x2]

                if crop.size == 0:
                    continue

                plate, conf = read_plate(crop)

                if not plate:
                    continue

                logging.info(f"Plate: {plate} ({conf:.2f})")

                if conf < MIN_PLATE_CONFIDENCE:
                    continue

                # Dynamic matching against active missing vehicles from DB
                missing_vehicles = get_active_missing_vehicles()
                matched_vehicle = None
                cleaned_detected_plate = plate.upper().replace(" ", "").replace("-", "")

                for v in missing_vehicles:
                    v_plate = v.get("plateNumber", "").upper().replace(" ", "").replace("-", "")
                    if v_plate == cleaned_detected_plate:
                        matched_vehicle = v
                        break

                if matched_vehicle:
                    logging.info(f"🎯 MATCH FOUND: {matched_vehicle.get('brand')} {matched_vehicle.get('model')} with plate {plate}")
                    if should_send(plate):
                        send_detection(matched_vehicle, plate, conf, frame)
                else:
                    logging.info(f"ℹ️ Plate {plate} detected, but it does not match any registered missing vehicles.")

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(
                    frame,
                    plate,
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 255, 0),
                    2
                )

        cv2.imshow("Vehicle Detection", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    run_vehicle_system()