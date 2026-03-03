console.log("API KEY:", process.env.GEMINI_API_KEY)
const Groq = require("groq-sdk");
const fetch = require("node-fetch");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" 
  ? JSON.parse(req.body) 
  : req.body;

const message = body?.message;
const imageBase64 = body?.imageBase64;

    // 👇 Nếu có ảnh → gọi Gemini Vision
    if (imageBase64) {

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: "Phân tích bức ảnh này:" },
                  {
                    inline_data: {
                      mime_type: "image/jpeg",
                      data: imageBase64
                    }
                  }
                ]
              }
            ]
          })
        }
      );

      const geminiData = await geminiResponse.json();

if (!geminiResponse.ok) {
  console.error("Gemini error:", geminiData);
  return res.status(400).json({
    reply: "Gemini API lỗi",
    error: geminiData
  });
}
      const description = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!description) {
  return res.json({ reply: "Không phân tích được ảnh 😬" });
}

      // Nếu có cả ảnh + text yêu cầu
      if (message) {
        // gửi mô tả ảnh kèm yêu cầu tới Groq để trả lời
        const combined = `Ảnh: ${description}\nYêu cầu: ${message}`;

        const chatResult = await groq.chat.completions.create({
          messages: [
            { role: "system", content: "Bạn là AI phân tích ảnh + chat" },
            { role: "user", content: combined }
          ],
          model: "openai/gpt-oss-120b",
          temperature: 0.7,
        });

        return res.status(200).json({
          reply: chatResult.choices[0].message.content
        });
      }

      // Chỉ có ảnh, không có text
      return res.status(200).json({
        reply: description
      });
    }

    // ❗ Nếu chỉ text → dùng Groq như cũ
    if (!message) {
      return res.status(400).json({ reply: "No input provided" });
    }

    const textOnly = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "Bạn là AI chat thông minh" },
        { role: "user", content: message }
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
    });

    return res.status(200).json({
      reply: textOnly.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ reply: "Server error" });
  }
};
