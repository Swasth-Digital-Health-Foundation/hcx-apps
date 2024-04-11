import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import strings from "../../utils/strings";
import { generateToken, searchParticipant } from "../../services/hcxService";
import {
  generateOutgoingRequest,
  getConsultationDetails, searchUser
} from "../../services/hcxMockService";
import TransparentLoader from "../../components/TransparentLoader";
import { toast } from "react-toastify";
import { isEmpty } from "lodash";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import * as _ from "lodash";
import thumbnail from "../../images/pngwing.com.png"

const ViewPatientDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState<string>();
  const [providerName, setProviderName] = useState<string>();
  const [payorName, setPayorName] = useState<string>("");
  const [preauthOrClaimList, setpreauthOrClaimList] = useState<any>([]);
  const [loading, setisLoading] = useState(false);
  const [coverageDetails, setCoverageDetails] = useState<any>([]);
  const [apicallIds, setapicallIds] = useState<any>([]);
  const [coverageEligibilityStatus, setcoverageStatus] = useState<any>([]);
  const [apicallIdForClaim, setApicallID] = useState<any>();
  const [patientDetails, setPatientDetails] = useState<any>([]);
  const [consultationDetail, setConsultationDetails] = useState<any>();
  const [isRejected, setIsRejected] = useState<boolean>(false)

  const requestDetails = {
    providerName: providerName,
    billAmount: location.state?.billAmount || preauthOrClaimList[0]?.billAmount,
    apiCallId: apicallIdForClaim,
    ...location.state,
  };

  const [type, setType] = useState<string[]>([]);



  const getPatientDetails = async () => {
    try {
      setisLoading(true);
      let registerResponse: any = await searchUser("user/search", location.state?.patientMobile || localStorage.getItem("patientMobile"))
      console.log(registerResponse)
      setPatientDetails(registerResponse?.data?.result);
    } catch (error: any) {
      toast.error(error.response.data.params.errmsg, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  localStorage.setItem("patientMobile", patientDetails[0]?.mobile);
  localStorage.setItem("patientName", patientDetails[0]?.name);

  const personalDeatails = [
    {
      key: "Patient name",
      value: patientDetails?.userName,
    },
    {
      key: "Mobile no",
      value: patientDetails?.mobile || location.state?.patientMobile || localStorage.getItem("patientMobile"),
    },
    {
      key: "Address",
      value: patientDetails?.address,
    },
  ];

  const consultationDetailsData = [
    {
      key: "Treatment type",
      value: consultationDetail?.service_type,
    },
    {
      key: "Service type",
      value: consultationDetail?.treatment_type,
    },
    {
      key: "Symptom",
      value: consultationDetail?.symptoms,
    },
  ];

  let urls: string = consultationDetail?.supporting_documents_url;
  const trimmedString: string = urls?.slice(1, -1);
  const urlArray: any[] = trimmedString?.split(",");

  const participantCodePayload = {
    filters: {
      participant_code: { eq: location.state?.participantCode },
    },
  };

  const payorCodePayload = {
    filters: {
      participant_code: { eq: location.state?.payorCode },
    },
  };

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const tokenGeneration = async () => {
    try {
      const tokenResponse = await generateToken();
      if (tokenResponse.statusText === "OK") {
        setToken(tokenResponse.data.access_token);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const search = async () => {
    const response = await searchParticipant(participantCodePayload, config);
    setProviderName(response.data?.participants[0]?.participant_name);

    const payorResponse = await searchParticipant(payorCodePayload, config);
    setPayorName(payorResponse.data?.participants[0].participant_name);
  };

  useEffect(() => {
    try {
      if (token !== undefined) {
        search();
      }
    } catch (err) {
      console.log(err);
    }
  }, [token]);

  const preauthOrClaimListPayload = {
    workflow_id: requestDetails?.workflowId || location.state?.workflowId,
    app: "OPD",
  };

  const patientMobile = localStorage.getItem("patientMobile");
  const coverageEligibilityPayload = {
    mobile:
      location.state?.patientMobile || patientMobile,
    app: "OPD",
  };

  const getActivePlans = async () => {
    try {
      setisLoading(true);
      let statusCheckCoverageEligibility = await generateOutgoingRequest(
        "request/list",
        coverageEligibilityPayload
      );
      let response = await generateOutgoingRequest(
        "request/list",
        preauthOrClaimListPayload
      );
      let preAuthAndClaimList = response.data?.entries;
      setpreauthOrClaimList(preAuthAndClaimList);
      for (const entry of preAuthAndClaimList) {
        if (entry.type === "claim") {
          setApicallID(entry.apiCallId);
          break;
        }
      }
      setType(
        response.data?.entries.map((ele: any) => {
          if ((ele.type === 'claim' && ele.status === 'Rejected') || ele.type === 'preauth' && ele.status === 'Rejected' || ele.type === 'coverageeligibility' && ele.status === 'Rejected') setIsRejected(true)
          else setIsRejected(false);
          return ele.type;
        })
      );

      let coverageData = statusCheckCoverageEligibility.data?.entries;
      setCoverageDetails(coverageData);

      const entryKey = Object?.keys(coverageDetails[0])[0];

      // Filter the objects with type "claim"
      const claimObjects = coverageDetails[0][entryKey].filter(
        (obj: any) => obj.type === "claim"
      );

      // Extract the apicallId values from the "claim" objects
      const apicallIds = claimObjects.map((obj: any) => obj.apiCallId);
      setapicallIds(apicallIds);

      setisLoading(false);
    } catch (err) {
      setisLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    tokenGeneration();
    getActivePlans();
  }, [preauthOrClaimListPayload.workflow_id, patientMobile]);

  const getConsultation = async () => {
    try {
      const response = await getConsultationDetails(location.state?.workflowId);
      let data = response.data;
      setConsultationDetails(data);
    } catch (err: any) {
      console.log(err);
      // toast.error()
    }
  };

  useEffect(() => {
    for (const entry of preauthOrClaimList) {
      if (entry.type === "claim") {
        setApicallID(entry.apiCallId);
        break;
      }
    }
    getConsultation();
  }, []);


  const workflowId = location.state?.workflowId;
  let coverageStatus = coverageDetails.find(
    (entryObj: any) => Object.keys(entryObj)[0] === workflowId
  );

  useEffect(() => {
    if (
      coverageStatus &&
      coverageStatus[workflowId].some(
        (obj: any) => obj.type === "coverageeligibility"
      )
    ) {
      // If it exists, find the object with type "coverageeligibility" and return its status
      const eligibilityObject = coverageStatus[workflowId].find(
        (obj: any) => obj.type === "coverageeligibility"
      );
      const status = eligibilityObject.status;
      setcoverageStatus(status);
    } else {
      console.log(
        "Object with type 'coverageeligibility' not found for the given ID."
      );
    }
  }, [coverageStatus, patientMobile]);

  useEffect(() => {
    getPatientDetails();
  }, [location.state?.patientMobile]);

  const hasClaimApproved = preauthOrClaimList.some(
    (entry: any) => entry.type === "claim"
  );

  const patientInsuranceId = localStorage.getItem('patientInsuranceId');
  const patientPayorName = localStorage.getItem('patientPayorName');

  return (
    <>
      {!loading ? (
        <div className="-pt-2">
          <div className="relative flex pb-8">
            <ArrowPathIcon
              onClick={() => {
                getActivePlans();
                getPatientDetails()
              }}
              className={
                loading ? "animate-spin h-7 w-7 absolute right-0" : "h-7 w-7 absolute right-0"
              }
              aria-hidden="true"
            />
            {loading ? "Please wait..." : ""}
          </div>
          <div className="flex items-center justify-between">
            <label className="block text-left text-2xl font-bold text-black dark:text-white">
              Patient details
            </label>
            <h2 className="sm:text-title-xl1 text-end font-semibold text-success dark:text-success">
              {coverageEligibilityStatus === "response.complete" ? (
                <div className="text-success">&#10004; Eligible</div>
              ) : (
                <div className="mr-3 text-warning">Pending</div>
              )}
            </h2>
          </div>
          <div className="mt-4 rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
            <label className="text-1xl mb-2.5 block text-left font-bold text-black dark:text-white">
              Personal details
            </label>
            <div className="items-center justify-between"></div>
            <div>
              {_.map(personalDeatails, (ele: any, index: any) => {
                return (
                  <div key={index} className="mb-2 flex gap-2">
                    <h2 className="text-bold inline-block w-30 text-base font-medium text-black dark:text-white">
                      {ele.key}
                    </h2>
                    <div className="mr-6">:</div>
                    <span className="text-base font-medium">{ele.value}</span>
                  </div>
                );
              })}
            </div>
            {patientDetails?.medicalHistory && !_.isEmpty(patientDetails?.medicalHistory?.allergies) ?
              <>
                <label className="text-1xl mb-2.5 block text-left font-bold text-black dark:text-white">
                  Medical history
                </label>
                <div className="items-center justify-between"></div>
                <div>
                  <div className="mb-2">
                    <div className="mb-2 flex gap-2">
                      <h2 className="text-bold inline-block w-30 text-base font-medium text-black dark:text-white">
                        Allergies
                      </h2>
                      <div className="mr-6">:</div>
                      <span className="text-base font-medium">
                        {patientDetails?.medicalHistory?.allergies || ""}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <h2 className=" text-bold inline-block w-30 text-base font-medium text-black dark:text-white">
                        Blood group
                      </h2>
                      <div className="mr-6">:</div>
                      <span className="text-base font-medium">
                        {patientDetails?.medicalHistory?.blood_group || ""}
                      </span>
                    </div>
                  </div>
                </div>
              </>
              : <></>}
            <label className="text-1xl mb-2.5 block text-left font-bold text-black dark:text-white">
              Insurance details
            </label>
            <div className="items-center justify-between"></div>
            <div>
              <div
                className="mb-2 mt-4 rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark"
              >
                <div className="mb-2 flex gap-2">
                  <h2 className="text-bold inline-block w-30 text-base font-medium text-black dark:text-white">
                    Insurance ID
                  </h2>
                  <div className="mr-6">:</div>
                  <span className="text-base font-medium">
                    {patientInsuranceId === "undefined" ? (patientDetails?.payorDetails?.insurance_id) : patientInsuranceId}
                  </span>
                </div>
                <div className="flex gap-2">
                  <h2 className="text-bold inline-block w-30 text-base font-medium text-black dark:text-white">
                    Payor name
                  </h2>
                  <div className="mr-6">:</div>
                  <span className="text-base font-medium">
                    {patientPayorName === "undefined" ? (patientDetails?.payorDetails?.payorName) : patientPayorName}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {consultationDetail && (
            <div className="mt-4 rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
              <label className="text-1xl mb-2.5 block text-left font-bold text-black dark:text-white">
                Consultation details
              </label>
              <div className="items-center justify-between"></div>
              <div>
                {_.map(consultationDetailsData, (ele: any, index: number) => {
                  return (
                    <div key={index} className="mb-2 flex gap-2">
                      <h2 className="text-bold inline-block w-30 text-base font-medium text-black dark:text-white">
                        {ele.key}
                      </h2>
                      <div className="mr-6">:</div>
                      <span className="text-base font-medium">{ele.value}</span>
                    </div>
                  );
                })}
              </div>
              {urls === "{}" || urls === undefined ? <> </> :
                <>
                  <h2 className="text-bold text-base font-medium text-black dark:text-white">
                    Supporting documents :
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {_.map(urlArray, (ele: string, index: number) => {
                      const parts = ele.split('/');
                      const fileName = parts[parts.length - 1];
                      return (
                        <a href={ele} download>
                          <div className='text-center'>
                            <img key={index} height={150} width={150} src={thumbnail} alt='image' />
                            <span>{decodeURIComponent(fileName)}</span>
                          </div>
                        </a>
                      );
                    })}
                  </div></>}
            </div>
          )}
          {_.map(preauthOrClaimList, (ele: any, index: any) => {
            // const additionalInfo = JSON.parse(ele?.additionalInfo) || {}
            return (
              <>
                <div className=" flex items-center justify-between">
                  <h2 className="sm:text-title-xl1 mt-3 text-2xl font-semibold text-black dark:text-white">
                    {ele?.type.charAt(0).toUpperCase() + ele?.type.slice(1)}{" "}
                    details :
                  </h2>
                  {ele?.status === "response.complete" ? (
                    <div className="sm:text-title-xl1 mb-1 text-end font-semibold text-success dark:text-success">
                      &#10004; Approved
                    </div>
                  ) : ele?.status === "Rejected" ? (
                    <div className="sm:text-title-xl1 mb-1 text-end font-semibold text-danger dark:text-danger">
                      Rejected
                    </div>
                  ) : (
                    <div className="sm:text-title-xl1 mb-1 text-end font-semibold text-warning dark:text-success">
                      Pending
                    </div>
                  )}
                </div>
                <div className="mt-4 rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
                  <div className="flex items-center justify-between">
                    <h2 className="sm:text-title-xl1 text-1xl mt-2 mb-4 font-semibold text-black dark:text-white">
                      {strings.TREATMENT_AND_BILLING_DETAILS}
                    </h2>
                  </div>
                  <div>
                    <div className="mb-2 ">
                      <div className="flex gap-2">
                        <h2 className="text-bold inline-block w-30 text-base font-bold text-black dark:text-white">
                          Service type
                        </h2>
                        <div className="mr-6">:</div>
                        <span className="text-base font-medium">
                          {ele.claimType}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <h2 className=" text-bold inline-block w-30 text-base font-bold text-black dark:text-white">
                          Bill amount
                        </h2>
                        <div className="mr-6">:</div>
                        <span className="text-base font-medium">
                          INR {ele.billAmount}
                        </span>
                      </div>
                      {ele?.status === 'response.complete' ?
                        <div className="flex gap-2">
                          <h2 className=" text-bold inline-block w-30 text-base font-bold text-black dark:text-white">
                            Approved amount
                          </h2>
                          <div className="mr-6">:</div>
                          <span className="text-base font-medium">
                            INR {ele.approvedAmount}
                          </span>
                        </div> : null}
                      {/* {
                        additionalInfo?.financial?.approved_amount &&
                          additionalInfo?.financial?.approved_amount === 0 ?
                          <div className="flex gap-2">
                            <h2 className="text-bold inline-block w-30 text-base font-bold text-black dark:text-white">
                              Approved amount :
                            </h2>
                            <div className="mr-6">:</div>
                            <span className="text-base font-medium">
                              INR {0}
                            </span>
                          </div> :
                          <div className="flex gap-2">
                            <h2 className="text-bold inline-block w-30 text-base font-bold text-black dark:text-white">
                              Approved amount :
                            </h2>
                            <div className="mr-6">:</div>
                            <span className="text-base font-medium">
                              INR {additionalInfo?.financial?.approved_amount}
                            </span>
                          </div>
                      } */}
                    </div>
                  </div>
                  {/* {_.isEmpty(ele.supportingDocuments) ? null : <>
                    <h2 className="text-bold mb-3 text-base font-bold text-black dark:text-white">
                      Supporting documents :
                    </h2>
                    {Object.entries(ele.supportingDocuments).map(([key, values]) => (
                      <div key={key}>
                        <h3 className='text-base font-bold text-black dark:text-white'>Document type : <span className='text-base font-medium'>{key}</span></h3>
                        <div className='flex'>
                          {Array.isArray(values) &&
                            values.map((imageUrl, index) => {
                              const parts = imageUrl.split('/');
                              const fileName = parts[parts.length - 1];
                              console.log(fileName)
                              return (
                                <a href={imageUrl} download>
                                  <div className='text-center'>
                                    <img key={index} height={150} width={150} src={thumbnail} alt={`${key} ${index + 1}`} />
                                    <span>{decodeURIComponent(fileName)}</span>
                                  </div>
                                </a>
                              )
                            })}
                        </div>
                      </div>
                    ))}
                  </>} */}
                  {!isEmpty(ele.supportingDocuments) ? <>
                    <h2 className="text-bold text-base font-medium text-black dark:text-white">
                      Supporting documents :
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {_.map(urlArray, (ele: string, index: number) => {
                        const parts = ele.split('/');
                        const fileName = parts[parts.length - 1];
                        return (
                          <a href={ele} download>
                            <div className='text-center'>
                              <img key={index} height={150} width={150} src={thumbnail} alt='image' />
                              <span>{decodeURIComponent(fileName)}</span>
                            </div>
                          </a>
                        );
                      })}
                    </div></> : null}
                </div>
              </>
            );
          })}

          <div>
            {preauthOrClaimList.length === 0 && (
              <>
                {isRejected ? <button
                  onClick={() => navigate("/home")}
                  className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed disabled:bg-secondary disabled:text-gray"
                >
                  Home
                </button> :
                  <div>
                    <button
                      onClick={() => navigate("/initiate-claim-request", {
                        state: { requestDetails: requestDetails },
                      })}
                      className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed disabled:bg-secondary disabled:text-gray"
                    >
                      Initiate claim
                    </button>
                    <button
                      onClick={() => navigate("/initiate-preauth-request", {
                        state: { requestDetails: requestDetails },
                      })}
                      className="align-center mt-4 flex w-full justify-center rounded py-4 font-medium text-primary border border-primary disabled:cursor-not-allowed disabled:border-secondary disabled:text-primary"
                    >
                      Initiate pre-auth
                    </button>
                  </div>
                }
              </>
            )}

            {type.includes("claim") ? (
              <></>
            ) : type.includes("preauth") ? (
              <>
                {isRejected ? <button
                  onClick={() => navigate("/home")}
                  className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed disabled:bg-secondary disabled:text-gray"
                >
                  Home
                </button> : <button
                  onClick={() => navigate("/initiate-claim-request", {
                    state: { requestDetails: requestDetails, recipientCode: patientDetails[0]?.payor_details[0]?.recipientCode },
                  })}
                  className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed disabled:bg-secondary disabled:text-gray"
                >
                  Initiate new claim request
                </button>}
              </>
            ) : null}
          </div>
          {!hasClaimApproved ? (
            null
          ) : (
            <button
              onClick={() => navigate("/home")}
              className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed disabled:bg-secondary disabled:text-gray"
            >
              Home
            </button>
          )}
        </div>
      ) : (
        <TransparentLoader />
      )}
    </>
  );
};

export default ViewPatientDetails;
