const AI_SERVER =
  "https://ai-photo-backend-8le8.onrender.com";

// ==========================================
// Check AI Server
// ==========================================

export async function checkAI() {
  try {
    const res = await fetch(`${AI_SERVER}/`);

    const text = await res.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (!res.ok) {
      throw new Error(
        data.detail ||
          data.message ||
          `AI server error: ${res.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("❌ AI Server Check Failed:", error);
    throw error;
  }
}

// ==========================================
// Process Event
// ==========================================

export async function processEvent(eventId) {
  try {
    console.log("🤖 Starting AI Processing...");
    console.log("📌 Event ID:", eventId);
    console.log("🌐 AI Server:", AI_SERVER);

    const res = await fetch(
      `${AI_SERVER}/process-event`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          eventId: eventId,
        }),
      }
    );

    const text = await res.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        message: text,
      };
    }

    console.log(
      "🤖 AI Processing Response:",
      data
    );

    if (!res.ok) {
      throw new Error(
        data.detail ||
          data.message ||
          `AI processing failed: ${res.status}`
      );
    }

    return data;

  } catch (error) {
    console.error(
      "❌ AI Processing Error:",
      error
    );

    throw error;
  }
}