import { useState, useEffect, useRef } from 'react';

const ModalConfirmBack = (props: any) => {
    const { show, userInfo, setSelectedProfile } = props;
    const [modalOpen, setModalOpen] = useState(show);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);

    // const trigger = useRef<any>(null);
    const modal = useRef<any>(null);

    // Close on click outside
    // useEffect(() => {
    //     const clickHandler = ({ target }: MouseEvent) => {
    //         if (!modal.current) return;
    //         if (
    //             !modalOpen ||
    //             modal.current.contains(target) ||
    //             trigger.current.contains(target)
    //         )
    //             return;
    //         setModalOpen(false);
    //     };
    //     document.addEventListener('click', clickHandler);
    //     return () => document.removeEventListener('click', clickHandler);
    // }, [modalOpen]);

    useEffect(() => {
        setModalOpen(show);
    }, [show]);

    return (
        <div
            className={`fixed top-0 left-0 z-999999 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-2 py-2 ${modalOpen ? 'block' : 'hidden'
                }`} >
            <div
                ref={modal}
                className="w-full max-w-142.5 rounded-lg bg-white py-12 px-8 text-center dark:bg-boxdark md:py-15 md:px-17.5" >
                <h4 className="mt-2 text-xl font-bold text-black dark:text-white sm:text-2xl">
                    {"Patient Records Found"}
                </h4>
                <p className="mb-4">{"It appears that there are patient records that contain the same phone number as the one you just entered."}</p>
                <div className="mb-4">
                    {userInfo.length > 0 ? (
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="py-2">Select</th>
                                    <th className="py-2">Patient Name</th>
                                    <th className="py-2">Age</th>
                                    <th className="py-2">Gender</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userInfo.map((user: any, index: any) => (
                                    <tr key={index}>
                                        <td className="border px-3 py-3">
                                            <input
                                                type="radio"
                                                name="selectedUser"
                                                value={user.beneficiaryId}
                                                onChange={() => setSelectedUser(user)}
                                            />
                                        </td>
                                        <td className="border px-3 py-3">
                                            {user.userName}
                                            <br />
                                            <span className="text-sm text-gray-500">{`ID : ${user.beneficiaryId}`}</span>
                                        </td>
                                        <td className="border px-3 py-3">{user.age}</td>
                                        <td className="border px-3 py-3">{user.gender}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No user information available.</p>
                    )}
                </div>
                <div className="-mx-3 flex flex-wrap gap-y-4">
                    <div className="w-full px-3 2xsm:w-1/2">
                        <button
                            onClick={() => {
                                setModalOpen(false);

                            }}
                            className="block w-full rounded border border-stroke bg-gray p-3 text-center font-medium text-black transition hover:border-meta-1 hover:bg-meta-1 hover:text-white dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:border-meta-1 dark:hover:bg-meta-1"
                        >
                            Add New Patient
                        </button>
                    </div>
                    <div className="w-full px-3 2xsm:w-1/2">
                        <button
                            disabled={!selectedUser}
                            onClick={() => {
                                setSelectedProfile(selectedUser)
                                setModalOpen(false);
                            }}
                            className="block w-full rounded border border-meta-1 bg-meta-1 p-3 text-center font-medium text-white transition hover:bg-opacity-90">
                            {"Proceed"}
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ModalConfirmBack;