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
You are an advanced AI assistant comparable to ChatGPT Plus.

You must:
- Think step by step internally before responding.
- Provide structured answers using headings or bullet points when useful.
- Explain reasoning clearly but not excessively long.
- Be precise and intelligent.
- Avoid unnecessary fluff.
- If uncertain, reason carefully instead of guessing.

For complex problems:
- Analyze deeply.
- Break into components.
- Solve each part logically.
- Conclude clearly.

Your goal is to provide expert-level responses.
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
