import { useEffect, useState } from 'react';
import { searchUser } from '../../services/hcxMockService';
import { useLocation, useNavigate } from "react-router-dom";
import * as _ from "lodash"

const LinkedBeneficiaries = () => {
    const [userInfo, setUserInformation] = useState<any>([]);
    const [showDeleteIcons, setShowDeleteIcons] = useState(false);
    const navigate = useNavigate();
    const getMobileFromLocalStorage: any = localStorage.getItem('mobile');
    const location = useLocation();
    const currentPathname = location.pathname;
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

    const handleAddClick = () => {
        navigate('/signup', {});
    };

    const toggleDeleteIcons = () => {
        setShowDeleteIcons(!showDeleteIcons);
    };

    const handleDelete = (userId: string) => {
        // Implement the delete logic here
        // For now, we'll just filter out the deleted user
        setUserInformation(userInfo.filter((user: any) => user.beneficiaryId !== userId));
    };

    return (
        <div className='mt-1 relative'>
            <div className="mt-1 relative">
                <label className="block mb-2 text-left text-2xl font-bold text-black dark:text-white">
                    {"Linked Beneficiaries"}
                </label>
                {_.map(userInfo, (user, userIndex) => (
                    <div key={userIndex} className="mt-2 relative border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
                        {showDeleteIcons && (
                            <button
                                onClick={() => handleDelete(user.beneficiaryId)}
                                className="absolute top-2 right-2 text-red-500"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </button>
                        )}
                        <div className="flex items-center">
                            <h2 className="font-small mt-1 block text-left text-black dark:text-white">
                                <b className="inline-block w-35">{"Beneficiary ID"}</b>
                            </h2>
                            <span>: {`BSP/${user?.beneficiaryId.toString().slice(0, 6)}`}</span>
                        </div>
                        <div className="flex items-center">
                            <h2 className="font-small mt-1 block text-left text-black dark:text-white">
                                <b className="inline-block w-35">{"Beneficiary Name"}</b>
                            </h2>
                            <span>: {user?.userName}</span>
                        </div>
                        <div className="flex items-center">
                            <h2 className="font-small mt-1 block text-left text-black dark:text-white">
                                <b className="inline-block w-35">{"Mobile"}</b>
                            </h2>
                            <span>: {getMobileFromLocalStorage}</span>
                        </div>
                        <div className="flex items-center">
                            <h2 className="font-small mt-1 block text-left text-black dark:text-white">
                                <b className="inline-block w-35">{"Address "}</b>
                            </h2>
                            <span>: {user?.address}</span>
                        </div>
                        <span
                            className="cursor-pointer text-right"
                            onClick={(event) => {
                                event.preventDefault();
                                navigate('/beneficiary-profiles', { state: { userInfo: user, searchedMobileNumber: getMobileFromLocalStorage, currentPathname: currentPathname } });
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
            <div className='flex justify-between items-center mt-2'>
                <button
                    onClick={toggleDeleteIcons}
                    className="text-blue-500 underline cursor-pointer">
                    {showDeleteIcons ? "Cancel" : "Remove Beneficiary"}
                </button>
                <button
                    onClick={handleAddClick}
                    className="text-blue-500 cursor-pointer">
                    Add Another
                </button>
            </div>
        </div>
    )
}

export default LinkedBeneficiaries;