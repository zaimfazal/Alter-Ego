const fs = require('fs');
const axios = require('axios');

async function test() {
  try {
    // Read the .env file
    const envContent = fs.readFileSync('.env', 'utf-8');
    const keyMatch = envContent.match(/EXPO_PUBLIC_OPENROUTER_API_KEY=(.*)/);
    const key = keyMatch ? keyMatch[1].trim() : null;

    if (!key) {
      console.error("No key found in .env");
      return;
    }

    console.log("Key found, length:", key.length, "Starts with:", key.substring(0, 5));

    console.log("Testing gpt-oss-20b:free...");
    const res = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-oss-20b:free',
        messages: [{ role: 'user', content: 'Test.' }],
        reasoning: { enabled: true }
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://alterego.app',
          'X-Title': 'Alter Ego MVP'
        }
      }
    );
    console.log("20b SUCCESS!");

    console.log("Testing gpt-oss-120b:free...");
    const res2 = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-oss-120b:free',
        messages: [{ role: 'user', content: 'Test.' }],
        reasoning: { enabled: true }
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://alterego.app',
          'X-Title': 'Alter Ego MVP'
        }
      }
    );
    console.log("120b SUCCESS!");


  } catch (error) {
    if (error.response) {
      console.error("\n--- API ERROR ---");
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    } else {
      console.error("Network/Request error:", error.message);
    }
  }
}

test();
