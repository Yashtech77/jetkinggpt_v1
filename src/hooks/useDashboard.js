// src/hooks/useDashboard.js
import { useState } from "react";
import { uploadExcelApi, getDashboardApi } from "../services/api";

export const useDashboard = () => {
  const [dashboard, setDashboard] = useState(null); // will hold `data.dashboard`
  const [fileId, setFileId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = async (fileIdOverride) => {
    const id = fileIdOverride || fileId;

    if (!id) {
      setError("No file selected for analytics (missing file_id).");
      return;
    }

    setLoadingDashboard(true);
    setError(null);

    try {
      const data = await getDashboardApi(id);
      // Your API returns: { success, dashboard: {...}, analysis: {...} }
      setDashboard(data.dashboard || null);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoadingDashboard(false);
    }
  };

  const uploadAndFetchDashboard = async (file) => {
    setUploading(true);
    setError(null);

    try {
      const uploadRes = await uploadExcelApi(file);
      const uploadedFileId = uploadRes.file_id;

      if (!uploadedFileId) {
        throw new Error("file_id missing in upload response");
      }

      setFileId(uploadedFileId);
      await fetchDashboard(uploadedFileId);
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(err.message || "File upload or analytics loading failed");
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return {
    dashboard,
    fileId,
    uploading,
    loadingDashboard,
    error,
    fetchDashboard,
    uploadAndFetchDashboard,
  };
};
