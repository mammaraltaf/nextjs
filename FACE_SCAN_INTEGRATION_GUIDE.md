# Face Scan Integration Guide

## Quick Start

### Step 1: Import the Component

```jsx
import FaceScanHud from "@/app/PageComponents/FaceScanHud";
```

### Step 2: Use in Your Page

```jsx
"use client";

import { useState } from "react";
import FaceScanHud from "@/app/PageComponents/FaceScanHud";

export default function VerificationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <FaceScanHud
        setCurrentStep={setCurrentStep}
        setShowTutorial={setShowTutorial}
      />
    </div>
  );
}
```

## Required Props

| Prop | Type | Description |
|------|------|-------------|
| `setCurrentStep` | `function` | Callback to update tutorial step |
| `setShowTutorial` | `function` | Callback to show/hide tutorial |

## Complete Example with Tutorial

```jsx
"use client";

import { useState } from "react";
import FaceScanHub from "@/app/PageComponents/FaceScanHub";

export default function FaceVerificationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  const tutorialSteps = [
    {
      title: "Position Your Face",
      description: "Ensure your face is clearly visible in the camera frame",
    },
    {
      title: "Follow Instructions",
      description: "Perform each action as shown on the screen",
    },
    {
      title: "Capture Actions",
      description: "Click capture or use auto-capture for each action",
    },
    {
      title: "Final Selfie",
      description: "Take a clear final selfie to complete verification",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Identity Verification
        </h1>
        <p className="text-gray-400">
          Complete the face scan to verify your identity
        </p>
      </header>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">
              Step {currentStep + 1} of {tutorialSteps.length}
            </h2>
            <h3 className="text-lg text-blue-400 mb-2">
              {tutorialSteps[currentStep].title}
            </h3>
            <p className="text-gray-300 mb-6">
              {tutorialSteps[currentStep].description}
            </p>
            <div className="flex gap-4">
              {currentStep < tutorialSteps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => setShowTutorial(false)}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Start Verification
                </button>
              )}
              <button
                onClick={() => setShowTutorial(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Face Scan Component */}
      <FaceScanHub
        setCurrentStep={setCurrentStep}
        setShowTutorial={setShowTutorial}
      />
    </div>
  );
}
```

## Using Individual Hooks

If you want more control, you can use the hooks directly:

### Camera Hook Example

```jsx
"use client";

import { useCamera } from "@/app/hooks/useCamera";

export default function CustomCamera() {
  const {
    videoRef,
    isStreaming,
    error,
    startCamera,
    stopCamera,
    captureImage,
  } = useCamera();

  const handleCapture = () => {
    const imageData = captureImage();
    console.log("Captured image:", imageData);
    // Use imageData as needed
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline />
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={startCamera} disabled={isStreaming}>
        Start Camera
      </button>
      <button onClick={stopCamera} disabled={!isStreaming}>
        Stop Camera
      </button>
      <button onClick={handleCapture} disabled={!isStreaming}>
        Capture
      </button>
    </div>
  );
}
```

### Workflow Hook Example

```jsx
"use client";

import { useFaceScanWorkflow } from "@/app/hooks/useFaceScanWorkflow";
import { formatActionText } from "@/app/lib/faceScanApi";

export default function CustomWorkflow() {
  const {
    currentAction,
    actionsRemaining,
    message,
    progress,
    isWaitingForAction,
    initialize,
    submitAction,
    submitSelfie,
  } = useFaceScanWorkflow();

  useEffect(() => {
    initialize();
  }, []);

  const handleSubmit = async (imageData) => {
    if (isWaitingForAction) {
      await submitAction(imageData);
    } else {
      await submitSelfie(imageData);
    }
  };

  return (
    <div>
      <h2>{formatActionText(currentAction)}</h2>
      <p>{message}</p>
      <p>Progress: {progress}%</p>
      <p>Actions remaining: {actionsRemaining}</p>
      {/* Your custom UI */}
    </div>
  );
}
```

## API Service Usage

```javascript
import {
  generateGUI,
  registerSession,
  verifyAction,
  submitFinalImage,
  checkFinalStatus,
  formatActionText,
} from "@/app/lib/faceScanApi";

// Generate a session ID
const gui = generateGUI();

// Register session
const registration = await registerSession(gui);

// Verify an action
const verification = await verifyAction({
  gui: gui,
  uid: registration.uid,
  action: registration.action,
  image: "data:image/png;base64,...",
});

// Submit final selfie
const finalResult = await submitFinalImage({
  gui: gui,
  uid: registration.uid,
  image: "data:image/png;base64,...",
});

// Check status
const status = await checkFinalStatus(gui);

// Format action text
const humanReadable = formatActionText("TouchNoseWithLeftHand");
// Returns: "Touch your nose with your left hand"
```

## Environment Configuration

The API endpoint is configured in `src/app/lib/faceScanApi.js`:

```javascript
const API_URL = "https://george-backend.quantilence.com";
```

To change the endpoint, edit this constant.

## Styling Customization

The component uses Tailwind CSS. To customize:

1. **Colors**: Modify the gradient classes in FaceScanHub.js
2. **Sizes**: Adjust the `max-w-*` and size classes
3. **Animations**: Edit the custom CSS at the bottom of the component

Example customization:

```jsx
// Change primary color from blue to purple
<div className="bg-gradient-to-br from-purple-900 via-pink-900 to-black">
  {/* ... */}
</div>

// Adjust component width
<div className="max-w-4xl"> {/* instead of max-w-2xl */}
  {/* ... */}
</div>
```

## Error Handling

The component handles errors automatically, but you can add custom error handling:

```jsx
const {
  error,
  isError,
  reset,
} = useFaceScanWorkflow();

useEffect(() => {
  if (isError) {
    // Custom error handling
    console.error("Workflow error:", error);
    // Show toast notification
    // Log to analytics
    // etc.
  }
}, [isError, error]);
```

## Testing

Run the test script to verify API connectivity:

```bash
node test-face-scan.mjs
```

This will:
1. Test registration endpoint
2. Test action verification endpoint
3. Verify API response structure
4. Check error handling

## Common Issues

### Camera Not Working

**Problem**: Camera doesn't start or permission denied

**Solutions**:
- Ensure you're using HTTPS or localhost
- Check browser permissions in settings
- Verify no other app is using the camera
- Try a different browser

### API Errors

**Problem**: API calls failing

**Solutions**:
- Check network connectivity
- Verify API endpoint is accessible
- Check CORS configuration
- Review API response in browser console

### Actions Not Recognized

**Problem**: Performed action but not captured

**Solutions**:
- Ensure good lighting
- Position face clearly in frame
- Hold action steady for capture
- Use manual capture if auto-capture fails

## Performance Tips

1. **Camera Resolution**: Default is 640x480. Adjust in `useCamera.js` if needed
2. **Auto Capture Delay**: Default is 3 seconds. Modify in `FaceScanHub.js`
3. **Retry Attempts**: Default is 3. Change in `useFaceScanWorkflow.js`

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 63+ | ✅ Full |
| Firefox | 60+ | ✅ Full |
| Safari | 11+ | ✅ Full |
| Edge | 79+ | ✅ Full |
| Opera | 50+ | ✅ Full |

## Security Notes

1. Always use HTTPS in production
2. Camera permission is explicit - users must grant it
3. Images are not stored locally
4. GUI is generated client-side
5. All API calls include proper CORS headers

## Next Steps

1. Integrate into your existing authentication flow
2. Add user feedback mechanisms
3. Implement analytics tracking
4. Add localization support
5. Customize styling to match your brand

## Support

For issues or questions:
- Check the documentation in `FACE_SCAN_IMPLEMENTATION.md`
- Review the test file `test-face-scan.mjs`
- Check browser console for errors
- Verify API endpoint accessibility
