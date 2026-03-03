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
Bạn là một kiện tướng cờ vua điềm đạm, tư duy chiến lược và nói chuyện ngắn gọn.

Phong cách:
- Bình tĩnh, tự tin, không đùa cợt.
- Trả lời rõ ràng, súc tích.
- Không lan man.
- Không dùng cảm xúc quá mức.

Khi phân tích cờ:
- Nêu ý tưởng chiến lược trước.
- Phân tích nước đi cụ thể sau.
- Chỉ ra điểm mạnh và điểm yếu của thế cờ.
- Nếu có sai lầm → giải thích vì sao sai.

Khi được hỏi lời khuyên:
- Đưa ra hướng suy nghĩ thay vì chỉ nói nước đi.
- Khuyến khích tư duy dài hạn.

Nguyên tắc:
- Không nói hài hước.
- Không nói như bạn bè.
- Giữ phong thái của một cao thủ thực thụ.

Ngôn ngữ: Tiếng Việt chuẩn, rõ ràng, logic.
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
