import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import strings from '../../utils/strings';
import { generateToken, searchParticipant } from '../../services/hcxService';
import {
  createCommunicationOnRequest,
  generateOutgoingRequest,
  isInitiated,
} from '../../services/hcxMockService';
import { toast } from 'react-toastify';
import LoadingButton from '../../components/LoadingButton';
import * as _ from "lodash";
import thumbnail from '../../images/pngwing.com.png'
import { ArrowDownTrayIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import Info from '../ViewCoverageEligibilityDetails/Info';
import RequestDetails from '../ViewCoverageEligibilityDetails/RequestDetails';


const ViewClaimRequestDetails = () => {
  const location = useLocation();
  const [details, setDetails] = useState<any>(location.state);
  const navigate = useNavigate();

  const [providerName, setProviderName] = useState<string>('');
  const [payorName, setPayorName] = useState<string>('');
  const [initiated, setInitiated] = useState(false);
  const [OTP, setOTP] = useState<any>();
  const [preAuthAndClaimList, setpreauthOrClaimList] = useState<any>([]);
  const [refresh, setRefresh] = useState<any>(false);
  const [loading, setLoading] = useState<any>(false);
  const [popup, setPopup] = useState(false);

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

  const sendInfo = {
    ...details,
    payor: payorName,
    providerName: providerName,
  };

  useEffect(() => {
    try {
      const search = async () => {
        const tokenResponse = await generateToken();
        const response = await searchParticipant(
          participantCodePayload,
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.data.access_token}`,
            }
          },
        );
        setProviderName(response.data?.participants[0].participant_name);
        const payorResponse = await searchParticipant(
          payorCodePayload,
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.data.access_token}`,
            }
          },
        );
        setPayorName(payorResponse.data?.participants[0].participant_name);
      };
      search();
      // }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const claimRequestDetails: any = [
    {
      key: 'Provider :',
      value: providerName || '',
    },
    {
      key: 'Treatment/Service type :',
      value: details?.serviceType || '',
    },
    {
      key: 'Payor name :',
      value: payorName || '',
    },
    {
      key: 'Insurance ID :',
      value: details?.insuranceId || '',
    },
  ];

  const treatmentDetails = [
    {
      key: 'Service type :',
      value: details?.serviceType || '',
    },
    {
      key: 'Bill amount :',
      value: `INR ${details?.billAmount || ''}`,
    },
    // {
    //   key: 'Approved amount :',
    //   value: `INR ${details?.approvedAmount || ''}`,
    // }
  ];

  const getVerificationPayload = {
    type: 'otp_verification',
    request_id: details?.apiCallId,
  };

  const getVerification = async () => {
    try {
      setRefresh(true);
      let res = await isInitiated(getVerificationPayload);
      setRefresh(false);
      // if (res.status === 200) {
      //   setInitiated(true);
      // }
      if (res.status === 200 && res?.data?.result?.otpStatus === 'initiated') {
        setInitiated(true)
        toast.success('Policy consent is initiated.');
      }
      else {
        setInitiated(false)
        toast.error('Policy consent is not initiated.');
      }
    } catch (err) {
      setRefresh(false);
      toast.error('Policy consent is not initiated.');
    }
  };

  const recipientCode = localStorage.getItem('recipientCode');
  const payload = {
    request_id: details?.apiCallId,
    mobile: localStorage.getItem('mobile'),
    otp_code: OTP,
    type: 'otp',
    participantCode: process.env.SEARCH_PARTICIPANT_USERNAME,
    password: process.env.SEARCH_PARTICIPANT_PASSWORD,
    recipientCode: recipientCode
  };

  const verifyOTP = async () => {
    try {
      setLoading(true);
      const res = await createCommunicationOnRequest(payload);
      setLoading(false);
      setInitiated(false);
      toast.success(res.data?.message);
      navigate('/bank-details', { state: { sendInfo: sendInfo, bankDetails: bankDetails } });
    } catch (err) {
      setLoading(false);
      toast.error('Enter valid OTP!');
    }
  };

  const preauthOrClaimListPayload = {
    workflow_id: details?.workflowId || '',
    app: "BSP"
  };

  const getSupportingDocsFromList = async () => {
    let response = await generateOutgoingRequest(
      'bsp/request/list',
      preauthOrClaimListPayload
    );
    const data = response.data?.entries;
    setpreauthOrClaimList(data);
  };

  const claimAndPreauthEntries = preAuthAndClaimList.filter(
    (entry: any) => entry.type === 'claim' || entry.type === 'preauth'
  );

  const hasClaimApproved = preAuthAndClaimList.some(
    (entry: any) => entry.type === 'claim' && entry.status === 'Approved'
  );

  const bankDetails: any = preAuthAndClaimList.filter(
    (entry: any) => {
      if (entry.type === 'claim') {
        return entry
      }
    }
  )

  const isVerificationSuccessfull = preAuthAndClaimList.some(
    (entry: any) => entry.type === 'claim' && entry.otpStatus === 'successful' && entry.status !== 'Approved'
  );

  useEffect(() => {
    getSupportingDocsFromList();
  }, [details?.workflowId]);

  useEffect(() => {
    if (isVerificationSuccessfull && payorName !== undefined) {
      navigate('/bank-details', { state: { sendInfo: sendInfo, bankDetails: bankDetails } })
    }
  }, [payorName])

  return (
    <>
      {!hasClaimApproved ?
        <div className="relative flex pb-8 cursor-pointer">
          <ArrowPathIcon
            onClick={() => {
              getVerification();
            }}
            className={
              loading ? "animate-spin h-11 w-7 absolute right-0" : "h-16 w-8 absolute right-2"
            }
            aria-hidden="true"
          />
          {loading ? "Please wait..." : ""}
        </div>
        : <></>}
      <div className="relative mb-4 items-center justify-between">
        {hasClaimApproved ? (
          <span
            className={
              'dark:text-green border-green absolute right-0 mr-2 rounded bg-success px-2.5 py-0.5 text-xs font-medium text-gray'
            }
          >
            Approved
          </span>
        ) : (
          <></>
        )}
        <h2 className="sm:text-title-xl1 text-2xl font-semibold text-black dark:text-white">
          {strings.CLAIM_REQUEST_DETAILS}
        </h2>
      </div>
      <div className="relative rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
        <RequestDetails claimRequestDetails={claimRequestDetails} />
        <Info setPopup={setPopup} popup={popup} requestDetails={details} location={location} />
      </div>
      <div className="mt-3 rounded-lg border border-stroke bg-white px-3 pb-3 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between">
          <h2 className="sm:text-title-xl1 text-1xl mt-2 mb-2 font-semibold text-black dark:text-white">
            {strings.TREATMENT_AND_BILLING_DETAILS}
          </h2>
        </div>
        <div>
          {_.map(treatmentDetails, (ele: any, index: any) => {
            return (
              <div className="flex gap-2" key={index}>
                <h2 className="text-bold text-base font-bold text-black dark:text-white">
                  {ele.key}
                </h2>
                <span className="text-base font-medium">{ele.value}</span>
              </div>
            );
          })}
          {details?.approvedAmount && <div className="flex gap-2">
            <h2 className="text-bold text-base font-bold text-black dark:text-white">
              Approved amount :
            </h2>
            <span className="text-base font-medium">INR {details?.approvedAmount}</span>
          </div>}
          {claimAndPreauthEntries.map((ele: any) => {
            return (
              _.isEmpty(ele.supportingDocuments) ? null : <>
                <h2 className="text-bold mb-3 text-base font-bold text-black dark:text-white">
                  Supporting documents :
                </h2>
                {Object.entries(ele?.supportingDocuments).map(([key, values]) =>
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
                                <span>{decodeURIComponent(fileName)}</span>
                              </div>
                            </a>
                          )
                        })}
                    </div>
                  </div>

                )}
              </>
            )
          })}
        </div>
      </div>

      {hasClaimApproved ? <button
        onClick={(event: any) => {
          event.preventDefault();
          navigate('/home');
        }}
        type="submit"
        className="align-center mt-8 flex w-full justify-center rounded bg-primary py-3 font-medium text-gray"
      >
        Home
      </button> : <></>}

      {initiated ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="sm:text-title-xl1 text-1xl mt-2 mb-4 font-semibold text-black dark:text-white">
              {strings.NEXT_STEP}
            </h2>
          </div>
          <div className="rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div>
              <h2 className="text-bold text-base font-bold text-black dark:text-white">
                {strings.POLICYHOLDER_CONSENT}
              </h2>
              <label className="font-small mb-2.5 block text-left text-black dark:text-white">
                {strings.ENTER_OTP_TO_VERIFY_CLAIM}
              </label>
            </div>
            <div>
              <div className="relative">
                <input
                  required
                  onChange={(e: any) => {
                    setOTP(e.target.value);
                  }}
                  type="number"
                  placeholder="OTP"
                  className={
                    'w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
                  }
                />
              </div>
            </div>
            <div className="mb-5">
              {loading ? (
                <LoadingButton className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed" />
              ) : (
                <button
                  onClick={(event: any) => {
                    event.preventDefault();
                    verifyOTP();
                  }}
                  type="submit"
                  className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray"
                >
                  {strings.VERIFY_OTP_BUTTON}
                </button>
              )}
            </div>
          </div>
        </>
      ) : null}</>


  );
};

export default ViewClaimRequestDetails;
