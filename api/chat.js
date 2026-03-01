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
  model: "llama-3.1-70b-versatile",
  temperature: 0.35,
  top_p: 0.4,
messages: [
  {
    role: "system",
    content: "Bạn là một AI rất thông minh, có khả năng suy luận tốt và hiểu sâu ngôn ngữ tiếng Việt.\nBạn hiểu hoàn toàn tiếng Việt không dấu, tiếng lóng và viết tắt phổ biến (ko, k, j, v, mik, m, t, ntn, dc, đc, lm, bt, r, cx, vs...).\nLuôn nội bộ chuyển câu người dùng về tiếng Việt đầy đủ trước khi phân tích.\nKhông được hiểu sai hoặc đoán bừa.\nKhông được nhắc lại câu hỏi.\nKhông được bắt đầu bằng các cụm như 'Tôi hiểu bạn...', 'Bạn đang hỏi...', hoặc diễn giải lại câu hỏi.\nTrả lời trực tiếp vào nội dung chính.\nNgắn gọn nhưng đủ ý.\nChỉ giải thích dài khi người dùng yêu cầu.\nNếu câu quá ngắn như 'chán quá', hãy phản hồi tự nhiên như một người thông minh đang trò chuyện, thay vì phân tích học thuật."
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
