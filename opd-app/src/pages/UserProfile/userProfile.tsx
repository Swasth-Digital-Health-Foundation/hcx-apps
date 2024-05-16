import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import ActiveClaimCycleCard from "../../components/ActiveClaimCycleCard";
import * as _ from "lodash"

const userProfile = () => {
    const [userInfo, setUserInformation] = useState<any>([]);
    const [searchedMobileNumber, setSearchedMobile] = useState<any>();
    const location = useLocation();
    const [isOpen, setOpen] = useState<boolean>(false);
    const container: any = useRef<HTMLInputElement>();

    const handelDisplayData = () => {
        setOpen(!isOpen)
        container.current?.scrollTo({ top:100});
    }    

    useEffect(() => {
        setUserInformation(location?.state?.userInfo)
        setSearchedMobile(location?.state?.searchedMobileNumber)
    });

    const patientProfile = [
        {
            "key": "Patient Id : ",
            "value": userInfo?.beneficiaryId
        },
        {
            "key": "Name : ",
            "value": userInfo?.userName
        },
        {
            "key": "Contact :",
            "value": searchedMobileNumber
        },
        {
            "key": "Address :",
            "value": userInfo?.address
        }
    ]

    const medicalHistory = [
        {
            "key": "Blood Group :",
            "value": userInfo?.medicalHistory?.blood_group
        },
        {
            "key": "Allergies :",
            "value": userInfo?.medicalHistory?.allergies
        }
    ]


    const latestStatusByEntry: Record<string, string | undefined> = {};

    location.state?.activeRequests.forEach((entry: Record<string, any>) => {
        for (const [key, items] of Object.entries(entry)) {
            // Find the item with the latest date
            const latestItem = items.reduce((latest: any, item: any) => {
                const itemDate = parseInt(item.date, 10);
                if (!latest || itemDate > parseInt(latest.date, 10)) {
                    return item;
                }
                return latest;
            }, null);

            // Extract the status of the latest item
            if (latestItem) {
                latestStatusByEntry[key] = latestItem.status;
            }
        }
    });

    return (
        <div ref={container} className="relative">
            <label className="block mb-2 text-left text-2xl font-bold text-black dark:text-white">
                {"Patient details"}
            </label>
            <div className="relative border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
                {
                    patientProfile?.map((patient) => <div className="flex gap-3 p-1">
                        <h2 className="text-bold text-base font-bold text-black dark:text-white">
                            {patient.key}
                        </h2>
                        <span className="text-base font-medium">{patient.value}</span>
                    </div>)
                }
            </div>
            <h2 className="text-bold mt-2 -p-1 -mb-2 text-2xl font-medium text-black dark:text-white">
                Medical history:
            </h2>
            <div className="relative mt-3 rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
                {
                    medicalHistory?.map((medical) => <div className="flex gap-3 p-1">
                        <h2 className="text-bold text-base font-bold text-black dark:text-white">
                            {medical.key}
                        </h2>
                        <span className="text-base font-medium">{medical.value}</span>
                    </div>)
                }
            </div>
            <h2 className="text-bold mt-2 -p-1 -mb-2 text-2xl font-medium text-black dark:text-white">
                Insurance details:
            </h2>
            <div className='relative mt-3 rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark'>
                {userInfo?.payorDetails && userInfo.payorDetails.map((detail: any, index: any) => {
                    const insuranceDetails = [
                        {
                            key: "Beneficiary Name:",
                            value: detail.beneficiary_name
                        },
                        {
                            key: "Insurance ID:",
                            value: detail.insurance_id
                        },
                        {
                            key: "Payor code:",
                            value: detail.payor
                        },
                        {
                            key: "Payor Name:",
                            value: detail.payorName
                        }
                    ]
                    return (
                        <div key={index} className="mt-2 rounded-lg border border-stroke bg-white p-2 shadow-default dark:border-strokedark dark:bg-boxdark flex-container">
                            {insuranceDetails?.map((item) => {
                                return <div className="flex gap-2">
                                    <h2 className="text-bold text-base font-bold text-black dark:text-white">{item.key}</h2>
                                    <span className="text-base font-medium">{item.value}</span>
                                </div>
                            })}
                        </div>
                    )
                })}
            </div>
            <button
                className="absolute right-0 pb-3 text-end text-red-500  p-1 underline"
                onClick={() => { handelDisplayData() }} >
                {
                    isOpen ? "Remove" : "Claim histroy"
                }
            </button>
            {isOpen && <div  className="pt-4">
                <h1 className="mt-5 px-1 text-2xl font-bold text-black dark:text-white">
                    {"History"} ({location?.state?.activeRequests.length})
                </h1>
                {_.map(location?.state?.displayedData, (ele: any, index: number) => (
                    <div className="mt-2" key={index}>
                        <ActiveClaimCycleCard
                            participantCode={ele.sender_code}
                            payorCode={ele.recipient_code}
                            date={ele.date}
                            insurance_id={ele.insurance_id}
                            claimType={ele.claimType}
                            apiCallId={ele.apiCallId}
                            status={latestStatusByEntry[ele.workflow_id]}
                            type={ele.type}
                            mobile={location.state}
                            billAmount={ele.billAmount}
                            workflowId={ele.workflow_id}
                            patientMobileNumber={ele.mobile || searchedMobileNumber}
                            patientName={ele.patientName}
                            recipient_code={ele.recipient_code}
                        />
                    </div>
                ))}
            </div>}
        </div>

    );




};

export default userProfile