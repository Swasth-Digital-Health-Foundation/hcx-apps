import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateToken, searchParticipant } from '../../services/hcxService';
import { searchUser } from '../../services/hcxMockService';
import LoadingButton from '../../components/LoadingButton';
import * as _ from 'lodash';
import strings from '../../utils/strings';
import AddAnotherInsurance from './AddAnotherInsurance';
import ProviderSearch from './ProviderSearch';

const KeyboardArrowDownIcon = () => (
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
);

const NewClaim = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const claimDetails = location.state || {};


  const [insurancePlan, setInsurancePlan] = useState<string>('');
  const [treatmentType, setTreatmentType] = useState<string>(claimDetails?.serviceType || '');
  const [providerName, setProviderName] = useState<string>(claimDetails?.patientName || '');
  const [participantCode, setParticipantCode] = useState<string>(claimDetails?.participantCode || '');
  const [isLoading, setIsLoading] = useState(false);
  const [payor, setPayor] = useState<string>('');
  const [insuranceId, setInsuranceId] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [payorFromInsuranceId, setPayorFromInsuranceId] = useState<string>('');
  const [userInfo, setUserInformation] = useState<any[]>([]);

  const payload = {
    filters: {
      roles: { startsWith: 'provider' },
    },
  };

  // Fetch providers
  useEffect(() => {
    const search = async () => {
      try {
        const tokenResponse = await generateToken();
        const token = tokenResponse.data.access_token;
        const response = await searchParticipant(payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSearchResults(response.data?.participants || []);
      } catch (error: any) {
        setOpenDropdown(false);
      }
    };
    search();
  }, []);

  // Fetch user info
  useEffect(() => {
    const registrySearch = async () => {
      try {
        const mobile = localStorage.getItem('mobile');
        if (!mobile) return;
        const response: any = await searchUser('user/search', mobile);
        setUserInformation(response?.data || []);
      } catch (error) {
        // handle error if needed
      }
    };
    registrySearch();
  }, []);

  // Memoized payorDetails
  const payorDetails = useMemo(
    () => userInfo?.map((user: any) => user.payorDetails).flat() || [],
    [userInfo]
  );

  // Memoized filteredResults
  const filteredResults = useMemo(
    () =>
      searchResults.filter((result: any) =>
        result.participant_name
          .toLowerCase()
          .includes(providerName.toLowerCase())
      ),
    [searchResults, providerName]
  );

  // Get payor name from insurance id
  const getPayorName = (insuranceId: string) => {
    if (payorDetails && insuranceId) {
      const matchingPayor = payorDetails.find(
        (detail: any) => detail.insurance_id === insuranceId
      );
      return matchingPayor ? matchingPayor.payorName : 'Payor not found';
    }
    return '';
  };

  // Update payorFromInsuranceId when insurancePlan changes
  useEffect(() => {
    setPayorFromInsuranceId(getPayorName(insurancePlan));
  }, [insurancePlan, payorDetails]);

  const handleSelect = (result: any, code: any) => {
    setParticipantCode(code);
    setProviderName(result);
  };

  const initiateClaimRequestBody = {
    providerName,
    participantCode: process.env.SEARCH_PARTICIPANT_USERNAME,
    serviceType: treatmentType,
    insurancePlan,
    payor: insurancePlan === 'add another' ? payor : payorFromInsuranceId,
    insuranceId: insurancePlan === 'add another' ? insuranceId : insurancePlan,
    mobile: localStorage.getItem('mobile'),
    password: process.env.SEARCH_PARTICIPANT_PASSWORD,
    recipientCode: userInfo?.[0]?.payor_details?.[0]?.recipientCode,
  };

  return (
    <div className="w-full">
      <h2 className="mb-4 text-2xl font-bold text-black dark:text-white">
        {strings.PROVIDE_DETAILS_FOR_NEW_CLAIM}
      </h2>
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
          disabled={claimDetails.disabledDropdown || false}
        />
        <div className="mt-4">
          <label className="mb-2.5 block text-left font-medium text-black dark:text-white">
            Treatment/Service Type: *
          </label>
          <div className="relative z-20 bg-white dark:bg-form-input">
            <select
              onChange={(e) => setTreatmentType(e.target.value)}
              required
              value={treatmentType}
              disabled={claimDetails.disabledDropdown || false}
              className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-6 py-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark"
            >
              <option value="">select</option>
              <option value="OPD">OPD</option>
              <option value="IPD">IPD</option>
            </select>
            <span className="absolute right-4 top-1/2 z-10 -translate-y-1/2">
              <KeyboardArrowDownIcon />
            </span>
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-2.5 block text-left font-medium text-black dark:text-white">
            {strings.SELECT_INSURANCE_PLAN}
          </label>
          <div className="relative z-20 bg-white dark:bg-form-input">
            <select
              onChange={(e) => setInsurancePlan(e.target.value)}
              required
              className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-6 py-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark"
            >
              <option value="">select</option>
              {_.map(payorDetails, (ele: any, index: any) => (
                <option key={index} value={ele?.insurance_id}>
                  {`${ele?.insurance_id} ( ${ele?.payorName} )`}
                </option>
              ))}
            </select>
            <span className="absolute right-4 top-1/2 z-10 -translate-y-1/2">
              <KeyboardArrowDownIcon />
            </span>
          </div>
          <AddAnotherInsurance
            insurancePlanInputRef={insurancePlan}
            setPayor={setPayor}
            setInsuranceId={setInsuranceId}
          />
        </div>
      </div>
      <div className="mb-5 mt-5">
        {!isLoading ? (
          <button
            disabled={
              insurancePlan === '' ||
              treatmentType === '' ||
              providerName === '' ||
              (insurancePlan === 'add another' &&
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
