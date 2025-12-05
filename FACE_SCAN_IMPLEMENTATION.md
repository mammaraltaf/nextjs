# Face Scan Implementation Guide

This document provides a comprehensive overview of the face scan workflow implementation in the Next.js application.

## Overview

The face scan workflow allows users to verify their identity through a series of facial actions followed by a final selfie. The implementation follows a state-machine pattern for robust workflow management.

## Architecture

### Files Created

1. **`src/app/lib/faceScanApi.js`** - API service layer
2. **`src/app/hooks/useCamera.js`** - Custom hook for camera operations
3. **`src/app/hooks/useFaceScanWorkflow.js`** - State machine for workflow management
4. **`src/app/PageComponents/FaceScanHub.js`** - Main UI component

### Flow Diagram

```
┌─────────────────┐
│  Initialize     │
│  - Generate GUI │
│  - Register     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Request Camera  │
│  Permission     │
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Action Loop    │◄─────┐
│  - Show action  │      │
│  - Capture img  │      │
│  - Verify       │──────┘
└────────┬────────┘
         │ (actions_size = 0)
         v
┌─────────────────┐
│  Final Selfie   │
│  - Capture      │
│  - Submit       │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Verify Status   │
│  - Check done   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│   Completed     │
└─────────────────┘
```

## API Workflow

### 1. Registration (Step 1)

**Endpoint:** `POST https://george-backend.quantilence.com/api/register`

**Request:**
```json
{
  "gui": "1733068137087_abc123xyz"
}
```

**Response:**
```json
{
  "gui": "1733068137087_abc123xyz",
  "image": null,
  "created_on": "2025-12-01T13:08:57.087062Z",
  "status": "success",
  "waiting": null,
  "current_process": null,
  "reason": null,
  "message": "created",
  "uid": "510a69bd-af1d-4c4f-b4bc-0715f883c56f",
  "action_status": "created",
  "actions_size": 3,
  "action": "TouchNoseWithLeftHand"
}
```

### 2. Action Verification (Step 2-3)

**Endpoint:** `POST https://george-backend.quantilence.com/api/verify-action`

**Request:**
```json
{
  "gui": "1733068137087_abc123xyz",
  "uid": "510a69bd-af1d-4c4f-b4bc-0715f883c56f",
  "action": "TouchNoseWithLeftHand",
  "image": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

**Response:**
```json
{
  "message": "success",
  "uid": "510a69bd-af1d-4c4f-b4bc-0715f883c56f",
  "status": "success",
  "actions_size": 2,
  "action": "TouchRightEarWithLeftHand",
  "gui": "1733068137087_abc123xyz"
}
```

Continue loop until `actions_size` = 0.

### 3. Final Selfie (Step 4)

**Endpoint:** `POST https://george-backend.quantilence.com/api/final-image`

**Request:**
```json
{
  "gui": "1733068137087_abc123xyz",
  "uid": "510a69bd-af1d-4c4f-b4bc-0715f883c56f",
  "image": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

**Response:**
```json
{
  "message": "success",
  "reason": "SUCCESS",
  "status": "success"
}
```

### 4. Status Validation (Step 5)

Call the register endpoint again to verify completion:

**Response:**
```json
{
  "action_status": "completed",
  "selfie_status": "completed",
  "reason": "SUCCESS",
  "message": "Already process completed",
  "image": "./images/customers/{gui}/{gui}___FINAL.png"
}
```

## Component Usage

### Basic Usage

```jsx
import FaceScanHub from "@/app/PageComponents/FaceScanHub";

function MyPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <FaceScanHub
      setCurrentStep={setCurrentStep}
      setShowTutorial={setShowTutorial}
    />
  );
}
```

## Custom Hooks

### useCamera

Manages camera access and image capture.

```javascript
const {
  videoRef,        // Ref for video element
  isStreaming,     // Camera streaming state
  error,           // Camera error message
  hasPermission,   // Permission granted state
  startCamera,     // Function to start camera
  stopCamera,      // Function to stop camera
  captureImage,    // Function to capture base64 image
  requestPermission // Function to request permission
} = useCamera();
```

### useFaceScanWorkflow

Manages the face scan workflow state machine.

```javascript
const {
  state,              // Current workflow state
  error,              // Workflow error message
  currentAction,      // Current action to perform
  actionsRemaining,   // Number of actions remaining
  message,            // User-facing message
  progress,           // Progress percentage (0-100)
  isCompleted,        // Whether workflow is completed
  isWaitingForAction, // Ready for action capture
  isWaitingForSelfie, // Ready for selfie capture
  isProcessing,       // API call in progress
  initialize,         // Initialize workflow
  submitAction,       // Submit action image
  submitSelfie,       // Submit final selfie
  reset,              // Reset workflow
} = useFaceScanWorkflow();
```

## API Service Functions

### faceScanApi.js

```javascript
import {
  generateGUI,         // Generate unique session ID
  registerSession,     // Register new session
  verifyAction,        // Verify action with image
  submitFinalImage,    // Submit final selfie
  checkFinalStatus,    // Check completion status
  formatActionText,    // Format action names
} from "@/app/lib/faceScanApi";
```

## Error Handling

The implementation includes comprehensive error handling:

1. **Camera Errors**: Permission denied, device not available
2. **API Errors**: Network failures, server errors
3. **Workflow Errors**: Invalid state transitions
4. **Retry Logic**: Automatic retry up to 3 times for failed verifications

## State Management

### Workflow States

- `IDLE` - Initial state
- `INITIALIZING` - Setting up workflow
- `REGISTERING` - Calling register API
- `WAITING_FOR_ACTION` - Ready for user action
- `CAPTURING_ACTION` - Capturing action image
- `VERIFYING_ACTION` - Verifying with API
- `WAITING_FOR_SELFIE` - Ready for final selfie
- `CAPTURING_SELFIE` - Capturing selfie
- `SUBMITTING_SELFIE` - Submitting final image
- `CHECKING_STATUS` - Validating completion
- `COMPLETED` - Successfully completed
- `ERROR` - Error occurred

## Features

### 1. Auto Capture
- 3-second countdown before automatic capture
- Visual countdown display

### 2. Manual Capture
- Instant capture on button click
- Immediate feedback

### 3. Progress Tracking
- Real-time progress bar
- Actions remaining counter
- Percentage completion

### 4. Visual Feedback
- Camera status indicators
- Processing spinners
- Success/error animations
- Scanning effects overlay

### 5. Responsive Design
- Mobile-friendly layout
- Adaptive camera view
- Touch-optimized controls

## Supported Actions

1. `TouchNoseWithLeftHand`
2. `TouchNoseWithRightHand`
3. `TouchLeftEarWithLeftHand`
4. `TouchLeftEarWithRightHand`
5. `TouchRightEarWithLeftHand`
6. `TouchRightEarWithRightHand`
7. `OpenMouth`
8. `BlinkEyes`
9. `TurnFaceLeft`
10. `TurnFaceRight`
11. `SelfieClick` (final step)

## Styling

The component uses Tailwind CSS with custom animations:

- Gradient backgrounds
- Pulsing effects
- Smooth transitions
- Custom spin animations

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 11+)
- Opera: Full support

Requires:
- `navigator.mediaDevices.getUserMedia` support
- ES6+ JavaScript support
- Canvas API support

## Security Considerations

1. Camera permission is requested explicitly
2. GUI is generated client-side for session tracking
3. Images are captured in base64 format
4. No images stored locally
5. All API calls use CORS headers

## Performance Optimization

1. Lazy loading of camera stream
2. Automatic cleanup on unmount
3. Debounced capture operations
4. Minimal re-renders with proper hooks
5. Progress calculated efficiently

## Testing

To test the implementation:

1. Grant camera permission
2. Perform each action when prompted
3. Verify progress updates
4. Complete final selfie
5. Check completion message

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Ensure HTTPS or localhost
- Verify camera is not in use by another app

### API Errors
- Verify API endpoint is accessible
- Check network connectivity
- Review API response status codes

### Workflow Stuck
- Use retry button
- Refresh page to reset state
- Check console for error messages

## Future Enhancements

Potential improvements:

1. Add MediaPipe integration for real-time action validation
2. Implement offline support with service workers
3. Add multi-language support
4. Include accessibility improvements (WCAG compliance)
5. Add analytics tracking
6. Implement face detection feedback
7. Add voice guidance option

## Dependencies

- React 18+
- Next.js 13+
- Tailwind CSS
- lucide-react (for icons)

## License

Refer to the main project license.
