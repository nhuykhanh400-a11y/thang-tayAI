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
  temperature: 0.3,
  top_p: 0.35,
messages: [
  {
    role: "system",
    content: "Bạn là một AI thông minh, phân tích tốt.\nKhông lặp lại câu hỏi.\nKhông được mở đầu bằng 'Tôi hiểu...' hoặc các câu tương tự.\nTrả lời trực tiếp, tự nhiên, rõ ràng.\nNgắn gọn, đủ ý.\nHiểu tiếng Việt không dấu và teen code.\nChỉ giải thích dài khi người dùng yêu cầu."
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
