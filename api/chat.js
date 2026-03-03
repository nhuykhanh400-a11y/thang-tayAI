const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "No message provided" });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Bạn là một AI nói chuyện tự nhiên, thông minh, trả lời bằng tiếng Việt."
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "openai/gpt-oss-120b",
    });

    return res.status(200).json({
      reply: chatCompletion.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ reply: "AI đang lỗi 😢" });
  }
};
