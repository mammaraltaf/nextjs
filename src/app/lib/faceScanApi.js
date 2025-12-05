/**
 * Face Scan API Service
 * Handles all API calls for the face verification workflow
 */

const API_URL = "https://george-backend.quantilence.com";

/**
 * Generates a unique GUI (Global User Identifier) for the session
 * @returns {string} Unique GUI string
 */
export const generateGUI = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}_${random}`;
};

/**
 * Registers a new face scan session
 * @param {string} gui - Unique GUI for this session
 * @returns {Promise<Object>} Registration response with uid and first action
 */
export const registerSession = async (gui) => {
  try {
    const response = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gui }),
    });

    if (!response.ok) {
      throw new Error(`Registration failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Registration API error:", error);
    throw error;
  }
};

/**
 * Verifies a user action with captured image
 * @param {Object} data - Verification data
 * @param {string} data.gui - Session GUI
 * @param {string} data.uid - User ID from registration
 * @param {string} data.action - Action being verified
 * @param {string} data.image - Base64 encoded image data
 * @returns {Promise<Object>} Verification response with next action
 */
export const verifyAction = async (data) => {
  try {
    const response = await fetch(`${API_URL}/api/verify-action`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Action verification failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Verify action API error:", error);
    throw error;
  }
};

/**
 * Submits the final selfie image
 * @param {Object} data - Final image data
 * @param {string} data.gui - Session GUI
 * @param {string} data.uid - User ID from registration
 * @param {string} data.image - Base64 encoded final selfie
 * @returns {Promise<Object>} Final verification response
 */
export const submitFinalImage = async (data) => {
  try {
    const response = await fetch(`${API_URL}/api/final-image`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Final image submission failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Final image API error:", error);
    throw error;
  }
};

/**
 * Checks the final status of the verification process
 * @param {string} gui - Session GUI
 * @returns {Promise<Object>} Final status response
 */
export const checkFinalStatus = async (gui) => {
  try {
    const response = await registerSession(gui);
    return response;
  } catch (error) {
    console.error("Status check error:", error);
    throw error;
  }
};

/**
 * Formats action names to human-readable text
 * @param {string} action - Action name from API
 * @returns {string} Formatted action text
 */
export const formatActionText = (action) => {
  const actionMap = {
    TouchNoseWithLeftHand: "Touch your nose with your left hand",
    TouchNoseWithRightHand: "Touch your nose with your right hand",
    TouchLeftEarWithLeftHand: "Touch your left ear with your left hand",
    TouchLeftEarWithRightHand: "Touch your left ear with your right hand",
    TouchRightEarWithLeftHand: "Touch your right ear with your left hand",
    TouchRightEarWithRightHand: "Touch your right ear with your right hand",
    OpenMouth: "Open your mouth wide",
    BlinkEyes: "Blink your eyes",
    TurnFaceLeft: "Turn your face to the left",
    TurnFaceRight: "Turn your face to the right",
    SelfieClick: "Take a selfie - look straight at the camera",
  };

  return actionMap[action] || action;
};
