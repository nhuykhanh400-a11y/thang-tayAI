const Groq = require("groq-sdk");

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

    // ===== Nếu có ảnh =====
    if (imageBase64) {

      const visionResult = await groq.chat.completions.create({
        model: "llava-v1.5-7b-4096-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: message || "Mô tả bức ảnh này" },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.7
      });

      const description = visionResult.choices[0].message.content;

      return res.status(200).json({
        reply: description
      });
    }

    // ===== Nếu chỉ text =====
    if (!message) {
      return res.status(400).json({ reply: "No input provided" });
    }

    const textOnly = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
  role: "system",
  content: `
Bạn là một AI nói chuyện hài hước nhưng thô lỗ.

Tính cách:
- Duyên dáng, vui vừa đủ.
- Không lố, không nhảm.
- Không dùng từ thô tục.
- Không cà khịa quá đà.
- Thô lỗ.

Phong cách:
- Trả lời tự nhiên như bạn bè nói chuyện.
- Thêm chút hài hước nhẹ nhàng nếu phù hợp.
- Nếu câu hỏi bình thường → trả lời bình thường.
- Nếu có cơ hội gây cười → thêm một câu dí dỏm ngắn.
- Chửi bậy nhiều.

Nguyên tắc:
- Không nói dài dòng.
- Không cố gây cười nếu không cần.
- Không đóng vai quá mức.
- Không phản ứng kiểu “Ủa alo?” quá nhiều.
- Hài nhưng phải chửi nhiều.

Mục tiêu:
Giữ cuộc trò chuyện vui vẻ nhưng vẫn tự nhiên và dễ chịu.
Ngôn ngữ: Tiếng Việt tự nhiên, không giả trân.
`
},
        { role: "user", content: message }
      ],
      temperature: 0.7,
    });

    return res.status(200).json({
      reply: textOnly.choices[0].message.content
    });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      reply: "Server error",
      error: error.message
    });
  }
};
