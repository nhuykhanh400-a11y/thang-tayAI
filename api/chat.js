console.log("OpenAI key:", process.env.OPENAI_API_KEY);

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

      const description = openaiData.choices?.[0]?.message?.content;

      // Nếu có cả ảnh + text
      if (message) {
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

      // Chỉ có ảnh
      return res.status(200).json({
        reply: description
      });
    }

    // ===== Nếu chỉ text =====
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
    console.error("Server error:", error);
    return res.status(500).json({ reply: "Server error", error: error.message });
  }
};
