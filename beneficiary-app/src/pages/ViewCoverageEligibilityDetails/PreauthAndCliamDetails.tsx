import * as _ from "lodash"
import strings from '../../utils/strings'
import thumbnail from "../../images/pngwing.com.png"

const PreauthAndCliamDetails = (props: any) => {
    const { preauthOrClaimList } = props;
    return (
        <>
            {_.map(preauthOrClaimList, (ele: any) => {
                const additionalInfo = JSON.parse(ele?.additionalInfo)
                return (
                    <>
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
                                    {strings.TREATMENT_AND_BILLING_DETAILS}
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
                                                                <img key={index} height={100} width={100} src={thumbnail} alt={`${key} ${index + 1}`} />
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
                    </>
                );
            })}
        </>
    )
}

export default PreauthAndCliamDetails