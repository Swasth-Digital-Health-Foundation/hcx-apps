import { useEffect, useState } from 'react';
import { searchUser } from '../../services/hcxMockService';
import { useNavigate } from "react-router-dom";
import * as _ from "lodash"

const LinkedBeneficiaries = () => {

    const [userInfo, setUserInformation] = useState<any>([]);
    const navigate = useNavigate();
    const getMobileFromLocalStorage: any = localStorage.getItem('mobile');
    const [isOpen, setOpen] = useState<boolean>(false)


    const userSearch = async () => {
        try {
            let responseData: any = await searchUser("user/search", getMobileFromLocalStorage);

            setUserInformation(responseData?.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        userSearch();
    }, [getMobileFromLocalStorage]);

    const handleAddRemoveClick = () => {
        navigate('/signup', {});
        setOpen(!isOpen); // Toggle isOpen state
    };

    return (
        <div className='mt-1 relative'>
            <div className="mt-1 relative">
                <label className="block mb-2 text-left text-2xl font-bold text-black dark:text-white">
                    {"Linked Beneficiaries"}
                </label>
                {_.map(userInfo, (user, userIndex) => (
                    <div key={userIndex} className="mt-2 relative border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div key={userIndex} className="flex items-center">
                            <h2 className="font-small mt-1 block text-left text-black dark:text-white">
                                <b className="inline-block w-30">{"ID"}</b>
                            </h2>
                            <span>: {`BSP/${user?.beneficiaryId.toString().slice(0, 6)}`}</span>
                        </div>
                        <div key={userIndex} className="flex items-center">
                            <h2 className="font-small mt-1 block text-left text-black dark:text-white">
                                <b className="inline-block w-30">{"Name"}</b>
                            </h2>
                            <span>: {user?.userName}</span>
                        </div>
                        <div key={userIndex} className="flex items-center">
                            <h2 className="font-small mt-1 block text-left text-black dark:text-white">
                                <b className="inline-block w-30">{"Mobile"}</b>
                            </h2>
                            <span>: {getMobileFromLocalStorage}</span>
                        </div>
                        <div key={userIndex} className="flex items-center">
                            <h2 className="font-small mt-1 block text-left text-black dark:text-white">
                                <b className="inline-block w-30">{"Address "}</b>
                            </h2>
                            <span>: {user?.address}</span>
                        </div>
                        <span
                            className="cursor-pointer text-right"
                            onClick={(event) => {
                                event.preventDefault();
                                navigate('/beneficiary-profiles', { state: { userInfo: user, searchedMobileNumber: getMobileFromLocalStorage } });
                            }}
                        >
                            <div className="flex items-center justify-end gap-2">
                                <p>View Details</p>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </div>
                        </span>
                    </div>
                ))}
            </div>
            <div className='flex items-right'>
            <button
                onClick={handleAddRemoveClick}
                className="mt-2 text-blue-500 underline cursor-pointer justify-center">
                {isOpen ? (
                    "Remove"
                ) : (
                    "Add Another"
                )}
            </button>
            </div>
        </div>
    )
}
export default LinkedBeneficiaries;