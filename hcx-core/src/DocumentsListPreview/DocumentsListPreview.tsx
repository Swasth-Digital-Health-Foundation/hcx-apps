import React from "react";
import * as _ from "lodash";
const DocumentsList = (props: any) => {
    const { preauthOrClaimList } = props;

    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                    {_.map(preauthOrClaimList, (ele: any) => {
                        return (
                            <>
                                {_.isEmpty(ele.supportingDocuments) ? null : <>
                                    {Object.entries(ele.supportingDocuments).map(([key, values]) => (
                                        <>
                                            <thead>
                                                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                                    <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                                                        Document type
                                                    </th>
                                                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                                                        Document name
                                                    </th>
                                                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            {Array.isArray(values) &&
                                                values.map((imageUrl, index) => {
                                                    const parts = imageUrl.split('/');
                                                    const fileName = parts[parts.length - 1];
                                                    return (
                                                        <tbody>
                                                            <tr>
                                                                <td className="flex items-center gap-2 text-start border-b border-[#eee] py-5 dark:border-strokedark xl:pl-11">
                                                                    <div className="flex h-14 w-full max-w-14 items-center justify-center rounded-full border border-stroke bg-gray text-black-2 dark:border-strokedark dark:bg-graydark dark:text-white sm:flex">
                                                                        <svg
                                                                            className="fill-current"
                                                                            width="28"
                                                                            height="29"
                                                                            viewBox="0 0 28 29"
                                                                            fill="none"
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                        >
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                clipRule="evenodd"
                                                                                d="M4.72659 3.36759C5.32314 2.77105 6.13222 2.43591 6.97585 2.43591H16.2295L16.2299 2.43591L16.2303 2.43591C16.4817 2.43591 16.7081 2.54281 16.8665 2.71363L23.7604 9.6075C23.9312 9.76594 24.0381 9.99231 24.0381 10.2437C24.0381 10.2568 24.0378 10.2699 24.0372 10.2828V24.1241C24.0372 24.9677 23.7021 25.7768 23.1055 26.3733C22.509 26.9699 21.6999 27.305 20.8563 27.305H6.97585C6.13222 27.305 5.32313 26.9699 4.72659 26.3733C4.13005 25.7768 3.79492 24.9677 3.79492 24.1241V5.61684C3.79492 4.77321 4.13005 3.96413 4.72659 3.36759ZM6.97585 4.17097H15.3628V10.2437C15.3628 10.7228 15.7512 11.1112 16.2303 11.1112H22.3022V24.1241C22.3022 24.5075 22.1498 24.8753 21.8787 25.1465C21.6075 25.4176 21.2397 25.57 20.8563 25.57H6.97585C6.59238 25.57 6.22462 25.4176 5.95346 25.1465C5.68231 24.8753 5.52997 24.5075 5.52997 24.1241V5.61684C5.52997 5.23337 5.68231 4.86561 5.95346 4.59445C6.22462 4.3233 6.59238 4.17097 6.97585 4.17097ZM17.0979 5.3987L21.0753 9.37613H17.0979V5.3987ZM9.2896 15.1596C8.81048 15.1596 8.42208 15.548 8.42208 16.0271C8.42208 16.5062 8.81048 16.8946 9.2896 16.8946H18.5432C19.0223 16.8946 19.4107 16.5062 19.4107 16.0271C19.4107 15.548 19.0223 15.1596 18.5432 15.1596H9.2896ZM8.42208 20.654C8.42208 20.1749 8.81048 19.7865 9.2896 19.7865H18.5432C19.0223 19.7865 19.4107 20.1749 19.4107 20.654C19.4107 21.1332 19.0223 21.5216 18.5432 21.5216H9.2896C8.81048 21.5216 8.42208 21.1332 8.42208 20.654ZM9.2896 10.5328C8.81048 10.5328 8.42208 10.9212 8.42208 11.4003C8.42208 11.8795 8.81048 12.2679 9.2896 12.2679H11.603C12.0821 12.2679 12.4705 11.8795 12.4705 11.4003C12.4705 10.9212 12.0821 10.5328 11.603 10.5328H9.2896Z"
                                                                                fill=""
                                                                            />
                                                                        </svg>
                                                                    </div>

                                                                    <h5 className="font-medium text-black dark:text-white">
                                                                        {key}
                                                                    </h5>
                                                                </td>
                                                                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                                    <p className="text-black dark:text-white">{decodeURIComponent(fileName)}</p>
                                                                </td>
                                                                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                                                    <div className="flex items-center space-x-3.5">
                                                                        <a href={imageUrl}>
                                                                            <button className="hover:text-primary">
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
                                                                            </button>
                                                                        </a>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    )
                                                })}
                                        </>
                                    ))}
                                </>}
                            </>
                        );
                    })}

                </table>
            </div>
        </div >
    )
}

export default DocumentsList