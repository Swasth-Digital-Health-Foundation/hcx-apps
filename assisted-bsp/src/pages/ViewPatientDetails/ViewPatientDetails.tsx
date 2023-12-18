import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import strings from "../../utils/strings";
import { generateToken, searchParticipant } from "../../services/hcxService";
import {
  generateOutgoingRequest,
  getConsultationDetails,
  isInitiated,
} from "../../services/hcxMockService";
import TransparentLoader from "../../components/TransparentLoader";
import LoadingButton from '../../components/LoadingButton';
import { toast } from "react-toastify";
import { postRequest } from "../../services/registryService";
import { isEmpty } from "lodash";
import { ArrowDownTrayIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import * as _ from "lodash";
import thumbnail from "../../images/pngwing.com.png"

const ViewPatientDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const details = location.state;
  const [token, setToken] = useState<string>();
  const [providerName, setProviderName] = useState<string>();
  const [payorName, setPayorName] = useState<string>("");
  const [preauthOrClaimList, setpreauthOrClaimList] = useState<any>([]);
  const [coverageDetails, setCoverageDetails] = useState<any>([]);
  const [apicallIds, setapicallIds] = useState<any>([]);
  const [coverageEligibilityStatus, setcoverageStatus] = useState<any>([]);
  const [apicallIdForClaim, setApicallID] = useState<any>();
  const [patientDetails, setPatientDetails] = useState<any>([]);
  const [refresh, setRefresh] = useState<any>(false);
  const [loading, setLoading] = useState<any>(false);
  const [initiated, setInitiated] = useState(false);
  const requestDetails = {
    ...location.state,
    providerName: providerName,
    billAmount: location.state?.billAmount || preauthOrClaimList[0]?.billAmount,
    apiCallId: apicallIdForClaim,
  };


  const [type, setType] = useState<string[]>([]);

  const payload = {
    entityType: ["Beneficiary"],
    filters: {
      mobile: {
        eq: `${location.state?.patientMobile || localStorage.getItem("patientMobile")
          }`,
      },
    },
  };

  const getPatientDetails = async () => {
    try {
      setLoading(true);
      let registerResponse: any = await postRequest("search", payload);
      const patientDetails = registerResponse.data;
      setPatientDetails(patientDetails);
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
      key: "Beneficiary name",
      value: patientDetails[0]?.name,
    },
    {
      key: "Mobile no",
      value: patientDetails[0]?.mobile || location.state?.patientMobile,
    },
    {
      key: "Address",
      value: patientDetails[0]?.address,
    },
  ];

  // const consultationDetailsData = [
  //   {
  //     key: "Treatment type",
  //     value: consultationDetail?.service_type,
  //   },
  //   {
  //     key: "Service type",
  //     value: consultationDetail?.treatment_type,
  //   },
  //   {
  //     key: "Symptom",
  //     value: consultationDetail?.symptoms,
  //   },
  // ];

  // let urls: string = consultationDetail?.supporting_documents_url;
  // const trimmedString: string = urls?.slice(1, -1);
  // const urlArray: any[] = trimmedString?.split(",");

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
    app: "ABSP",
  };

  const patientMobile = localStorage.getItem("patientMobile");

  const coverageEligibilityPayload = {
    mobile:
      patientMobile,
    app: "ABSP",
  };

  const getActivePlans = async () => {
    try {
      setLoading(true);
      let statusCheckCoverageEligibility = await generateOutgoingRequest(
        "bsp/request/list",
        coverageEligibilityPayload
      );
      let response = await generateOutgoingRequest(
        "bsp/request/list",
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

      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    tokenGeneration();
  }, [preauthOrClaimListPayload.workflow_id]);

  useEffect(() => {
    getActivePlans();
  }, [patientMobile])

  useEffect(() => {
    for (const entry of preauthOrClaimList) {
      if (entry.type === "claim") {
        setApicallID(entry.apiCallId);
        break;
      }
    }
    // getConsultation();
  }, []);


  const workflowId = location.state?.workflowId || localStorage.getItem("workflowId");
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
  }, [coverageStatus, patientMobile, localStorage.getItem("workflowId")]);

  useEffect(() => {
    getPatientDetails();
  }, [location.state?.patientMobile]);

  const hasClaimApproved = preauthOrClaimList.some(
    (entry: any) => entry.type === 'claim' && entry.status === 'Approved'
  );

  const patientInsuranceId = localStorage.getItem('patientInsuranceId');
  const patientPayorName = localStorage.getItem('patientPayorName');
  const patient_Insurance_Id = patientInsuranceId || (patientDetails[0]?.payor_details[0]?.insurance_id)

  const getVerificationPayload = {
    type: 'otp_verification',
    request_id: details?.apiCallId,
  };

  const getVerification = async () => {
    try {
      setRefresh(true);
      let res = await isInitiated(getVerificationPayload);
      setRefresh(false);
      if (res.status === 200) {
        setInitiated(true);
      }
    } catch (err) {
      setRefresh(false);
      console.log(err);
      toast.error('Communication is not initiated.');
    }
  };

  return (
    <>
      {!loading ? (
        <div className="-pt-2">
          <div className="relative flex pb-8">
            <ArrowPathIcon
              onClick={() => {
                getActivePlans();
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
            Beneficiary Details
            </label>
            <h2 className="sm:text-title-xl1 text-end font-semibold text-success dark:text-success">
              {coverageEligibilityStatus === "Approved" ? (
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
            {/* {patientDetails[0]?.medical_history && (
              <>
                <label className="text-1xl mb-2.5 block text-left font-bold text-black dark:text-white">
                  Medical history
                </label>
                <div className="items-center justify-between"></div>
                <div>
                  {_.map(patientDetails[0]?.medical_history,
                    (ele: any, index: any) => {
                      return (
                        <div key={index} className="mb-2">
                          <div className="mb-2 flex gap-2">
                            <h2 className="text-bold inline-block w-30 text-base font-medium text-black dark:text-white">
                              Allergies
                            </h2>
                            <div className="mr-6">:</div>
                            <span className="text-base font-medium">
                              {ele?.allergies}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <h2 className=" text-bold inline-block w-30 text-base font-medium text-black dark:text-white">
                              Blood group
                            </h2>
                            <div className="mr-6">:</div>
                            <span className="text-base font-medium">
                              {ele?.bloodGroup}
                            </span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            )} */}
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
                  {patientInsuranceId === "undefined" ? (patientDetails[0]?.payor_details[0]?.insurance_id) : patientInsuranceId}                  </span>
                </div>
                <div className="flex gap-2">
                  <h2 className="text-bold inline-block w-30 text-base font-medium text-black dark:text-white">
                    Payor name
                  </h2>
                  <div className="mr-6">:</div>
                  <span className="text-base font-medium">
                  {patientPayorName === "undefined" ? (patientDetails[0]?.payor_details[0]?.payorName) : patientPayorName}                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* {consultationDetail && (
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
              {!isEmpty(urls) ? <>
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
                          <span>{fileName}</span>
                        </div>
                      </a>
                    );
                  })}
                </div></> : null}
            </div>
          )} */}
          {_.map(preauthOrClaimList, (ele: any, index: any) => {
            return (
              <>
                <div className=" flex items-center justify-between">
                  <h2 className="sm:text-title-xl1 mt-3 text-2xl font-semibold text-black dark:text-white">
                    {ele?.type.charAt(0).toUpperCase() + ele?.type.slice(1)}{" "}
                    details :
                  </h2>
                  {ele?.status === "Approved" ? (
                    <div className="sm:text-title-xl1 mb-1 text-end font-semibold text-success dark:text-success">
                      &#10004; Approved
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
                          Claimed amount
                        </h2>
                        <div className="mr-6">:</div>
                        <span className="text-base font-medium">
                          INR {ele.billAmount}
                        </span>
                      </div>
                      {hasClaimApproved && ele?.status === 'Approved' ?
                        <div className="flex gap-2">
                          <h2 className=" text-bold inline-block w-30 text-base font-bold text-black dark:text-white">
                            Approved amount
                          </h2>
                          <div className="mr-6">:</div>
                          <span className="text-base font-medium">
                            INR {ele.billAmount}
                          </span>
                        </div> : null}
                    </div>
                  </div>
                  {_.isEmpty(ele.supportingDocuments) ? null : <>
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
                              return (
                                <a href={imageUrl} download>
                                  <div className='text-center'>
                                    <img key={index} height={150} width={150} src={thumbnail} alt={`${key} ${index + 1}`} />
                                    <span>{fileName}</span>
                                  </div>
                                </a>
                              )
                            })}
                        </div>
                      </div>
                    ))}
                  </>}
                </div>
              </>
            );
          })}

          <div>
            {preauthOrClaimList.length === 0 && (
              <>
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

              </>
            )}

            {type.includes("claim") ? (
              <></>
            ) : type.includes("preauth") ? (
              <>
                <button
                  onClick={() => navigate("/initiate-claim-request", {
                    state: { requestDetails: requestDetails, recipientCode: patientDetails[0]?.payor_details[0]?.recipientCode },
                  })}
                  className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed disabled:bg-secondary disabled:text-gray"
                >
                  Initiate new claim request
                </button>
              </>
            ) : null}
          </div>
          {type.includes('claim') && !hasClaimApproved ? (
            <div className="mb-5 mt-5">
              <button
                disabled={false}
                onClick={() => {
                  navigate('/verify-claim', {
                    state: requestDetails,
                  });
                }}
                className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed disabled:bg-secondary disabled:text-gray"
              >
                {strings.PROCEED}
              </button>
            </div>
          ) : hasClaimApproved ? (
            <button
              onClick={() => navigate('/home')}
              className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed disabled:bg-secondary disabled:text-gray"
            >
              Home
            </button>
          ) : <></>}
        </div>
      ) : (
        <TransparentLoader />
      )}
    </>
  );
};

export default ViewPatientDetails;
