/**
 * Test script for Face Scan API integration
 * Run with: node test-face-scan.mjs
 */

const API_URL = "https://george-backend.quantilence.com";

// Generate a unique GUI
const generateGUI = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `test_${timestamp}_${random}`;
};

// Test 1: Register Session
async function testRegister() {
  console.log("\n========== TEST 1: Register Session ==========");
  const gui = generateGUI();
  console.log("Generated GUI:", gui);

  try {
    const response = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gui }),
    });

    const data = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));

    if (data.status === "success") {
      console.log("✅ Registration successful!");
      console.log("   - UID:", data.uid);
      console.log("   - First Action:", data.action);
      console.log("   - Actions Remaining:", data.actions_size);
      return { gui, uid: data.uid, action: data.action };
    } else {
      console.log("❌ Registration failed:", data.message);
      return null;
    }
  } catch (error) {
    console.error("❌ Error during registration:", error.message);
    return null;
  }
}

// Test 2: Verify Action (with dummy image)
async function testVerifyAction(gui, uid, action) {
  console.log("\n========== TEST 2: Verify Action ==========");
  console.log("Action to verify:", action);

  // Create a small dummy base64 image (1x1 transparent PNG)
  const dummyImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  try {
    const response = await fetch(`${API_URL}/api/verify-action`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gui,
        uid,
        action,
        image: dummyImage,
      }),
    });

    const data = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));

    if (data.status === "success") {
      console.log("✅ Action verification call successful!");
      console.log("   - Next Action:", data.action);
      console.log("   - Actions Remaining:", data.actions_size);
      return data;
    } else {
      console.log("⚠️  Verification response:", data.message);
      return data;
    }
  } catch (error) {
    console.error("❌ Error during action verification:", error.message);
    return null;
  }
}

// Test 3: Submit Final Image
async function testFinalImage(gui, uid) {
  console.log("\n========== TEST 3: Submit Final Image ==========");

  const dummyImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  try {
    const response = await fetch(`${API_URL}/api/final-image`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gui,
        uid,
        image: dummyImage,
      }),
    });

    const data = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));

    if (data.status === "success") {
      console.log("✅ Final image submission call successful!");
      return data;
    } else {
      console.log("⚠️  Final image response:", data.message);
      return data;
    }
  } catch (error) {
    console.error("❌ Error during final image submission:", error.message);
    return null;
  }
}

// Test 4: Check Final Status
async function testFinalStatus(gui) {
  console.log("\n========== TEST 4: Check Final Status ==========");

  try {
    const response = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gui }),
    });

    const data = await response.json();
    console.log("Response Status:", response.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));

    if (
      data.action_status === "completed" &&
      data.selfie_status === "completed"
    ) {
      console.log("✅ Workflow completed!");
      console.log("   - Reason:", data.reason);
      console.log("   - Image Path:", data.image);
    } else {
      console.log("⚠️  Workflow status:");
      console.log("   - Action Status:", data.action_status);
      console.log("   - Selfie Status:", data.selfie_status);
      console.log("   - Message:", data.message);
    }
    return data;
  } catch (error) {
    console.error("❌ Error during status check:", error.message);
    return null;
  }
}

// Main test runner
async function runTests() {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║   Face Scan API Integration Test Suite    ║");
  console.log("╚════════════════════════════════════════════╝");

  try {
    // Test 1: Register
    const registerResult = await testRegister();
    if (!registerResult) {
      console.log("\n❌ Test suite aborted: Registration failed");
      return;
    }

    const { gui, uid, action } = registerResult;

    // Test 2: Verify Action (just test the API call, not actual verification)
    await testVerifyAction(gui, uid, action);

    console.log("\n========================================");
    console.log("NOTE: This test uses dummy images.");
    console.log(
      "Actual verification will fail without real face images."
    );
    console.log(
      "The purpose is to verify API connectivity and response structure."
    );
    console.log("========================================");

    console.log("\n✅ All API connectivity tests completed!");
    console.log("\nNext steps:");
    console.log("1. Test with the actual React component");
    console.log("2. Grant camera permissions in the browser");
    console.log("3. Perform real face actions");
    console.log("4. Verify the complete workflow");
  } catch (error) {
    console.error("\n❌ Test suite error:", error);
  }
}

// Run the tests
runTests();
