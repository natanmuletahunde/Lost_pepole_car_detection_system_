const { GoogleGenerativeAI } = require("@google/generative-ai");
const MissingPerson = require("../models/MissingPerson");
const MissingVehicle = require("../models/MissingVehicle");

// Clean search string for regex matching
function cleanKeyword(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

exports.chatWithAI = async (req, res) => {
  try {
    const { message, history, language } = req.body;
    const clientLang = language || "en";

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // ==========================================
    // 1. DYNAMIC DATABASE RETRIEVAL (RAG)
    // ==========================================
    // Common filler words/pronouns to exclude from database search matching to prevent false positives
    const stopwords = new Set([
      "what", "who", "are", "you", "the", "and", "for", "with", "from", 
      "this", "that", "these", "those", "she", "him", "her", "his", 
      "they", "them", "their", "there", "here", "how", "why", "when",
      "where", "your", "mine", "our", "not", "yes", "can", "will"
    ]);

    // Extract keywords from the user message to run a smart lookup
    const words = message
      .toLowerCase()
      .split(/[\s,.;:?!()]+/)
      .filter((w) => w.length > 2 && !stopwords.has(w)); // exclude stop words

    let personQuery = { status: "Active" };
    let vehicleQuery = { status: "Active" };

    if (words.length > 0) {
      const searchRegexes = words.map((w) => new RegExp(cleanKeyword(w), "i"));

      personQuery = {
        status: "Active",
        $or: [
          { firstName: { $in: searchRegexes } },
          { middleName: { $in: searchRegexes } },
          { lastName: { $in: searchRegexes } },
          { location: { $in: searchRegexes } },
          { description: { $in: searchRegexes } },
        ],
      };

      vehicleQuery = {
        status: "Active",
        $or: [
          { brand: { $in: searchRegexes } },
          { model: { $in: searchRegexes } },
          { color: { $in: searchRegexes } },
          { location: { $in: searchRegexes } },
          { plateNumber: { $in: searchRegexes } },
          { vehicleDescription: { $in: searchRegexes } },
        ],
      };
    }

    // Fetch matched active cases, fallback to fetching recent cases if no match
    let matchedPersons = await MissingPerson.find(personQuery)
      .limit(8)
      .lean();
    let matchedVehicles = await MissingVehicle.find(vehicleQuery)
      .limit(8)
      .lean();

    // If a search query yielded 0 results, get the most recent active cases to give the LLM basic context
    if (matchedPersons.length === 0) {
      matchedPersons = await MissingPerson.find({ status: "Active" })
        .sort({ reportDate: -1 })
        .limit(5)
        .lean();
    }
    if (matchedVehicles.length === 0) {
      matchedVehicles = await MissingVehicle.find({ status: "Active" })
        .sort({ lastSeenDate: -1 })
        .limit(5)
        .lean();
    }

    // Format databases as prompt context strings
    const personsContext = matchedPersons.map(p => 
      `- ${p.firstName} ${p.lastName || ""} (${p.gender}, Age ${p.age || "Unknown"}). Last seen: ${p.location || "Unknown"}. Description: ${p.description || "No description"}. Contact: ${p.reportedBy?.phone || "N/A"}`
    ).join("\n") || "No active missing person reports currently match this search.";

    const vehiclesContext = matchedVehicles.map(v => 
      `- ${v.brand} ${v.model || ""} (${v.color || "Unknown"}), Plate: ${v.plateNumber || "N/A"} (${v.region || ""} Code ${v.code || ""}). Last seen: ${v.location || "Unknown"}. Description: ${v.vehicleDescription || "No description"}. Contact: ${v.contactMethods?.phone || v.reportedBy?.phone || "N/A"}`
    ).join("\n") || "No active stolen/missing vehicle reports currently match this search.";

    // ==========================================
    // 2. GEMINI CLIENT INITIALIZATION & FALLBACK
    // ==========================================
    const apiKey = process.env.GEMINI_API_KEY;
    const isKeyUnconfigured = !apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "";

    // Dynamic localization templates for support instruction
    const langInstructions = {
      en: "Please respond in English.",
      am: "Please respond in Amharic (አማርኛ) only.",
      om: "Please respond in Oromo (Afaan Oromoo) only."
    };

    const targetLangInstruction = langInstructions[clientLang] || langInstructions.en;

    const systemInstruction = `
You are the Flega AI Assistant, a highly intelligent, empathetic, and multilingual virtual support bot for the "Flega" Lost Person and Stolen Vehicle Recovery Platform. 
Your goal is to help users find information about missing persons/stolen vehicles, guide them on how to report cases, explain subscription prices, and provide general support.

LANGUAGES SUPPORTED: English, Amharic (አማርኛ), and Oromo (Afaan Oromoo).
${targetLangInstruction} Match the user's selected language strictly. If the user shifts language, switch with them.

Here is the REAL-TIME active database context extracted from our system matching the user query:

=== ACTIVE MISSING PERSONS DATABASE ===
${personsContext}

=== ACTIVE STOLEN VEHICLES DATABASE ===
${vehiclesContext}

=== FLEGA SYSTEM MANUAL & PRICING ===
1. Reporting a Case: Go to dashboard, click 'Report Missing', select case type, fill in fields, pick location on map, upload >=2 photos, review and click submit.
2. Pricing Plans:
   - Free Account: Up to 1 active report, basic map search, and in-app notifications.
   - Premium Upgrade: 360 Birr/month (via Chapa). Includes unlimited reports, priority AI facial & plate search, instant SMS alerts, Telegram bot alerts, and live GPS tracking for smart belts.
3. GPS Belts: Smart wearable tracking devices for children or elderly that report coordinates directly to the user dashboard.

=== CONSTRANTS ===
- ALWAYS check the database context above first. If a user asks about a missing person or stolen car, cross-reference it. If you find a match, summarize details clearly and offer contact/sighting links.
- If a person/vehicle is NOT in the database, explain politely that they are not in the active listings, and explain how to register a report.
- Do NOT make up names or license plates that are not in the provided context database.
- Keep responses friendly, structured with Markdown, and concise (under 250 words).
`;

    // IF API KEY IS UNCONFIGURED: Respond locally with a premium rule-based RAG system
    if (isKeyUnconfigured) {
      console.log("⚠️ GEMINI_API_KEY is not configured. Running premium local engine...");

      // Simple keyword matching for fallback response
      const lowerMsg = message.toLowerCase();
      let responseText = "";

      const fallbackReplies = {
        en: {
          welcome: "Hello! I am your Flega AI assistant. How can I help you recover your lost items or query cases today?",
          pricing: `Our pricing plans:\n\n1. **Free Plan**: 1 active report, basic map matching, in-app notifications.\n2. **Premium Upgrade**: 360 Birr/month via Chapa, offering unlimited reports, priority AI matching, live SMS/Telegram alerts, and GPS smart belt pairing.`,
          howToReport: `To report a missing case:\n\n1. Log in and go to your dashboard.\n2. Click 'Report Missing' and select 'Person' or 'Vehicle'.\n3. Provide detailed traits (name, plate number, color, height).\n4. Mark the last known location on our interactive map.\n5. Upload 2 recent clear photos.\n6. Review and submit!`,
          gps: `Pair a smart GPS belt under your profile to track children or elderly family members in real-time right from your dashboard!`,
          searching: `Here are matching active cases found in our database:\n\n**Missing Persons:**\n${personsContext}\n\n**Missing Vehicles:**\n${vehiclesContext}\n\nTo see more details, check the active listings directories!`,
          unknown: `I'm here to help! I searched our records and found:\n\n**Missing Persons:**\n${personsContext.slice(0, 300)}...\n\n**Missing Vehicles:**\n${vehiclesContext.slice(0, 300)}...\n\nHow else can I assist you?`
        },
        am: {
          welcome: "ሰላም! እኔ የፍለጋ AI ረዳትዎ ነኝ። ዛሬ የጠፉ ሰዎችን ወይም ተሽከርካሪዎችን እንዴት እንድታገኝ ልረዳህ እችላለሁ?",
          pricing: `የአገልግሎት ክፍያ እና የምዝገባ እቅዶች፡\n\n1. **ነፃ አካውንት**፦ 1 የጠፋ ሪፖርት መመዝገብ ይችላሉ (መሰረታዊ የካርታ አጠቃቀምን ያካትታል)።\n2. **ፕሪሚየም አገልግሎት**፦ በወር 360 ብር (በቻፓ) ሲሆን ያልተገደበ ሪፖርት መመዝገብ፣ ፈጣን የAI ፊት እና የሰሌዳ አሰሳ፣ የፈጣን የኤስኤምኤስ እና የቴሌግራም ማሳሰቢያዎች፣ የጂፒኤስ ዘመናዊ ቀበቶዎችን በቀጥታ መከታተልን ያካትታል።`,
          howToReport: `ሪፖርት ለማድረግ እነዚህን ደረጃዎች ይከተሉ፡\n\n1. ወደ ዳሽቦርድዎ በመሄድ 'ሪፖርት ያድርጉ' የሚለውን ይጫኑ።\n2. የጉዳይ አይነት ይምረጡ (የጠፋ ሰው ወይም ተሽከርካሪ)።\n3. መሰረታዊ መለያዎችን (ስሞች፣ የሰሌዳ ቁጥሮች፣ ጾታ፣ ዕድሜ) ይሙሉ።\n4. በካርታው ላይ መጨረሻ የታየበትን ቦታ ይምረጡ።\n5. ቢያንስ 2 ፎቶዎችን ይስቀሉ እና ያስገቡ።`,
          gps: `የልጆችን ወይም አረጋውያንን ቦታ በቀጥታ ለመከታተል የጂፒኤስ ቀበቶ ማገናኘት ይችላሉ።`,
          searching: `በዳታቤዝ ውስጥ የተገኙ ተዛማጅ መረጃዎች፡\n\n**የጠፉ ሰዎች:**\n${personsContext}\n\n**የጠፉ ተሽከርካሪዎች:**\n${vehiclesContext}`,
          unknown: `በመረጃ ቋታችን ውስጥ የሚከተሉት ገባሪ ሪፖርቶች ይገኛሉ፡\n\n**የጠፉ ሰዎች:**\n${personsContext.slice(0, 300)}...\n\n**የጠፉ ተሽከርካሪዎች:**\n${vehiclesContext.slice(0, 300)}...\n\nበምን ልርዳዎት እችላለሁ?`
        },
        om: {
          welcome: "Akkam! Ani gargaara kee Flega AI Assistant ti. Har'a dhimma dhabame ykn konkolaataa bade deebisuuf akkamitti si gargaaruu danda'a?",
          pricing: `Akkaataa gatii fi qophii galmee keenyaa:\n\n1. **Herrega Bilisaa**: Gabaasa socho'aa 1 bilisaan gabaasuu dandeessu.\n2. **Premium Upgrade**: Ji'atti 360 birr (karaa Chapa), gabaasa daangaa malee galmeessuu, dursa AI facial fi license plate search, battalatti SMS fi Telegram bot alerts, GPS smart belts sochii isaanii live hordofuu.`,
          howToReport: `Dhimma bade gabaasuuf tarkaanfiiwwan hordofi:\n\n1. Daashboordii kee irratti 'Report Missing' cuqaasi.\n2. Gosa gabaasaa filadhu (Nama bade ykn Konkolaataa bade).\n3. Ibsa bu'uraa guuti (maqaa, gabatee konkolaataa, saala, umrii).\n4. Kaartaa interactive irratti bakka dhumaa filadhu.\n5. Suuraalee qulqulluu fi dhiyoo galchi (suuraa 2), erga ilaaltee submit cuqaasi.`,
          gps: `Smart GPS belts daashboordii keetti fe'uun daa'imman/maanguddoota live hordofuu dandeessu.`,
          searching: `Dhimmoota galmee keessatti argaman:\n\n**Namoota Badan:**\n${personsContext}\n\n**Konkolaattota Badan:**\n${vehiclesContext}`,
          unknown: `Galmee active ta'e keessaa kanneen argaman:\n\n**Namoota Badan:**\n${personsContext.slice(0, 300)}...\n\n**Konkolaattota Badan:**\n${vehiclesContext.slice(0, 300)}...\n\nMaal siif gochuu danda'a?`
        }
      };

      const replies = fallbackReplies[clientLang] || fallbackReplies.en;

      if (
        /\b(hello|hi|hey|ሰላም|እንደምን|akkam)\b/i.test(lowerMsg) || 
        lowerMsg.includes("who are you") || 
        lowerMsg.includes("what are you")
      ) {
        responseText = replies.welcome;
      } else if (
        lowerMsg.includes("report") || 
        lowerMsg.includes("register") || 
        lowerMsg.includes("submit") || 
        lowerMsg.includes("create") || 
        lowerMsg.includes("add") || 
        lowerMsg.includes("gabaas") || 
        lowerMsg.includes("galmeess") || 
        lowerMsg.includes("ሪፖርት") || 
        lowerMsg.includes("መመዝገብ") || 
        lowerMsg.includes("መዝግብ") || 
        lowerMsg.includes("ፍጠር")
      ) {
        responseText = replies.howToReport;
      } else if (lowerMsg.includes("price") || lowerMsg.includes("pricing") || lowerMsg.includes("free") || lowerMsg.includes("ክፍያ") || lowerMsg.includes("ነፃ") || lowerMsg.includes("gatii") || lowerMsg.includes("bilisa")) {
        responseText = replies.pricing;
      } else if (lowerMsg.includes("gps") || lowerMsg.includes("smart") || lowerMsg.includes("belt") || lowerMsg.includes("ቀበቶ")) {
        responseText = replies.gps;
      } else if (
        words.length > 0 &&
        words.some(w => {
          // Use whole word regex boundaries rather than loose substring includes
          const escapedWord = cleanKeyword(w);
          const regex = new RegExp(`\\b${escapedWord}\\b`, "i");
          return regex.test(personsContext) || regex.test(vehiclesContext);
        })
      ) {
        responseText = replies.searching;
      } else {
        responseText = replies.unknown;
      }

      // Add a helpful development disclaimer at the bottom
      responseText += `\n\n*(Note: Running in offline/fallback mode. Configure GEMINI_API_KEY in the backend .env to enable full, adaptive conversational AI)*`;

      return res.json({
        success: true,
        data: responseText,
      });
    }

    // ==========================================
    // 3. EXECUTE GEMINI API CALL
    // ==========================================
    console.log("🧠 Calling Google Gemini AI API...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction 
    });

    // Format chat history array into what Gemini expects: { role: 'user'|'model', parts: [{ text: '...' }] }
    const contents = [];
    if (history && Array.isArray(history)) {
      history.forEach((h) => {
        contents.push({
          role: h.sender === "user" ? "user" : "model",
          parts: [{ text: h.text }],
        });
      });
    }

    // Push the current message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const result = await model.generateContent({
      contents: contents,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    const response = await result.response;
    const aiText = response.text();

    res.json({
      success: true,
      data: aiText,
    });

  } catch (error) {
    console.error("❌ Chat Controller Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred in AI chat generation",
      error: error.message,
    });
  }
};
