import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Html5QrcodePlugin from '../../components/Html5QrcodeScannerPlugin/Html5QrcodeScannerPlugin';
import ActiveClaimCycleCard from '../../components/ActiveClaimCycleCard';
import strings from '../../utils/strings';
import { generateOutgoingRequest, getCoverageEligibilityRequestList } from '../../services/hcxMockService';
import { postRequest } from '../../services/registryService';
import TransparentLoader from '../../components/TransparentLoader';
import { toast } from 'react-toastify';
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [qrCodeData, setQrCodeData] = useState<any>();
  const [userInformation, setUserInformation] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [activeRequests, setActiveRequests] = useState<any>([]);
  const [finalData, setFinalData] = useState<any>([]);
  const [coverageAndClaimData, setDisplayedData] = useState<any>(finalData.slice(0, 5));
  const latestStatusByEntry: Record<string, string | undefined> = {};

  const onNewScanResult = (decodedText: any) => {
    setQrCodeData(decodedText);
  };

  const requestPayload = {
    mobile: localStorage.getItem('mobile'),
    app: "BSP"
  };

  useEffect(() => {
    if (qrCodeData) {
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
          let response = await generateOutgoingRequest('create/coverageeligibility/check', payload);
          if (response?.status === 202) {
            toast.success("Coverage eligibility initiated successfully");
            setQrCodeData(undefined);
            setLoading(false);
          }
        } catch (error) {
          toast.error(_.get(error, 'response.data.error.message'));
        }
      };
      sendCoverageEligibilityRequest();
    }
  }, [qrCodeData]);

  const search = async () => {
    try {
      const searchUser = await postRequest('/search', {
        entityType: ['Beneficiary'],
        filters: {
          mobile: { eq: localStorage.getItem('mobile') },
        },
      });
      setUserInformation(searchUser.data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadMoreData = () => {
    const nextData = finalData.slice(0, 5);
    setDisplayedData([...coverageAndClaimData, ...nextData]);
  };

  useEffect(() => {
    search();
    getCoverageEligibilityRequestList(setLoading, requestPayload, setActiveRequests, setFinalData, setDisplayedData);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{strings.WELCOME_TEXT} {userInformation[0]?.name || '...'}</h1>
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="mt-2">
          <div className="qr-code p-1">
            <Html5QrcodePlugin
              fps={60}
              qrbox={250}
              disableFlip={false}
              qrCodeSuccessCallback={onNewScanResult}
            />
          </div>
          <p className="mt-2 text-center font-bold">OR</p>
          <div className="mt-2 text-center">
            <a
              className="cursor-pointer underline text-base"
              onClick={() => navigate('/new-claim', { state: location.state })}
            >
              {strings.SUBMIT_NEW_CLAIM}
            </a>
          </div>
        </div>
      </div>
      <div>
        {loading ? (
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Getting Active Requests</h1>
            <TransparentLoader />
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">No Active Requests</h1>
            {coverageAndClaimData.map((ele: any, index: any) => (
              <div className="mb-4" key={index}>
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
                  patientName={ele.patientName}
                />
              </div>
            ))}
            <div className="mt-2 flex justify-end underline">
              {currentIndex < activeRequests.length && (
                <button onClick={loadMoreData}>View More</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
