"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  generateGUI,
  registerSession,
  verifyAction,
  submitFinalImage,
  checkFinalStatus,
} from "../lib/faceScanApi";

/**
 * Workflow states
 */
const WORKFLOW_STATES = {
  IDLE: "idle",
  INITIALIZING: "initializing",
  REQUESTING_PERMISSION: "requesting_permission",
  REGISTERING: "registering",
  WAITING_FOR_ACTION: "waiting_for_action",
  CAPTURING_ACTION: "capturing_action",
  VERIFYING_ACTION: "verifying_action",
  WAITING_FOR_SELFIE: "waiting_for_selfie",
  CAPTURING_SELFIE: "capturing_selfie",
  SUBMITTING_SELFIE: "submitting_selfie",
  CHECKING_STATUS: "checking_status",
  COMPLETED: "completed",
  ERROR: "error",
};

/**
 * Custom hook for managing face scan workflow
 * @returns {Object} Workflow state and controls
 */
export const useFaceScanWorkflow = () => {
  const [state, setState] = useState(WORKFLOW_STATES.IDLE);
  const [error, setError] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);
  const [actionsRemaining, setActionsRemaining] = useState(0);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);

  const guiRef = useRef(null);
  const uidRef = useRef(null);
  const totalActionsRef = useRef(0);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  /**
   * Initializes the workflow
   */
  const initialize = useCallback(async () => {
    try {
      setState(WORKFLOW_STATES.INITIALIZING);
      setError(null);
      setMessage("Initializing face scan...");

      // Generate unique GUI for this session
      guiRef.current = generateGUI();
      retryCountRef.current = 0;

      setState(WORKFLOW_STATES.REGISTERING);
      setMessage("Registering session...");

      // Register the session
      const response = await registerSession(guiRef.current);

      if (response.status !== "success") {
        throw new Error(response.message || "Registration failed");
      }

      // Handle different registration statuses
      if (response.action_status === "waiting") {
        throw new Error(
          `Session on hold. Please try again after ${response.time_left || "some time"}.`
        );
      }

      if (
        response.action_status === "completed" &&
        response.selfie_status === "completed"
      ) {
        setState(WORKFLOW_STATES.COMPLETED);
        setMessage("Face scan already completed!");
        return { success: true, alreadyCompleted: true };
      }

      // Store session data
      uidRef.current = response.uid;
      setActionsRemaining(response.actions_size || 0);
      totalActionsRef.current = response.actions_size || 0;
      setCurrentAction(response.action);
      updateProgress(response.actions_size, totalActionsRef.current);

      setState(WORKFLOW_STATES.WAITING_FOR_ACTION);
      setMessage(`Ready for action: ${response.action}`);

      return { success: true, action: response.action };
    } catch (err) {
      console.error("Initialization error:", err);
      setError(err.message);
      setState(WORKFLOW_STATES.ERROR);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Updates progress percentage
   */
  const updateProgress = useCallback((remaining, total) => {
    if (total === 0) {
      setProgress(100);
    } else {
      const completed = total - remaining;
      const percentage = Math.round((completed / (total + 1)) * 100); // +1 for final selfie
      setProgress(percentage);
    }
  }, []);

  /**
   * Submits an action with captured image
   */
  const submitAction = useCallback(
    async (imageData) => {
      if (!guiRef.current || !uidRef.current || !currentAction) {
        setError("Session not initialized");
        return { success: false };
      }

      try {
        setState(WORKFLOW_STATES.VERIFYING_ACTION);
        setMessage("Verifying action...");

        const response = await verifyAction({
          gui: guiRef.current,
          uid: uidRef.current,
          action: currentAction,
          image: imageData,
        });

        if (response.status !== "success") {
          throw new Error(response.message || "Action verification failed");
        }

        // Check if there are more actions
        if (response.actions_size > 0) {
          setActionsRemaining(response.actions_size);
          setCurrentAction(response.action);
          updateProgress(response.actions_size, totalActionsRef.current);
          setState(WORKFLOW_STATES.WAITING_FOR_ACTION);
          setMessage(`Next action: ${response.action}`);
          retryCountRef.current = 0; // Reset retry count on success
          return { success: true, nextAction: response.action };
        }

        // No more actions, proceed to selfie
        if (response.actions_size === 0) {
          setActionsRemaining(0);
          setCurrentAction("SelfieClick");
          updateProgress(0, totalActionsRef.current);
          setState(WORKFLOW_STATES.WAITING_FOR_SELFIE);
          setMessage("All actions completed! Take a final selfie.");
          retryCountRef.current = 0;
          return { success: true, proceedToSelfie: true };
        }

        return { success: true };
      } catch (err) {
        console.error("Action submission error:", err);

        // Handle retry logic
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          setError(
            `Verification failed. Retry ${retryCountRef.current}/${maxRetries}`
          );
          setState(WORKFLOW_STATES.WAITING_FOR_ACTION);
          return { success: false, retry: true };
        }

        setError(err.message);
        setState(WORKFLOW_STATES.ERROR);
        return { success: false, error: err.message };
      }
    },
    [currentAction, updateProgress]
  );

  /**
   * Submits the final selfie
   */
  const submitSelfie = useCallback(
    async (imageData) => {
      if (!guiRef.current || !uidRef.current) {
        setError("Session not initialized");
        return { success: false };
      }

      try {
        setState(WORKFLOW_STATES.SUBMITTING_SELFIE);
        setMessage("Submitting final selfie...");

        const response = await submitFinalImage({
          gui: guiRef.current,
          uid: uidRef.current,
          image: imageData,
        });

        if (response.status !== "success") {
          throw new Error(response.message || "Selfie submission failed");
        }

        // Verify final status
        setState(WORKFLOW_STATES.CHECKING_STATUS);
        setMessage("Verifying completion...");

        const statusResponse = await checkFinalStatus(guiRef.current);

        if (
          statusResponse.action_status === "completed" &&
          statusResponse.selfie_status === "completed"
        ) {
          setState(WORKFLOW_STATES.COMPLETED);
          setMessage("Face scan completed successfully!");
          setProgress(100);
          return {
            success: true,
            image: statusResponse.image,
            reason: statusResponse.reason,
          };
        }

        throw new Error("Final verification incomplete");
      } catch (err) {
        console.error("Selfie submission error:", err);

        // Handle retry logic
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          setError(
            `Submission failed. Retry ${retryCountRef.current}/${maxRetries}`
          );
          setState(WORKFLOW_STATES.WAITING_FOR_SELFIE);
          return { success: false, retry: true };
        }

        setError(err.message);
        setState(WORKFLOW_STATES.ERROR);
        return { success: false, error: err.message };
      }
    },
    [updateProgress]
  );

  /**
   * Resets the workflow
   */
  const reset = useCallback(() => {
    setState(WORKFLOW_STATES.IDLE);
    setError(null);
    setCurrentAction(null);
    setActionsRemaining(0);
    setMessage("");
    setProgress(0);
    guiRef.current = null;
    uidRef.current = null;
    totalActionsRef.current = 0;
    retryCountRef.current = 0;
  }, []);

  /**
   * Marks the workflow as ready for capture
   */
  const startCapture = useCallback(() => {
    if (state === WORKFLOW_STATES.WAITING_FOR_ACTION) {
      setState(WORKFLOW_STATES.CAPTURING_ACTION);
      setMessage("Perform the action and hold...");
    } else if (state === WORKFLOW_STATES.WAITING_FOR_SELFIE) {
      setState(WORKFLOW_STATES.CAPTURING_SELFIE);
      setMessage("Hold steady for selfie...");
    }
  }, [state]);

  return {
    // State
    state,
    error,
    currentAction,
    actionsRemaining,
    message,
    progress,
    isInitialized: !!guiRef.current,
    isCompleted: state === WORKFLOW_STATES.COMPLETED,
    isError: state === WORKFLOW_STATES.ERROR,
    isWaitingForAction: state === WORKFLOW_STATES.WAITING_FOR_ACTION,
    isWaitingForSelfie: state === WORKFLOW_STATES.WAITING_FOR_SELFIE,
    isCapturing:
      state === WORKFLOW_STATES.CAPTURING_ACTION ||
      state === WORKFLOW_STATES.CAPTURING_SELFIE,
    isProcessing:
      state === WORKFLOW_STATES.VERIFYING_ACTION ||
      state === WORKFLOW_STATES.SUBMITTING_SELFIE ||
      state === WORKFLOW_STATES.CHECKING_STATUS ||
      state === WORKFLOW_STATES.REGISTERING ||
      state === WORKFLOW_STATES.INITIALIZING,

    // Actions
    initialize,
    submitAction,
    submitSelfie,
    reset,
    startCapture,
    gui: guiRef.current,
    uid: uidRef.current,
  };
};
