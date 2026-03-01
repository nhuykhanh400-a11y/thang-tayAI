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
    content: "Bạn là chuyên gia ngôn ngữ tiếng Việt.\nBạn có khả năng chuẩn hóa mọi câu tiếng Việt không dấu, viết tắt, sai chính tả nhẹ thành câu chuẩn trước khi xử lý.\nLuôn nội bộ chuyển câu của người dùng sang tiếng Việt đầy đủ rồi mới phân tích.\nKhông được hiểu sai teen code.\nNếu câu quá mơ hồ, chọn nghĩa phổ biến nhất trong ngữ cảnh.\nKhông nhắc lại câu hỏi.\nTrả lời ngắn gọn, rõ ràng và thông minh."
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
