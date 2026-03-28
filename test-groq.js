const fs = require('fs');
const axios = require('axios');

async function test() {
  try {
    const envContent = fs.readFileSync('.env', 'utf-8');
    const keyMatch = envContent.match(/EXPO_PUBLIC_GROQ_API_KEY=(.*)/);
    const key = keyMatch ? keyMatch[1].trim() : null;

    if (!key) {
      console.error("No key found in .env");
      return;
    }

    console.log("Testing Groq endpoint with llama-3.1-8b-instant...");
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'Test.' }]
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("SUCCESS:", res.data.choices[0].message.content);

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
