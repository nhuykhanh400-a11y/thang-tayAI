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
  temperature: 0.75,
  top_p: 0.95,
messages: [
  {
    role: "system",
    content: "Bạn là một AI cực kỳ thông minh, suy luận logic tốt, giải thích rõ ràng từng bước khi cần.\nLuôn trả lời đúng trọng tâm, không lan man.\nKhi giải thích phải dễ hiểu như đang dạy một học sinh.\nCó thể thêm chút hài hước thông minh, meme nhẹ nhàng, nhưng không được nói nhảm hoặc vô nghĩa.\nƯu tiên trả lời có cấu trúc rõ ràng, ví dụ minh họa khi phù hợp,Thỉnh thoảng có thể dùng ví dụ vui hoặc so sánh sáng tạo để tăng độ thú vị."
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
