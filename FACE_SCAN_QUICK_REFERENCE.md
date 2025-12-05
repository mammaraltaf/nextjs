# Face Scan Quick Reference

## 🚀 Quick Start (30 seconds)

```jsx
import FaceScanHub from "@/app/PageComponents/FaceScanHub";

<FaceScanHub
  setCurrentStep={setCurrentStep}
  setShowTutorial={setShowTutorial}
/>
```

## 📁 File Locations

| Purpose | File Path |
|---------|-----------|
| Main Component | `src/app/PageComponents/FaceScanHub.js` |
| API Service | `src/app/lib/faceScanApi.js` |
| Camera Hook | `src/app/hooks/useCamera.js` |
| Workflow Hook | `src/app/hooks/useFaceScanWorkflow.js` |
| Test Script | `test-face-scan.mjs` |

## 🔄 API Flow

```
1. POST /api/register           → Get UID + first action
2. POST /api/verify-action      → Loop until actions_size = 0
3. POST /api/final-image        → Submit selfie
4. POST /api/register (verify)  → Check completion
```

## 📡 API Endpoints

**Base URL:** `https://george-backend.quantilence.com`

### Register
```javascript
POST /api/register
Body: { "gui": "unique_id" }
```

### Verify Action
```javascript
POST /api/verify-action
Body: {
  "gui": "unique_id",
  "uid": "user_id",
  "action": "ActionName",
  "image": "data:image/png;base64,..."
}
```

### Final Image
```javascript
POST /api/final-image
Body: {
  "gui": "unique_id",
  "uid": "user_id",
  "image": "data:image/png;base64,..."
}
```

## 🎯 Component Props

```typescript
FaceScanHub({
  setCurrentStep: (step: number) => void,
  setShowTutorial: (show: boolean) => void
})
```

## 🪝 Hook Usage

### useCamera
```javascript
const {
  videoRef,           // <video ref={videoRef} />
  isStreaming,        // boolean
  startCamera,        // () => Promise<boolean>
  stopCamera,         // () => void
  captureImage,       // () => string (base64)
} = useCamera();
```

### useFaceScanWorkflow
```javascript
const {
  currentAction,      // string
  actionsRemaining,   // number
  progress,           // number (0-100)
  isWaitingForAction, // boolean
  initialize,         // () => Promise<result>
  submitAction,       // (image) => Promise<result>
  submitSelfie,       // (image) => Promise<result>
} = useFaceScanWorkflow();
```

## 🎨 Key Features

| Feature | Description |
|---------|-------------|
| Auto Capture | 3-second countdown capture |
| Manual Capture | Instant capture button |
| Progress Bar | Real-time completion % |
| Error Retry | Auto-retry up to 3 times |
| Loading States | Visual feedback during API calls |
| Camera Status | Live camera indicators |

## 🧪 Testing

```bash
# Test API connectivity
node test-face-scan.mjs

# Expected output:
# ✅ Registration successful
# ⚠️ Verification (404 with dummy image - expected)
```

## 📱 Browser Support

✅ Chrome 63+
✅ Firefox 60+
✅ Safari 11+
✅ Edge 79+
✅ Opera 50+

## 🎬 Supported Actions

1. TouchNoseWithLeftHand
2. TouchNoseWithRightHand
3. TouchLeftEarWithLeftHand
4. TouchLeftEarWithRightHand
5. TouchRightEarWithLeftHand
6. TouchRightEarWithRightHand
7. OpenMouth
8. BlinkEyes
9. TurnFaceLeft
10. TurnFaceRight
11. SelfieClick

## 🔧 Configuration

Edit API endpoint in `src/app/lib/faceScanApi.js`:
```javascript
const API_URL = "https://george-backend.quantilence.com";
```

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Camera not working | Check HTTPS, grant permission |
| API errors | Check network, verify endpoint |
| Actions not captured | Better lighting, clear face position |
| Stuck workflow | Use retry button or refresh |

## 🎯 Workflow States

```
IDLE → INITIALIZING → REGISTERING →
WAITING_FOR_ACTION → CAPTURING_ACTION → VERIFYING_ACTION →
(repeat until actions_size = 0) →
WAITING_FOR_SELFIE → CAPTURING_SELFIE → SUBMITTING_SELFIE →
CHECKING_STATUS → COMPLETED
```

## 💾 Example Integration

```jsx
"use client";
import { useState } from "react";
import FaceScanHub from "@/app/PageComponents/FaceScanHub";

export default function VerifyPage() {
  const [step, setStep] = useState(0);
  const [tutorial, setTutorial] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <FaceScanHub
        setCurrentStep={setStep}
        setShowTutorial={setTutorial}
      />
    </div>
  );
}
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `FACE_SCAN_SUMMARY.md` | Complete overview |
| `FACE_SCAN_IMPLEMENTATION.md` | Technical details |
| `FACE_SCAN_INTEGRATION_GUIDE.md` | Integration examples |
| `FACE_SCAN_QUICK_REFERENCE.md` | This file |

## 🔐 Security Checklist

- [x] HTTPS in production
- [x] Explicit camera permission
- [x] No local image storage
- [x] Client-side GUI generation
- [x] CORS headers configured

## ⚡ Performance Tips

1. Camera starts only when initialized
2. Automatic cleanup on unmount
3. Optimized re-renders with proper deps
4. Base64 PNG format (not JPEG)
5. Progress calculated efficiently

## 🎨 Styling Customization

Change colors in `FaceScanHub.js`:
```jsx
// Line 123: Change gradient colors
className="bg-gradient-to-br from-blue-900 via-purple-900 to-black"

// Change to green theme:
className="bg-gradient-to-br from-green-900 via-teal-900 to-black"
```

## 📞 Need Help?

1. Check console for errors
2. Run `node test-face-scan.mjs`
3. Review `FACE_SCAN_IMPLEMENTATION.md`
4. Check browser camera permissions
5. Verify API endpoint accessibility

## 🚦 Production Deployment

Before going live:
- [ ] Test on real devices
- [ ] Monitor API response times
- [ ] Set up error logging
- [ ] Configure rate limiting
- [ ] Test camera permissions flow
- [ ] Verify HTTPS certificate

## 📊 Metrics to Track

- Session completion rate
- Average time per session
- Action retry rates
- Camera permission grant rate
- API error rates
- Browser/device distribution

## 🔄 Update Migration

From old `FaceScanHud` to new `FaceScanHub`:

```diff
- import FaceScanHud from '@/app/PageComponents/FaceScanHud';
+ import FaceScanHub from '@/app/PageComponents/FaceScanHub';

- <FaceScanHud {...props} />
+ <FaceScanHub {...props} />
```

## 🎓 Learning Resources

- [MediaPipe Face Detection](https://developers.google.com/mediapipe/solutions/vision/face_detector)
- [getUserMedia API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [React Hooks](https://react.dev/reference/react)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Version:** 1.0
**Last Updated:** 2025-12-01
**Status:** Production Ready ✅
