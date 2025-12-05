"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Custom hook for camera access and image capture
 * @returns {Object} Camera controls and state
 */
export const useCamera = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  /**
   * Checks if browser supports getUserMedia
   */
  const hasGetUserMedia = useCallback(() => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }, []);

  /**
   * Starts the camera stream
   */
  const startCamera = useCallback(async () => {
    if (!hasGetUserMedia()) {
      setError("Camera not supported in this browser");
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setHasPermission(true);
        setError(null);
      }

      return true;
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(
        err.name === "NotAllowedError"
          ? "Camera permission denied"
          : "Failed to access camera"
      );
      setHasPermission(false);
      return false;
    }
  }, [hasGetUserMedia]);

  /**
   * Stops the camera stream
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  /**
   * Captures an image from the video stream as base64
   * @returns {string|null} Base64 encoded PNG image with data URI prefix
   */
  const captureImage = useCallback(() => {
    if (!videoRef.current || !isStreaming) {
      console.error("Cannot capture: camera not active");
      return null;
    }

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      // Mirror the image horizontally to match the video display
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL("image/png");
      return imageData;
    } catch (err) {
      console.error("Error capturing image:", err);
      setError("Failed to capture image");
      return null;
    }
  }, [isStreaming]);

  /**
   * Requests camera permission without starting the stream
   */
  const requestPermission = useCallback(async () => {
    if (!hasGetUserMedia()) {
      setError("Camera not supported in this browser");
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
      setError(null);
      return true;
    } catch (err) {
      console.error("Permission error:", err);
      setError("Camera permission denied");
      setHasPermission(false);
      return false;
    }
  }, [hasGetUserMedia]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isStreaming,
    error,
    hasPermission,
    startCamera,
    stopCamera,
    captureImage,
    requestPermission,
    hasGetUserMedia,
  };
};
