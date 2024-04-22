import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import strings from '../../utils/strings';
import {
  createCommunicationOnRequest,
  isInitiated,
} from '../../services/hcxMockService';
import { toast } from 'react-toastify';
import LoadingButton from '../../components/LoadingButton';
import * as _ from "lodash";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const SendBankDetails = () => {
  const location = useLocation();
  const details = location.state?.sendInfo;
  const beneficiaryBankDetails: any[] = location.state?.bankDetails;
  const navigate = useNavigate();

  const [beneficiaryName, setbeneficiaryName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ifscCode, setIfsc] = useState<string>('');
  const [refresh, setRefresh] = useState<any>(false);
  const [loading, setLoading] = useState<any>(false);
  const [isConsentVerified, setIsConsentVerified] = useState<boolean>()

  const claimRequestDetails: any = [
    {
      key: 'Provider name :',
      value: details?.providerName || '',
    },
    {
      key: 'Participant code :',
      value: details?.participantCode || '',
    },
    {
      key: 'Treatment/Service type :',
      value: details?.serviceType || '',
    },
    {
      key: 'Payor name :',
      value: details?.payor || '',
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
      value: details?.billAmount || '',
    },
  ];

  const bankAccountDetails = [
    {
      key: 'Account number :',
      value: beneficiaryBankDetails[0]?.accountNumber || '',
    },
    {
      key: 'IFSC code :',
      value: beneficiaryBankDetails[0]?.ifscCode || '',
    },
  ];

  const [bankDetails, setBankDetails] = useState(false);

  const getVerificationPayloadForBank = {
    type: 'bank_details',
    request_id: details?.apiCallId,
  };

  const getVerificationForBank = async () => {
    try {
      setRefresh(true);
      let res = await isInitiated(getVerificationPayloadForBank);
      setRefresh(false);
      if (res.status === 200 && _.includes(["Pending"], res.data?.result?.bankStatus)) {

        // toast.success('succes');
        toast.error('Bank details request is not initiated');
      }
      else {
        setBankDetails(true);
        toast.success('Bank details request is initiated');
      }
      if (res.data?.result?.otpStatus === 'successful' && res.status === 200) {
        setIsConsentVerified(true)
      }
    } catch (err) {
      setRefresh(false);
      toast.error('Bank details request is not initiated');
      console.log(err);
    }
  };

  const recipientCode = localStorage.getItem('recipientCode');
  const bankDetailsPayload = {
    request_id: details?.apiCallId,
    type: 'bank_details',
    account_number: accountNumber,
    ifsc_code: ifscCode,
    participantCode: process.env.SEARCH_PARTICIPANT_USERNAME,
    password: process.env.SEARCH_PARTICIPANT_PASSWORD,
    recipientCode: recipientCode
  };

  const submit = async () => {
    try {
      setLoading(true);
      let res = await createCommunicationOnRequest(bankDetailsPayload);
      setLoading(false);
      if (res.status === 202) {
        toast.success('Bank deatils submitted successfully!');
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
      <div className="relative flex pb-8 cursor-pointer">
        {beneficiaryBankDetails[0]?.bankStatus !== 'successful' ? <ArrowPathIcon
          onClick={() => {
            getVerificationForBank();
          }}
          className={
            loading ? "animate-spin h-11 w-7 absolute right-0" : "h-20 w-8 absolute right-2"
          }
          aria-hidden="true"
        /> : <></>}
        {/* {!refresh ? (
          <span className="cursor-pointer">Refresh</span>
        ) : (
          <LoadingButton className="align-center flex w-20 justify-center rounded bg-primary font-medium text-gray disabled:cursor-not-allowed" />
        )} */}
      </div>
      <div className="flex items-center justify-between">
        <h2 className="sm:text-title-xl1 mb-4 text-2xl font-semibold text-black dark:text-white">
          {strings.CLAIM_REQUEST_DETAILS}
        </h2>
      </div>
      <div className="rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div>
          {_.map(claimRequestDetails, (ele: any, index: any) => {
            ele.value !== '1234'
            return (
              <div key={index} className='mb-2'>
                <h2 className="text-bold text-base font-bold text-black dark:text-white">
                  {ele.key}
                </h2>
                <span className="text-base font-medium">{ele.value}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-2 pb-2 rounded-lg border border-stroke bg-white px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between">
          <h2 className="sm:text-title-xl1 text-1xl mt-2 mb-4 font-semibold text-black dark:text-white">
            {strings.TREATMENT_AND_BILLING_DETAILS}
          </h2>
        </div>
        <div className=" gap-2">
          <div className='flex'>
            <h2 className="text-bold text-base font-bold text-black dark:text-white">
              {"Service type :"}
            </h2>
            <span className="text-base ml-15.5 font-medium">{details?.serviceType}</span>
          </div>
          <div className='flex'>
            <h2 className="text-bold text-base font-bold text-black dark:text-white">
              {"Bill amount :"}
            </h2>
            <span className="text-base ml-18 font-medium">INR {details?.billAmount}</span>
          </div>
          <div className='flex'>
            {beneficiaryBankDetails[0]?.status === "response.complete" ? <>
              <h2 className="text-bold text-base  font-bold text-black dark:text-white">
                {"Approved amount :"}
              </h2>
              <span className="text-base ml-5 font-medium">INR {beneficiaryBankDetails[0]?.approvedAmount}</span>
            </> : <></>
            }</div>
        </div>
        {beneficiaryBankDetails[0]?.status === "response.complete" && beneficiaryBankDetails[0]?.remarks !== "" ?
          <>
            <div className="flex items-center justify-between">
              <h2 className="sm:text-title-xl1 text-1xl mt-2 mb-4 font-semibold text-black dark:text-white">
                <span className="flex items-center">
                  {"Remarks"}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6 ml-2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
                  </svg>
                </span>
              </h2>
            </div>
            <div className="flex gap-2">
              <h2 className="">
                {beneficiaryBankDetails[0]?.remarks}
              </h2>
            </div>
          </> : <></>
        }

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
        beneficiaryBankDetails[0]?.bankStatus === "successful" ?
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
          </div> : <></>
      }
      {beneficiaryBankDetails[0]?.bankStatus === 'successful' ?
        <button
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

      {bankDetails ? (
        <>
          <div className="rounded-lg border border-stroke bg-white p-2 px-3 mt-3 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h2 className="text-bold text-base font-bold text-black dark:text-white">
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
                    //   navigate('/home');
                    //   verifyOTP();
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