import { useLocation, useNavigate } from 'react-router-dom';
import Html5QrcodePlugin from '../../components/Html5QrcodeScannerPlugin/Html5QrcodeScannerPlugin';
import { useEffect, useState } from 'react';
import ActiveClaimCycleCard from '../../components/ActiveClaimCycleCard';
import strings from '../../utils/strings';
import {
  generateOutgoingRequest,
  getCoverageEligibilityRequestList,
} from '../../services/hcxMockService';
import * as _ from 'lodash';
import TransparentLoader from '../../components/TransparentLoader';
import { toast } from 'react-toastify';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useUserSearch } from '../../hooks/useUserSearch';
import { formatDateTime } from '../../utils';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const [qrCodeData, setQrCodeData] = useState<any>();
  const [currentIndex, setCurrentIndex] = useState(5);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(true);
  const getMobileFromLocalStorage = localStorage.getItem('mobile');
  const claimDetails: {
    [mobileNumber: string]: { id: string; type: 'OPD' | 'IPD' }[];
  } = JSON.parse(localStorage.getItem('claimDetails') || '[]');

  const [activeRequests, setActiveRequests] = useState<any>([]);
  const [finalData, setFinalData] = useState<any>([]);
  const [coverageAndClaimData, setDisplayedData] = useState<any>(
    finalData.slice(0, 5)
  );
  const [latestStatusByEntry, setlatestStatusByEntry] = useState<any>({});
  const { userInfo: userInformation, findUserByDynamicKey } = useUserSearch(
    getMobileFromLocalStorage || location.state?.patientMobile
  );

  const userInfo = userInformation?.[1] || {};

  const onNewScanResult = (decodedText: any) => {
    const obj: {
      serviceType: 'OPD' | 'IPD';
      participantCode: string;
      patientName: string;
    } = JSON.parse(decodedText) || {};
    // setQrCodeData(decodedText);
    setInitialized(false);
    const information = {
      serviceType: obj.serviceType,
      participantCode: obj.participantCode,
      patientName: obj.patientName,
      disabledDropdown: true, // temporary fix to disable dropdown
    };

    navigate('/new-claim', { state: information });
  };

  const requestPayload = {
    mobile: getMobileFromLocalStorage,
    app: 'BSP',
  };

  // useEffect(() => {
  //   if (qrCodeData !== undefined) {
  //     const obj = JSON.parse(qrCodeData) || {};

  //     // const payorDetails = findUserByDynamicKey('insurance_id', obj?.insuranceId)[0];
  //     // if (!payorDetails) {
  //     //   toast.error('No payor details found for the provided insurance ID');
  //     //   return;
  //     // }

  //     // const payorDetails = userInfo.payorDetails[0];
  //     // console.log("Payor Details", payorDetails);

  //     // const payload = {
  //     //   providerName: obj?.provider_name,
  //     //   participantCode: process.env.SEARCH_PARTICIPANT_USERNAME,
  //     //   serviceType: 'OPD',
  //     //   mobile: getMobileFromLocalStorage,
  //     //   payor: payorDetails?.payorName,
  //     //   insuranceId: payorDetails?.insurance_id,
  //     //   patientName: userInfo?.userName,
  //     //   app: 'BSP',
  //     //   bspParticipantCode: process.env.SEARCH_PARTICIPANT_USERNAME,
  //     //   password: process.env.SEARCH_PARTICIPANT_PASSWORD,
  //     //   recipientCode: payorDetails?.payor
  //     // };
  //     // const sendCoverageEligibilityRequest = async () => {
  //     //   try {
  //     //     setLoading(true);
  //     //     let response = await generateOutgoingRequest(
  //     //       'coverageeligibility/check',
  //     //       payload
  //     //     );
  //     //     if (response?.status === 202) {
  //     //       toast.success("Coverage eligibility initiated successfully")
  //     //       setQrCodeData(undefined)
  //     //       setLoading(false)
  //     //     }
  //     //   } catch (error) {
  //     //     // setLoading(false);
  //     //     toast.error(_.get(error, 'response.data.error.message'));
  //     //   }
  //     // };
  //     // sendCoverageEligibilityRequest();
  //   }
  // }, [qrCodeData]);

  const loadMoreData = () => {
    const nextData = finalData.slice(currentIndex, currentIndex + 5);
    setDisplayedData([...coverageAndClaimData, ...nextData]);
    setCurrentIndex(currentIndex + 5);
  };

  activeRequests.forEach((entry: Record<string, any>) => {
    for (const [key, items] of Object.entries(entry)) {
      // Find the item with the latest date
      const latestItem = items.reduce((latest: any, item: any) => {
        const itemDate = parseInt(item.date, 10);
        if (!latest || itemDate > parseInt(latest.date, 10)) {
          return item;
        }
        return latest;
      }, null);

      // Extract the status of the latest item
      if (latestItem) {
        latestStatusByEntry[key] = latestItem.status === "response.complete" ? "Approved" : latestItem.status;
      }
    }
  });

  useEffect(() => {
    getCoverageEligibilityRequestList(
      setLoading,
      requestPayload,
      setActiveRequests,
      setFinalData,
      setDisplayedData
    );
  }, []);

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <h1 className="text-1xl mb-3 font-bold text-black dark:text-white">
            {strings.WELCOME_TEXT} {userInfo?.userName || '...'}
          </h1>
        </div>
      </div>
      <div className="rounded-lg border border-stroke bg-white p-2 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mt-2">
          <div className="qr-code p-1">
            <div id="reader" className="px-1">
              <Html5QrcodePlugin
                fps={60}
                qrbox={250}
                disableFlip={false}
                qrCodeSuccessCallback={onNewScanResult}
              // setInitialized={initialized}
              />
            </div>
          </div>
          <p className="mt-2 text-center font-bold text-black dark:text-gray">
            OR
          </p>
          <div className="mt-2 text-center">
            <a
              className="cursor-pointer underline text-base"
              onClick={() => {
                navigate('/new-claim', { state: location.state });
              }}
            >
              {strings.SUBMIT_NEW_CLAIM}
            </a>
          </div>
        </div>
        {loading ? (<></> ): <></>}
      </div>
      <div className="mt-6">
        {loading ? (
          <div className="flex items-center gap-4">
            <h1 className="px-1 text-2xl font-bold text-black dark:text-white">
              Getting Active Requests
            </h1>
            <TransparentLoader />
          </div>
        ) : coverageAndClaimData.length === 0 ? (
          <div className="flex justify-between">
            <h1 className="px-1 mb-1 text-2xl font-bold text-black dark:text-white">
              No Active Requests
            </h1>
            <>
              <ArrowPathIcon
                onClick={() => {
                  getCoverageEligibilityRequestList(
                    setLoading,
                    requestPayload,
                    setActiveRequests,
                    setFinalData,
                    setDisplayedData
                  );
                }}
                className={loading ? "animate-spin h-7 w-7" : "h-7 w-7"}
                aria-hidden="true"
              />
            </>
          </div>
        ) : (
          <div className="flex justify-between">
            <h1 className="px-1 mb-1 text-2xl font-bold text-black dark:text-white">
              {strings.YOUR_ACTIVE_CYCLE} ({activeRequests.length})
            </h1>
            <>
              <ArrowPathIcon
                onClick={() => {
                  getCoverageEligibilityRequestList(
                    setLoading,
                    requestPayload,
                    setActiveRequests,
                    setFinalData,
                    setDisplayedData
                  );
                }}
                className={loading ? "animate-spin h-7 w-7" : "h-7 w-7"}
                aria-hidden="true"
              />
            </>
          </div>
        )}
        {!loading ? (
          <div>
            {_.map(coverageAndClaimData, (ele: any, index: any) => {
              let approvedAmount: any = '';
              const claimType =
                claimDetails[ele.mobile]?.find(
                  (claim) => claim.id === ele.workflow_id
                )?.type || 'OPD';
              if (ele?.type === 'claim') {
                // approvedAmount = JSON.parse(ele?.additionalInfo)?.financial?.approved_amount
              }

              // This data isn't used
              // TODO: Remove this if not needed
              // const data: any = [
              //   {
              //     key: "Beneficiary name",
              //     value: ele.patientName,
              //   },
              //   {
              //     key: "Initiation date",
              //     value: formatDateTime(parseInt(ele.date)),
              //   },
              //   {
              //     key: "Insurance ID",
              //     value: `${ele.insurance_id || "null"}`,
              //   },
              //   {
              //     key: "ServiceType",
              //     value: `${claimType}`,
              //   },
              //   {
              //     key: "Status",
              //     value: (
              //       <span
              //         className={`${latestStatusByEntry[ele.workflow_id] === "Pending"
              //           ? "mr-2 rounded bg-warning px-2.5 py-0.5 text-xs font-medium text-gray dark:bg-warning dark:text-gray"
              //           : latestStatusByEntry[ele.workflow_id] === "Rejected"
              //             ? "mr-2 rounded bg-danger px-2.5 py-0.5 text-xs font-medium text-gray dark:bg-danger dark:text-gray"
              //             : "dark:text-green border-green mr-2 rounded bg-success px-2.5 py-0.5 text-xs font-medium text-gray"
              //           }`}
              //       >
              //         {latestStatusByEntry[ele.workflow_id]}
              //       </span>
              //     ),
              //   },
              // ];
              return (
                <div className="mt-2" key={index}>
                  <ActiveClaimCycleCard
                    participantCode={ele.sender_code}
                    payorCode={ele.recipient_code}
                    date={formatDateTime(parseInt(ele.date))}
                    insurance_id={ele.insurance_id}
                    claimType={claimType}
                    apiCallId={ele.apiCallId}
                    status={latestStatusByEntry[ele.workflow_id]}
                    type={ele.type}
                    mobile={ele.mobile}
                    billAmount={ele.billAmount}
                    workflowId={ele.workflow_id}
                    patientName={
                      findUserByDynamicKey(
                        'insurance_id',
                        ele.insurance_id
                      )?.[0]?.userName || ele.patientName
                    }
                    approvedAmount={approvedAmount}
                  />
                </div>
              );
            })}
            <div className="mt-2 flex justify-end underline">
              {currentIndex < activeRequests.length && (
                <button onClick={loadMoreData}>View More</button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Home;
