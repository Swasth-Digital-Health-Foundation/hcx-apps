import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import strings from '../../utils/strings';
import {
  createCommunicationOnRequest,
  isInitiated,
} from '../../services/hcxMockService';
import { toast } from 'react-toastify';
import LoadingButton from '../../components/LoadingButton';
import * as _ from "lodash";
import { ArrowPathIcon } from '@heroicons/react/24/outline';


const SendBankDetails = () => {
  const location = useLocation();
  const details = location.state;
  const navigate = useNavigate();

  const [beneficiaryName, setbeneficiaryName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ifscCode, setIfsc] = useState<string>('');
  const [refresh, setRefresh] = useState<any>(false);
  const [loading, setLoading] = useState<any>(false);
  const [isConsentVerified, setIsConsentVerified] = useState<boolean>()
  const beneficiaryBankDetails: any[] = location.state?.bankDetails;
  const [bankStatus , setBankStatus] = useState<boolean>(false);
  const [bankDetails , setBankDetails] = useState<any>();

  const claimRequestDetails: any = [
    {
      key: 'Provider name :',
      value: details?.sendInfo?.providerName || '',
    },
    {
      key: 'Participant code :',
      value: details?.sendInfo?.participantCode || '',
    },
    {
      key: 'Treatment/Service type :',
      value: details?.sendInfo?.serviceType || '',
    },
    {
      key: 'Payor name :',
      value: details?.sendInfo?.payor || '',
    },
    {
      key: 'Insurance ID :',
      value: details?.sendInfo?.insuranceId || '',
    },
  ];

  const treatmentDetails = [
    {
      key: 'Service type :',
      value: details?.sendInfo?.serviceType || '',
    },
    {
      key: 'Claimed amount :',
      value: details?.sendInfo?.billAmount || '',
    },
  ];

  const bankAccountDetails = [
    {
      key: 'Account number :',
      value: beneficiaryBankDetails[0]?.accountNumber,
    },
    {
      key: 'IFSC code :',
      value: beneficiaryBankDetails[0]?.ifscCode,
    },
  ];

  const getVerificationPayloadForBank = {
    type: 'bank_details',
    request_id: details?.sendInfo?.apiCallId,
  };  

  const getVerificationForBank = async () => {
    try {
      setRefresh(true);
      let res = await isInitiated(getVerificationPayloadForBank);
      setBankDetails(res.data?.result)
      setRefresh(false);
      if (res.status === 200) {
        if (_.includes(["Pending"], res.data?.result?.bankStatus)) {
          toast.error('Bank details request is not initiated');
          setBankStatus(false);
        } else if (_.includes(["initiated"], res.data?.result?.bankStatus)) {
          setBankStatus(true);
          toast.success('Bank details request is initiated');
        }
        if (res.data?.result?.otpStatus === 'successful') {
          setIsConsentVerified(true);
        }
      }
    } catch (err) {
      setRefresh(false);
      toast.error('Bank details request is not initiated');
      console.log(err);
    }
  };
  

  const recipientCode = details?.sendInfo?.recipientCode;


  const bankDetailsPayload = {
    request_id: details?.sendInfo?.apiCallId,
    type: 'bank_details',
    account_number: accountNumber,
    ifsc_code: ifscCode,
    participantCode: localStorage.getItem('senderCode') ,
    password: localStorage.getItem('password'),
    recipientCode: recipientCode
  };

  const submit = async () => {
    try {
      setLoading(true);
      let res = await createCommunicationOnRequest(bankDetailsPayload);
      setLoading(false);
      if (res.status === 202) {
        toast.success('Bank details submitted successfully!');
        navigate('/home');
      }
    } catch (err) {
      setLoading(false);
      toast.error('Faild to submit, please try again');
      console.log(err);
    }
  };   
  

  return (
    <div>   
      {beneficiaryBankDetails[0]?.bankStatus != 'successful' ?
        <div className="relative flex pb-8">
          <ArrowPathIcon
            onClick={() => {
              getVerificationForBank();
            }}
            className={
              loading ? "animate-spin h-11 w-7 absolute right-0" : "h-20 w-8 absolute right-2"
            }
            aria-hidden="true"
          />
        </div> : <></>
      }

      <div className="flex items-center justify-between">
        <h2 className="sm:text-title-xl1 mb-4 text-2xl font-semibold text-black dark:text-white">
          {strings.CLAIM_REQUEST_DETAILS}
        </h2>
      </div>
      <div className="rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div>
          {_.map(claimRequestDetails, (ele: any, index: any) => {
            return (
              <div key={index}>
                <h2 className="text-bold text-base font-bold text-black dark:text-white">
                  {ele.key}
                </h2>
                <span className="text-base font-medium">{ele.value}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 p-2 rounded-lg border border-stroke bg-white px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between">
          <h2 className="sm:text-title-xl1 text-1xl mt-2 mb-4 font-semibold text-black dark:text-white">
            {strings.TREATMENT_AND_BILLING_DETAILS}
          </h2>
        </div>
        <div>
          {_.map(treatmentDetails, (ele: any) => {
            return (
              <div className="flex gap-2">
                <h2 className="text-bold text-base font-bold text-black dark:text-white">
                  {ele.key}
                </h2>
                <span className="text-base font-medium">INR {ele.value}</span>
              </div>
            );
          })}
        </div>
      </div>
      {isConsentVerified || beneficiaryBankDetails[0]?.otpStatus === 'successful' ?
        <div className="mt-2 p-2 rounded-lg border border-stroke bg-white px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <h2 className="sm:text-title-xl1 text-1xl mt-1 mb-1 font-semibold text-black dark:text-white">
              Policy consent : <span className='text-success'>&#10004; Approved</span>
            </h2>
          </div>
        </div>
        : <></>
      }
      {
        beneficiaryBankDetails[0]?.bankStatus === 'successful' ? ( 
        <div className="mt-2 pb-2 rounded-lg border border-stroke bg-white px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <h2 className="sm:text-title-xl1 text-1xl mt-2 mb-4 font-semibold text-black dark:text-white">
              Beneficiary bank details :
            </h2>
          </div>
          <div>
            {_.map(bankAccountDetails, (ele: any) => {
              return (
                <div className="flex gap-2">
                  <h2 className="text-bold text-base font-bold text-black dark:text-white">
                    {ele.key}
                  </h2>
                  <span className="text-base font-medium">{ele.value}</span>
                </div>
              );
            })}
          </div>
        </div>) : <></> 
      }
      {beneficiaryBankDetails[0]?.bankStatus === 'successful' ? <button
        onClick={(event: any) => {
          event.preventDefault();
          navigate('/home');
        }}
        type="submit"
        className="align-center mt-3 flex w-full justify-center rounded bg-primary py-3 font-medium text-gray"
      >
        Home
      </button> :
        <></>
      }

      {bankStatus ? (
        <>
          <div className="mt-4 rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h2 className="mt-2 text-bold text-base font-bold text-black dark:text-white">
              Beneficiary account details :
            </h2>
            <p className="mt-2">
              Please enter beneficiary bank account details.
            </p>{' '}
            <label className="font-small mt-3 mb-2.5 block text-left text-black dark:text-white">
              Beneficiary Name
            </label>
            <div className="relative">
              <input
                required
                onChange={(e: any) => {
                  setbeneficiaryName(e.target.value);
                }}
                type="text"
                placeholder="Enter beneficiary name"
                className={
                  'w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
                }
              />
            </div>
            <label className="font-small mt-3 mb-2.5 block text-left text-black dark:text-white">
              Bank account no.
            </label>
            <div className="relative">
              <input
                required
                onChange={(e: any) => {
                  setAccountNumber(e.target.value);
                }}
                type="text"
                placeholder="Enter account no."
                className={
                  'w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
                }
              />
            </div>
            <label className="font-small mt-3 mb-2.5 block text-left text-black dark:text-white">
              IFSC code
            </label>
            <div className="relative">
              <input
                required
                onChange={(e: any) => {
                  setIfsc(e.target.value);
                }}
                type="text"
                placeholder="Enter IFSC code"
                className={
                  'w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
                }
              />
            </div>
            <div className="mt-3">
              {!loading ? (
                <button
                  disabled={accountNumber === '' || ifscCode === ''}
                  onClick={(event: any) => {
                    event.preventDefault();
                    submit();
                  }}
                  type="submit"
                  className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed disabled:bg-secondary disabled:text-gray"
                >
                  Submit
                </button>
              ) : (
                <LoadingButton className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed" />
              )}
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default SendBankDetails;
