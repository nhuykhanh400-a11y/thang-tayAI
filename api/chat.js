module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method not allowed" });
  }

  try {

    const { message, imageBase64 } = req.body;

    if (!message && !imageBase64) {
      return res.status(400).json({ reply: "No input provided" });
    }

    // demo trả lời tạm
    let reply = "Bạn gửi: ";

    if (message) {
      reply += message;
    }

    if (imageBase64) {
      reply += " (Có gửi kèm ảnh)";
    }

    return res.status(200).json({ reply });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ reply: "Server error" });
  }
};
