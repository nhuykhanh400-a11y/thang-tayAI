export default async function handler(req, res) {

  const { message, imageBase64 } = req.body;

  // 🟢 Nếu có ảnh → dùng Gemini Vision
  if (imageBase64) {

    const visionResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: "Phân tích bức ảnh này chi tiết:" },
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

    const visionData = await visionResponse.json();
    const visionText = visionData.candidates[0].content.parts[0].text;

    return res.status(200).json({ reply: visionText });
  }

  // 🔵 Nếu chỉ có text → dùng Groq như cũ
  const textResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: message }]
    })
  });

  const textData = await textResponse.json();

  return res.status(200).json({
    reply: textData.choices[0].message.content
  });
} catch (err) {
    console.error("SERVER CRASH:", err);
    return res.status(500).json({ error: err.message });
  }
};
