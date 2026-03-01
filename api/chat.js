export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ message: "API is working. Use POST." });
  }

  const { message } = req.body;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
  model: "llama-3.1-8b-instant",
 messages: [
  {
    role: "system",
    content: "Bạn là một trợ lý AI thông minh, trả lời rõ ràng, dễ hiểu, không trả lời qua loa."
  },
  {
    role: "user",
    content: message
  }
]
})
    });

    const data = await response.json();

    const reply = data.choices?.[0]?.message?.content || "Lỗi Groq API";

    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
