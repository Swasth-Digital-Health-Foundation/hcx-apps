import strings from '../../utils/strings';
import * as _ from "lodash";

const ProviderSearch = (props: any) => {
    const { providerName, participantCode, openDropdown, setProviderName, searchResults, setOpenDropdown, filteredResults, handleSelect } = props;
    return (
        <div>
            <h2 className="text-bold text-base font-bold text-black dark:text-white">
                {strings.PROVIDER_NAME}{' '}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={providerName}
                        onChange={(e) => {
                            const inputText = e.target.value;
                            setProviderName(inputText)
                            const hasMatchingRecords = searchResults.some((result: any) =>
                                result.participant_name.toLowerCase().includes(inputText.toLowerCase())
                            );
                            setOpenDropdown(hasMatchingRecords);
                        }
                        }
                        className="mt-2 w-full rounded-lg border-[1.5px] border-stroke bg-white py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                    <span
                        className="absolute top-8 right-4 z-30 -translate-y-1/2"
                        onClick={() => {
                            setOpenDropdown(!openDropdown);
                        }}
                    >
                        <svg
                            className="fill-current"
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
                                    fill=""
                                ></path>
                            </g>
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
                                        className="hover:bg-gray-200 cursor-pointer p-2"
                                    >
                                        {result?.participant_name +
                                            ` (${result?.participant_code})` || ''}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </h2>
            <div className='items-center'>
                <h2 className="text-bold mt-3 text-base font-bold text-black dark:text-white">
                    {strings.PARTICIPANT_CODE}
                </h2>
                <span className='mt-3'>{providerName ? participantCode : 'Search above for participant code'}</span>
            </div>
        </div>
    )
}

export default ProviderSearch