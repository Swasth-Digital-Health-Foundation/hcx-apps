const Info = (props: any) => {
    const { setPopup, popup, requestDetails, location } = props
    return (
        <div>
            <div className='absolute top-2 right-2' onClick={() => setPopup(!popup)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
            </div>
            {popup ?
                <div className='absolute top-8 right-2 bg-black text-white p-4'>
                    Api call Id : {location.state?.apiCallId || null} <br />
                    BSP_hcx_code : {requestDetails?.participantCode} <br />
                    workflowId : {requestDetails.workflowId || ''}
                </div>
                : null}
        </div>
    )
}

export default Info