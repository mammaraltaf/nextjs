import DropDownMenu from '@/app/PageComponents/DropDownMenu'
import EINNumber from '@/app/PageComponents/EINNumber'
import SocialSecurityNumber from '@/app/PageComponents/SocialSecurityNumber'
import ToggleButton from '@/app/PageComponents/ToggleButton'
import React from 'react'
import AutoDropDownMenu from './AutoDropDownMenu'
import HereGeoLocationComponent from './HereGeoLocationComponent'
import Telephone from './Telephone'

export default function DynamicComponent({
    form,
    setform,
    handleChange,
    formErrors,
    label,
    id,
    type,
    classes='',
    labelClasses ='',
    setFormErrors,
    options = [],
    placeholder = ``,
    required = false,
    formState = 0,
    section = null,
    index = null,
    conditionalId = null,
    condition = null,
    hlink = null,
    label2 = null,
    toggleIDs = null,
    disabled = false,
    label3 = null,
    maxCharacters = 3000,
    setVerifiedAddress = null,
    compiledBlockedTerms = null
    }) {
  return (
    type === 'br' ?
    <br key={index} /> :
    type === 'sectionHeading' ?
    <div key={index} className='col-span-3 text-2xl font-bold text-[var(--primary)] mt-6'>
        <h2 key={`section-heading-${index}`}>{label}</h2>
    </div>: 
    type=== 'heading2' ?
    <div key={index} className={`col-span-3 text-lg font-bold mt-2 mb-1 ${classes}`}>
        <h2 key={`heading2-${index}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </h2>
        {
            label2 && <span className="text-gray-500 text-sm font-normal ml-1 italic">{label2}</span>
        }
        <div id={`error-${id}`} className="text-red-500 text-xs">{formErrors[id]}</div>
    </div>
    :
    type === 'conditionalDDM' && form[conditionalId] && form[conditionalId]===condition?
    <div className={`mr-5`}>
        <label className={`flex ${type==='toggle'?'hidden':'block'} ${labelClasses}`}>
                {label} 
                {required && <span className="text-red-500">*</span>}
                {label2 && <span className="text-gray-500 font-bold ml-2 italic">{label2}</span>}
                {hlink && <a href={hlink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">Learn more</a>}
        </label>
       <DropDownMenu
                    id={id}
                    key={index}
                    name={label}
                    form={form}
                    setform={setform}
                    formErrors={formErrors}
                    handleChange={handleChange}
                    options={options}
                    formState={formState}
                    setFormErrors={setFormErrors}
                    sliceText={true}
                />
    </div>:
    type === 'textarea'?
    <div className={`flex relative mt-8 flex-col ${classes}`}>
        <label className={`flex flex-col !text-base !text-blue-600 font-bold`}>
            <span>{label} {required && <span className="text-red-500">*</span>}</span>
            {label2 && <span className="text-gray-500 text-sm font-normal ml-1 italic">{label2}</span>}
            {hlink && <a href={hlink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">Learn more</a>}
        </label>
        <textarea
            id={id}
            name={label}    
            value={form[id] || ''}
            onChange={handleChange}
            className="border p-2 rounded w-full bg-white"
            //placeholder={`${placeholder}`}
            rows={10}
        />
        <div className={`absolute right-0 -bottom-7 ${form[id] && form[id].length > maxCharacters ? 'text-red-500' : 'text-gray-600'}`}>{`${form[id]?form[id].length:0}/${maxCharacters} characters remaining`}</div>
        <div id={`error-${id}`} className="text-red-500 text-xs">{formErrors[id]}</div>
    </div>:
    condition && condition === 'false' && form[conditionalId].toString()==='false'?
    <div className={`${classes} flex flex-col relative`}>
            <label htmlFor={id} className={`${type==='toggle'?'hidden':'block'}`}>
                {label+(form[conditionalId].toString()==='false').toString()} 
                {required && <span className="text-red-500">*</span>}
                {label2 && <span className="text-gray-500 font-bold ml-2 italic">{label2}</span>}
                {hlink && <a href={hlink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">Learn more</a>}
            </label>
           {
            type === 'ddm'?  (
            <DropDownMenu
                id={id}
                key={index}
                name={label}
                form={form}
                setform={setform}
                formErrors={formErrors}
                handleChange={handleChange}
                options={options}
                formState={formState}
                setFormErrors={setFormErrors}
            />
            ):
            type === 'ddm'?  (
            <DropDownMenu
                id={id}
                key={index}
                name={label}
                form={form}
                setform={setform}
                formErrors={formErrors}
                handleChange={handleChange}
                sliceText={true}
                options={options}
                formState={formState}
                setFormErrors={setFormErrors}
            />
            
            ): type === 'empty' ?
                <div key={index} className="invisible"></div>  :
            type === 'toggle' ?
            <ToggleButton
                id={id}
                label={label}
                form={form}
                setForm={setform}
                formErrors={formErrors}
                handleChange={handleChange}
                classes='!text-base !text-gray-700'
                toggleIDs={toggleIDs}
                secondaryLabel={label2}
            /> :
            type === 'ssn'?
            <SocialSecurityNumber   
                id={id}
                name={label}
                form={form}
                setform={setform}
                formErrors={formErrors}
                setFormErrors={setFormErrors}
                section={section}
                handleChange={handleChange}
                classes='!bg-white'
                />:
            type === 'EIN'?
            <EINNumber
                id={id}
                name={label}
                form={form}
                setform={setform}
                formErrors={formErrors}
                setFormErrors={setFormErrors}
                section={section}
                handleChange={handleChange}
                classes={`${classes} !bg-white`}
            /> :
            type==='hereGeoLocation' ?
            <HereGeoLocationComponent
                id ={id}
                form={form}
                setform={setform}
                setformErrors={setFormErrors}
                formErrors={formErrors}
                section={section}
                classes={`!bg-white ${classes}`}
                setVerifiedAddress={setVerifiedAddress}
                compiledBlockedTerms={compiledBlockedTerms}
            />:
            <input
                    type={type}
                    id={id}
                    name={label}
                    value={form[id] || ''}
                    onChange={(e)=>{
                        if(e.target.value==='e' && type==='number') return;
                        handleChange(e);
                    }}
                    className="border p-2 rounded w-full bg-white"
                    
                  
                />
           }
           <div id={`error-${id}`} className="text-red-500 text-xs">{formErrors[id]}</div>
    </div>:
    type === 'label'?
    <div key={index} className={`col-span-3 ${classes}`}>
      {label}
    </div>:
    type === 'checklist' ?
    <div key={index} className={`flex gap-6 px-5 ${classes}`}>
        <div>
            {
                options.slice(0,11).map((option, optIndex) => (
                    <div key={`option-${optIndex}`} className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            id={`${id}-${optIndex}`}
                            name={option.value}
                            checked={form[id][optIndex].value || false}
                            onChange={(e) => {
                                setform({ ...form, [id]: form[id].map((item, index) => index === optIndex ? { ...item, value: e.target.checked } : item)     });
                                //handleChange(e);
                            }}
                            className="mr-2 bg-white"
                        />
                        <label htmlFor={`${id}-${optIndex}`} className="text-gray-700 !text-sm">{option.label}</label>
                    </div>
                ))}
        </div>
        <div>
            {
                options.slice(11, 22).map((option, optIndex) => {
                    const actualIndex = optIndex + 11;
                    return (
                    <div key={`option-${actualIndex}`} className="flex items-center mb-2">
                        <input
                        type="checkbox"
                        id={`${id}-${actualIndex}`}
                        name={option.value}
                        checked={form[id]?.[actualIndex]?.value || false}
                        onChange={(e) => {
                            const updatedArray = form[id].map((item, index) =>
                            index === actualIndex ? { ...item, value: e.target.checked } : item
                            );
                            setform({ ...form, [id]: updatedArray });
                        }}
                        className="mr-2"
                        />
                        <label htmlFor={`${id}-${actualIndex}`} className="text-gray-700 !text-sm">
                        {option.label}
                        </label>
                    </div>
                    );
                })
                }

        </div>
        <div>
            {
                options.slice(22, 33).map((option, optIndex) => {
                    const actualIndex = optIndex + 22;
                    return (
                    <div key={`option-${actualIndex}`} className="flex items-center mb-2">
                        <input
                        type="checkbox"
                        id={`${id}-${actualIndex}`}
                        name={option.value}
                        checked={form[id]?.[actualIndex]?.value || false}
                        onChange={(e) => {
                            const updatedArray = form[id].map((item, index) =>
                            index === actualIndex ? { ...item, value: e.target.checked } : item
                            );
                            setform({ ...form, [id]: updatedArray });
                        }}
                        className="mr-2"
                        />
                        <label htmlFor={`${id}-${actualIndex}`} className="text-gray-700 !text-sm">
                        {option.label}
                        </label>
                    </div>
                    );
                })
                }
        </div>
        <div>
            {
                options.slice(33).map((option, optIndex) => {
                    const actualIndex = optIndex + 33;
                    return (
                    <div key={`option-${actualIndex}`} className="flex items-center mb-2">
                        <input
                        type="checkbox"
                        id={`${id}-${actualIndex}`}
                        name={option.value}
                        checked={form[id]?.[actualIndex]?.value || false}
                        onChange={(e) => {
                            const updatedArray = form[id].map((item, index) =>
                            index === actualIndex ? { ...item, value: e.target.checked } : item
                            );
                            setform({ ...form, [id]: updatedArray });
                        }}
                        className="mr-2"
                        />
                        <label htmlFor={`${id}-${actualIndex}`} className="text-gray-700 !text-sm">
                        {option.label}
                        </label>
                    </div>
                    );
                })
                }
        </div>
    </div>:
    type === 'yes/no' ?
    <div key={index} className={`flex flex-col`}>
        <label className={`${labelClasses}`}>
            {label}
            {required && <span className="text-red-500">*</span>}
        </label>
        <div id={`error-${id}`} className="text-red-500 text-xs font-bold">{formErrors[id]}</div>
        <div className='flex px-15 py-3'>
               <input
                    type="radio"
                    id={`${id}-yes`}
                    name={id}
                    value="yes"
                    checked={form[id] === true}
                    onChange={() => {
                        setform({ ...form, [id]: true });
                    }}
                    className="mr-2"
                />
                <label htmlFor={`${id}-yes`} className="mr-4 !text-sm">Yes</label>

                <input
                    type="radio"
                    id={`${id}-no`}
                    name={id}
                    value="no"
                    checked={form[id] === false}
                    onChange={() => {
                        setform({ ...form, [id]: false });
                    }}
                    className="mr-2"
                />
                <label htmlFor={`${id}-no`} className="mr-4 !text-sm">No</label>
        </div>
    </div>:
    <div className={`${classes} ${conditionalId? form[conditionalId] && form[conditionalId].toString()===condition.toString() ? 'flex flex-col relative' : 'hidden' : 'flex flex-col relative'}`}>
            <label className={`flex ${type==='toggle'?'hidden':'block'} ${labelClasses}`}>
                {label} 
                {required && <span className="text-red-500">*</span>}
                {label2 && <span className="text-gray-500 font-bold ml-2 italic">{label2}</span>}
                {hlink && <a href={hlink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">Learn more</a>}
            </label>
            {label3 && <span className="text-gray-500 text-sm font-normal ml-1 italic">{label3}</span>}
           {
            
            type === 'tel'?
            <Telephone
                id={id}
                form={form}
                setform={setform}
                setFormErrors={setFormErrors}
                section={section}
                handleChange={handleChange}
            />:
            type === 'hereGeoLocation' ?
            <HereGeoLocationComponent
             id ={id}
             form={form}
             setform={setform}
             setformErrors={setFormErrors}
             formErrors={formErrors}
             setVerifiedAddress={setVerifiedAddress}
             section={section}
             classes={`!bg-white ${classes}`}
                compiledBlockedTerms={compiledBlockedTerms}
            />:
            type === 'autoddm' ? 
                <AutoDropDownMenu
                    id={id}
                    key={index}
                    name={label}
                    form={form}
                    setform={setform}
                    formErrors={formErrors}
                    handleChange={handleChange}
                    options={options}
                    formState={formState}
                    setFormErrors={setFormErrors}
                    classes={`!bg-white ${classes}`}
                    compiledBlockedTerms={compiledBlockedTerms}
                />:
            type === 'ddm'?  (
            <DropDownMenu
                id={id}
                key={index}
                name={label}
                form={form}
                setform={setform}
                formErrors={formErrors}
                handleChange={handleChange}
                sliceText={true}
                options={options}
                formState={formState}
                setFormErrors={setFormErrors}
                classes={classes}
            />
            ):
            type === 'empty' ?
                <div key={index} className="invisible"></div>  :
            type === 'toggle' ?
            <ToggleButton
                id={id}
                label={label}
                form={form}
                setForm={setform}
                formErrors={formErrors}
                handleChange={handleChange}
                classes={classes}
                toggleIDs={toggleIDs}
                secondaryLabel={label2}
            /> :
            type === 'ssn'?
            <SocialSecurityNumber   
                id={id}
                name={label}
                form={form}
                setform={setform}
                formErrors={formErrors}
                setFormErrors={setFormErrors}
                section={section}
                handleChange={handleChange}
                />:
            type === 'EIN'?
            <EINNumber
                id={id}
                name={label}
                form={form}
                setform={setform}
                formErrors={formErrors}
                setFormErrors={setFormErrors}
                section={section}
                handleChange={handleChange}
            /> :
            <input  
                type={type}
                id={id}
                name={label}
                value={form[id] || ''}
                onChange={(e) => {
                    handleChange(e);
                }}
                
                onKeyDown={(e) => {
                    if (['e', 'E', '+', '-'].includes(e.key)) {
                        if(type === 'number') {
                            e.preventDefault();
                        }
                    }
                }}
                className="border p-2 rounded w-full !bg-white"
                disabled={disabled}
                placeholder={`${placeholder}`}
            />

           }
           <div id={`error-${id}`} className="text-red-500 text-xs">{formErrors[id]}</div>
    </div>
  )
}
