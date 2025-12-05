import React from 'react'
import TextProcessor from './TextProcessor'

// ShowLiveTutorial.js
export default function ShowLiveTutorial({steps, currentStep, setCurrentStep, setShowTutorial}) {
  return (
    <div className="fixed h-full top-0 left-0 w-full  bg-black/50 bg-opacity-80 flex flex-col items-center justify-center p-4 rounded-md z-50">
        <div className="bg-white text-black rounded-lg p-6 w-full max-w-lg shadow-lg">
        {   steps[currentStep].finally?
            <h3 className="text-lg italic mx-5 text-center">
                {steps[currentStep].finally}
            </h3>:
            <h3 className="text-lg font-semibold mb-4">
                {steps[currentStep].title}
            </h3>
        }
        {steps[currentStep].description &&
            <div className="text-sm ">
                {
                    steps[currentStep].description.split('\n').map((line, index) => (
                        <TextProcessor key={index} text={line} />
                    ))
                }
            </div>
        }
        <div className="mt-4 flex justify-between items-center">
            <button
            onClick={() =>
                setCurrentStep((s) => Math.max(s - 1, 0))
            }
            disabled={currentStep === 0}
            className="text-sm text-blue-600 disabled:text-gray-400"
            >
            ◀ Previous
            </button>
            <button
            onClick={() =>
                setCurrentStep((s) =>
                Math.min(s + 1, steps.length - 1)
                )
            }
            disabled={currentStep === steps.length - 1}
            className="text-sm text-blue-600 disabled:text-gray-400"
            >
            Next ▶
            </button>
        </div>
        <button
            onClick={() => setShowTutorial(false)}
            className="mt-4 w-full bg-blue-600 text-white py-1.5 rounded hover:bg-blue-700"
        >
            Got It
        </button>
        </div>
    </div>
  )
}
