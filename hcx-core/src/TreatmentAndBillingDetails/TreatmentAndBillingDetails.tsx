import React from 'react'
import * as _ from "lodash"
import thumbnail from "../images/pngwing.com.png"

export const TreatmentAndBillingDetails = (props: any) => {
    const { treatmentDetails, details, claimAndPreauthEntries } = props
    return (
        <div className="mt-3 rounded-lg border border-stroke bg-white px-3 pb-3 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between">
                <h2 className="sm:text-title-xl1 text-1xl mt-2 mb-2 font-semibold text-black dark:text-white">
                    {/* {strings.TREATMENT_AND_BILLING_DETAILS} */}
                    Treatment & billing details : *
                </h2>
            </div>
            <div>
                {_.map(treatmentDetails, (ele: any, index: any) => {
                    return (
                        <div className="flex gap-2" key={index}>
                            <h2 className="text-bold text-base font-bold text-black dark:text-white">
                                {ele.key}
                            </h2>
                            <span className="text-base font-medium">{ele.value}</span>
                        </div>
                    );
                })}
                {details?.approvedAmount && <div className="flex gap-2">
                    <h2 className="text-bold text-base font-bold text-black dark:text-white">
                        Approved amount :
                    </h2>
                    <span className="text-base font-medium">INR {details?.approvedAmount}</span>
                </div>}
                {claimAndPreauthEntries.map((ele: any) => {
                    return (
                        _.isEmpty(ele.supportingDocuments) ? null : <>
                            <h2 className="text-bold mb-3 text-base font-bold text-black dark:text-white">
                                Supporting documents :
                            </h2>
                            {Object.entries(ele?.supportingDocuments).map(([key, values]) =>
                                <div key={key}>
                                    <h3 className='text-base font-bold text-black dark:text-white'>Document type : <span className='text-base font-medium'>{key}</span></h3>
                                    <div className='flex'>
                                        {Array.isArray(values) &&
                                            values.map((imageUrl, index) => {
                                                const parts = imageUrl.split('/');
                                                const fileName = parts[parts.length - 1];
                                                return (
                                                    <a href={imageUrl} download>
                                                        <div className='text-center'>
                                                            <img key={index} height={150} width={150} src={thumbnail} alt={`${key} ${index + 1}`} />
                                                            <span>{decodeURIComponent(fileName)}</span>
                                                        </div>
                                                    </a>
                                                )
                                            })}
                                    </div>
                                </div>

                            )}
                        </>
                    )
                })}
            </div>
        </div>

    )
}
