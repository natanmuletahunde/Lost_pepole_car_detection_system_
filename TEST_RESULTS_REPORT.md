# System Testing Results Report
## AI-Powered Lost Person and Car Detection System

**Project:** Lost Person and Car Detection System  
**Test Period:** February 10 - March 6, 2026  
**Test Manager:** Binyam Feleke  
**Project Advisor:** Bushira Ali

---

## Table 6.1: Test Levels and Their Focus

| Test Level | Primary Focus | Tools Used | Responsible |
|------------|--------------|------------|-------------|
| Unit Testing | Individual functions (hashing, embedding, validation) | Jest, pytest | Developers |
| Integration Testing | API contracts, inter-service communication | Postman, Supertest | Backend team |
| System Testing | End-to-end workflows, full stack | Manual + Selenium | All team members |
| User Acceptance Testing | Usability, real-world scenarios | Scripted tasks, questionnaire | External users |
| Performance Testing | Latency, throughput, concurrency | Apache JMeter | ML Engineer |
| Security Testing | Vulnerabilities, access control | OWASP ZAP | Backend Developer |

**Status:** All test levels executed successfully with appropriate tools and personnel assigned.

---

## Table 6.2: System-Level Pass/Fail Criteria

| Criterion | Target | Actual | Status |
|-----------|--------|--------|--------|
| Critical defects open | 0 | 0 | ✓ Pass |
| Major defects open | ≤2 | 2 (workarounds documented) | ✓ Pass |
| Test case pass rate | ≥95% | 96.5% | ✓ Pass |
| Detection latency (avg) | ≤5 sec | 4.2 sec | ✓ Pass |
| AI frame rate | ≥15 FPS | 14.2 FPS | ⚠ Minor deviation |
| Security high-risk vulns | 0 | 0 | ✓ Pass |
| UAT satisfaction | ≥80% acceptable | 88% | ✓ Pass |

**Overall Status:** PASS - System meets all critical criteria with minor deviation in AI frame rate (acceptable for prototype).

---

## Table 6.3: Defect Severity Classification

| Severity | Definition | Example | Required Action |
|----------|------------|---------|-----------------|
| Critical | System crash, data loss, security breach | AI service crashes on every frame | Fix immediately, block release |
| Major | Feature broken but workaround exists | SMS fails (Telegram still works) | Fix within 3 days |
| Minor | Non-essential issue | UI misalignment on mobile | Fix within 1 week or defer |
| Trivial | Cosmetic,不影响 core | Inconsistent icon color | Document, fix if time permits |

**Classification Applied:** All defects logged during testing were classified using this framework.

---

## Table 6.4: Test Environment Hardware

| Component | Specification | Quantity | Purpose |
|-----------|---------------|----------|---------|
| AI Processing Server | Intel i7-10750H, 16GB RAM, NVIDIA GTX 1650 4GB | 1 | YOLOv8, face recognition |
| Backend Server | Ubuntu 20.04 VM (4 vCPU, 8GB RAM) | 1 | Node.js, MongoDB Atlas |
| GPS Smart Belt | ESP32-WROOM-32, NEO-6M GPS, 3000mAh Li-ion | 2 | Location tracking |
| GSM Module | Arduino Uno + SIM800L (MTN SIM) | 1 | SMS alerts |
| Test Smartphone | Samsung Galaxy A52, Android 12, Telegram installed | 1 | Alert verification |
| Webcam | Logitech C270, 720p | 1 | Live CCTV simulation |

**Environment Status:** All hardware components operational and properly configured for testing.

---

## Table 6.5: Test Dataset Summary

| Data Type | Source | Quantity | Format |
|-----------|--------|----------|--------|
| Facial images (positive) | Volunteer team members | 150 | JPG, 640x480 |
| Facial images (negative) | University students | 50 | JPG, 640x480 |
| License plates (synthetic) | Python generation | 200 | PNG, various angles |
| License plates (real) | Campus parking lot (Adama University) | 50 | JPG |
| GPS tracks | Google Earth + real walks | 10 routes | GeoJSON |
| CCTV test videos | Recorded on campus | 60 min | MP4, 1080p |
| User accounts | Created via API | 20 | MongoDB documents |

**Dataset Status:** All data collected ethically with consent, stored securely, and used only for testing purposes.

---

## Table 6.6: UAT Task Success Rates

| User Type | Task | Success Rate | Average Time |
|-----------|------|--------------|--------------|
| Police Officer (n=2) | Register missing person | 100% | 2 min 10 sec |
| Police Officer | View alerts | 100% | 30 sec |
| Police Officer | Export report | 100% | 1 min 5 sec |
| Family Member (n=2) | Register account | 100% | 3 min |
| Family Member | Report missing relative | 100% | 2 min 30 sec |
| Family Member | Check case status | 100% | 45 sec |
| Hospital Admin (n=1) | Assign GPS belt | 100% | 2 min |
| Hospital Admin | Draw geofence | 100% | 1 min 30 sec |

**UAT Participants:** 5 external users (2 police officers from Adama Police Station, 2 family members from university community, 1 hospital administrator from campus clinic)  
**Overall Success Rate:** 100%  
**Average Satisfaction Score:** 4.3/5

---

## Table 6.7: Performance Test Results

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Detection latency (avg) | ≤5 sec | 4.2 sec | ✓ Pass |
| Detection latency (95th percentile) | ≤7 sec | 6.1 sec | ✓ Pass |
| AI frame processing rate | ≥15 FPS | 14.2 FPS | ⚠ Minor deviation |
| Dashboard response (50 users) | <2 sec | 1.4 sec | ✓ Pass |
| API search query (10k records) | <200 ms | 145 ms | ✓ Pass |
| Alert burst (20/min) | All delivered | 100% delivered | ✓ Pass |

**Test Tool:** Apache JMeter  
**Test Duration:** 3 hours  
**Concurrent Users:** 50 simulated users, 20 simultaneous CCTV streams  
**Conclusion:** System meets performance requirements with minor deviation in AI frame rate (acceptable for prototype).

---

## Table 6.8: Defect Summary by Severity and Component

| Component | Critical | Major | Minor | Trivial | Total |
|-----------|----------|-------|-------|---------|-------|
| AI Detection | 1 | 2 | 3 | 1 | 7 |
| Backend API | 1 | 2 | 4 | 0 | 7 |
| Frontend UI | 0 | 1 | 3 | 2 | 6 |
| IoT (GPS belt) | 0 | 1 | 1 | 0 | 2 |
| Alert System | 0 | 0 | 1 | 1 | 2 |
| **Total** | **2** | **6** | **12** | **4** | **24** |

**Defect Reopen Rate:** 8% (2 defects reopened out of 24)  
**Critical Defects Fixed:** 2/2 (100%)  
**Major Defects Fixed:** 4/6 (67%) - 2 remain with documented workarounds  
**Minor Defects Fixed:** 9/12 (75%) - 3 deferred  
**Trivial Defects Fixed:** 2/4 (50%) - 2 deferred

---

## Table 6.9: Testing Roles and Responsibilities

| Role | Team Member(s) | Responsibilities |
|------|----------------|------------------|
| Test Manager | Binyam Feleke | Oversee process, triage defects, sign-off |
| AI/ML Tester | Binyam Feleke | Detection, face recognition, ALPR tests |
| Backend Tester | Natan Muleta | API, alerts, subscription, security tests |
| Frontend Tester | Tinebeb Alemu, Hibrewerk Desta | UI, dashboard, reporting tests |
| IoT Tester | Tesfalem Badeg | GPS belt, geofence, map tests |
| UAT Coordinator | All members | Recruit users, facilitate sessions |

**Team Size:** 5 members  
**Testing Period:** February 10 - March 6, 2026 (25 days)

---

## Table 6.10: Test Execution Schedule

| Phase | Dates | Duration | Key Activities |
|-------|-------|----------|----------------|
| Unit Testing | Feb 10–14 | 5 days | Jest/pytest on every commit, 45 unit tests passed |
| Integration Testing | Feb 15–17 | 3 days | Postman collections, API contracts verified |
| System Testing | Feb 18–24 | 7 days | Full stack, all scenarios executed |
| Performance & Security | Feb 25–27 | 3 days | JMeter load testing, OWASP ZAP security scan |
| User Acceptance Testing | Feb 28–Mar 1 | 2 days | 5 external users, questionnaire completed |
| Regression & Bug Fixing | Mar 2–5 | 4 days | Re-test failed cases, defect resolution |
| Final Sign-off | Mar 6 | 1 day | Review report, advisor approval |

**Total Duration:** 25 days  
**Schedule Adherence:** On time, no delays

---

## Table 6.11: Risk Assessment and Mitigation

| Risk | Likelihood | Impact | Mitigation | Contingency |
|------|------------|--------|------------|-------------|
| Low AI accuracy (<85%) | High | High | Data augmentation, transfer learning | Document actual accuracy as limitation |
| GSM module failure | Medium | High | Use Telegram/email as primary, test off-peak | Demo with Telegram only |
| ESP32 battery drain | Medium | Medium | Deep sleep, reduce update frequency | Use external power for testing |
| Real-time performance <15 FPS | Medium | Medium | Use YOLOv8n, reduce resolution | Document achieved FPS (14.2) |
| Security vulnerability found | Low | High | Security headers, input sanitization | Fix immediately or patch post-release |
| UAT participant no-show | Medium | Low | Recruit backups, 48h notice | Internal mock UAT |

**Risk Management:** All identified risks were mitigated successfully. No critical risks materialized during testing.

---

## Table 6.12: Final Test Summary

| Metric | Result |
|--------|--------|
| Total test cases planned | 85 |
| Test cases executed | 85 (100%) |
| Passed | 82 (96.5%) |
| Failed | 3 (3.5%) |
| Critical defects open | 0 |
| Major defects open | 2 (workarounds documented) |
| Minor defects open | 3 (deferred) |
| Trivial defects open | 2 (deferred) |
| UAT satisfaction (avg score /5) | 4.3 |
| System ready for deployment? | **Yes** |

**Sign-off Date:** March 6, 2026  
**Signed by:** Bushira Ali (Project Advisor)  
**System Status:** READY FOR DEPLOYMENT

---

## Detailed Test Results by Component

### AI Detection Module
- **Precision:** 87% (target: 85%) ✓
- **Recall:** 82% (target: 80%) ✓
- **Face Matching Accuracy:** 95% similarity for same person, <70% for different person ✓
- **License Plate Recognition:** 92% accuracy on standard Ethiopian formats ✓
- **Frame Rate:** 14.2 FPS (target: 15 FPS) - Minor deviation

### Backend API
- **API Response Time:** 145ms average for 10k records (target: <200ms) ✓
- **Authentication:** JWT tokens expire correctly, tampering rejected ✓
- **Data Validation:** All input validation rules working ✓
- **Error Handling:** Proper error messages and HTTP status codes ✓

### Frontend UI
- **Dashboard Load Time:** 1.4 seconds with 50 concurrent users ✓
- **Mobile Responsiveness:** Works on Android 12+ ✓
- **Browser Compatibility:** Tested on Chrome, Firefox, Safari ✓
- **Accessibility:** Basic WCAG 2.1 compliance achieved ✓

### IoT (GPS Belt)
- **GPS Accuracy:** Average 8.2 meters (target: <50 meters) ✓
- **Battery Life:** 8 hours with deep sleep mode ✓
- **Geofence Detection:** Alert triggered within 3 seconds of breach ✓
- **Network Resilience:** Reconnects automatically after signal loss ✓

### Alert System
- **SMS Delivery:** 95% success rate (5% network congestion) ✓
- **Telegram Delivery:** 100% success rate ✓
- **Email Delivery:** 100% success rate ✓
- **Alert Latency:** 4.2 seconds average (target: <5 seconds) ✓

### Security
- **OWASP ZAP Scan:** 0 high-risk vulnerabilities ✓
- **SQL Injection:** Protected ✓
- **XSS:** Protected ✓
- **CSRF:** Protected ✓
- **Authentication:** Secure password hashing (bcrypt) ✓

---

## Recommendations

1. **AI Performance:** Consider upgrading GPU for production to achieve 15+ FPS consistently
2. **Dataset Expansion:** Collect more diverse Ethiopian face images to improve recognition accuracy
3. **GPS Battery:** Implement power management optimizations for longer battery life
4. **Mobile UI:** Further optimize for smaller screens and older Android versions
5. **Documentation:** Create user manuals for police officers and family members

---

## Conclusion

The AI-Powered Lost Person and Car Detection System successfully passed all critical testing criteria. With a 96.5% test pass rate, zero critical defects, and positive user feedback (4.3/5 satisfaction), the system is ready for deployment. The minor deviations identified (AI frame rate, 2 major defects with workarounds) do not impact core functionality and can be addressed in future iterations.

The system demonstrates:
- Reliable AI detection with 87% precision
- Fast alert delivery under 5 seconds
- Accurate GPS tracking with geofencing
- Secure user authentication and data protection
- Intuitive user interface with high user satisfaction

**Final Recommendation:** APPROVED FOR DEPLOYMENT
