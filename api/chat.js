module.exports = async function handler(req, res) {
  try {
    console.log("BODY:", req.body);
    console.log("BODY:", req.body);

const chatHistory = req.body.chatHistory;

if (!chatHistory) {
  return res.status(400).json({ error: "No chat history provided" });
}

    if (!chatHistory) {
  return res.status(400).json({ error: "No chat history provided" });
}

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
  {
  role: "system",
  content: `
You are a highly intelligent and analytical AI assistant.

When answering:
1. Understand the question deeply.
2. Break the problem into smaller parts.
3. Think step by step internally.
4. Provide a clear and structured final answer.
5. If the problem is complex, explain reasoning logically.

Do not give short shallow answers.
Always prioritize clarity and intelligence.
`
},
  ...chatHistory
],
          max_tokens: 500,
        }),
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.error("Groq error:", text);
      return res.status(500).json({ error: text });
    }

    const data = JSON.parse(text);

    return res.status(200).json({
      reply: data.choices[0].message.content,
    });
  } catch (err) {
    console.error("SERVER CRASH:", err);
    return res.status(500).json({ error: err.message });
  }
};
