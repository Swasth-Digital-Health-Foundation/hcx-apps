import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { generateOutgoingRequest, getActivePlans, getConsultationDetails, getCoverageEligibilityRequestList, handleUpload, searchUser } from "../../services/hcxMockService";
import LoadingButton from "../../components/LoadingButton";
import { toast } from "react-toastify";
import strings from "../../utils/strings";
import { generateToken, searchParticipant } from "../../services/hcxService";
import SelectInput from "../../components/SelectInput";
import TextInputWithLabel from "../../components/inputField";
import TransparentLoader from "../../components/TransparentLoader";
import * as _ from "lodash";

const InitiateNewClaimRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [amount, setAmount] = useState<string>("");
  const [serviceType, setServiceType] = useState<string>();
  const [documentType, setDocumentType] = useState<string>("prescription");

  const [loading, setLoading] = useState(false);
  const [payorName, setPayorName] = useState<string>("");

  const [userInfo, setUserInformation] = useState<any>([]);
  const [activeRequests, setActiveRequests] = useState<any>([]);
  const [finalData, setFinalData] = useState<any>([]);
  const [displayedData, setDisplayedData] = useState<any>(
    finalData.slice(0, 5)
  );

  const [submitLoading, setSubmitLoading] = useState(false);
  const [consultationDetails, setConsultationDetails] = useState<any>();
  const [preauthOrClaimList, setpreauthOrClaimList] = useState<any>([]);
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>({});
  const [files, setFiles] = useState<File[]>([]);
  const [treatmentType, setTreatmentType] = useState<string>("")
  const [entererName, setEntererName] = useState<string>("")
  const [entererRole, setEntererRole] = useState<string>("Helathcare Professional")

  const password = localStorage.getItem('password');
  const email = localStorage.getItem('email');

  const documentTypeOptions = [{ label: "Prescription", value: "Prescription", }, { label: "Payment Receipt", value: "Payment Receipt", }, { label: "Medical Bill/invoice", value: "Medical Bill/invoice", },];

  const treatmentOptions = [{ label: "Consultation", value: "Consultation" }, { label: "Teleconsultation", value: "Teleconsultation" }];

  const entererRoleOptions = [{ label: "Helathcare Professional", value: "Helathcare Professional" }, { label: "Public Health Nurse", value: "Public Health Nurse" }, { label: "Consultant Physician", value: "Consultant Physician" }, { label: "Insurance Agent", value: "Insurance Agent" }];


  const [data] = useState(location.state);

  const handleDelete = (name: string) => {
    setSelectedFiles((prevSelectedFiles) => {
      const updatedFiles = { ...prevSelectedFiles };
      for (const key in updatedFiles) {
        updatedFiles[key] = updatedFiles[key].filter((file) => file.name !== name);
      }
      return updatedFiles;
    });
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== name));
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files;
    if (newFiles) {
      const fileType = documentType.toLowerCase().replace(/\s+/g, '_');
      setSelectedFiles((prevSelectedFiles) => ({
        ...prevSelectedFiles,
        [fileType]: prevSelectedFiles[fileType]
          ? [...prevSelectedFiles[fileType], ...Array.from(newFiles)]
          : Array.from(newFiles),
      }));
      setFiles((prevFiles) => [...prevFiles, ...Array.from(newFiles)]);
    }
  };



  const generateSupportingDocuments = (selectedFiles: any, uploadedFiles: any[]): any[] => {
    const getFileNameFromUrl = (url: string): string => decodeURIComponent(url.split('/').pop() || '').replace("/", "");
    const documentUrlsMap: { [key: string]: string[] } = {};
    if (!selectedFiles || Object.keys(selectedFiles).length === 0) {
      return [];
    }
    Object.keys(selectedFiles).forEach(documentType => {
      selectedFiles[documentType].forEach((fileName: any) => {
        const matchedFile = uploadedFiles.find(file => getFileNameFromUrl(file.url) === fileName.name);
        if (matchedFile) {
          if (!documentUrlsMap[documentType]) {
            documentUrlsMap[documentType] = [];
          }
          documentUrlsMap[documentType].push(matchedFile.url); // Add URL to the document type array
        }
      });
    });
    return Object.entries(documentUrlsMap).map(([documentType, urls]) => ({
      documentType,
      urls,
    }));
  };

  let urls: string = consultationDetails?.supporting_documents_url;
  const trimmedString: string = urls?.slice(1, -1);
  const consultationDocs: any[] = trimmedString?.split(",");

  function addConsultationUrls(supportingDocs: { documentType: string; urls: any; }[], consultationUrls: any) {
    const prescriptionIndex = supportingDocs.findIndex(doc => doc.documentType === "prescription");
    if (prescriptionIndex !== -1) {
      supportingDocs[prescriptionIndex].urls = supportingDocs[prescriptionIndex].urls.concat(consultationUrls);
    } else {
      supportingDocs.push({
        documentType: "prescription",
        urls: consultationUrls
      });
    }
  }


  let initiateClaimRequestBody: any = {
    insuranceId: _.get(data, 'requestDetails.insuranceId', '') || displayedData[0]?.insurance_id,
    insurancePlan: _.get(data, 'requestDetails.insurancePlan', '') || null,
    mobile: displayedData[0]?.mobile || localStorage.getItem("mobile"),
    patientName: displayedData[0]?.patientName || userInfo[0]?.name || localStorage.getItem("patientName") || data?.requestDetails?.patientName,
    participantCode:
      _.get(data, 'requestDetails.participantCode', '') || localStorage.getItem("senderCode") || email,
    payor: _.get(data, 'requestDetails.payor', '') || payorName,
    providerName: _.get(data, 'requestDetails.providerName', '') || localStorage.getItem("providerName"),
    serviceType: _.get(data, 'requestDetails.serviceType', '') || displayedData[0]?.claimType,
    billAmount: amount,
    workflowId: _.get(data, 'requestDetails.workflowId', ''),
    supportingDocuments: [],
    type: _.get(data, 'requestDetails.serviceType', '') || displayedData[0]?.claimType,
    app: "OPD",
    entererName: entererName,
    entererRole: entererRole,
    password: password,
    treatmentType: treatmentType,
    recipientCode: _.get(data, 'requestDetails.recipientCode', ''),
  };

  const search = async () => {
    try {
      let responseData: any = await searchUser("user/search", mobile || localStorage.getItem("mobile") || data?.requestDetails?.patientMobile);
      setUserInformation(responseData?.data?.result);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    search();
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
    app: "OPD",
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
        let payorname = payorResponse?.data?.participants[0]?.participant_name;
        setPayorName(payorname);
      } catch (err) {
        console.log("error", err);
      }
    };
    search();
  }, [displayedData]);

  const handleClaimRequest = async () => {
    const response = await generateOutgoingRequest("claim/submit", initiateClaimRequestBody);
    console.log(response)
  };

  const submitClaim = async () => {
    try {
      setSubmitLoading(true);
      if (!_.isEmpty(selectedFiles)) {
        const response = await handleUpload(mobile, files);
        var supportingDocs = generateSupportingDocuments(selectedFiles, response?.data);
        if (urls != "{}") {
          addConsultationUrls(supportingDocs, consultationDocs);
        }
        _.set(initiateClaimRequestBody, "supportingDocuments", supportingDocs)
        if (response?.status === 200) {
          handleClaimRequest()
          setSubmitLoading(false);
          toast.dismiss()
          toast.success("Claim request initiated successfully!");
        }
      } else {
        toast.dismiss()
        if (urls != "{}") {
          _.set(initiateClaimRequestBody, "supportingDocuments", addConsultationUrls([], consultationDocs));
        }
        const response = await generateOutgoingRequest("claim/submit", initiateClaimRequestBody);
        if (response?.status === 200) {
          toast.success("Claim request initiated successfully!");
        }
      }
      setSubmitLoading(false);
      navigate("/home");
    } catch (err) {
      setSubmitLoading(false);
      toast.dismiss()
      toast.error("Failed to submit claim, try again!");
    }
  };

  const getConsultation = async () => {
    try {
      const response = await getConsultationDetails(_.get(data, "requestDetails.workflowId", ""));
      let consultationDetails = response.data;
      setConsultationDetails(consultationDetails);
    } catch (err: any) {
      console.log(err);
    }
  };


  const preauthOrClaimListPayload = {
    workflow_id: _.get(data, "requestDetails.workflowId", ""),
    app: 'OPD',
  };

  useEffect(() => {
    getConsultation().then(() => { getActivePlans({ setLoading, preauthOrClaimListPayload, setpreauthOrClaimList }).catch((err: any) => console.log(err)) })
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
          <div className="rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
            <TextInputWithLabel
              label="Selected insurance : "
              value={displayedData[0]?.insurance_id}
              disabled={true}
              type="text"
            />
            <TextInputWithLabel
              label="Service type : "
              value={displayedData[0]?.claimType || serviceType}
              disabled={true}
              type="text"
            />
            <SelectInput
              label="Service/Treatment given : "
              value={treatmentType}
              onChange={(e: any) => setTreatmentType(e.target.value)}
              options={treatmentOptions}
            />
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
              <table className="table-auto w-full mt-5">
                <thead className="text-left">
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th>
                      Document type
                    </th>
                    <th>
                      Document name
                    </th>
                    <th>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="text-left">
                  {Object.entries(selectedFiles).map(([fileType, files]) => (
                    files.map((file, index) => (
                      <tr key={`${fileType}-${index}`}>
                        <td>{fileType}</td>
                        <td>{file.name}</td>
                        <td>
                          <div >
                            <button onClick={() => handleDelete(file.name)} className="text-red underline text-end"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            }
          </div>
          <div className="mb-5 mt-4">
            {!submitLoading ? (
              <button
                disabled={amount === "" || treatmentType === ''}
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
        </div>
      )}
    </>
  );
};

export default InitiateNewClaimRequest;
