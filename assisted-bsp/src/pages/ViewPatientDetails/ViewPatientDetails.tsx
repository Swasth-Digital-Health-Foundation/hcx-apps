import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import strings from "../../utils/strings";
import { generateToken, searchParticipant } from "../../services/hcxService";
import {
  generateOutgoingRequest, searchUser
} from "../../services/hcxMockService";
import TransparentLoader from "../../components/TransparentLoader";
import { toast } from "react-toastify";
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
  const [coverageDetails, setCoverageDetails] = useState<any>([]);
  const [apicallIds, setapicallIds] = useState<any>([]);
  const [coverageEligibilityStatus, setcoverageStatus] = useState<any>([]);
  const [apicallIdForClaim, setApicallID] = useState<any>();
  const [patientDetails, setPatientDetails] = useState<any>([]);
  const [loading, setLoading] = useState<any>(false);
  const requestDetails = {
    ...location.state,
    providerName: providerName,
    billAmount: location.state?.billAmount || preauthOrClaimList[0]?.billAmount,
    apiCallId: apicallIdForClaim,
  };
  const [isRejected, setIsRejected] = useState<boolean>(false)

  const [type, setType] = useState<string[]>([]);


  const getPatientDetails = async () => {
    try {
      setLoading(true);
      let registerResponse: any = await searchUser("user/search", location.state?.patientMobile || localStorage.getItem("patientMobile"))
      setPatientDetails(registerResponse?.data?.result);
    } catch (error: any) {
      toast.error(error.response.data.params.errmsg, {
        position: toast.POSITION.TOP_CENTER,
      });
    }
  };

  localStorage.setItem("patientMobile", patientDetails?.mobile);
  localStorage.setItem("patientName", patientDetails?.userName);

  const personalDeatails = [
    {
      key: "Beneficiary name",
      value: patientDetails?.userName,
    },
    {
      key: "Mobile no",
      value: patientDetails?.mobile || location.state?.patientMobile,
    },
    {
      key: "Address",
      value: patientDetails?.address,
    },
  ];


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

  const getSupportingDocuments = (supportingDocuments: any) => {
    try {
      let urls: string = supportingDocuments;
      const trimmedString: string = urls?.slice(1, -1);
      const urlArray: any[] = trimmedString?.split(",");
      return urlArray;
    } catch (err) {
      console.log(err);
    }
  }

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

  const patientMobile = location.state?.patientMobile;

  const coverageEligibilityPayload = {
    mobile:
      patientMobile,
    app: "ABSP",
  };

  const getActivePlans = async () => {
    try {
      setLoading(true);
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

      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    tokenGeneration().then(() => getActivePlans());
  }, [preauthOrClaimListPayload.workflow_id, patientMobile]);

  useEffect(() => {
    for (const entry of preauthOrClaimList) {
      if (entry.type === "claim") {
        setApicallID(entry.apiCallId);
        break;
      }
    }
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
    (entry: any) => entry.type === 'claim' && entry.status === 'response.complete'
  );

  const patientInsuranceId = localStorage.getItem('patientInsuranceId');
  const patientPayorName = localStorage.getItem('patientPayorName');

console.log("patientDetails", patientDetails)

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
              Beneficiary Details
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
              Personal Details
            </label>
            <div className="items-center justify-between"></div>
            <div>
              {_.map(personalDeatails, (ele: any, index: any) => {
                return (
                  <div key={index} className="mb-2 flex gap-2">
                    <h2 className="text-bold inline-block w-40 text-base font-medium text-black dark:text-white">
                      {ele.key}
                    </h2>
                    <div className="mr-6">:</div>
                    <span className="text-base font-medium">{ele.value}</span>
                  </div>
                );
              })}
            </div>
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
                    {(patientDetails.length !== 0 ? patientDetails?.payorDetails?.[0]?.insurance_id : "") || patientInsuranceId} </span>
                </div>
                <div className="flex gap-2">
                  <h2 className="text-bold inline-block w-30 text-base font-medium text-black dark:text-white">
                    Payor name
                  </h2>
                  <div className="mr-6">:</div>
                  <span className="text-base font-medium">
                    {(patientDetails.length !== 0 ? patientDetails?.payorDetails?.[0]?.payorName : "") || patientPayorName}
                     </span>
                </div>
              </div>
            </div>
          </div>
          {_.map(preauthOrClaimList, (ele: any, index: any) => {
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
                          Claimed amount
                        </h2>
                        <div className="mr-6">:</div>
                        <span className="text-base font-medium">
                          INR {ele.billAmount}
                        </span>
                      </div>
                      {ele.status === "response.complete" ? (
                        <div className="flex gap-2">
                          <h2 className=" text-bold inline-block w-30 text-base font-bold text-black dark:text-white">
                            Approved amount
                          </h2>
                          <div className="mr-6">:</div>
                          <span className="text-base font-medium">
                            INR {ele.approvedAmount}
                          </span>
                        </div>) : <></>
                      }
                      {ele.status === "response.complete" && ele.type === 'claim' ? (
                        <>
                          <div className="flex items-center justify-between">
                            <h2 className="sm:text-title-xl1 text-1xl mt-1 mb-1 font-semibold text-black dark:text-white">
                              Policy consent :
                              <span className='text-success , ml-10'>&#10004; Approved</span>
                            </h2>
                          </div>
                          <div className="flex gap-2">
                            <h2 className="sm:text-title-xl1 text-1xl mt-2 mb-4 font-semibold text-black dark:text-white">
                              Beneficiary bank details :
                            </h2>
                          </div>
                          <div className="flex gap-2">
                            <h2 className="text-bold inline-block w-30 text-base font-bold text-black dark:text-white">
                              Account Number
                            </h2>
                            <div className="mr-6">:</div>
                            <span className="text-base font-medium">
                              {ele.accountNumber}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <h2 className="text-bold inline-block w-30 text-base font-bold text-black dark:text-white">
                              IFSC code
                            </h2>
                            <div className="mr-6">:</div>
                            <span className="text-base font-medium">
                              {ele.ifscCode}
                            </span>
                          </div>
                        </>
                      ) : <></>}

                    </div>
                  </div>

                  {Object.keys(ele?.supportingDocuments).length === 0 ? <>
                    <h2 className="text-bold text-base font-medium text-black dark:text-white">
                      Supporting documents :
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {_.map(getSupportingDocuments(ele?.supportingDocuments), (ele: string, index: number) => {
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
