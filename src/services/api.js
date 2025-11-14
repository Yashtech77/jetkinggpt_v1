// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 
// e.g. http://192.168.1.22/api

if (!API_BASE_URL) {
  console.warn(
    "⚠️ VITE_API_BASE_URL is not set. Example: VITE_API_BASE_URL=http://192.168.1.22/api"
  );
}

const handleJsonResponse = async (res) => {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  return res.json();
};

// ----------------- UPLOAD -----------------
export const uploadExcelApi = async (file) => {
  if (!API_BASE_URL) throw new Error("VITE_API_BASE_URL is not configured");

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  return handleJsonResponse(res); // contains file_id, file_info, etc.
};

// ----------------- DASHBOARD -----------------
export const getDashboardApi = async (fileId) => {
  if (!API_BASE_URL) throw new Error("VITE_API_BASE_URL is not configured");
  if (!fileId) throw new Error("file_id is required for dashboard");

  // ⚠ Backend expects: { message: <string>, file_id: <string> }
  const res = await fetch(`${API_BASE_URL}/dashboard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Generate dashboard for uploaded file", // can be any string
      file_id: fileId,
    }),
  });

  return handleJsonResponse(res);
};

// ----------------- CHAT / AI ASSISTANT -----------------
export const chatWithAssistantApi = async (question, fileId) => {
  if (!API_BASE_URL) throw new Error("VITE_API_BASE_URL is not configured");
  if (!question?.trim()) throw new Error("Question is required");

  // Most likely `/api/chat` uses the same model: message (str) + file_id (optional/required)
  const body = {
    message: question,
  };

  if (fileId) {
    body.file_id = fileId;
  }

  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return handleJsonResponse(res);
};
