import React from "react"
import * as _ from "lodash"
import thumbnail from "../images/pngwing.com.png"

const PreauthAndCliamDetails = (props: any) => {
    const { preauthOrClaimList } = props;
    return (
        <>
            {preauthOrClaimList.map((ele: any, index: any) => {
                const additionalInfo = JSON.parse(ele?.additionalInfo)
                return (
                    <div key={index}>
                        <div className=" flex items-center justify-between">
                            <h2 className="sm:text-title-xl1 mt-3 text-2xl font-semibold text-black dark:text-white">
                                {ele?.type.charAt(0).toUpperCase() + ele?.type.slice(1)}{' '}
                                details :
                            </h2>
                            {ele?.status === "Approved" ? (
                                <div className="sm:text-title-xl1 mb-1 text-end font-semibold text-success dark:text-success">
                                    &#10004; Approved
                                </div>
                            ) : ele?.status === "Rejected" ? (
                                <div className="sm:text-title-xl1 mb-1 text-end font-semibold text-danger dark:text-danger">
                                    Rejected
                                </div>
                            ) : (
                                <div className="sm:text-title-xl1 mb-1 text-end font-semibold text-warning dark:text-success">
                                    Pending
                                </div>
                            )}
                        </div>
                        <div className="mt-4 rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
                            <div className="flex items-center justify-between">
                                <h2 className="sm:text-title-xl1 text-1xl mt-2 mb-4 font-semibold text-black dark:text-white">
                                    Treatment & billing details : *
                                </h2>
                            </div>
                            <div>
                                <div className="mb-2 ">
                                    <div className="flex gap-2">
                                        <h2 className="text-bold text-base font-bold text-black dark:text-white">
                                            Service type :
                                        </h2>
                                        <span className="text-base font-medium">
                                            {ele.claimType}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <h2 className="text-bold text-base font-bold text-black dark:text-white">
                                            Bill amount :
                                        </h2>
                                        <span className="text-base font-medium">
                                            INR {ele.billAmount}
                                        </span>
                                    </div>
                                    {
                                        additionalInfo?.financial?.approved_amount &&
                                        <div className="flex gap-2">
                                            <h2 className="text-bold text-base font-bold text-black dark:text-white">
                                                Approved amount :
                                            </h2>
                                            <span className="text-base font-medium">
                                                INR {additionalInfo?.financial?.approved_amount}
                                            </span>
                                        </div>
                                    }
                                </div>
                            </div>
                            {_.isEmpty(ele.supportingDocuments) ? null : <>
                                <h2 className="text-bold mb-3 text-base font-bold text-black dark:text-white">
                                    Supporting documents :
                                </h2>
                                {Object.entries(ele.supportingDocuments).map(([key, values]) => (
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
                                                                {/* <img key={index} height={100} width={100} src={thumbnail} alt={`${key} ${index + 1}`} /> */}
                                                                <svg
                                                                                    className="fill-current"
                                                                                    width="18"
                                                                                    height="18"
                                                                                    viewBox="0 0 18 18"
                                                                                    fill="none"
                                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                                >
                                                                                    <path
                                                                                        d="M16.8754 11.6719C16.5379 11.6719 16.2285 11.9531 16.2285 12.3187V14.8219C16.2285 15.075 16.0316 15.2719 15.7785 15.2719H2.22227C1.96914 15.2719 1.77227 15.075 1.77227 14.8219V12.3187C1.77227 11.9812 1.49102 11.6719 1.12539 11.6719C0.759766 11.6719 0.478516 11.9531 0.478516 12.3187V14.8219C0.478516 15.7781 1.23789 16.5375 2.19414 16.5375H15.7785C16.7348 16.5375 17.4941 15.7781 17.4941 14.8219V12.3187C17.5223 11.9531 17.2129 11.6719 16.8754 11.6719Z"
                                                                                        fill=""
                                                                                    />
                                                                                    <path
                                                                                        d="M8.55074 12.3469C8.66324 12.4594 8.83199 12.5156 9.00074 12.5156C9.16949 12.5156 9.31012 12.4594 9.45074 12.3469L13.4726 8.43752C13.7257 8.1844 13.7257 7.79065 13.5007 7.53752C13.2476 7.2844 12.8539 7.2844 12.6007 7.5094L9.64762 10.4063V2.1094C9.64762 1.7719 9.36637 1.46252 9.00074 1.46252C8.66324 1.46252 8.35387 1.74377 8.35387 2.1094V10.4063L5.40074 7.53752C5.14762 7.2844 4.75387 7.31252 4.50074 7.53752C4.24762 7.79065 4.27574 8.1844 4.50074 8.43752L8.55074 12.3469Z"
                                                                                        fill=""
                                                                                    />
                                                                                </svg>
                                                                <span>{decodeURIComponent(fileName)}</span>
                                                            </div>
                                                        </a>
                                                    )
                                                })}
                                        </div>
                                    </div>
                                ))}
                            </>}
                            {
                                ele?.accountNumber === '1234' ? <></> :
                                    <div className='mt-2'>
                                        <div className="flex items-center justify-between">
                                            <h2 className="sm:text-title-xl1 text-1xl mt-2 mb-1 font-semibold text-black dark:text-white">
                                                Beneficiary bank details :
                                            </h2>
                                        </div>
                                        <div>
                                            <div>
                                                <div className='flex gap-2'>
                                                    <h2 className="text-bold text-base font-bold text-black dark:text-white">
                                                        Account number :
                                                    </h2>
                                                    <span className="text-base font-medium">{ele.accountNumber}</span>
                                                </div>
                                                <div className='flex gap-2'>
                                                    <h2 className="text-bold text-base font-bold text-black dark:text-white">
                                                        IFSC code :
                                                    </h2>
                                                    <span className="text-base font-medium">{ele.ifscCode}</span>                        </div>
                                            </div>
                                        </div>
                                    </div>
                            }
                        </div>
                    </div>
                );
            })}
        </>
    )
}

export default PreauthAndCliamDetails