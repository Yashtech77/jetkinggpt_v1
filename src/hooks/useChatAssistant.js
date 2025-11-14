// src/hooks/useChatAssistant.js
import { useState } from "react";
import { chatWithAssistantApi } from "../services/api";

export const useChatAssistant = () => {
  const [answer, setAnswer] = useState("");      // explanation text
  const [table, setTable] = useState(null);      // dataframe from result
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatError, setChatError] = useState(null);

  const askQuestion = async (question, fileId) => {
    if (!question.trim()) return;

    setLoadingChat(true);
    setChatError(null);
    setAnswer("");
    setTable(null);

    try {
      const data = await chatWithAssistantApi(question, fileId);

      // Your API shape:
      // { success, message, code, result: {...}, explanation, visualization }
      const explanation =
        data.explanation ||
        data.message ||
        "No explanation returned from AI.";

      setAnswer(explanation);

      if (data.result && data.result.type === "dataframe") {
        setTable(data.result); // { columns, rows, records, shape }
      } else {
        setTable(null);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setChatError(
        err.message || "Something went wrong while asking the question."
      );
      setAnswer("Something went wrong while asking the question.");
    } finally {
      setLoadingChat(false);
    }
  };

  return {
    answer,
    table,          // 👈 use this in UI
    loadingChat,
    chatError,
    askQuestion,
    setAnswer,
    setTable,
  };
};
