import React from 'react'

// ToggleButton.js
// This component is designed to create a toggle button that can be used to switch between two states, such as agreeing or disagreeing with a statement.
// It also supports additional functionality like disabling other toggle buttons when one is activated.
export default function ToggleButton({label, id, form, setform, required,toggleIDs=null, secondaryLabel=null, classes}) {
    const [isChecked, setIsChecked] = React.useState(false);
    // Initialize the toggle state based on the form prop
    React.useEffect(() => {
        if (form) {
            setIsChecked(form[id] || false);
        }
    }, [form[id]]);
    // Update the form state when the toggle button is clicked
    React.useEffect(() => {
        if (isChecked && toggleIDs && Array.isArray(toggleIDs)) {
            let  valsOBJ = {}
            toggleIDs.forEach(toggleId => {
                valsOBJ[toggleId] = false;
            });
            setform(prev => ({
                ...prev,
                ...valsOBJ
            }));
        }
    }, [isChecked]);
  return (
    <div className='flex gap-2 items-start p-1'>
        <label className={`text-lg text-gray-600 ml-2 ${classes || ''}`} htmlFor={id}>
            {
                label.includes(':') ?
                <>
                <span className='font-bold mr-1'>{label.split(':')[0]}:</span> 
                <span>{label.split(':')[1]}</span>
                </>
                :<span>{label}</span>
            }
            <span className={`text-blue-500 font-bold`}>{required ? '*' : ''}</span>
            {secondaryLabel && <span className='text-gray-500 italic font-semibold ml-1'>{secondaryLabel}</span>}
        </label>
        <div className='w-10 mt-1'>
            <button
            type="button"
            className={`w-15 h-7 flex items-center rounded-full px-2 transition-colors duration-300 hover:cursor-pointer ${
                isChecked ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            onClick={() => setform(prev => {
                const newValue = !isChecked;
                return {
                    ...prev,
                    [id]: newValue
                };
            })}
            >
            <div
                className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                isChecked ? 'translate-x-8' : ''
                }`}
            />
            </button>
        </div>
    </div>
  )
}
