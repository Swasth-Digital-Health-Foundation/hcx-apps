import React, { useState } from 'react';

const SupportingDocs = () => {
    const [documentType, setDocumentType] = useState('Prescription');
    const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>({});


    const handleDelete = (name: string) => {
        setSelectedFiles(prevSelectedFiles => {
            const updatedFiles = { ...prevSelectedFiles };
            for (const key in updatedFiles) {
                updatedFiles[key] = updatedFiles[key].filter(file => file.name !== name);
            }
            return updatedFiles;
        });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const fileType = documentType.toLowerCase().replace(/\s+/g, '_');
            setSelectedFiles((prevSelectedFiles) => ({
                ...prevSelectedFiles,
                [fileType]: prevSelectedFiles[fileType]
                    ? [...prevSelectedFiles[fileType], ...Array.from(files)]
                    : Array.from(files),
            }));
        }
    };


    const documentTypeOptions = [
        { label: "Prescription", value: "Prescription", },
        { label: "Payment Receipt", value: "Payment Receipt", },
        { label: "Medical Bill/invoice", value: "Medical Bill/invoice", },
    ];

    return (
        <div className="mt-4 rounded-lg border border-stroke bg-white p-5 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h2 className="text-1xl mb-4 font-bold text-black dark:text-white sm:text-title-xl1">
                Supporting documents :
            </h2>

            <div className="relative z-20 mb-4 bg-white dark:bg-form-input">
                <label className="mb-2.5 mt-3 block text-left font-medium text-black dark:text-white">
                    {"Document type :"}
                </label>
                <div className='flex items-center'>
                <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent bg-transparent py-3 px-6 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark">
                    {documentTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <span className="absolute mt-5 right-4 z-10 -translate-y-1/2">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g opacity="0.8">
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                    fill="#637381"
                                ></path>
                            </g>
                        </svg>
                    </span>
                </div>

            </div>
            <div className="flex items-center justify-evenly gap-x-6">
                <div>
                    <label
                        htmlFor="profile"
                        className="bottom-0 right-0 flex h-15 w-15 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2"  >
                        <svg className="fill-current" width="20" height="20" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M4.76464 1.42638C4.87283 1.2641 5.05496 1.16663 5.25 1.16663H8.75C8.94504 1.16663 9.12717 1.2641 9.23536 1.42638L10.2289 2.91663H12.25C12.7141 2.91663 13.1592 3.101 13.4874 3.42919C13.8156 3.75738 14 4.2025 14 4.66663V11.0833C14 11.5474 13.8156 11.9925 13.4874 12.3207C13.1592 12.6489 12.7141 12.8333 12.25 12.8333H1.75C1.28587 12.8333 0.840752 12.6489 0.512563 12.3207C0.184375 11.9925 0 11.5474 0 11.0833V4.66663C0 4.2025 0.184374 3.75738 0.512563 3.42919C0.840752 3.101 1.28587 2.91663 1.75 2.91663H3.77114L4.76464 1.42638ZM5.56219 2.33329L4.5687 3.82353C4.46051 3.98582 4.27837 4.08329 4.08333 4.08329H1.75C1.59529 4.08329 1.44692 4.14475 1.33752 4.25415C1.22812 4.36354 1.16667 4.51192 1.16667 4.66663V11.0833C1.16667 11.238 1.22812 11.3864 1.33752 11.4958C1.44692 11.6052 1.59529 11.6666 1.75 11.6666H12.25C12.4047 11.6666 12.5531 11.6052 12.6625 11.4958C12.7719 11.3864 12.8333 11.238 12.8333 11.0833V4.66663C12.8333 4.51192 12.7719 4.36354 12.6625 4.25415C12.5531 4.14475 12.4047 4.08329 12.25 4.08329H9.91667C9.72163 4.08329 9.53949 3.98582 9.4313 3.82353L8.43781 2.33329H5.56219Z" fill="" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M7.00004 5.83329C6.03354 5.83329 5.25004 6.61679 5.25004 7.58329C5.25004 8.54979 6.03354 9.33329 7.00004 9.33329C7.96654 9.33329 8.75004 8.54979 8.75004 7.58329C8.75004 6.61679 7.96654 5.83329 7.00004 5.83329ZM4.08337 7.58329C4.08337 5.97246 5.38921 4.66663 7.00004 4.66663C8.61087 4.66663 9.91671 5.97246 9.91671 7.58329C9.91671 9.19412 8.61087 10.5 7.00004 10.5C5.38921 10.5 4.08337 9.19412 4.08337 7.58329Z" fill="" />
                        </svg>
                        <input
                            type="file"
                            accept="*/*"
                            capture="environment"
                            multiple
                            name="profile"
                            id="profile"
                            size={5 * 1024 * 1024}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleFileChange(event)}
                            className="sr-only"
                        />
                    </label>
                </div>
                <div>OR</div>
                <div>
                    <label htmlFor="profile" className="custom-file-label cursor-pointer pl-50, upload underline">
                        Select documents
                        <input
                            type="file"
                            accept="*/*"
                            capture="environment"
                            multiple
                            name="profile"
                            id="profile"
                            size={5 * 1024 * 1024}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleFileChange(event)}
                            className="sr-only"
                        />
                    </label>
                </div>
            </div>
            {Object.keys(selectedFiles).length === 0 || Object.values(selectedFiles).every(files => files.length === 0) === null ? <></> :
                <div>
                    <table className="w-full table-auto mt-10">
                        <thead>
                            <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                <th className="min-w-[220px] py-4 px-2 font-medium text-black dark:text-white xl:pl-11">
                                    Document type
                                </th>
                                <th className="min-w-[150px] py-4 px-30 font-medium text-black dark:text-white">
                                    Document name
                                </th>
                                <th className="py-4 px-50  font-medium text-black dark:text-white">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(selectedFiles).map(([fileType, files]) => (
                                files.map((file, index) => (
                                    <tr key={`${fileType}-${index}`}>
                                        <td className='text-left dark:bg-meta-4 pl-11 p-3'>{fileType}</td>
                                        <td className='pl-30 p-3'>{file.name}</td>
                                        <td className='pl-50 p-3'>
                                            <div className="flex items-center justify-between">
                                                <button onClick={() => handleDelete(file.name)} className="text-red underline text-end">Remove</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </table>
                </div>
            }
        </div>
    );
};

export default SupportingDocs;
