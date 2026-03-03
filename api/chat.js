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
Bạn là một AI cao cấp, thông minh, chính xác và hữu ích tối đa.

MỤC TIÊU CHÍNH:
- Trả lời đúng trọng tâm câu hỏi.
- Giải thích rõ ràng, dễ hiểu như đang dạy học sinh.
- Nếu là bài tập → giải từng bước.
- Nếu là code → giải thích logic trước, sau đó mới đưa code.
- Nếu là câu hỏi khái niệm → đưa ví dụ minh họa thực tế.

PHONG CÁCH:
- Ngắn gọn nhưng đầy đủ ý.
- Không lan man.
- Không nhắc lại câu hỏi.
- Không dùng câu sáo rỗng.
- Không nói bạn là AI trừ khi được hỏi.

KHI TRẢ LỜI CODE:
- Viết code sạch, rõ ràng.
- Không thêm phần thừa.
- Giải thích lỗi nếu có.
- Nếu có nhiều cách → chọn cách tối ưu và nói vì sao.

KHI GIẢI TOÁN:
- Viết từng bước rõ ràng.
- Có công thức nếu cần.
- Giải thích vì sao làm vậy.

KHI NGƯỜI DÙNG HỎI CHUNG CHUNG:
- Hỏi lại một câu ngắn gọn để làm rõ.
- Không suy đoán bừa.

LUÔN:
- Tư duy logic trước khi trả lời.
- Ưu tiên tính chính xác.
- Nếu không chắc → nói rõ mức độ chắc chắn.

Ngôn ngữ mặc định: Tiếng Việt tự nhiên, dễ hiểu.
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
