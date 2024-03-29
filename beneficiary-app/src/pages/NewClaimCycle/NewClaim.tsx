import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateToken, searchParticipant } from '../../services/hcxService';
import LoadingButton from '../../components/LoadingButton';
import * as _ from 'lodash';
import strings from '../../utils/strings';
import { postRequest } from '../../services/registryService';

const NewClaim = () => {
  const navigate = useNavigate();
  const [insurancePlanInputRef, setInsurancePlanInputRef] =
    useState<string>('');
  const [treatmentInputRef, setTreatmentInputRef] = useState<string>('');
  const [providerName, setProviderName] = useState<string>('');
  const [participantCode, setParticipantCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [payor, setPayor] = useState<string>('');
  const [insuranceId, setInsuranceId] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any>([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [payorFromInsuranceId, setpayorFromInsuranceId] = useState<string>('');

  const payload = {
    filters: {
      roles: { startsWith: "provider" },
    },
  };

  let search = async () => {
    try {
      const tokenResponse = await generateToken();
      const token = tokenResponse.data.access_token;
      const response = await searchParticipant(payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },  
      });
      setSearchResults(response.data?.participants);
    } catch (error: any) {
      setOpenDropdown(false);
      // toast.error(_.get(error, 'response.data.error.message'))
    }
  };

  useEffect(() => {
    search();
  }, [])

  const handleSelect = (result: any, participantCode: any) => {
    setParticipantCode(participantCode);
    setProviderName(result);
  };

  const [userInfo, setUserInformation] = useState<any>([]);
  let initiateClaimRequestBody = {
    providerName: providerName,
    participantCode: process.env.SEARCH_PARTICIPANT_USERNAME,
    serviceType: treatmentInputRef,
    insurancePlan: insurancePlanInputRef,
    payor:
      insurancePlanInputRef === 'add another' ? payor : payorFromInsuranceId,
    insuranceId:
      insurancePlanInputRef === 'add another'
        ? insuranceId
        : insurancePlanInputRef,
    mobile: localStorage.getItem('mobile'),
    password: process.env.SEARCH_PARTICIPANT_PASSWORD,
    recipientCode: userInfo[0]?.payor_details[0]?.recipientCode
  };

  const getMobileFromLocalStorage = localStorage.getItem('mobile');

  const userSearch = {
    entityType: ['Beneficiary'],
    filters: {
      mobile: { eq: getMobileFromLocalStorage },
    },
  };


  const searchUser = async () => {
    try {
      const searchUser = await postRequest('/search', userSearch);
      setUserInformation(searchUser.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    searchUser
  }, [])

  const filter = {
    entityType: ['Beneficiary'],
    filters: {
      mobile: { eq: localStorage.getItem('mobile') },
    },
  };

  const searchUserInfo = async () => {
    try {
      const searchUser = await postRequest('/search', filter);
      setUserInformation(searchUser.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getPayorName = () => {
    if (userInfo) {
      const matchingPayor = userInfo[0]?.payor_details.find(
        (detail: any) => detail.insurance_id === insurancePlanInputRef
      );
      setpayorFromInsuranceId(
        matchingPayor ? matchingPayor.payorName : 'Payor not found'
      );
    }
    return 'User info not available';
  };

  useEffect(() => {
    searchUserInfo();
    getPayorName();
  }, [insurancePlanInputRef]);

  const filteredResults = searchResults.filter((result: any) =>
    result.participant_name.toLowerCase().includes(providerName.toLowerCase())
  );

  return (
    <div className="w-full">
      <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">
        {strings.PROVIDE_DETAILS_FOR_NEW_CLAIM}
      </h2>
      <div className="rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
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
        <div className="mt-4">
          <label className="mb-2.5 block text-left font-medium text-black dark:text-white">
            Treatment/Service Type: *
          </label>
          <div className="relative z-20 bg-white dark:bg-form-input">
            <select
              onChange={(e) => {
                setTreatmentInputRef(e.target.value);
              }}
              required
              className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent bg-transparent py-4 px-6 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark"
            >
              <option value="">select</option>
              <option value="OPD">OPD</option>
              <option value="IPD">IPD</option>
            </select>
            <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
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
        <div className="mt-4">
          <label className="mb-2.5 block text-left font-medium text-black dark:text-white">
            {strings.SELECT_INSURANCE_PLAN}
          </label>
          <div className="relative z-20 bg-white dark:bg-form-input">
            <select
              onChange={(e) => {
                setInsurancePlanInputRef(e.target.value);
              }}
              required
              className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent bg-transparent py-4 px-6 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark"
            >
              <option value="">select</option>
              {_.map(userInfo[0]?.payor_details, (ele: any, index: any) => {
                return (
                  <option key={index} value={ele?.insurance_id}>{ele?.insurance_id}</option>
                );
              })}
              <option value="add another">add another</option>
            </select>
            <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
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
          {insurancePlanInputRef === 'add another' ? (
            <>
              <h2 className="sm:text-title-xl1 mt-4 mb-2 text-2xl font-bold text-black dark:text-white">
                {strings.INSURANCE_DETAILS}
              </h2>
              <div className="flex flex-col gap-5.5 py-4">
                <div>
                  <label className="mb-2.5 block text-left font-medium text-black dark:text-white">
                    {strings.PAYOR_DETAILS}
                  </label>
                  <div className="relative z-20 bg-white dark:bg-form-input">
                    <select
                      onChange={(e: any) => {
                        setPayor(e.target.value);
                      }}
                      required
                      className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent bg-transparent py-4 px-6 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark"
                    >
                      <option value="">select</option>
                      <option value="Swasth-reference Payor">
                        Swasth-reference Payor
                      </option>
                    </select>
                    <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
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
                <div>
                  <label className="mb-2.5 block text-left font-medium text-black dark:text-white">
                    {strings.INSURANCE_ID}
                  </label>
                  <div className="relative">
                    <input
                      onChange={(e: any) => {
                        setInsuranceId(e.target.value);
                      }}
                      required
                      type="text"
                      placeholder="Insurance ID"
                      className={
                        'w-full rounded-lg border border-stroke py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
      <div className="mb-5 mt-5">
        {!isLoading ? (
          <button
            disabled={
              insurancePlanInputRef === '' ||
              treatmentInputRef === '' ||
              providerName === '' ||
              (insurancePlanInputRef === 'add another' &&
                (insuranceId === '' || payor === ''))
            }
            onClick={(event: any) => {
              event.preventDefault();
              navigate('/initiate-claim-request', {
                state: { ...initiateClaimRequestBody },
              });
            }}
            className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed disabled:bg-secondary disabled:text-gray"
          >
            {strings.PROCEED}
          </button>
        ) : (
          <LoadingButton className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed" />
        )}
      </div>
    </div>
  );
};

export default NewClaim;
