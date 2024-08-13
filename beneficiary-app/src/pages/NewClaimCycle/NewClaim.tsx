import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateToken, searchParticipant } from '../../services/hcxService';
import { searchUser } from '../../services/hcxMockService';
import LoadingButton from '../../components/LoadingButton';
import * as _ from 'lodash';
import strings from '../../utils/strings';
import AddAnotherInsurance from './AddAnotherInsurance';
import ProviderSearch from './ProviderSearch';

const NewClaim = () => {
  const navigate = useNavigate();
  const [insurancePlanInputRef, setInsurancePlanInputRef] = useState<string>('');
  const [treatmentInputRef, setTreatmentInputRef] = useState<string>('');
  const [providerName, setProviderName] = useState<string>('');
  const [participantCode, setParticipantCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [payor, setPayor] = useState<string>('');
  const [insuranceId, setInsuranceId] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any>([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [payorFromInsuranceId, setpayorFromInsuranceId] = useState<string>('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string>('');
  const [selectedPayor, setSelectedPayor] = useState<string>('');

  const payload = {
    filters: {
      roles: { startsWith: "provider" },
    },
  };

  let providerSearch = async () => {
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
    providerSearch();
  }, []);

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
    selectedpayor: selectedPayor,
    // recipientCode: userInfo[0]?.payor_details[0]?.recipientCode
  };

  const getMobileFromLocalStorage = localStorage.getItem('mobile');

  const registrySearch = async () => {
    try {
      let response: any = await searchUser("user/search", getMobileFromLocalStorage);
      setUserInformation(response?.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    registrySearch
  }, [])

  const getPayorName = () => {
    if (userInfo) {
      const selectedUser = userInfo.find((user: { userName: string; }) => user.userName === selectedBeneficiary);

      if (selectedUser) {
        const matchingPayor = selectedUser.payorDetails.find(
          (detail: any) => detail.insurance_id === insurancePlanInputRef
        );

        setpayorFromInsuranceId(matchingPayor ? matchingPayor.payorName : '');
      } else {
        setpayorFromInsuranceId('');
      }
    } else {
      setpayorFromInsuranceId('');
    }
  };


  useEffect(() => {
    registrySearch();
    getPayorName();
  }, [insurancePlanInputRef]);

  const filteredResults = searchResults.filter((result: any) =>
    result.participant_name.toLowerCase().includes(providerName.toLowerCase())
  );
  const selectedUser = userInfo.find((user: { userName: string; }) => user.userName === selectedBeneficiary);
  return (
    <div className="w-full">
      <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">
        {strings.PROVIDE_DETAILS_FOR_NEW_CLAIM}
      </h2>
      <div className='mb-2.5 rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark'>
        <div className='mt-4'>
          <label className="mb-2.5 block text-left font-medium text-black dark:text-white">
            Beneficiary Details:
          </label>
          <div className='flex space-x-1'>
            <div className="w-full relative z-20 bg-white dark:bg-form-input">
              <label className="mb-2.5 block text-left font-medium text-black dark:text-white">
                Beneficiary Name: *
              </label>
              <div className="relative">
                <select
                  onChange={(e) => {
                    setSelectedBeneficiary(e.target.value);
                  }}
                  required
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-4 px-6 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark"
                >
                  <option value="">Select Beneficiary</option>
                  {_.map(userInfo, (user, userIndex) => (
                    <option key={userIndex} value={user?.userName}>{user?.userName}</option>
                  ))}
                </select>
                <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2 pointer-events-none">
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
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
        <ProviderSearch
          providerName={providerName}
          participantCode={participantCode}
          openDropdown={openDropdown}
          setProviderName={setProviderName}
          searchResults={searchResults}
          setOpenDropdown={setOpenDropdown}
          filteredResults={filteredResults}
          handleSelect={handleSelect}
        />
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
              className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-4 px-6 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark"
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
              className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-4 px-6 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark"
            >
              <option value="">select</option>
              {selectedUser && selectedUser.payorDetails.map((detail: any, index: any) => (
                <option key={index} value={detail.insurance_id}>
                  {detail.insurance_id}
                </option>
              ))}
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
          <AddAnotherInsurance insurancePlanInputRef={insurancePlanInputRef} setPayor={setPayor} setInsuranceId={setInsuranceId} />
        </div>
      </div>
      <div className="mb-5 mt-5">
        {!isLoading ? (
          <button
            disabled={
              insurancePlanInputRef === '' ||
              treatmentInputRef === '' ||
              providerName === '' ||
              selectedBeneficiary === '' ||
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
