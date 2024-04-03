import { useLocation, useNavigate } from 'react-router-dom';
import Html5QrcodePlugin from '../../components/Html5QrcodeScannerPlugin/Html5QrcodeScannerPlugin';
import { useEffect, useState } from 'react';
import ActiveClaimCycleCard from '../../components/ActiveClaimCycleCard';
import strings from '../../utils/strings';
import { generateOutgoingRequest, getCoverageEligibilityRequestList, searchUser } from '../../services/hcxMockService';
import * as _ from 'lodash';
import TransparentLoader from '../../components/TransparentLoader';
import { toast } from 'react-toastify';
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [qrCodeData, setQrCodeData] = useState<any>();
  const [currentIndex, setCurrentIndex] = useState(5);
  const [userInformation, setUserInformation] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(true);
  const getMobileFromLocalStorage = localStorage.getItem('mobile');

  const [activeRequests, setActiveRequests] = useState<any>([]);
  const [finalData, setFinalData] = useState<any>([]);
  const [coverageAndClaimData, setDisplayedData] = useState<any>(
    finalData.slice(0, 5)
  );
  const [latestStatusByEntry, setlatestStatusByEntry] = useState<any>({});

  const onNewScanResult = (decodedText: any, decodedResult: any) => {
    setQrCodeData(decodedText);
    setInitialized(false);
  };

  const requestPayload = {
    mobile: getMobileFromLocalStorage,
    app: "BSP"
  };


  useEffect(() => {
    if (qrCodeData !== undefined) {
      let obj = JSON.parse(qrCodeData);
      let payload = {
        providerName: obj?.provider_name,
        participantCode: process.env.SEARCH_PARTICIPANT_USERNAME,
        serviceType: 'OPD',
        mobile: localStorage.getItem('mobile'),
        payor: userInformation[0]?.payor_details[0]?.payorName,
        insuranceId: userInformation[0]?.payor_details[0]?.insurance_id,
        patientName: userInformation[0]?.name,
        app: "BSP",
        bspParticipantCode: process.env.SEARCH_PARTICIPANT_USERNAME,
        password: process.env.SEARCH_PARTICIPANT_PASSWORD,
        recipientCode: userInformation[0]?.payor_details[0]?.recipientCode
      };

      const sendCoverageEligibilityRequest = async () => {
        try {
          setLoading(true);
          let response = await generateOutgoingRequest(
            'create/coverageeligibility/check',
            payload
          );
          if (response?.status === 202) {
            toast.success("Coverage eligibility initiated successfully")
            setQrCodeData(undefined)
            setLoading(false)
          }
        } catch (error) {
          // setLoading(false);
          toast.error(_.get(error, 'response.data.error.message'));
        }
      };
      sendCoverageEligibilityRequest();
    }
  }, [qrCodeData]);


  const search = async () => {
    try {
      let response: any = await searchUser("user/search", getMobileFromLocalStorage || location.state?.patientMobile)
      setUserInformation(response?.data?.result);
    } catch (error) {
      console.log(error);
    }
  };

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
        latestStatusByEntry[key] = latestItem.status;
      }
    }
  });

  useEffect(() => {
    search();
    getCoverageEligibilityRequestList(setLoading, requestPayload, setActiveRequests, setFinalData, setDisplayedData);
  }, []);

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <h1 className="text-1xl mb-3 font-bold text-black dark:text-white">
            {strings.WELCOME_TEXT} {userInformation[0]?.name || '...'}
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
                  getCoverageEligibilityRequestList(setLoading, requestPayload, setActiveRequests, setFinalData, setDisplayedData);
                }}
                className={
                  loading ? "animate-spin h-7 w-7" : "h-7 w-7"
                }
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
                  getCoverageEligibilityRequestList(setLoading, requestPayload, setActiveRequests, setFinalData, setDisplayedData);
                }}
                className={
                  loading ? "animate-spin h-7 w-7" : "h-7 w-7"
                }
                aria-hidden="true"
              />
            </>
          </div>
        )}
        {!loading ? (
          <div>
            {_.map(coverageAndClaimData, (ele: any, index: any) => {
              let approvedAmount: any = "";
              if (ele?.type === 'claim') {
                // approvedAmount = JSON.parse(ele?.additionalInfo)?.financial?.approved_amount
              }
              const date = new Date(parseInt(ele.date));
              const day = date.getDate().toString().padStart(2, "0");
              const month = (date.getMonth() + 1).toString().padStart(2, "0");
              const year = date.getFullYear();

              const formattedDate = `${day}-${month}-${year}`;
              const data: any = [
                {
                  key: "Beneficiary name",
                  value: ele.patientName,
                },
                {
                  key: "Initiation date",
                  value: formattedDate,
                },
                {
                  key: "Insurance ID",
                  value: `${ele.insurance_id || "null"}`,
                },
                {
                  key: "ServiceType",
                  value: `${ele.claimType}`,
                },
                {
                  key: "Status",
                  value: (
                    <span
                      className={`${latestStatusByEntry[ele.workflow_id] === "Pending"
                        ? "mr-2 rounded bg-warning px-2.5 py-0.5 text-xs font-medium text-gray dark:bg-warning dark:text-gray"
                        : latestStatusByEntry[ele.workflow_id] === "Rejected"
                          ? "mr-2 rounded bg-danger px-2.5 py-0.5 text-xs font-medium text-gray dark:bg-danger dark:text-gray"
                          : "dark:text-green border-green mr-2 rounded bg-success px-2.5 py-0.5 text-xs font-medium text-gray"
                        }`}
                    >
                      {latestStatusByEntry[ele.workflow_id]}
                    </span>
                  ),
                },
              ];
              return (
                <div className="mt-2" key={index}>
                  <ActiveClaimCycleCard
                    participantCode={ele.sender_code}
                    payorCode={ele.recipient_code}
                    date={ele.date}
                    insurance_id={ele.insurance_id}
                    claimType={ele.claimType}
                    apiCallId={ele.apiCallId}
                    status={latestStatusByEntry[ele.workflow_id]}
                    type={ele.type}
                    mobile={location.state}
                    billAmount={ele.billAmount}
                    workflowId={ele.workflow_id}
                    patientName={ele.patientName || userInformation?.userName}
                    approvedAmount={approvedAmount}
                    data={data}
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
