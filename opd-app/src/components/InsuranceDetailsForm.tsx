import  { useEffect, useState } from 'react';
import _ from 'lodash';
import { generateToken, searchParticipant } from '../services/hcxService';
import TextInputWithLabel from './TextInputField';

const InsuranceDetailsForm = (props:any) => {

    const [openDropdown, setOpenDropdown] = useState(false);
    const {beneficiaryName, setBeneficiaryName,insuranceId, setInsuranceId , payorName, setPayorName , payorParticipantCode, setPayorParticipantCode } = props;
    const [searchResults, setSearchResults] = useState<any>([]);

    const filteredResults = searchResults.filter((result: any) =>
        result.participant_name.toLowerCase().includes(payorName.toLowerCase())
    );

    const handleSelect = (result: any, participantCode: any) => {
        setOpenDropdown(false);
        setPayorParticipantCode(participantCode);
        setPayorName(result);
    };


    let searchPayorForPatient = async () => {
        try {
            const tokenResponse = await generateToken();
            const token = tokenResponse.data.access_token;
            const response = await searchParticipant(searchPayload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSearchResults(response.data?.participants);
        } catch (error: any) {
            setOpenDropdown(false);
        }
    };

    const searchPayload = {
        filters: {
            "roles": {
                "eq": "payor"
            },
            "status": {
                "eq": "Active"
            }
        },
    };

    useEffect(() => {
        searchPayorForPatient();
    }, []);
    
    return (
        <div>
            <h2 className="sm:text-title-xl1 mb-2 mt-3 text-2xl font-bold text-black dark:text-white">
                {"Insurance Details"}
            </h2>
            <div className="relative rounded-lg border border-stroke bg-white p-3 -mt-1 px-1 shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="flex flex-col gap-5.5 p-3">
                    <TextInputWithLabel
                        label="Beneficiary name *"
                        value={beneficiaryName}
                        onChange={(e: any) => setBeneficiaryName(e.target.value)}
                        placeholder="Enter beneficiary name"
                        type="text"
                    />
                    <TextInputWithLabel
                        label="Insurance ID *"
                        value={insuranceId}
                        onChange={(e: any) => setInsuranceId(e.target.value)}
                        placeholder="Enter insurance id"
                        type="text"
                    />
                    <div>
                        <h2 className="-mt-2 block text-left font-medium text-black dark:text-white">
                            Payor name *:
                            <div className="relative">
                                <input type="text" placeholder="Search insurer name" value={payorName} required
                                    onChange={(e) => {
                                        const inputText = e.target.value; setPayorName(inputText)
                                        const hasMatchingRecords = searchResults.some((result: any) => result.participant_name.toLowerCase().includes(inputText.toLowerCase())
                                        );
                                        setOpenDropdown(hasMatchingRecords);
                                    }
                                    }
                                    className="mt-2 w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                />
                                <span className="absolute top-8 right-4 z-30 -translate-y-1/2"
                                    onClick={() => {
                                        setOpenDropdown(!openDropdown);
                                    }}>
                                    <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g opacity="0.8"> <path fillRule="evenodd" clipRule="evenodd" d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z" fill=""></path></g>
                                    </svg>
                                </span>
                                {filteredResults.length !== 0 && openDropdown ? (
                                    <div className="max-h-40 overflow-y-auto overflow-x-hidden">
                                        <ul className="border-gray-300 left-0 w-full rounded-lg bg-gray px-2 text-black">
                                            {_.map(filteredResults, (result: any, index: any) => (
                                                <li
                                                    key={index}
                                                    onClick={() => {
                                                        setOpenDropdown(!openDropdown)
                                                        handleSelect(
                                                            result?.participant_name,
                                                            result?.participant_code
                                                        )
                                                    }
                                                    }
                                                    className="hover:bg-gray-200 cursor-pointer p-2">
                                                    {result?.participant_name +
                                                        `(${result?.participant_code})` || ''}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </div>
                        </h2>
                        <div className="mt-2 relative items-center">
                            <TextInputWithLabel
                                label="Participant code : *"
                                disabled={true}
                                value={payorParticipantCode}
                                type="text"
                                placeholder="Search above for participant code"
                                onChange={(e: any) => setPayorParticipantCode(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsuranceDetailsForm;
