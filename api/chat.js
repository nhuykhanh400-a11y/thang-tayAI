console.log("OpenAI key:", process.env.OPENAI_API_KEY);
const Groq = require("groq-sdk");
const fetch = require("node-fetch");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

process.env.OPENAI_API_KEY
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

    // Nếu có ảnh
if (imageBase64) {

  const openaiResponse = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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
        ]
      })
    }
  );

  const openaiData = await openaiResponse.json();

  if (!openaiResponse.ok) {
    console.error(openaiData);
    return res.status(400).json({
      reply: "OpenAI Vision lỗi",
      error: openaiData
    });
  }

  const description = openaiData.choices[0].message.content;

  return res.json({ reply: description });
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
