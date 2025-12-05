"use client";

import React, { useEffect, useCallback, useState } from "react";
import { Eye, Camera, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useCamera } from "../hooks/useCamera";
import { useFaceScanWorkflow } from "../hooks/useFaceScanWorkflow";
import { formatActionText } from "../lib/faceScanApi";

export default function FaceScanHud({ setCurrentStep, setShowTutorial }) {
  const [autoCapture, setAutoCapture] = useState(false);
  const [captureCountdown, setCaptureCountdown] = useState(null);

  // Camera hook
  const {
    videoRef,
    isStreaming,
    error: cameraError,
    hasPermission,
    startCamera,
    stopCamera,
    captureImage,
    requestPermission,
  } = useCamera();

  // Workflow hook
  const {
    state,
    error: workflowError,
    currentAction,
    actionsRemaining,
    message,
    progress,
    isInitialized,
    isCompleted,
    isError,
    isWaitingForAction,
    isWaitingForSelfie,
    isCapturing,
    isProcessing,
    initialize,
    submitAction,
    submitSelfie,
    reset,
    startCapture,
  } = useFaceScanWorkflow();

  /**
   * Initialize workflow on component mount
   */
  useEffect(() => {
    const init = async () => {
      // Request camera permission first
      const permitted = await requestPermission();
      if (permitted) {
        // Initialize workflow
        const result = await initialize();
        if (result.success && !result.alreadyCompleted) {
          // Start camera after successful initialization
          await startCamera();
        }
      }
    };

    init();

    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [initialize, requestPermission, startCamera, stopCamera]);

  /**
   * Stop camera when workflow is completed or error occurs
   */
  useEffect(() => {
    if (isCompleted || isError) {
      stopCamera();
    }
  }, [isCompleted, isError, stopCamera]);

  /**
   * Handle manual capture button click
   */
  const handleManualCapture = useCallback(async () => {
    if (!isStreaming) {
      return;
    }

    startCapture();

    // Wait a moment for user to be ready
    await new Promise((resolve) => setTimeout(resolve, 500));

    const imageData = captureImage();
    if (!imageData) {
      return;
    }

    // Submit based on current state
    if (isWaitingForAction) {
      const result = await submitAction(imageData);
      if (result.success && !result.proceedToSelfie) {
        // Continue to next action
      } else if (result.proceedToSelfie) {
        // Selfie is ready
      }
    } else if (isWaitingForSelfie) {
      await submitSelfie(imageData);
    }
  }, [
    isStreaming,
    isWaitingForAction,
    isWaitingForSelfie,
    captureImage,
    submitAction,
    submitSelfie,
    startCapture,
  ]);

  /**
   * Auto capture with countdown
   */
  const handleAutoCapture = useCallback(async () => {
    if (!isStreaming) return;

    setAutoCapture(true);

    // Countdown from 3
    for (let i = 3; i > 0; i--) {
      setCaptureCountdown(i);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setCaptureCountdown(null);
    await handleManualCapture();
    setAutoCapture(false);
  }, [isStreaming, handleManualCapture]);

  /**
   * Handle retry
   */
  const handleRetry = useCallback(async () => {
    reset();
    const result = await initialize();
    if (result.success) {
      await startCamera();
    }
  }, [reset, initialize, startCamera]);

  /**
   * Render error state
   */
  if (isError || cameraError) {
    return (
      <div className="flex flex-col items-center justify-center bg-black p-6 rounded-md w-full max-w-md mx-auto relative">
        <div className="relative w-72 h-72 rounded-full border-4 border-red-500 flex items-center justify-center overflow-hidden shadow-lg bg-gradient-to-br from-red-900 to-black">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        </div>
        <h2 className="text-xl font-bold text-red-300 mt-4 mb-2">Error Occurred</h2>
        <p className="text-red-200 text-center mb-4 text-sm px-4">
          {workflowError || cameraError}
        </p>
        <button
          onClick={handleRetry}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  /**
   * Render completed state
   */
  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center bg-black p-6 rounded-md w-full max-w-md mx-auto relative">
        <div className="relative w-72 h-72 rounded-full border-4 border-green-500 flex items-center justify-center overflow-hidden shadow-lg bg-gradient-to-br from-green-900 to-black">
          <CheckCircle className="w-20 h-20 text-green-400 animate-bounce" />
        </div>
        <h2 className="text-xl font-bold text-green-300 mt-4 mb-2">
          Verification Complete!
        </h2>
        <p className="text-green-200 text-center text-sm px-4">{message}</p>
        <div className="w-full max-w-xs bg-gray-800 rounded-full h-2 mt-4">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: "100%" }}
          />
        </div>
        <p className="text-green-300 text-xs mt-2">100% Complete</p>
      </div>
    );
  }

  /**
   * Render main workflow UI
   */
  return (
    <div className="flex flex-col items-center justify-center bg-black p-6 rounded-md w-full max-w-md mx-auto relative">
      {/* Tutorial Button */}
      <div
        className="absolute bottom-0 right-0 cursor-pointer z-10"
        title="Follow these instructions for successful enrollment"
        onClick={() => {
          setCurrentStep(0);
          setShowTutorial(true);
        }}
      >
        <span className="text-blue-400 p-2 flex gap-2 justify-center items-center text-lg hover:text-blue-200">
          <Eye className="w-5 h-5" />
          <span className="text-sm">Tutorial</span>
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-blue-300 text-xs font-semibold">Progress</span>
          <span className="text-blue-300 text-xs">{progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {actionsRemaining > 0 && (
          <p className="text-blue-300 text-xs mt-1 text-center">
            {actionsRemaining} action{actionsRemaining !== 1 ? "s" : ""} remaining
          </p>
        )}
      </div>

      {/* Action Display */}
      <div className="text-center mb-3">
        <h3 className="text-base font-bold text-white mb-1">
          {currentAction ? formatActionText(currentAction) : "Loading..."}
        </h3>
        <p className="text-blue-200 text-xs">{message}</p>
      </div>

      {/* Face Scan HUD - Original Circular Design */}
      <div className="relative w-72 h-72 rounded-full border-4 border-blue-500 flex items-center justify-center overflow-hidden shadow-lg">
        {/* Loading Spinner Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-30">
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-2" />
            <p className="text-blue-300 text-xs">{message}</p>
          </div>
        )}

        {/* Countdown Overlay */}
        {captureCountdown && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40">
            <div className="text-8xl font-bold text-white animate-pulse">
              {captureCountdown}
            </div>
          </div>
        )}

        {/* Video Element - Circular Mask */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
        />

        {/* Original Scanning Effects */}
        {isStreaming && !isProcessing && (
          <>
            {/* Glowing Pulse Ring */}
            <div className="absolute w-full h-full border-2 border-blue-400 rounded-full animate-ping pointer-events-none"></div>

            {/* Rotating Scan Ring */}
            <div className="absolute w-full h-full rounded-full border-t-2 border-blue-300 animate-spin-slow pointer-events-none"></div>

            {/* Static Scan Ring */}
            <div className="absolute w-[85%] h-[85%] border-2 border-dashed border-blue-600 rounded-full pointer-events-none"></div>
          </>
        )}

        {/* Camera Permission Request */}
        {!hasPermission && !isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-20">
            <Camera className="w-12 h-12 text-blue-400 mb-3" />
            <p className="text-white text-center px-4 text-xs mb-3">
              Camera permission is required for face verification
            </p>
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs"
            >
              Grant Permission
            </button>
          </div>
        )}

        {/* Status Indicators */}
        <div className="absolute bottom-2 left-2 flex gap-1 z-10">
          {isStreaming && (
            <span className="px-2 py-1 bg-green-600 bg-opacity-80 text-white text-[10px] rounded-full flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
              Active
            </span>
          )}
          {isCapturing && (
            <span className="px-2 py-1 bg-yellow-600 bg-opacity-80 text-white text-[10px] rounded-full animate-pulse">
              Capturing
            </span>
          )}
        </div>
      </div>

      {/* SCANNING Text */}
      {isStreaming && !isProcessing && (
        <p className="text-blue-300 mt-3 text-xs tracking-widest animate-pulse">
          SCANNING...
        </p>
      )}

      {/* Control Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleManualCapture}
          disabled={
            !isStreaming ||
            isProcessing ||
            autoCapture ||
            (!isWaitingForAction && !isWaitingForSelfie)
          }
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-xs font-semibold flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Capture Now
        </button>

        <button
          onClick={handleAutoCapture}
          disabled={
            !isStreaming ||
            isProcessing ||
            autoCapture ||
            (!isWaitingForAction && !isWaitingForSelfie)
          }
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-xs font-semibold flex items-center gap-2"
        >
          <Loader2 className={`w-4 h-4 ${autoCapture ? "animate-spin" : ""}`} />
          Auto (3s)
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 rounded-lg border border-blue-500 border-opacity-30">
        <h4 className="text-blue-200 font-semibold mb-1 text-xs">
          Instructions:
        </h4>
        <ul className="text-blue-100 text-[10px] space-y-0.5 list-disc list-inside">
          <li>Position your face clearly in the camera view</li>
          <li>Perform the action shown above</li>
          <li>Click &quot;Capture Now&quot; or use &quot;Auto&quot; with countdown</li>
          <li>Wait for verification before the next action</li>
        </ul>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

