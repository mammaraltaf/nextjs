# Face Scan Visual Flow Diagram

## Complete Workflow Visualization

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER OPENS PAGE                              │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Component Mount (useEffect)                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  1. Request Camera Permission                                │  │
│  │  2. Initialize Workflow                                      │  │
│  │     - Generate GUI: "1733068137087_abc123xyz"                │  │
│  │     - Call POST /api/register                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API RESPONSE HANDLING                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Response: {                                                 │  │
│  │    "status": "success",                                      │  │
│  │    "uid": "510a69bd-af1d-4c4f-b4bc-0715f883c56f",           │  │
│  │    "action": "TouchNoseWithLeftHand",                        │  │
│  │    "actions_size": 3                                         │  │
│  │  }                                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         START CAMERA                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  navigator.mediaDevices.getUserMedia({ video: true })       │  │
│  │  - Video stream starts                                       │  │
│  │  - User sees themselves                                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌═════════════════════════════════════════════════════════════════════┐
║                     ACTION LOOP (Repeat)                            ║
║  ┌──────────────────────────────────────────────────────────────┐  ║
║  │  STEP 1: Display Action                                      │  ║
║  │  ┌────────────────────────────────────────────────────────┐  │  ║
║  │  │  Screen shows: "Touch your nose with your left hand"  │  │  ║
║  │  │  Progress: 33% | Actions remaining: 2                 │  │  ║
║  │  └────────────────────────────────────────────────────────┘  │  ║
║  │                          │                                    │  ║
║  │                          ▼                                    │  ║
║  │  STEP 2: User Performs Action                                │  ║
║  │  ┌────────────────────────────────────────────────────────┐  │  ║
║  │  │  User clicks:                                          │  │  ║
║  │  │  • "Capture Now" (instant)                            │  │  ║
║  │  │  • "Auto Capture" (3 second countdown)                │  │  ║
║  │  └────────────────────────────────────────────────────────┘  │  ║
║  │                          │                                    │  ║
║  │                          ▼                                    │  ║
║  │  STEP 3: Capture Image                                       │  ║
║  │  ┌────────────────────────────────────────────────────────┐  │  ║
║  │  │  const imageData = captureImage()                     │  │  ║
║  │  │  // Returns: "data:image/png;base64,iVBORw..."        │  │  ║
║  │  └────────────────────────────────────────────────────────┘  │  ║
║  │                          │                                    │  ║
║  │                          ▼                                    │  ║
║  │  STEP 4: Verify Action                                       │  ║
║  │  ┌────────────────────────────────────────────────────────┐  │  ║
║  │  │  POST /api/verify-action                              │  │  ║
║  │  │  Body: {                                               │  │  ║
║  │  │    "gui": "...",                                       │  │  ║
║  │  │    "uid": "...",                                       │  │  ║
║  │  │    "action": "TouchNoseWithLeftHand",                 │  │  ║
║  │  │    "image": "data:image/png;base64,..."               │  │  ║
║  │  │  }                                                     │  │  ║
║  │  └────────────────────────────────────────────────────────┘  │  ║
║  │                          │                                    │  ║
║  │                          ▼                                    │  ║
║  │  STEP 5: Process Response                                    │  ║
║  │  ┌────────────────────────────────────────────────────────┐  │  ║
║  │  │  Response: {                                           │  │  ║
║  │  │    "status": "success",                                │  │  ║
║  │  │    "actions_size": 2,                                  │  │  ║
║  │  │    "action": "OpenMouth"  ← Next action                │  │  ║
║  │  │  }                                                     │  │  ║
║  │  └────────────────────────────────────────────────────────┘  │  ║
║  └──────────────────────────────────────────────────────────────┘  ║
║                                 │                                   ║
║                                 ▼                                   ║
║  ┌──────────────────────────────────────────────────────────────┐  ║
║  │  IF actions_size > 0: REPEAT LOOP with new action           │  ║
║  │  IF actions_size = 0: EXIT LOOP → Final Selfie              │  ║
║  └──────────────────────────────────────────────────────────────┘  ║
╚═════════════════════════════════════════════════════════════════════╝
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FINAL SELFIE STAGE                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Screen shows: "Take a final selfie - look straight"        │  │
│  │  Progress: 100% | All actions complete                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                 │                                   │
│                                 ▼                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  User captures final selfie                                  │  │
│  │  captureImage() → base64 data                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                 │                                   │
│                                 ▼                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  POST /api/final-image                                       │  │
│  │  Body: {                                                     │  │
│  │    "gui": "1733068137087_abc123xyz",                        │  │
│  │    "uid": "510a69bd-af1d-4c4f-b4bc-0715f883c56f",          │  │
│  │    "image": "data:image/png;base64,..."                     │  │
│  │  }                                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                 │                                   │
│                                 ▼                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Response: {                                                 │  │
│  │    "status": "success",                                      │  │
│  │    "reason": "SUCCESS"                                       │  │
│  │  }                                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     FINAL STATUS CHECK                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  POST /api/register (with same GUI)                         │  │
│  │  Body: { "gui": "1733068137087_abc123xyz" }                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                 │                                   │
│                                 ▼                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Response: {                                                 │  │
│  │    "action_status": "completed",                             │  │
│  │    "selfie_status": "completed",                             │  │
│  │    "reason": "SUCCESS",                                      │  │
│  │    "message": "Already process completed",                   │  │
│  │    "image": "./images/customers/{gui}/{gui}___FINAL.png"    │  │
│  │  }                                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ✅ VERIFICATION COMPLETE!                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  • Stop camera                                               │  │
│  │  • Show success animation                                    │  │
│  │  • Display completion message                                │  │
│  │  • Store verification result (optional)                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## State Transitions

```
┌──────────┐      initialize()      ┌──────────────┐
│   IDLE   │ ─────────────────────> │ INITIALIZING │
└──────────┘                        └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ REGISTERING  │
                                    └──────┬───────┘
                                           │
                                           ▼
                                ┌──────────────────────┐
                                │ WAITING_FOR_ACTION   │ ◄───┐
                                └──────┬───────────────┘     │
                                       │ startCapture()      │
                                       ▼                     │
                                ┌──────────────────────┐     │
                                │ CAPTURING_ACTION     │     │
                                └──────┬───────────────┘     │
                                       │ submitAction()      │
                                       ▼                     │
                                ┌──────────────────────┐     │
                                │ VERIFYING_ACTION     │     │
                                └──────┬───────────────┘     │
                                       │                     │
                          ┌────────────┴──────────┐          │
                          │                       │          │
                          ▼                       ▼          │
                  actions_size > 0        actions_size = 0   │
                          │                       │          │
                          └───────────────────────┘          │
                                                   │
                                                   ▼
                                        ┌──────────────────────┐
                                        │ WAITING_FOR_SELFIE   │
                                        └──────┬───────────────┘
                                               │ startCapture()
                                               ▼
                                        ┌──────────────────────┐
                                        │ CAPTURING_SELFIE     │
                                        └──────┬───────────────┘
                                               │ submitSelfie()
                                               ▼
                                        ┌──────────────────────┐
                                        │ SUBMITTING_SELFIE    │
                                        └──────┬───────────────┘
                                               │
                                               ▼
                                        ┌──────────────────────┐
                                        │ CHECKING_STATUS      │
                                        └──────┬───────────────┘
                                               │
                                               ▼
                                        ┌──────────────────────┐
                                        │    COMPLETED ✅      │
                                        └──────────────────────┘

                          (Any state can transition to ERROR on failure)
```

## Component Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        FaceScanHub.js                          │
│                                                                │
│  ┌─────────────────────┐         ┌───────────────────────┐   │
│  │   Video Display     │         │   Control Panel       │   │
│  │  ┌───────────────┐  │         │  ┌─────────────────┐  │   │
│  │  │  <video ref>  │  │         │  │ Capture Button  │  │   │
│  │  │               │  │         │  └─────────────────┘  │   │
│  │  │  Camera Feed  │  │         │  ┌─────────────────┐  │   │
│  │  │               │  │         │  │ Auto Capture    │  │   │
│  │  └───────────────┘  │         │  └─────────────────┘  │   │
│  │                     │         │                       │   │
│  │  ┌───────────────┐  │         │  ┌─────────────────┐  │   │
│  │  │ Scan Overlay  │  │         │  │ Tutorial Button │  │   │
│  │  │  (animated)   │  │         │  └─────────────────┘  │   │
│  │  └───────────────┘  │         └───────────────────────┘   │
│  └─────────────────────┘                                     │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    Progress Bar                          │ │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░  66%                       │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Current Action Display                      │ │
│  │       "Touch your nose with your left hand"              │ │
│  │              Actions remaining: 1                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Uses:                                                         │
│  • useCamera() ──────────> Video stream management            │
│  • useFaceScanWorkflow() ─> State & API orchestration        │
│  • faceScanApi ───────────> Direct API calls                 │
└────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Action (Capture)
         │
         ▼
    captureImage()
         │
         ▼
    Base64 PNG Data
         │
         ▼
  submitAction(image)
         │
         ▼
   faceScanApi.verifyAction()
         │
         ▼
    API Server
         │
         ▼
   JSON Response
         │
         ▼
  Update State
   • currentAction
   • actionsRemaining
   • progress
         │
         ▼
   Re-render UI
```

## Error Flow

```
API Call Fails
      │
      ▼
  Try-Catch
      │
      ▼
Retry Counter < 3?
      │
      ├─ YES ──> Increment retry, show message, stay in WAITING state
      │
      └─ NO  ──> Set ERROR state, show error UI, offer manual retry
```

## Timeline Example

```
00:00  User opens page
00:01  Camera permission granted
00:02  Session registered (GUI + UID received)
00:03  First action displayed: "Touch nose with left hand"
00:05  User touches nose
00:06  User clicks "Capture Now"
00:07  Image captured and sent to API
00:09  Verification complete, next action: "Open mouth"
00:11  User opens mouth
00:12  Auto-capture countdown: 3... 2... 1...
00:15  Captured and verified
00:16  Next action: "Turn face left"
00:18  User turns face
00:19  Manual capture
00:21  All actions complete (actions_size = 0)
00:22  Prompt for final selfie
00:24  User takes selfie
00:25  Selfie submitted
00:27  Final status verified
00:28  ✅ Success message displayed
00:29  Camera stopped
```

## Progress Calculation

```
Total Steps = actions_size + 1 (selfie)

Example: 3 actions + 1 selfie = 4 total steps

Progress at start:        0/4 = 0%
After 1st action:         1/4 = 25%
After 2nd action:         2/4 = 50%
After 3rd action:         3/4 = 75%
After final selfie:       4/4 = 100%
```

## Memory Management

```
Component Mount
    ↓
Camera Stream Created
    ↓
Refs Initialized:
  • guiRef
  • uidRef
  • videoRef
  • streamRef
    ↓
[User Interaction]
    ↓
Component Unmount
    ↓
Cleanup:
  • Stop camera tracks
  • Clear video srcObject
  • Reset refs to null
    ↓
Memory Released
```

---

This visual flow provides a comprehensive understanding of how the face scan workflow operates from start to finish.
