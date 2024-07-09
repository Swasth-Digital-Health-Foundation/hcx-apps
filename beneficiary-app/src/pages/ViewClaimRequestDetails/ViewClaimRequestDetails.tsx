import { useEffect, useState } from 'react';
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
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const ViewClaimRequestDetails = () => {
  const location = useLocation();
  const details = location.state;
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
      if (res.status === 200 && res?.data?.result?.otpStatus === 'initiated') {
        setInitiated(true)
        toast.success('Policy consent is initiated.');
      } else if (res?.data?.result?.otpStatus === 'failed') {
        toast.error("Failed to verify consent. Please ask the payor to resend the request.")
      } else {
        setInitiated(false)
        toast.error('Policy consent is not initiated.');
      }
    } catch (err) {
      setRefresh(false);
      toast.error('Policy consent is not initiated.');
    }
  };

  let urls: string = preAuthAndClaimList[0]?.supportingDocuments;
  const trimmedString: string = urls?.slice(1, -1);
  const urlArray: any[] = trimmedString?.split(",");

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
      if (res.status = 202) {
        setLoading(false);
        setInitiated(false);
        toast.success("OTP submitted successfully!");
        navigate('/home', { state: { sendInfo: sendInfo, bankDetails: bankDetails } });
      }
    } catch (err) {
      setLoading(false);
      toast.error('Please enter valid 6 digit OTP sent to your mobile number!');
    }
  };

  const preauthOrClaimListPayload = {
    workflow_id: details?.workflowId || '',
    app: "BSP"
  };

  const getSupportingDocsFromList = async () => {
    let response = await generateOutgoingRequest(
      'request/list',
      preauthOrClaimListPayload
    );
    const data = response.data?.entries;
    setpreauthOrClaimList(data);
  };


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
      {!hasClaimApproved ? (
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
      ) : (
        <>
        </>
      )}
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
        <div>
          {_.map(claimRequestDetails, (ele: any, index: any) => {
            return (
              <div key={index} className="mb-2">
                <h2 className="text-bold text-base font-bold text-black dark:text-white">
                  {ele.key}
                </h2>
                <span className="text-base font-medium">{ele.value}</span>
              </div>
            );
          })}
        </div>
        <div className='absolute top-2 right-2' onClick={() => setPopup(!popup)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </div>
        {popup ? <div className='absolute top-8 right-2 bg-black text-white p-4'>
          Api call Id : {location.state?.apiCallId} <br />
          BSP_hcx_code : {details?.participantCode} <br />
          workflowId : {details?.workflowId}
        </div> : null}
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
          {details.approvedAmount && <div className="flex gap-2">
            <h2 className="text-bold text-base font-bold text-black dark:text-white">
              Approved amount :
            </h2>
            <span className="text-base font-medium">INR {details?.approvedAmount}</span>
          </div>}

          {urls === "{}" || urls === undefined ? <></> :
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