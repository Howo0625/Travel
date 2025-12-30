import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are "TravelGenie", a world-class, expert travel planning assistant for a mobile app. 
Your goal is to help users plan trips by providing detailed itineraries, transport comparisons (like Rome2Rio/Omio), accommodation suggestions (like Booking/Agoda), and route optimization.

**Capabilities & Behavior:**
1.  **Transport Expert:** When asked about getting from A to B, compare options (Train, Bus, Flight, Self-drive). Provide duration, approximate cost, and mark the "Recommended" option based on comfort/price balance.
2.  **Itinerary Planner:** Create detailed day-by-day itineraries. Organize spots logically (geographically). Include travel time between spots (Google Maps style).
3.  **Accommodation:** Recommend hotels based on budget and location. List Pros/Cons.
4.  **Tone:** Friendly, professional, and encouraging.
5.  **Tools:** Use 'googleSearch' to find real-time schedules, prices, and facts. Use 'googleMaps' to find accurate locations and ratings.

**Structured Output Rule:**
If the user's request implies creating or updating a travel plan (e.g., "Plan a 5 day trip", "Add a hotel"), you MUST include a JSON representation of the plan at the END of your text response.
Wrap the JSON strictly in this block:
\`\`\`json_plan
{
  "title": "Trip Title",
  "destinations": ["City A", "City B"],
  "dates": "YYYY-MM-DD to YYYY-MM-DD",
  "summary": "Short summary...",
  "transportOptions": [
     { "type": "Train", "route": "A to B", "duration": "2h", "cost": "$50", "details": "...", "recommendationScore": 9, "isRecommended": true }
  ],
  "accommodations": [
     { "name": "Hotel X", "type": "Hotel", "pricePerNight": "$100", "rating": "4.5", "location": "City Center", "pros": ["Close to metro"], "cons": ["Small rooms"], "reason": "Best value" }
  ],
  "days": [
    {
      "day": 1,
      "date": "2023-12-20",
      "city": "Tokyo",
      "theme": "Arrival & Asakusa",
      "activities": [
         { "time": "10:00", "placeName": "Senso-ji", "description": "...", "type": "sightseeing", "googleMapsLink": "..." }
      ]
    }
  ],
  "tips": ["Wear coat", "Buy JR pass"]
}
\`\`\`

If the user is just chatting (e.g., "Hello", "Thanks"), do NOT output the JSON block.
ALWAYS provide a helpful text response before the JSON block explaining what you did.
`;

let chatSession: Chat | null = null;

export const getChatSession = () => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash', // Switched to 2.5-flash to support Google Maps grounding
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }, { googleMaps: {} }], 
      },
    });
  }
  return chatSession;
};

export const sendMessageStream = async (
  message: string,
  onChunk: (text: string) => void,
  onPlanUpdate: (planJson: string) => void
) => {
  const chat = getChatSession();
  
  try {
    const result = await chat.sendMessageStream({ message });
    
    let fullText = "";
    
    for await (const chunk of result) {
        const text = (chunk as GenerateContentResponse).text;
        if (text) {
            fullText += text;
            // We stream the text to the UI, but we hide the JSON block from the visual chat stream if possible
            // A simple way is to pass the raw text and let the UI handle the split, 
            // OR we filter it here. Let's pass raw and let UI handle parsing to avoid lag.
            onChunk(text); 
        }
    }

    // After stream completes, check for JSON plan
    const jsonMatch = fullText.match(/```json_plan\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        onPlanUpdate(jsonMatch[1]);
    }

  } catch (error) {
    console.error("Gemini Error:", error);
    onChunk("\n\n(Error: Unable to process request at this time. Please check your network or API key.)");
  }
};

export const resetChat = () => {
    chatSession = null;
}