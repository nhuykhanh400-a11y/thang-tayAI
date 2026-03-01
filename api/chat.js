import { useState } from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content:
        "Chào bạn! Mình là AI người Tây 🤖 Bạn muốn hỏi gì nào?"
    }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newHistory = [
      ...chatHistory,
      { role: "user", content: input }
    ];

    setChatHistory(newHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chatHistory: newHistory
        })
      });

      const data = await res.json();

      setChatHistory(prev => [
        ...prev,
        { role: "assistant", content: data.reply }
      ]);
    } catch (err) {
      setChatHistory(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Có lỗi xảy ra 😢"
        }
      ]);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        padding: "20px",
        color: "white",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>
        AI người Tây
      </h1>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent:
                msg.role === "user"
                  ? "flex-end"
                  : "flex-start",
              marginBottom: "12px"
            }}
          >
            {msg.role === "assistant" && (
              <img
                src="https://i.pravatar.cc/40?img=12"
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  marginRight: "8px"
                }}
              />
            )}

            <div
              style={{
                maxWidth: "60%",
                padding: "12px 16px",
                borderRadius: "16px",
                backgroundColor:
                  msg.role === "user"
                    ? "#2563eb"
                    : "#1e293b",
                color: "white"
              }}
            >
              {msg.content}
            </div>

            {msg.role === "user" && (
              <img
                src="https://i.pravatar.cc/40?img=5"
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  marginLeft: "8px"
                }}
              />
            )}
          </div>
        ))}

        {loading && (
          <div style={{ marginTop: "10px" }}>
            AI đang trả lời...
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          marginTop: "15px"
        }}
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e =>
            e.key === "Enter" && sendMessage()
          }
          placeholder="Nhập câu hỏi của bạn..."
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "20px",
            border: "none",
            outline: "none",
            marginRight: "10px"
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            padding: "12px 20px",
            borderRadius: "20px",
            border: "none",
            backgroundColor: "#2563eb",
            color: "white",
            cursor: "pointer"
          }}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
