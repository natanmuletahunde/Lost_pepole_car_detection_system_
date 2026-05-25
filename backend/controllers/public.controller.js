const axios = require('axios');
const MissingPerson = require('../models/MissingPerson');
const MissingVehicle = require('../models/MissingVehicle');
const User = require('../models/User');
const Sighting = require('../models/Sighting');
const ApiResponse = require('../utils/ApiResponse');

const getPublicStats = async (req, res, next) => {
  try {
    const [
      totalPersons,
      totalVehicles,
      resolvedPersons,
      resolvedVehicles,
      activeUsers,
      totalSightings
    ] = await Promise.all([
      MissingPerson.countDocuments(),
      MissingVehicle.countDocuments(),
      MissingPerson.countDocuments({ status: 'Resolved' }),
      MissingVehicle.countDocuments({ status: 'Resolved' }),
      User.countDocuments({ isActive: true }),
      Sighting.countDocuments()
    ]);

    const totalReports = totalPersons + totalVehicles + totalSightings;
    const resolvedCases = resolvedPersons + resolvedVehicles;
    // Mock devices connected by activeUsers + some margin for this metric
    const devicesConnected = activeUsers * 2 + 150; 

    return ApiResponse.success(res, 'Public stats retrieved', {
      stats: {
        totalReports,
        resolvedCases,
        activeUsers,
        devicesConnected
      }
    });
  } catch (error) {
    next(error);
  }
};

const askAIAssistant = async (req, res, next) => {
  try {
    const { messages, lang } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'OpenRouter API key is not configured.'
      });
    }

    const systemPrompt = `You are Flega AI Assistant (የፍለጋ AI ረዳት), a 24/7 Virtual Support assistant for the Flega platform, helping users recover lost items, missing persons, or vehicles.
Use the following context to answer questions:
Selected Language: ${lang === 'am' ? 'Amharic (አማርኛ)' : lang === 'om' ? 'Afaan Oromoo' : 'English'}

About Flega:
- **Reporting a case**:
  1. Go to dashboard and click 'Report Missing'.
  2. Select Case Type (Missing Person, Missing Vehicle, or Special Case).
  3. Fill in basic traits (names, plate numbers, colors, gender, age, height).
  4. Select 'Last Known Location' on the interactive map.
  5. Upload recent clear photos (minimum 2 files required).
  6. For special categories (e.g. mentally ill), upload mandatory files like a doctor's report.
  7. Review all sections and click 'Submit Report'.

- **How AI matching / cameras work**:
  1. Cameras scan public spaces and CCTV feeds in real time.
  2. The AI Matcher extracts facial features and license plate patterns.
  3. The engine cross-references sightings against our database of active cases.
  4. When a verified match is found, notifications are immediately sent.
  5. Users receive alerts with exact map coordinates via In-App message, Email, or Telegram bot.

- **Pricing / subscription**:
  1. **Free Account**: Users get 1 active report for free, including basic map matching and in-app alerts.
  2. **Premium Upgrade**: Starting at 360 birr/month (processed securely via Chapa), supporting:
     - Unlimited reports filed.
     - Priority AI facial/license plate search.
     - Real-time SMS and Telegram bot alerts.
     - Live GPS tracking for smart belts.

- **Other Features**:
  1. Monitor Alerts: Search missing people or stolen cars on public listing directories.
  2. Submit Sightings: Help the community by pinning sightings on the interactive map.
  3. Track Devices: Pair smart GPS belts under your profile to track kids/elderly.
  4. Receive Notifications: Connect Telegram account for instant real-time alerts.

Guidelines for response:
- Answer in the user's selected language: ${lang === 'am' ? 'Amharic' : lang === 'om' ? 'Afaan Oromoo' : 'English'}.
- Be friendly, concise, professional, and empathetic.
- If a question is unrelated to Flega, answer helpful information but gently guide them back to how Flega can help them.
- Format responses nicely (using bullet points and markdown if helpful).`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }))
    ];

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-chat',
        messages: apiMessages,
        stream: false,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Flega'
        },
        timeout: 25000
      }
    );

    const replyText = response.data.choices[0].message.content;

    return ApiResponse.success(res, 'AI reply retrieved', { reply: replyText });
  } catch (error) {
    console.error('OpenRouter Proxy Error:', error.response?.data || error.message);
    next(error);
  }
};

module.exports = {
  getPublicStats,
  askAIAssistant
};
