import { useEffect, useState } from 'react';
import { generateOutgoingRequest, searchUser, userUpdate } from '../../services/hcxMockService';
import { toast } from 'react-toastify';
import InsuranceDetailsForm from '../../components/InsuranceDetailsForm';
import TransparentLoader from '../../components/TransparentLoader';
import { useLocation } from 'react-router-dom';
import * as _ from "lodash"

const userProfile = () => {
    const [userInfo, setUserInformation] = useState<any>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUserName, setEditedUserName] = useState<string>('');
    const [editedEmail, setEditedEmail] = useState('');
    const [editedAddress, setEditedAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [beneficiaryName, setBeneficiaryName] = useState<string>('');
    const [payorParticipantCode, setPayorParticipantCode] = useState<string>('');
    const [insuranceId, setInsuranceId] = useState<string>('');
    const [payorName, setPayorName] = useState<string>('');
    const [isOpen, setOpen] = useState<boolean>(false)
    const [searchedMobileNumber, setSearchedMobileNumber] = useState<any>('');
    const location = useLocation();
    const [popup, setPopup] = useState(false);
    const [beneficiaryId, setBeneficiaryId] = useState<any>("");
    const [entries, setEntries] = useState<any[]>([]);
    const handleRefreshCoverageEligibility = async (insuranceId: string, payorName: string) => {
        try {
            setLoading(true);
            const coverageEligibilityPayload = {
                insuranceId: insuranceId,
                mobile: localStorage.getItem('mobile'),
                payor: payorName,
                providerName: "Demo Provider",
                serviceType: "OPD",
                app: "BSP",
                patientName: userInfo?.userName,
                participantCode: process.env.SEARCH_PARTICIPANT_USERNAME,
                password: process.env.SEARCH_PARTICIPANT_PASSWORD,
                recipientCode: userInfo?.payorDetails && userInfo?.payorDetails[0]?.payor
            };

            const response = await generateOutgoingRequest(
                "coverageeligibility/check",
                coverageEligibilityPayload
            );
            console.log("response...",response)
            if (response.status === 202) {
                toast.success("Coverage eligibility request sent successfully.");
                // Refresh the entries
                const updatedEntries = await generateOutgoingRequest('request/list', EligibilityPayload);
                setEntries(updatedEntries.data.entries);
            } else {
                toast.error("Failed to send coverage eligibility request.");
            }
        } catch (error) {
            console.error("Error in handleRefreshCoverageEligibility:", error);
            toast.error("Failed to send coverage eligibility request.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
    };

    useEffect(() => {
        setSearchedMobileNumber(location.state?.searchedMobileNumber)
        setUserInformation(location?.state?.userInfo)
        setBeneficiaryId(location?.state?.userInfo?.beneficiaryId)
        console.log('user info', location?.state?.userInfo);
    }, []);
    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const response = await generateOutgoingRequest('request/list', EligibilityPayload);
                setEntries(response.data.entries);
                console.log("CE request", response.data.entries)
            } catch (error) {
                console.error("Error fetching entries:", error);
            }
        };

        fetchEntries();
    }, []);
    const updatePayload = {
        mobile: searchedMobileNumber,
        beneficiary_id: beneficiaryId,
        name: editedUserName || location?.state?.userInfo?.userName,
        address: editedAddress || location?.state?.userInfo?.address,
        email: editedEmail || location?.state?.userInfo?.email,
    }

    const handleSaveClick = async () => {
        try {
            setIsEditing(false);
            const response: any = await userUpdate("user/update", updatePayload);
            if (response.status === 200) {
                setTimeout(async () => {
                    let searchResponse: any = await searchUser("user/search", searchedMobileNumber);
                    let filteredResults = searchResponse?.data?.filter((user: any) => user.beneficiaryId === beneficiaryId);
                    setUserInformation(filteredResults[0]);
                }, 2000);
                toast.success("Details updated successfully.");
            } else {
                toast.error("Failed to update details.");
            }
        } catch (error) {
            console.error("Error in handleDelete:", error);
            toast.error("Failed to update details.");
        } finally {
            setLoading(false);
        }
    };

    const handleStateChange = () => {
        setInsuranceId('');
        setBeneficiaryName('');
        setPayorName('');
        setPayorParticipantCode('');
    }

    const handleDelete = async (payorCode: any) => {
        try {
            setLoading(true);
            let filteredData = userInfo?.payorDetails.filter((ele: any) => ele.payor !== payorCode);
            const updatePayload = {
                mobile: searchedMobileNumber,
                beneficiary_id: beneficiaryId,
                payor_details: filteredData,
            };
            const response: any = await userUpdate("user/update", updatePayload);
            if (response.status === 200) {
                setTimeout(async () => {
                    let searchResponse: any = await searchUser("user/search", searchedMobileNumber);
                    let filteredResults = searchResponse?.data?.filter((user: any) => user.beneficiaryId === beneficiaryId);
                    setUserInformation(filteredResults[0]);
                    setLoading(false)
                    toast.success("Details updated successfully..!");
                }, 2000);
            } else {
                toast.error("Failed to update details.");
            }
        } catch (error) {
            console.error("Error in handleDelete:", error);
            toast.error("Failed to update details.");
        }
    };

    let coverageeligibilityPayload = {
        insuranceId: insuranceId,
        mobile: localStorage.getItem('mobile'),
        payor: payorName,
        providerName: "Demo Provider",
        serviceType: "OPD",
        app: "BSP",
        patientName: userInfo?.userName,
        participantCode: process.env.SEARCH_PARTICIPANT_USERNAME,
        password: process.env.SEARCH_PARTICIPANT_PASSWORD,
        recipientCode: userInfo?.payorDetails && userInfo?.payorDetails[0]?.payor
    }
    let EligibilityPayload = {
        mobile: localStorage.getItem('mobile'),
        app: "BSP",
    }
    const handleAddRemoveClick = () => {
        handleStateChange()
        setOpen(!isOpen);
    };

    const newPayorDetails = {
        payor: payorParticipantCode,
        payorName: payorName,
        insurance_id: insuranceId,
        beneficiary_name: beneficiaryName
    }

    const handelAddInsuranceDetails = async () => {
        try {
            setLoading(true)
            let searchResponse: any = searchUser("user/search", searchedMobileNumber);
            setUserInformation(searchResponse?.data?.result);
            const existPayorDetails = userInfo?.payorDetails && userInfo?.payorDetails
            const updatePayorDetails = [...existPayorDetails, newPayorDetails]
            const updatePayload = {
                mobile: searchedMobileNumber,
                payor_details: updatePayorDetails,
                beneficiary_id: beneficiaryId,
            };
            const response: any = await userUpdate("user/update", updatePayload);
            if (response.status === 200) {
                setTimeout(async () => {
                    let searchResponse: any = await searchUser("user/search", searchedMobileNumber);
                    let filteredResults = searchResponse?.data?.filter((user: any) => user.beneficiaryId === beneficiaryId);
                    setUserInformation(filteredResults[0]);
                    setLoading(false);
                    toast.success("Details updated successfully.");
                    await generateOutgoingRequest(
                        "coverageeligibility/check",
                        coverageeligibilityPayload
                    );
                }, 2000);
            } else {
                toast.error("Failed to update details.");
            }
        } catch (error) {
            toast.error("Failed to update details.");
        } finally {
            setOpen(false);
        }
    };
    const getStatusForInsuranceId = (insuranceId: string, entries: any[]): string => {
        for (const entry of entries) {
            const workflowId = Object.keys(entry)[0];
            const details = entry[workflowId][0];
            if (details.insurance_id === insuranceId) {
                return details.status;
            }
        }
        return "Pending";
    };

    return (
        <>
            {loading ? <TransparentLoader /> :
                <>
                    <h2 className="relative text-bold mb-3 text-2xl font-bold text-black dark:text-white">
                        Beneficiary Profile
                    </h2>
                    {beneficiaryId && (
                        <div className="mb-3 text-base font-medium text-black dark:text-white">
                            <h3 className="text-lg font-semibold">Beneficiary ID: {`BSP/${beneficiaryId.slice(0, 6)}`}
                            </h3>
                        </div>
                    )}
                    <div className="relative border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
                        <h2 className="text-bold text-base font-bold text-black dark:text-white">
                            Beneficiary Name :
                        </h2>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedUserName === '' ? userInfo?.userName : editedUserName}
                                className="w-full border border-stroke bg-transparent py-1 pl-2 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                onChange={(e) => setEditedUserName(e.target.value)}
                            />
                        ) : (
                            <span className="text-base font-medium">{userInfo?.userName}</span>
                        )}
                        <h2 className="mt-2 text-bold text-base font-bold text-black dark:text-white">
                            Beneficiary Mobile :
                        </h2>
                        <span className="text-base font-medium">{searchedMobileNumber}</span>
                        <h2 className="mt-2 text-bold text-base font-bold text-black dark:text-white">
                            Email ID:
                        </h2>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedEmail === '' ? userInfo?.email : editedEmail}
                                className="w-full border border-stroke bg-transparent py-1 pl-2 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                onChange={(e) => setEditedEmail(e.target.value)}
                            />
                        ) : (
                            <span className="text-base font-medium">{userInfo?.email}</span>
                        )}
                        <h2 className="mt-2 text-bold text-base font-bold text-black dark:text-white">
                            Address :
                        </h2>
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedAddress === '' ? userInfo?.address : editedAddress}
                                className="w-full   border border-stroke bg-transparent py-1 pl-2 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                onChange={(e) => setEditedAddress(e.target.value)}
                            />
                        ) : (
                            <span className="text-base font-medium">{userInfo?.address}</span>
                        )}
                        <div className="absolute top-0 right-0 text-end p-2 font-medium">
                            {!isEditing && <button onClick={handleEditClick}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                </svg>
                            </button>}
                        </div>
                    </div>
                    {isEditing && (
                        <div className='p-1 flex justify-between'>
                            <button onClick={handleCancelClick}>Cancel</button>
                            <button onClick={handleSaveClick}>Save</button>
                        </div>
                    )}
                    <h5 className="text-bold mt-2 mb-3 text-2xl font-bold text-black dark:text-white">
                        Insurance details:
                    </h5>
                    <div className='mt-3 mb-4 rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark'>
                        {userInfo?.payorDetails && userInfo.payorDetails.map(
                            (
                                detail: {
                                    beneficiary_name: any;
                                    insurance_id: any;
                                    payor: any;
                                    payorName: any;
                                },
                                index: any
                            ) => (
                                <div
                                    key={index}
                                    className="relative mt-4 rounded-lg border border-stroke bg-white p-2 shadow-default dark:border-strokedark dark:bg-boxdark"
                                >
                                    <button
                                        className="absolute bottom-0 right-0 text-red-500 p-1"
                                        onClick={() => handleDelete(detail.payor)} >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </button>
                                    <div className=''>
                                        {/* <div className="gap-2 mt-1">
                                            <h2 className="text-bold text-base font-bold text-black dark:text-white">
                                            Insurer HCX ID:
                                            </h2>
                                            <span className="text-base font-medium">{detail.payor}</span>
                                        </div> */}
                                        <div className="gap-2 mt-1.5">
                                            <h2 className="text-bold text-base font-bold text-black dark:text-white">
                                                Insurance ID:
                                                <span className="ml-180 text-green-500">
                                                    Status: {entries.length > 0 ? getStatusForInsuranceId(detail.insurance_id, entries) : "Loading..."}
                                                </span>
                                                <button
                                                    onClick={() => handleRefreshCoverageEligibility(detail.insurance_id, detail.payorName)}
                                                    className="ml-2 text-blue-500"
                                                    title="Refresh Coverage Eligibility"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </h2>
                                            <span className="text-base font-medium">{detail.insurance_id}</span>
                                        </div>
                                        <div className='absolute cursor-pointer top-3 right-2' onClick={() => setPopup(!popup)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                            </svg>
                                        </div>
                                        <div className="gap-2 mt-1.5">
                                            <h2 className="text-bold text-base font-bold text-black dark:text-white">
                                                Insurer Name:
                                            </h2>
                                            <span className="text-  base font-medium">{detail.payorName}</span>
                                        </div>
                                        {popup ?
                                            <div className='absolute top-0 right-8 bg-black text-white p-1'>
                                                Insurer HCX ID : {detail.payor}
                                            </div> : null}

                                    </div>
                                </div>
                            )
                        )}
                        <div className='flex justify-end'>
                            <button
                                onClick={handleAddRemoveClick}
                                className="mt-2 text-blue-500 underline cursor-pointer justify-center"
                            >
                                {isOpen ? (
                                    "Remove"
                                ) : (
                                    "Add Another"
                                )}
                            </button>
                        </div>
                        <div>
                            {isOpen && (
                                <InsuranceDetailsForm
                                    beneficiaryName={beneficiaryName} setBeneficiaryName={setBeneficiaryName}
                                    insuranceId={insuranceId} setInsuranceId={setInsuranceId}
                                    payorName={payorName} setPayorName={setPayorName}
                                    payorParticipantCode={payorParticipantCode} setPayorParticipantCode={setPayorParticipantCode}
                                />
                            )}
                            {isOpen ? <button
                                onClick={(event: any) => {
                                    event.preventDefault();
                                    handelAddInsuranceDetails();
                                }}
                                type="submit"
                                className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed disabled:bg-secondary disabled:text-gray">
                                {"Update Insurance details"}
                            </button> : ""
                            }
                        </div>
                    </div>
                </>
            }
        </>
    )
};

export default userProfile;