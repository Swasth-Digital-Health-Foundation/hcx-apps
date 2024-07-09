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
  const [isPatientExists, setIsPatientExists] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [searchResults, setSearchResults] = useState<any>([]);
  const [payorParticipantCode, setPayorParticipantCode] = useState<string>('');

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
  const payorOptions = [
    {
      label: `${patientInfo[0]?.payor_details[0]?.payorName || "Select"}`,
      value: patientInfo[0]?.payor_details[0]?.payorName || "",
    },
    { label: "Swasth-reference payor", value: "Swast-reference payor" },
  ];

  const patientDataFromState: any = location.state?.obj;

  const payload = {
    name: patientDataFromState?.patientName || name || patientInfo?.userName,
    mobile: mobile || patientDataFromState?.mobile || patientInfo[0]?.mobile,
    address:
      address || patientDataFromState?.address || patientInfo[0]?.address,
    payor_details: [
      {
        insurance_id:
          insuranceID ||
          patientDataFromState?.insuranceId ||
          patientInfo[0]?.payor_details[0]?.insurance_id,
        payorName:
          payorName ||
          patientDataFromState?.payorName ||
          patientInfo[0]?.payor_details[0]?.payorName,
        recipientCode:
          payorParticipantCode || patientInfo[0]?.payorDetails[0]?.payor
      },
    ],
  };

  const patientDetails = [
    {
      key: "Name :",
      value: patientDataFromState?.patientName,
    },
    {
      key: "Mobile no. :",
      value: patientDataFromState?.mobile,
    },
    {
      key: "Address :",
      value: patientDataFromState?.address,
    },
    {
      key: "Payor name :",
      value: patientDataFromState?.payorName,
    },
    {
      key: "HCX Payor code :",
      value: patientDataFromState?.hcxPayorCode,
    },
    {
      key: "Insurance ID :",
      value: patientDataFromState?.insuranceId,
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
      let registerResponse: any = await createUser("user/create", payload);
      console.log("Registry create  Response ----" + registerResponse);
      sendCoverageEligibilityRequest();
      toast.success(
        "Patient added successfully",
        {
          position: toast.POSITION.TOP_CENTER,
        }
      );
    } catch (error: any) {
      toast.info("Beneficiary already exists,  initiating coverage eligibility", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };


  const patientSearch = async () => {
    try {
      setSearchLoading(true);
      let registerResponse: any = await searchUser("user/search", patientDataFromState?.mobile || mobile)
      setPatientInfo(registerResponse?.data?.result);
      setIsEditable(true);
      setSearchLoading(false);
      if (registerResponse?.data?.result.length === 0) {
        toast.error("No active beneficiary registered on this mobile number!");
        setIsEditable(false);
      } else {
        toast.success("Beneficiary already exists!");
        setIsPatientExists(true);
      }
    } catch (error: any) {
      setIsEditable(false);
      setSearchLoading(false);
      toast.error("No active beneficiary registered on this mobile number!", {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  localStorage.setItem("patientMobile", mobile || patientDataFromState?.mobile);
  const email = localStorage.getItem('email')
  const passowrd = localStorage.getItem('password')
  localStorage.setItem('patientInsuranceId', patientDataFromState?.insuranceId);
  localStorage.setItem('patientPayorName', patientDataFromState?.payorName)

  const coverageeligibilityPayload = {
    insuranceId:
      insuranceID || (patientInfo.length !== 0 ? patientInfo?.payorDetails?.[0]?.insurance_id : "") ||
      patientDataFromState?.insuranceId,
    mobile: mobile || patientDataFromState?.mobile,
    payor: payorName || (patientInfo && patientInfo.length !== 0 ? patientInfo?.payorDetails?.[0]?.payorName : ""),
    providerName: localStorage.getItem("providerName"),
    participantCode: participantInfo[0]?.participant_code || email,
    serviceType: "OPD",
    patientName: patientInfo?.userName || name || patientDataFromState?.patientName,
    app: "ABSP",
    password: passowrd,
    recipientCode: payorParticipantCode || (patientInfo.length !== 0 ? patientInfo?.payorDetails?.[0]?.payor : "") || patientDataFromState?.hcxPayorCode
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
    // Check if the input contains exactly 10 numeric characters
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

  //payor search
  const debounce = useDebounce(payorName, 500);

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

  useEffect(() => {
    if (mobile !== "") {
      patientSearch()
    }
    if (patientDataFromState?.mobile) {
      patientSearch()
    }
  }, [patientDataFromState?.mobileNumber])

  const handleSelect = (result: any, participantCode: any) => {
    setOpenDropdown(false);
    setPayorParticipantCode(participantCode);
    setPayorName(result);
  };

  const filteredResults = searchResults.filter((result: any) =>
    result.participant_name.toLowerCase().includes(payorName.toLowerCase())
  );

  console.log("patientInfo", patientInfo)

  return (
    <div>
      <label className="mb-2.5 block text-left text-2xl font-bold text-black dark:text-white">
        New Beneficiary Details
      </label>
      {patientDataFromState ? (
        <div className='dark:bg-boxdark" rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark'>
          {patientDetails.map((ele: any) => {
            return (
              <div className="mb-2 flex gap-2">
                <h2 className="text-bold text-base font-bold text-black dark:text-white">
                  {ele.key}
                </h2>
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
            <div className="absolute right-4 -mt-10">
              <a
                onClick={() => {
                  if (isValid && mobile !== "") patientSearch();
                  else toast.info("Enter 10 digit mobile number!");
                }}
                className="w-20 cursor-pointer py-2 font-medium text-black underline"
              >
                {!searchLoading ? "Search" : "searching..."}
              </a>
            </div>
          </div>
          <TextInputWithLabel
            label="Name :"
            value={name || patientInfo?.userName}
            onChange={(e: any) => setName(e.target.value)}
            placeholder="Enter beneficiary name"
            disabled={false || isEditable}
            type="text"
          />
          <TextInputWithLabel
            label="Address :"
            value={address || patientInfo?.address}
            onChange={(e: any) => setAddress(e.target.value)}
            placeholder="Enter address"
            disabled={false || isEditable}
            type="text"
          />
        </div>
      )}
      {patientDataFromState ? (
        <></>
      ) : (
        <div className="mt-3">
          <div className="rounded-lg border border-stroke bg-white px-3 pb-3 shadow-default dark:border-strokedark dark:bg-boxdark">
            <label className="text-1xl mb-2.5 mt-2 block text-left font-bold text-black dark:text-white">
              Insurance details : *
            </label>
            {
              !_.isEmpty(patientInfo) ?
                <div className="text-bold text-base font-bold text-black dark:text-white">
                  <TextInputWithLabel
                    label="Payor Name :"
                    value={
                      payorName || patientInfo && patientInfo?.payorDetails[0]?.payorName || ""
                    }
                    disabled={false || isEditable}
                    type="text"
                  />
                  <TextInputWithLabel
                    label="Recipient Code :"
                    value={
                      patientInfo && patientInfo?.payorDetails[0]?.payor || payorParticipantCode || ""
                    }
                    disabled={false || isEditable}
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
                        // onChange={(e) => setPayorName(e.target.value)}
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
                      {/* {strings.PARTICIPANT_CODE} */}
                      Participant code :
                    </h2>
                    <span className='mt-3'>{payorName ? payorParticipantCode : 'Search above for participant code'}</span>
                  </div>
                </div>
            }
            <TextInputWithLabel
              label="Insurance ID :"
              value={
                insuranceID || patientInfo && patientInfo.length !== 0 ? patientInfo?.payorDetails?.[0]?.insurance_id : ""
              }
              onChange={(e: any) => setInsuranceID(e.target.value)}
              placeholder="Enter Insurance ID"
              disabled={false || isEditable}
              type="text"
            />
          </div>
        </div>
      )}
      {loading ? (
        <LoadingButton className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed" />
      ) : (
        <div>
          <CustomButton
            text="Proceed"
            onClick={() => {
              if (isPatientExists === false) {
                registerUser();
                setTimeout(() => {
                  navigate("/coverage-eligibility", { state: { patientMobile: mobile } })
                  setLoading(false)
                }, 2000)
              } else {
                sendCoverageEligibilityRequest();
              }
            }}
            disabled={false}
          />
        </div>
      )}
    </div>
  );
};

export default AddPatientAndInitiateCoverageEligibility;