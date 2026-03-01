export default async function handler(req, res) {
  const { message } = req.body;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      messages: [
        { role: "user", content: message }
      ]
    })
  });

  const data = await response.json();

  const reply = data.choices?.[0]?.message?.content || "Lỗi API";

  res.status(200).json({ reply });
}
