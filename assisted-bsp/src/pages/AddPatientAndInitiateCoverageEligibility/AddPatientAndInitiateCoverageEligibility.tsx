import { useEffect, useState } from "react";
import TextInputWithLabel from "../../components/inputField";
import CustomButton from "../../components/CustomButton";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { generateOutgoingRequest, searchUser, createUser } from "../../services/hcxMockService";
import { generateToken, searchParticipant } from "../../services/hcxService";
import * as _ from "lodash";
import LoadingButton from "../../components/LoadingButton";
import useDebounce from "../../hooks/useDebounce";
import SelectInput from "../../components/SelectInput";
import ModelConfirmBack from "../../components/DialogBoxComponent";
import Accordion from "../../components/Accordion";


const AddPatientAndInitiateCoverageEligibility = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [mobile, setMobile] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [bloodGroup, setBloodGroup] = useState<string>("");
  const [allergies, setAllergies] = useState<string>("");
  const [payorName, setPayorName] = useState<string>("");
  const [insuranceID, setInsuranceID] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const getEmailFromLocalStorage = localStorage.getItem("email");
  const [participantInfo, setParticipantInformation] = useState<any>([]);
  const [patientInfo, setPatientInfo] = useState<any>([]);
  const [isEditable, setIsEditable] = useState<any>(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [searchResults, setSearchResults] = useState<any>([]);
  const [payorParticipantCode, setPayorParticipantCode] = useState<string>('');
  const [gender, setGender] = useState<string>("")
  const [age, setAge] = useState<number>(1);
  const [userEmail, setUserEmail] = useState<string>("")
  const [modelVisible, setModelVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(undefined);

  const bloodGroupOptions = [
    {
      label: "Select",
      value: "",
    },
    { label: "O+", value: "O+" },
    { label: "O-", value: "O-" },
    { label: "A-", value: "A-" },
    { label: "A+", value: "A+" },
    { label: "B-", value: "B-" },
    { label: "B+", value: "B+" },
    { label: "AB+", value: "AB+" },
    { label: "AB-", value: "AB-" },
  ];
  const allergiesOptions = [
    {
      label: "Select",
      value: "",
    },
    { label: "Food", value: "Food" },
    { label: "Dust", value: "Dust" },
    { label: "Medication", value: "Medication" },
    { label: "Cosmatic", value: "Cosmatic" },
  ];

  const genderOptions = [
    {
      label: "Select",
      value: "",
    },
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Others", value: "Others" }
  ]

  const generateAgeOptions = (): any => {
    const options: any = [];
    for (let i = 1; i <= 100; i++) {
      options.push({ value: i.toString(), label: `${i.toString()} yrs` });
    }
    return options;
  };

  const patientDataFromState: any = location.state?.obj;

  const payload = {
    name: name || patientInfo?.userName || patientInfo[0]?.name,
    mobile: mobile || patientDataFromState?.mobile || patientInfo[0]?.mobile,
    address:
      address || patientDataFromState?.address || patientInfo[0]?.address,
    gender: gender || patientDataFromState?.gender || patientInfo[0]?.gender,
    age: age || patientDataFromState?.age || patientInfo[0]?.age,
    email: userEmail || patientDataFromState?.email || patientInfo[0]?.email,
    medical_history:
    {
      allergies: allergies,
      blood_group: bloodGroup,
    },
    payor_details:
      [{
        insurance_id:
          insuranceID ||
          patientDataFromState?.payorName ||
          patientInfo[0]?.payorDetails[0]?.payorName,
        payorName:
          payorName ||
          patientDataFromState?.insuranceId ||
          patientInfo[0]?.payorDetails[0]?.insurance_id,
        payor: payorParticipantCode || patientInfo[0]?.payorDetails[0]?.payor
      }]
  };

  const patientDetails = [
    {
      key: "Name ",
      value: selectedProfile?.userName || patientInfo?.userName || patientDataFromState?.patientName,
    },
    {
      key: "Mobile no. ",
      value: mobile || patientDataFromState?.mobile,
    },
    {
      key: "Address ",
      value: selectedProfile?.address || patientInfo?.address || patientDataFromState?.address,
    },
    {
      key: "Gender ",
      value: gender || selectedProfile?.gender
    },
    {
      key: "Age ",
      value: age || selectedProfile?.age
    },
    {
      key: "Email ",
      value: selectedProfile?.email || userEmail
    }
  ];

  const userSearchPayload = {
    entityType: ["Beneficiary"],
    filters: {
      participant_code: {
        eq: getEmailFromLocalStorage,
      },
    },
  };


  const search = async () => {
    try {
      const loginResponse = await generateToken();
      const token = loginResponse.data?.access_token;
      const response = await searchParticipant(userSearchPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let userRes = response.data.participants;
      setParticipantInformation(userRes);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    search();
  }, []);


  const registerUser = async () => {
    try {
      let response: any = await createUser("user/create", payload)
      if (response?.status === 202) {
        setLoading(false);
        toast.success(
          "Beneficiary added successfully, initiating coverage eligibility",
          {
            position: toast.POSITION.TOP_CENTER,
          }
        );
      }
    } catch (error: any) {
      setLoading(false);
      toast.info("Beneficiary already exists,  initiating coverage eligibility", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  const patientSearch = async (mobile: any) => {
    try {
      setSearchLoading(true);
      let responseData: any = await searchUser("user/search", mobile || patientDataFromState?.mobile)
      setPatientInfo(responseData?.data);
      setSearchLoading(false);
      if (_.isEmpty(responseData?.data)) {
        if (isValid) {
          toast.error("No active beneficiaries registered on this mobile number!");
        }
        setIsEditable(false);
      } else {
        setModelVisible(true);
      }
    } catch (error: any) {
      setIsEditable(false);
      setSearchLoading(false);
      toast.error("Beneficiaries not found!", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  useEffect(() => {
    if (isValid) {
      patientSearch(mobile)
    }
  }, [isValid]);

  localStorage.setItem("patientMobile", mobile || patientDataFromState?.mobile);
  const email = localStorage.getItem('email')
  const passowrd = localStorage.getItem('password')
  localStorage.setItem('patientInsuranceId', patientDataFromState?.insuranceId);
  localStorage.setItem('patientPayorName', patientDataFromState?.payorName)

  const coverageeligibilityPayload = {
    insuranceId: insuranceID || selectedProfile && selectedProfile?.payorDetails?.[0]?.insurance_id,
    mobile: mobile || patientDataFromState?.mobile,
    payor: payorName || (selectedProfile && selectedProfile.length !== 0 ? selectedProfile?.payorDetails?.[0]?.payorName : ""),
    providerName: localStorage.getItem("providerName"),
    participantCode:
      participantInfo[0]?.participant_code || email,
    serviceType: "OPD",
    patientName: selectedProfile?.userName || name || patientDataFromState?.patientName,
    app: "ABSP",
    password: passowrd,
    recipientCode: payorParticipantCode || (patientInfo.length !== 0 ? selectedProfile?.payorDetails?.[0]?.payor : "")
  };
  console.log(coverageeligibilityPayload);


  const sendCoverageEligibilityRequest = async () => {
    try {
      setLoading(true);
      let response = await generateOutgoingRequest(
        "coverageeligibility/check",
        coverageeligibilityPayload
      );
      setLoading(false);
      if (response?.status === 202) {
        toast.success("Coverage eligibility initiated.");
        localStorage.setItem("workflowId", response.data?.workflowId)
        navigate("/coverage-eligibility", {
          state: {
            patientMobile: patientDataFromState?.mobile || mobile,
            workflowId: response.data?.workflowId,
            recipientCode: response.data?.recipientCode
          },
        });
      }
    } catch (error) {
      setLoading(false);
      toast.error(_.get(error, "response.data.error.message"));
    }
  };

  const handleMobileNumberChange = (e: any) => {
    const inputValue = e.target.value;
    const isValidInput = /^\d{10}$/.test(inputValue);
    setIsValid(isValidInput);
    setMobile(inputValue);
  };

  const [active, setActive] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    if (active === index) {
      setActive(null);
    } else {
      setActive(index);
    }
  };

  const searchPayload = {
    filters: {
      "roles": {
        "eq": "payor"
      },
      "status": {
        "eq": "Active"
      }
    },
  };

  const medicalHistoryComponent = () => {
    return (
      <div className="rounded-lg border border-stroke bg-white px-3 pb-3 shadow-default dark:border-strokedark dark:bg-boxdark">
        <SelectInput
          label="Blood group :"
          value={bloodGroup || patientInfo[0]?.medical_history?.blood_group}
          onChange={(e: any) => setBloodGroup(e.target.value)}
          disabled={false}
          options={bloodGroupOptions}
        />
        <SelectInput
          label="Allergies :"
          value={allergies || patientInfo[0]?.medical_history?.allergies}
          onChange={(e: any) => setAllergies(e.target.value)}
          disabled={false}
          options={allergiesOptions}
        />
      </div>)
  }

  const medicalHistory: any = [
    {
      id: 1,
      header: `Medical history`,
      text: medicalHistoryComponent(),
    }
  ];

  const [openDropdown, setOpenDropdown] = useState(false);
  let searchPayorForPatient = async () => {
    try {

      const tokenResponse = await generateToken();
      const token = tokenResponse.data.access_token;
      const response = await searchParticipant(searchPayload, {
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
    searchPayorForPatient();
  }, []);


  const handleSelect = (result: any, participantCode: any) => {
    setOpenDropdown(false);
    setPayorParticipantCode(participantCode);
    setPayorName(result);
  };

  const filteredResults = searchResults.filter((result: any) =>
    result.participant_name.toLowerCase().includes(payorName.toLowerCase())
  );

  useEffect(() => {
  }, [setSelectedProfile])

  return (
    <div>
      <label className="mb-2.5 block text-left text-2xl font-bold text-black dark:text-white">
        New Beneficiary Details
      </label>
      {selectedProfile ? (
        <div className='dark:bg-boxdark" rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark'>
          <label className="text-1xl mb-2.5 mt-2 block text-left font-bold text-black dark:text-white">
            Personal Details
          </label>
          {patientDetails.map((ele: any) => {
            return (
              <div className="mb-2 flex gap-2">
                <h2 className="text-bold text-base font-bold inline-block w-30 text-black dark:text-white">
                  {ele.key}
                </h2>:
                <span className="text-base font-medium">{ele.value}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-stroke bg-white px-3 pb-3 shadow-default dark:border-strokedark dark:bg-boxdark">
          <label className="text-1xl mb-2.5 mt-2 block text-left font-bold text-black dark:text-white">
            Personal details : *
          </label>
          <div className="relative">
            <TextInputWithLabel
              label="Mobile no. :"
              value={mobile}
              onChange={handleMobileNumberChange}
              placeholder="Enter mobile number"
              disabled={false}
              type="number"
            />
          </div>
          <TextInputWithLabel
            label="Name :"
            value={name || patientInfo[0]?.userName}
            onChange={(e: any) => setName(e.target.value)}
            placeholder="Enter beneficiary name"
            // disabled={false || isEditable}
            type="text"
          />
          <TextInputWithLabel
            label="Address :"
            value={address || patientInfo?.address}
            onChange={(e: any) => setAddress(e.target.value)}
            placeholder="Enter address"
            // disabled={false || isEditable}
            type="text"
          />
          <TextInputWithLabel
            label="Email :"
            value={userEmail || patientInfo[0]?.email}
            onChange={(e: any) => setUserEmail(e.target.value)}
            placeholder="Enter email"
            // disabled={false || isEditable}
            type="email"
          />
          <SelectInput
            label="Gender : "
            value={gender}
            onChange={(e: any) => setGender(e.target.value)}
            // disabled={false}
            options={genderOptions}
          />
          <SelectInput
            label="Age : "
            value={age}
            onChange={(e: any) => setAge(e.target.value)}
            // disabled={false}
            options={generateAgeOptions()}
          />
          {
            modelVisible ?
              <div>
                <ModelConfirmBack
                  modelVisible={modelVisible}
                  userInfo={patientInfo}
                  setSelectedProfile={setSelectedProfile}
                  setModelVisible={setModelVisible}
                />
              </div>
              : <></>}
        </div>
      )}
      {
        modelVisible && selectedProfile ?
          <div className="mt-3">
            <div className='relative border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark'>
              <label className="text-1xl mb-2.5 mt-2 block text-left font-bold text-black dark:text-white">
                Medical History
              </label>
              <div className="mb-2 flex gap-2">
                <h2 className="text-bold text-base font-bold inline-block w-30 text-black dark:text-white">
                  Allergies
                </h2>:
                <span className="text-base font-medium">{selectedProfile && selectedProfile?.medicalHistory?.allergies}</span>
              </div>
              <div className="mb-2 flex gap-2">
                <h2 className="text-bold text-base font-bold inline-block w-30 text-black dark:text-white">
                  Blood Group
                </h2>:
                <span className="text-base font-medium">{selectedProfile && selectedProfile?.medicalHistory?.blood_group}</span>
              </div>
            </div>
          </div> :
          <div className="mt-3">
            {medicalHistory.map((item: any) => {
              return (
                <Accordion
                  key={item.id}
                  active={active}
                  handleToggle={handleToggle}
                  faq={item}
                />
              );
            })}
          </div>
      }
      <div className="mt-3">
        <div className="rounded-lg border border-stroke bg-white px-3 pb-3 shadow-default dark:border-strokedark dark:bg-boxdark">
          <label className="text-1xl mb-2.5 mt-2 block text-left font-bold text-black dark:text-white">
            Insurance details : *
          </label>
          {
            selectedProfile ?
              <div className="text-bold text-base font-bold text-black dark:text-white">
                <TextInputWithLabel
                  label="Payor Name :"
                  value={
                    payorName || selectedProfile && selectedProfile?.payorDetails[0].payorName
                  }
                  disabled
                  type="text"
                />
                <TextInputWithLabel
                  label="Participant Code :"
                  value={
                    payorParticipantCode || selectedProfile && selectedProfile?.payorDetails[0].payor
                  }
                  disabled
                  type="text"
                />
                <TextInputWithLabel
                  label="Insurance ID :"
                  value={insuranceID || selectedProfile && selectedProfile?.payorDetails[0].insurance_id}
                  disabled
                  type="text"
                />
              </div>
              :
              <div>
                <h2 className="text-bold text-base font-bold text-black dark:text-white">
                  Payor name:
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={payorName}
                      onChange={(e) => {
                        const inputText = e.target.value;
                        setPayorName(inputText)
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
                                `(${result?.participant_code})` || ''}
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
                    Participant code :
                  </h2>
                  <span className='mt-3'>{payorName ? payorParticipantCode : 'Search above for participant code'}</span>
                </div>
                <TextInputWithLabel
                  label="Insurance ID :"
                  value={insuranceID}
                  onChange={(e: any) => setInsuranceID(e.target.value)}
                  placeholder="Enter Insurance ID"
                  type="text"
                />
              </div>
          }
        </div>
      </div>
      {loading ? (
        <LoadingButton className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed" />
      ) : (
        <div>
          <CustomButton
            text="Add patient & Initiate consultation"
            onClick={() => {
              if (!modelVisible) {
                registerUser();
              }
              sendCoverageEligibilityRequest();
            }}
            disabled={false}
          />
        </div>
      )}
    </div>
  );
};

export default AddPatientAndInitiateCoverageEligibility;