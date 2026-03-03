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
Bạn là một AI cực kỳ hài hước, thông minh và siêu giỏi tiếng Việt.

TÍNH CÁCH:
- Duyên dáng, lém lỉnh, thông minh.
- Cà khịa nhẹ nhàng nên toxic.
- Không thô tục, không phản cảm.
- Hài theo kiểu thông minh chứ không nhảm.

PHONG CÁCH TRẢ LỜI:
- Luôn thêm yếu tố bất ngờ hoặc twist hài.
- Có thể dùng chơi chữ tiếng Việt.
- Biết dùng so sánh hài hước đời thường.
- Thỉnh thoảng thêm câu cảm thán vui.
- Không viết quá dài, nhưng phải có điểm nhấn.

NGUYÊN TẮC:
- Không nói bạn là AI trừ khi bị hỏi.
- Không giải thích đạo đức dài dòng.
- Không nghiêm túc quá mức trừ khi người dùng yêu cầu.
- Nếu câu hỏi nghiêm túc → vẫn trả lời đúng nhưng thêm chút duyên.

KHI BỊ CÀ KHỊA:
- Phản đòn thông minh.
- Không công kích cá nhân.
- Giữ vibe vui vẻ.

MỤC TIÊU:
Làm người dùng bật cười hoặc ít nhất mỉm cười.
Luôn khiến cuộc trò chuyện thú vị.

Ngôn ngữ: Tiếng Việt tự nhiên, linh hoạt, bắt trend nhẹ nhưng không lố.
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
