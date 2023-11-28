import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../images/swasth_logo.png';
import PayorDetailsCard from '../../components/PayorDetailsCard/PayorDetailsCard';
import { postRequest } from '../../services/registryService';
import { toast } from 'react-toastify';
import LoadingButton from '../../components/LoadingButton';
import strings from '../../utils/strings';
import useDebounce from '../../hooks/useDebounce';
import { generateToken, searchParticipant } from '../../services/hcxService';
import * as _ from "lodash";

const SignUp = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<any>([]);
  const [mobileNumber, setMobileNumber] = useState<string>();
  const [userName, setUserName] = useState();
  const [email, setEmail] = useState();
  const [isValid, setIsValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const getMobileFromLocalStorage: any = localStorage.getItem('mobile');
  const [payor, setPayor] = useState<string>('wemeanhospital Mock Payor');
  const [insuranceId, setInsuranceId] = useState<string>('');
  const [payorName, setPayorName] = useState<string>('');
  const [openDropdown, setOpenDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<any>([]);
  const [participantCode, setParticipantCode] = useState<string>('');

  // Function to update card data
  const updateCardData = (cardKey: any, newData: any) => {
    const updatedCards = cards.map((card: any) =>
      card.cardKey === cardKey ? { ...card, ...newData } : card
    );
    setCards(updatedCards);
  };

  // const addCard = () => {
  //   const cardKey = cards.length + 1;

  //   const newCard = {
  //     cardKey,
  //   };

  //   setCards([...cards, newCard]);
  // };

  const removeCard = (cardToRemove: any) => {
    const updatedCards = cards.filter(
      (card: any) => card.cardKey !== cardToRemove.cardKey
    );
    setCards(updatedCards);
  };

  const handlePayorChange = (e: any) => {
    setPayor(e.target.value);
  };

  const handleInsuranceIdChange = (e: any) => {
    setInsuranceId(e.target.value);
  };

  // let addMoreDetails = cards.map((ele: any) => {
  //   return { insurance_id: ele.insurance_id, payor: ele.payor };
  // });

  let payload = {
    email: email,
    mobile: "6363062395",
    name: userName,
    payor_details: [
      {
        insurance_id: insuranceId,
        payorName: payorName,
        recipientCode: participantCode
      },
      // ...addMoreDetails,
    ],
  };

  const registerUser = async () => {
    try {
      setLoading(true);
      let registerResponse: any = await postRequest('/invite', payload);
      setLoading(false);
      toast.success('User registered successfully!', {
        position: toast.POSITION.TOP_CENTER,
      });
      navigate('/home', { state: mobileNumber });
    } catch (error: any) {
      setLoading(false);
      toast.error(error.response.data.params.errmsg, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  const handleUserNameChange = (e: any) => {
    setUserName(e.target.value);
  };

  const handleEmailChange = (e: any) => {
    setEmail(e.target.value);
  };

  const insuranceCheck = insuranceId === '';
  const payorCheck = payor === ('' || 'none' || null);
  const handleDisable = () => {
    if (insuranceCheck || payorCheck) {
      return true;
    }
    return false;
  };

  const debounce = useDebounce(payorName, 500);

  const searchPayload = {
    filters: {
      participant_name: { eq: payorName },
      "roles": {
        "eq": "payor"
      },
      "status": {
        "eq": "Active"
      }
    },
  };

  let search = async () => {
    try {
      if (payorName.trim() === '') {
        setSearchResults([]);
        return;
      }
      const tokenResponse = await generateToken();
      const token = tokenResponse.data.access_token;
      const response = await searchParticipant(searchPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOpenDropdown(true);
      setSearchResults(response.data?.participants);
    } catch (error: any) {
      setOpenDropdown(false);
      // toast.error(_.get(error, 'response.data.error.message'))
    }
  };

  useEffect(() => {
    search();
  }, [debounce]);

  const handleSelect = (result: any, participantCode: any) => {
    setOpenDropdown(false);
    setParticipantCode(participantCode);
    setPayorName(result);
  };

  return (
    <div className="w-full m-auto border-stroke bg-white p-2 dark:border-strokedark dark:bg-black xl:w-1/2 xl:border">
      <Link className="inline-block px-4 md:block lg:block" to="#">
        <img className="w-48 dark:block" src={Logo} alt="Logo" />
      </Link>
      <h2 className="sm:text-title-xl1 mb-4 text-2xl font-bold text-black dark:text-white">
        {strings.ADD_PROFILE_DETAILS}
      </h2>
      <div className="w-full rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:p-12.5 xl:p-17.5">
        <form>
          <div className="mb-6">
            <div>
              <label className="mb-2.5 block text-left font-medium text-black dark:text-white">
                {strings.USERS_NAME}
              </label>
              <div className="relative">
                <input
                  onChange={handleUserNameChange}
                  type="text"
                  placeholder={strings.ENTER_YOUR_NAME}
                  className={
                    'w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
                  }
                />
              </div>
            </div>
            <div className="mt-5">
              <label className="mb-2.5 block text-left font-medium text-black dark:text-white">
                {strings.MOBILE}
              </label>
              <div className="relative">
                <input
                  disabled
                  value={getMobileFromLocalStorage}
                  placeholder={strings.ENTER_MOBILE_NUMBER}
                  className={`border ${isValid ? 'border-stroke' : 'border-red'
                    } w-full rounded-lg bg-transparent py-4 pl-6 pr-10 outline-none focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary`}
                />
              </div>
            </div>
            <div className="mt-5">
              <label className="mb-2.5 block text-left font-medium text-black dark:text-white">
                {strings.EMAILID}
              </label>
              <div className="relative">
                <input
                  onChange={handleEmailChange}
                  type="email"
                  placeholder={strings.ENTER_EMAIL_ADDRESS}
                  className={
                    'w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
                  }
                />
              </div>
            </div>
          </div>

          <h2 className="sm:text-title-xl1 mb-4 text-2xl font-bold text-black dark:text-white">
            {strings.ADD_INSURANCE_PLAN}
          </h2>

          <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex flex-col gap-5.5 p-4">
              <div>
                <h2 className="text-bold text-base font-bold text-black dark:text-white">
                  Payor name:
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={payorName}
                      onChange={(e) => setPayorName(e.target.value)}
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
                    {openDropdown && searchResults.length !== 0 ? (
                      <div className="max-h-40 overflow-y-auto overflow-x-hidden">
                        <ul className="border-gray-300 left-0 w-full rounded-lg bg-gray px-2 text-black">
                          {_.map(searchResults, (result: any, index: any) => (
                            <li
                              key={index}
                              onClick={() =>
                                handleSelect(
                                  result?.participant_name,
                                  result?.participant_code
                                )
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
                  <span className='mt-3'>{payorName ? participantCode : 'Search above for participant code'}</span>
                </div>
              </div>
              <div>
                <label className="mb-2.5 block text-left font-medium text-black dark:text-white">
                  {strings.INSURANCE_ID}
                </label>
                <div className="relative">
                  <input
                    required
                    onChange={handleInsuranceIdChange}
                    type="text"
                    placeholder="Insurance ID"
                    className={
                      'w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            {cards.map((card: any) => (
              <div className="relative mt-3" key={card.id}>
                <button
                  onClick={(event: any) => {
                    event.preventDefault();
                    removeCard(card);
                  }}
                  className="absolute right-5 mt-3 flex rounded bg-gray px-2 text-black dark:text-white"
                >
                  -
                </button>
                <PayorDetailsCard
                  onInputChange={(newData: any) =>
                    updateCardData(card.cardKey, newData)
                  }
                  cardKey={card.cardKey}
                />
              </div>
            ))}
          </div>
        </form>
      </div>
      <div className="mb-5">
        {!loading ? (
          <button
            disabled={handleDisable()}
            onClick={(event: any) => {
              event.preventDefault();
              registerUser();
            }}
            type="submit"
            className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed disabled:bg-secondary disabled:text-gray"
          >
            {strings.SAVE_PROFILE_DETAILS}
          </button>
        ) : (
          <LoadingButton className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed" />
        )}
      </div>
    </div>
  );
};

export default SignUp;
