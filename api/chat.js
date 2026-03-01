async function searchWeb(query) {
  try {
    const res = await fetch(
      "https://searx.be/search?q=" +
      encodeURIComponent(query) +
      "&format=json"
    );

    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return "Không có kết quả từ web.";
    }

    return data.results
      .slice(0, 5)
      .map(r =>
        `Tiêu đề: ${r.title}\nNội dung: ${r.content}\nLink: ${r.url}`
      )
      .join("\n\n");

  } catch {
    return "Lỗi khi tìm kiếm web.";
  }
}

function needSearch(question) {
  const keywords = [
    "hôm nay",
    "mới nhất",
    "hiện tại",
    "giá",
    "tin tức",
    "2026",
    "2027"
  ];

  return keywords.some(k =>
    question.toLowerCase().includes(k)
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ message: "API is working. Use POST." });
  }

  try {
    const { chatHistory } = req.body;

    if (!chatHistory || !Array.isArray(chatHistory)) {
      return res.status(400).json({ error: "Chat history không hợp lệ" });
    }

    // Lấy câu hỏi cuối cùng của user
    const lastMessage = chatHistory[chatHistory.length - 1];
    let finalMessage = lastMessage.content;

    // Nếu cần search web
    if (needSearch(finalMessage)) {
      const webData = await searchWeb(finalMessage);

      finalMessage =
        finalMessage +
        "\n\nDữ liệu tham khảo từ internet:\n" +
        webData +
        "\n\nHãy trả lời dựa vào dữ liệu trên.";

      // Thay thế message cuối bằng bản đã thêm dữ liệu web
      chatHistory[chatHistory.length - 1] = {
        role: "user",
        content: finalMessage
      };
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          temperature: 0.55,
          top_p: 0.65,
          max_tokens: 500,
          messages: [
            {
              {
  role: "system",
  content: `
Bạn là một AI chuyên gia cấp cao với khả năng suy luận sâu, phân tích logic chặt chẽ và tư duy đa chiều.

Nguyên tắc hoạt động:

1) Trước khi trả lời, hãy phân tích câu hỏi kỹ lưỡng:
- Xác định bản chất vấn đề
- Xác định giả định ẩn
- Xem có nhiều cách hiểu khác nhau không

2) Suy luận theo từng bước rõ ràng:
- Chia nhỏ vấn đề nếu phức tạp
- Giải thích logic từng bước
- Không nhảy cóc kết luận

3) Xem xét nhiều góc nhìn:
- Góc nhìn thực tế
- Góc nhìn lý thuyết
- Lợi ích và rủi ro nếu có
- Trường hợp ngoại lệ

4) Đưa ví dụ minh họa cụ thể khi cần.

5) Nếu câu hỏi mơ hồ:
- Chủ động chỉ ra điểm chưa rõ
- Đưa ra các khả năng hợp lý nhất

6) Không trả lời hời hợt.
7) Không dùng câu sáo rỗng.
8) Ưu tiên chiều sâu hơn độ dài.

Phong cách trả lời:
- Có cấu trúc rõ ràng (tiêu đề, mục, gạch đầu dòng)
- Dễ hiểu nhưng chuyên sâu
- Trả lời bằng tiếng Việt
- Kết luận rõ ràng ở cuối

Luôn suy nghĩ cẩn thận trước khi đưa ra câu trả lời cuối cùng.
`
}
            },
            ...chatHistory
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data.choices?.[0]?.message?.content || "Lỗi Groq API";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
