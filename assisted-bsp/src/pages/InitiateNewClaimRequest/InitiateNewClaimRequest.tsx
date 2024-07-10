import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { handleFileChange } from "../../utils/attachmentSizeValidation";
import { generateOutgoingRequest, getActivePlans, getCoverageEligibilityRequestList, handleUpload, searchUser } from "../../services/hcxMockService";
import LoadingButton from "../../components/LoadingButton";
import { toast } from "react-toastify";
import strings from "../../utils/strings";
import { generateToken, searchParticipant } from "../../services/hcxService";
import SelectInput from "../../components/SelectInput";
import TextInputWithLabel from "../../components/inputField";
import TransparentLoader from "../../components/TransparentLoader";
import useDebounce from '../../hooks/useDebounce';
import * as _ from "lodash";

const InitiateNewClaimRequest = () => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [providerName, setProviderName] = useState<string>('');
  const [participantCode, setParticipantCode] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFile, setSelectedFile]: any = useState<FileList | undefined>(
    undefined
  );
  const [fileErrorMessage, setFileErrorMessage]: any = useState();
  const [isSuccess, setIsSuccess]: any = useState(false);

  const [amount, setAmount] = useState<string>("");
  const [serviceType, setServiceType] = useState<string>("OPD");
  const [documentType, setDocumentType] = useState<string>("prescription");

  const [loading, setLoading] = useState(false);
  const [payorName, setPayorName] = useState<string>("");

  const [fileUrlList, setUrlList] = useState<any>([]);

  const [userInfo, setUserInformation] = useState<any>([]);
  const [activeRequests, setActiveRequests] = useState<any>([]);
  const [finalData, setFinalData] = useState<any>([]);
  const [displayedData, setDisplayedData] = useState<any>(
    finalData.slice(0, 5)
  );

  const [selectedInsurance, setSelectedInsurance] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [treatmentType, setTreatmentType] = useState<string>("Consultation")
  const [entererName, setEntererName] = useState<string>("")
  const [entererRole, setEntererRole] = useState<string>("Helathcare Professional")

  const [preauthOrClaimList, setpreauthOrClaimList] = useState<any>([]);

  const documentTypeOptions = [
    {
      label: "Prescription",
      value: "Prescription",
    },
    {
      label: "Payment Receipt",
      value: "Payment Receipt",
    },
    {
      label: "Medical Bill/invoice",
      value: "Medical Bill/invoice",
    },
  ];

  const treatmentOptions = [{ label: "Consultation", value: "Consultation" }, { label: "Teleconsultation", value: "Teleconsultation" }];

  const entererRoleOptions = [{ label: "Helathcare Professional", value: "Helathcare Professional" }, { label: "Public Health Nurse", value: "Public Health Nurse" }, { label: "Consultant Physician", value: "Consultant Physician" }, { label: "Insurance Agent", value: "Insurance Agent" }];

  const services = [{ label: "OPD", value: "OPD" }, { label: "IPD", value: "IPD" }];

  let FileLists: any;
  if (selectedFile !== undefined) {
    FileLists = Array.from(selectedFile);
  }

  const data = location.state?.requestDetails;
  const handleDelete = (name: any) => {
    if (selectedFile !== undefined) {
      const updatedFilesList = selectedFile.filter(
        (file: any) => file.name !== name
      );
      setSelectedFile(updatedFilesList);
    }
  };

  const password = localStorage.getItem('password');
  const email = localStorage.getItem('email');

  let initiateClaimRequestBody: any = {
    insuranceId: data?.insuranceId || displayedData[0]?.insurance_id,
    insurancePlan: data?.insurancePlan || null,
    mobile: data?.patientMobile || localStorage.getItem("mobile") || location.state?.patientMobile,
    patientName: userInfo?.userName || localStorage.getItem("patientName"),
    participantCode: data?.participantCode || localStorage.getItem("senderCode") || email,
    payor: data?.payor || payorName,
    providerName: providerName || _.isEmpty(searchResults) ? providerName : data?.providerName || localStorage.getItem("providerName"),
    serviceType: serviceType || displayedData[0]?.claimType,
    billAmount: amount,
    workflowId: data?.workflowId || localStorage.getItem("workflowId"),
    treatmentType: treatmentType,
    entererName: entererName,
    entererRole: entererRole,
    supportingDocuments: [
      {
        documentType: documentType,
        urls: fileUrlList.map((ele: any) => {
          return ele.url;
        }),
      },
    ],
    type: serviceType || displayedData[0]?.claimType,
    password: password,
    recipientCode: location.state?.recipientCode || data?.recipientCode || localStorage.getItem("recipientCode"),
    app: "ABSP",
    date: selectedDate
  };

  console.log("initiateClaimRequestBody", initiateClaimRequestBody);

  const userSearch = async () => {
    try {
      let registerResponse: any = await searchUser("user/search", localStorage.getItem("patientMobile") || location.state?.patientMobile)
      setUserInformation(registerResponse?.data?.result);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    userSearch();
  }, []);

  const payorCodePayload = {
    filters: {
      participant_code: {
        eq: displayedData[0]?.recipient_code || location.state?.payorCode,
      },
    },
  };

  const requestPayload = {
    sender_code: localStorage.getItem("senderCode"),
    app: "ABSP",
  };

  useEffect(() => {
    getCoverageEligibilityRequestList(setLoading, requestPayload, setActiveRequests, setFinalData, setDisplayedData)
  }, []);

  const mobile = localStorage.getItem("patientMobile")

  useEffect(() => {
    const search = async () => {
      try {
        const tokenResponse = await generateToken();
        let token = tokenResponse.data?.access_token;
        const payorResponse = await searchParticipant(payorCodePayload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        let payorname = payorResponse.data?.participants[0]?.participant_name;
        setPayorName(payorname);
      } catch (err) {
        console.log("error", err);
      }
    };
    search();
  }, [displayedData]);


  const submitClaim = async () => {
    try {
      setSubmitLoading(true);
      if (!_.isEmpty(selectedFile)) {
        await handleUpload(mobile, FileLists, initiateClaimRequestBody, setUrlList);
      }
      const claimResponse = await generateOutgoingRequest("claim/submit", initiateClaimRequestBody);
      if (claimResponse?.status === 202) {
        toast.success("Claim request initiated successfully!");
      } else {
        toast.error("Faild to submit claim, try again!");
        throw new Error("Failed to submit claim, try again!");
      }
      setSubmitLoading(false);
      navigate("/home");
    } catch (err) {
      setSubmitLoading(false);
      toast.error("Faild to submit claim, try again!");
    }
  };

  const handleSelect = (result: any, participantCode: any) => {
    setOpenDropdown(false);
    setParticipantCode(participantCode);
    setProviderName(result);
  };

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

  useDebounce(providerName, 500);

  useEffect(() => {
    search();
    const currentDate = new Date().toISOString().split('T')[0];
    setSelectedDate(currentDate);
  }, []);

  const filteredResults = searchResults.filter((result: any) =>
    result.participant_name.toLowerCase().includes(providerName.toLowerCase())
  );

  const preauthOrClaimListPayload = {
    workflow_id: data?.workflowId || '',
    app: 'ABSP',
  };

  useEffect(() => {
    getActivePlans({ setLoading, preauthOrClaimListPayload, setpreauthOrClaimList }).catch((err: any) => console.log(err))
  }, [])

  return (
    <>
      {loading ? (
        <TransparentLoader />
      ) : (
        <div className="w-full">
          <h2 className="mb-4 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
            {strings.NEW_CLAIM_REQUEST}
          </h2>
          <div className="rounded-lg border border-stroke bg-white mt-5 p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h2 className="mb-3 text-bold text-base font-bold text-black dark:text-white"> {"Provider Details:"} </h2>
            <h2 className="relative text-black font-bold z-20 mb-4 bg-white dark:bg-form-input">
              {strings.PROVIDER_NAME}{' '}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={providerName}
                  // onChange={(e) => setProviderName(e.target.value)}
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
            <TextInputWithLabel
              label="Participant code:"
              placeholder={providerName ? (_.isEmpty(participantCode) || _.isEmpty(searchResults)) ? 'Not applicable' : participantCode : 'Search above for participant code'}
              value={_.isEmpty(searchResults) ? "" : participantCode}
              disabled={true}
              type="text"
            />
          </div>
          <div className="rounded-lg border border-stroke bg-white mt-5 p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
            <TextInputWithLabel
              label="Insurance Id: "
              value={selectedInsurance || displayedData[0]?.insurance_id}
              disabled={true}
              type="text"
            />
            <SelectInput
              label="Service type : "
              value={serviceType}
              onChange={(e: any) => setServiceType(e.target.value)}
              options={services}
            />
            <SelectInput
              label="Service/Treatment category :"
              value={treatmentType}
              onChange={(e: any) => setTreatmentType(e.target.value)}
              options={treatmentOptions}
            />
            <h2 className="mt-3 text-1xl text-black font-bold z-20 bg-white dark:bg-form-input">
              {"Treatment date :"}
            </h2>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                max={selectedDate}
                onChange={(e: any) => setSelectedDate(e.target.value)}
                className=" mt-3 custom-input-date custom-input-date-1 w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
              <div className="absolute right-5 top-7 flex items-center ps-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                </svg>
              </div>
            </div>
            <TextInputWithLabel
              label="Bill amount : *"
              value={amount}
              onChange={(e: any) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={false}
              type="number"
            />
          </div>
          <div className="rounded-lg border border-stroke bg-white mt-5 p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h2 className="text-1xl mb-4 font-bold text-black dark:text-white sm:text-title-xl1">
              {"Claim Enterer Information"}
            </h2>
            <TextInputWithLabel
              label="Enterer Name :"
              placeholder="Enter enterer name"
              value={entererName}
              onChange={(e: any) => setEntererName(e.target.value)}
              type="text"
            />
            <SelectInput
              label="Enterer Role :"
              value={entererRole}
              onChange={(e: any) => setEntererRole(e.target.value)}
              options={entererRoleOptions}
            />
          </div>
          <div className="mt-4 rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h2 className="text-1xl mb-4 font-bold text-black dark:text-white sm:text-title-xl1">
              {strings.SUPPORTING_DOCS}
            </h2>
            <div className="relative z-20 mb-4 bg-white dark:bg-form-input">
              <SelectInput
                label="Document type :"
                onChange={(e: any) => setDocumentType(e.target.value)}
                disabled={false}
                options={documentTypeOptions}
              />
            </div>
            <div className="flex items-center justify-evenly gap-x-6">
              <div>
                <label
                  htmlFor="profile"
                  className="bottom-0 right-0 flex h-15 w-15 cursor-pointer items-center justify-center rounded-full bg-primary text-white hover:bg-opacity-90 sm:bottom-2 sm:right-2"
                >
                  <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M4.76464 1.42638C4.87283 1.2641 5.05496 1.16663 5.25 1.16663H8.75C8.94504 1.16663 9.12717 1.2641 9.23536 1.42638L10.2289 2.91663H12.25C12.7141 2.91663 13.1592 3.101 13.4874 3.42919C13.8156 3.75738 14 4.2025 14 4.66663V11.0833C14 11.5474 13.8156 11.9925 13.4874 12.3207C13.1592 12.6489 12.7141 12.8333 12.25 12.8333H1.75C1.28587 12.8333 0.840752 12.6489 0.512563 12.3207C0.184375 11.9925 0 11.5474 0 11.0833V4.66663C0 4.2025 0.184374 3.75738 0.512563 3.42919C0.840752 3.101 1.28587 2.91663 1.75 2.91663H3.77114L4.76464 1.42638ZM5.56219 2.33329L4.5687 3.82353C4.46051 3.98582 4.27837 4.08329 4.08333 4.08329H1.75C1.59529 4.08329 1.44692 4.14475 1.33752 4.25415C1.22812 4.36354 1.16667 4.51192 1.16667 4.66663V11.0833C1.16667 11.238 1.22812 11.3864 1.33752 11.4958C1.44692 11.6052 1.59529 11.6666 1.75 11.6666H12.25C12.4047 11.6666 12.5531 11.6052 12.6625 11.4958C12.7719 11.3864 12.8333 11.238 12.8333 11.0833V4.66663C12.8333 4.51192 12.7719 4.36354 12.6625 4.25415C12.5531 4.14475 12.4047 4.08329 12.25 4.08329H9.91667C9.72163 4.08329 9.53949 3.98582 9.4313 3.82353L8.43781 2.33329H5.56219Z"
                      fill=""
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7.00004 5.83329C6.03354 5.83329 5.25004 6.61679 5.25004 7.58329C5.25004 8.54979 6.03354 9.33329 7.00004 9.33329C7.96654 9.33329 8.75004 8.54979 8.75004 7.58329C8.75004 6.61679 7.96654 5.83329 7.00004 5.83329ZM4.08337 7.58329C4.08337 5.97246 5.38921 4.66663 7.00004 4.66663C8.61087 4.66663 9.91671 5.97246 9.91671 7.58329C9.91671 9.19412 8.61087 10.5 7.00004 10.5C5.38921 10.5 4.08337 9.19412 4.08337 7.58329Z"
                      fill=""
                    />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    name="profile"
                    id="profile"
                    className="sr-only"
                    onChange={(event: any) => {
                      handleFileChange(
                        event,
                        setFileErrorMessage,
                        setIsSuccess,
                        setSelectedFile
                      );
                    }}
                  />
                </label>
              </div>
              <div>OR</div>
              <div>
                <label htmlFor="actual-btn" className="upload underline">
                  {strings.UPLOAD_DOCS}
                </label>
                <input
                  hidden
                  id="actual-btn"
                  type="file"
                  multiple={true}
                  onChange={(event: any) => {
                    handleFileChange(
                      event,
                      setFileErrorMessage,
                      setIsSuccess,
                      setSelectedFile
                    );
                  }}
                  className="w-full rounded-md border border-stroke p-3 outline-none transition file:rounded file:border-[0.5px] file:border-stroke file:bg-[#EEEEEE] file:py-1 file:px-2.5 file:text-sm file:font-medium focus:border-primary file:focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-strokedark dark:file:bg-white/30 dark:file:text-white"
                />
              </div>
            </div>
            {isSuccess ? (
              <div>
                {_.map(FileLists, (file: any) => {
                  return (
                    <div className="flex items-center justify-between">
                      <div className="mb-2.5 mt-4 block text-left text-sm text-black dark:text-white">
                        {file?.name}
                      </div>
                      <a
                        className="text-red underline"
                        onClick={() => handleDelete(file?.name)}
                      >
                        {strings.DELETE}
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mb-2.5 mt-4 block text-left text-xs text-red dark:text-red">
                {fileErrorMessage}
              </div>
            )}
          </div>
          {/* <DocumentsList preauthOrClaimList={preauthOrClaimList} /> */}
          <div className="mb-5 mt-4">
            {!submitLoading ? (
              <button
                disabled={amount === "" || treatmentType === "" || entererName === "" || entererRole === "" || fileErrorMessage}
                onClick={() => {
                  submitClaim();
                }}
                type="submit"
                className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed disabled:bg-secondary disabled:text-gray"
              >
                Submit claim
              </button>
            ) : (
              <LoadingButton className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed" />
            )}
          </div>
        </div >
      )}
    </>
  );
};

export default InitiateNewClaimRequest;
