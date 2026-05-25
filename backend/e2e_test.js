const http = require('http');
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api/v1';

async function fetchApi(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING END-TO-END TESTS ===");
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // 1. Register User
    const userEmail = `testuser_${Date.now()}@test.com`;
    const userPhone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;
    console.log(`[1] Registering User: ${userEmail}`);
    let res = await fetchApi('/auth/register', 'POST', {
      firstName: 'Test',
      lastName: 'User',
      email: userEmail,
      phone: userPhone,
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });
    
    res = await fetchApi('/auth/login', 'POST', {
      loginValue: userEmail,
      password: 'Password123!'
    });
    if (res.status !== 200) throw new Error("User Login Failed");
    const userToken = res.data.data.token;
    console.log("User Logged In successfully.");

    // 2. Register Admin
    const adminEmail = `admin_${Date.now()}@test.com`;
    const adminPhone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;
    console.log(`\n[2] Registering Admin: ${adminEmail}`);
    res = await fetchApi('/auth/register', 'POST', {
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      phone: adminPhone,
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });
    
    // Elevate admin via DB
    await User.findOneAndUpdate({ email: adminEmail }, { role: 'admin' });

    res = await fetchApi('/auth/login', 'POST', {
      loginValue: adminEmail,
      password: 'Password123!'
    });
    const adminToken = res.data.data.token;
    console.log("Admin Logged In successfully. Elevated to 'admin' role via DB.");

    // 3. User Submits Feedback
    console.log("\n[3] User Submitting Feedback...");
    res = await fetchApi('/feedback', 'POST', {
      subject: "Great app",
      message: "I love this app!",
      type: "suggestion",
      category: "general",
      priority: "low"
    }, userToken);
    console.log("Submit Feedback Status:", res.status, res.data);
    let feedbackId = null;
    if (res.data.success && res.data.data) {
       feedbackId = res.data.data._id;
    }

    // 4. Admin Replies to Feedback
    if (feedbackId) {
      console.log(`\n[4] Admin Replying to Feedback (${feedbackId})...`);
      res = await fetchApi(`/admin/feedback/${feedbackId}/respond`, 'PATCH', {
        response: "Thank you for the feedback!",
        status: "resolved"
      }, adminToken);
      console.log("Admin Reply Status:", res.status, res.data);
    }

    // 5. User creates and Upgrades Subscription
    console.log("\n[5] User Creating & Upgrading Subscription...");
    res = await fetchApi('/subscriptions', 'POST', {
      planId: "free"
    }, userToken);
    res = await fetchApi('/subscriptions/upgrade', 'PATCH', {
      planId: "premium_monthly" 
    }, userToken);
    console.log("Subscription Upgrade Status:", res.status, res.data);

    // 6. User Submits Missing Person Case
    console.log("\n[6] User Submitting Missing Person Case...");
    res = await fetchApi('/missing-persons', 'POST', {
      firstName: "John",
      lastName: "Doe",
      age: 30,
      gender: "Male",
      lastSeenLocation: "Addis Ababa",
      lastSeenDate: new Date().toISOString(),
      images: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="]
    }, userToken);
    console.log("Submit Case Status:", res.status, res.data);
    let caseId = null;
    if (res.data.success && res.data.data) {
       caseId = res.data.data._id;
    }

    // 7. Admin Approves Case
    if (caseId) {
       console.log(`\n[7] Admin Approving Case (${caseId})...`);
       res = await fetchApi(`/admin/cases/person/${caseId}/verify`, 'PATCH', {
         status: 'approved'
       }, adminToken);
       console.log("Case Approval Status:", res.status, res.data);
    }

    // 8. Admin Sends Bulk Notification
    console.log("\n[8] Admin Sending Bulk Notification...");
    res = await fetchApi('/admin/notifications/bulk', 'POST', {
       title: "System Update",
       message: "We have updated the system.",
       targetAudience: "all"
    }, adminToken);
    console.log("Bulk Notification Status:", res.status, res.data);

    // 9. User Checks Notifications
    console.log("\n[9] User Checking Notifications...");
    res = await fetchApi('/notifications/my', 'GET', null, userToken);
    console.log("User Notifications Status:", res.status, "Count:", res.data.data?.length || 0, res.data);

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();

runTests();
