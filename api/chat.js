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
  temperature: 0.4,
  top_p: 0.45,
messages: [
  {
    role: "system",
    content: "Bạn là một AI rất thông minh, trả lời ngắn gọn, đúng trọng tâm.\nKhông được nhắc lại câu hỏi của người dùng.\nKhông được bắt đầu bằng các câu như: 'Tôi hiểu bạn đang hỏi...' hoặc diễn giải lại câu hỏi.\nNếu người dùng viết không dấu hoặc viết tắt, hãy tự động hiểu và trả lời bình thường.\nTrả lời tự nhiên, hơi hài hước nhẹ nếu phù hợp, nhưng súc tích."
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
