import cv2
import face_recognition
import requests
import os
import numpy as np
import time
import base64
from datetime import datetime
import logging

# ==============================
# CONFIG
# ==============================
BASE_URL = "http://localhost:5000"
PERSON_API = f"{BASE_URL}/api/v1/missing-persons"
DETECTION_API = f"{BASE_URL}/api/v1/detections"

RTSP_URL = 0
SAVE_DIR = "database"
CONFIDENCE_THRESHOLD = 0.5

# Performance Settings
SKIP_FRAMES = 4          # Process 1 out of every 4 frames
RESIZE_SCALE = 0.5       # Reduce image size for speed

os.makedirs(SAVE_DIR, exist_ok=True)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# ==============================
# UTILS
# ==============================
def frame_to_base64(frame):
    _, buffer = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return "data:image/jpeg;base64," + base64.b64encode(buffer).decode()

last_detection = {}

def should_send(person_id):
    if not person_id: 
        return True
    now = time.time()
    if person_id in last_detection and now - last_detection[person_id] < 20:
        return False
    last_detection[person_id] = now
    return True

# ==============================
# FETCH & ENCODE
# ==============================
def fetch_missing_persons():
    try:
        res = requests.get(PERSON_API, timeout=10)
        res.raise_for_status()
        data = res.json().get("data", [])
        logging.info(f"Fetched {len(data)} persons")
        return data
    except Exception as e:
        logging.error(f"Fetch failed: {e}")
        return []

def process_and_save_images(persons):
    saved = []
    for person in persons:
        name = f"{person.get('firstName','')} {person.get('lastName','')}".strip()
        for i, img_path in enumerate(person.get("images", [])):
            if not img_path: continue
            full_url = BASE_URL + img_path if not img_path.startswith("http") else img_path
            try:
                r = requests.get(full_url, timeout=10)
                r.raise_for_status()
                path = os.path.join(SAVE_DIR, f"{name.replace(' ','_')}_{i}.jpg")
                with open(path, "wb") as f: 
                    f.write(r.content)
                saved.append((name, path, person))
                logging.info(f"Saved: {name}")
            except Exception as e:
                logging.warning(f"Download failed: {e}")
    return saved

def load_encodings(saved):
    encodings, names, refs = [], [], []
    for name, path, person in saved:
        try:
            img = face_recognition.load_image_file(path)
            enc = face_recognition.face_encodings(img)
            if enc:
                encodings.append(enc[0])
                names.append(name)
                refs.append(person)
                logging.info(f"Encoded: {name}")
        except Exception as e:
            logging.error(f"Encoding failed: {e}")
    return encodings, names, refs

# ==============================
# SEND DETECTION (UPDATED - Sends frame as image)
# ==============================
def send_detection(person_id, name, confidence, frame):
    if not person_id: 
        return
    
    data = {
        "type": "Person",
        "registrationId": str(person_id),
        "name": name,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "confidence": round(float(confidence), 2),
        "priority": "High" if confidence > 0.7 else "Normal",
        "behavior": "Detected",
        "detectionImage": frame_to_base64(frame)   # This sends the detection frame
    }
    try:
        res = requests.post(DETECTION_API, json=data, timeout=10)
        if res.status_code in [200, 201]:
            logging.info(f"✅ SENT: {name} ({confidence:.2f})")
    except Exception as e:
        logging.error(f"Send failed: {e}")

# ==============================
# MAIN
# ==============================
def run_system():
    persons = fetch_missing_persons()
    saved = process_and_save_images(persons)
    encodings, names, refs = load_encodings(saved)
    if not encodings:
        logging.error("No encodings created!")
        return

    logging.info(f"✅ System ready with {len(encodings)} encodings")

    cap = cv2.VideoCapture(RTSP_URL)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    if not cap.isOpened():
        logging.error("Cannot open camera!")
        return

    logging.info("🎥 Camera started - Stand in front with good lighting")

    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret or frame is None:
            continue

        frame_count += 1

        if frame_count % SKIP_FRAMES != 0:
            cv2.imshow("Security Feed - Press Q to Quit", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            continue

        small_frame = cv2.resize(frame, (0, 0), fx=RESIZE_SCALE, fy=RESIZE_SCALE)
        rgb_small = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

        face_locs = face_recognition.face_locations(rgb_small)
        face_encs = face_recognition.face_encodings(rgb_small, face_locs)

        for (top, right, bottom, left), face_encoding in zip(face_locs, face_encs):
            top = int(top / RESIZE_SCALE)
            right = int(right / RESIZE_SCALE)
            bottom = int(bottom / RESIZE_SCALE)
            left = int(left / RESIZE_SCALE)

            distances = face_recognition.face_distance(encodings, face_encoding)
            best_match_index = np.argmin(distances)
            distance = distances[best_match_index]

            if distance < CONFIDENCE_THRESHOLD:
                confidence = 1 - distance
                name = names[best_match_index]
                person = refs[best_match_index]
                person_id = person.get("_id") or person.get("id")

                logging.info(f"🎯 MATCH FOUND: {name} ({confidence:.2f})")

                if should_send(person_id):
                    send_detection(person_id, name, confidence, frame)

                cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
                cv2.putText(frame, f"{name} {confidence:.2f}", (left, top-10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,255,0), 2)
            else:
                cv2.rectangle(frame, (left, top), (right, bottom), (0, 165, 255), 2)
                cv2.putText(frame, f"Unknown {distance:.2f}", (left, top-10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,165,255), 2)

        cv2.imshow("Security Feed - Press Q to Quit", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    
    cv2.destroyAllWindows()


if name == "main":
    run_system()