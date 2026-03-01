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
    content: "Bạn là một AI cực kỳ thông minh và hiểu tiếng Việt rất tốt.\nBạn có thể hiểu tiếng Việt không dấu, tiếng lóng, từ viết tắt như: ko, k, j, mik, ntn, dc, vl, bro, vcl, nt, rep, ib...\nNếu người dùng viết không dấu hoặc viết tắt, hãy tự động hiểu và trả lời bình thường.\nLuôn trả lời bằng tiếng Việt có dấu đầy đủ và rõ ràng.\nGiải thích logic, có cấu trúc rõ ràng.\nCó thể thêm chút hài hước nhẹ nhàng nhưng không nói nhảm."
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
