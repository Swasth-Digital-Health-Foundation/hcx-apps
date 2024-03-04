import LoadingButton from '../Components/LoadingButton';
import React from 'react'

export const BeneficiaryAccountDetails = (props: any) => {
    const { bankDetails, setbeneficiaryName, setAccountNumber, loading, setIfsc, accountNumber, submit, ifscCode } = props;
    return (
        <>
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
        </>
    )
}
