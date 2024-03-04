import LoadingButton from '../Components/LoadingButton';
import React from 'react'

export const ConsentVerification = (props: any) => {
    const { initiated, setOTP, loading, verifyOTP } = props;
    return (
        <>
            {initiated ? (
                <>
                    <div className="flex items-center justify-between">
                        <h2 className="sm:text-title-xl1 text-1xl mt-2 mb-4 font-semibold text-black dark:text-white">
                            {/* {strings.NEXT_STEP} */}
                            Next step :
                        </h2>
                    </div>
                    <div className="rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div>
                            <h2 className="text-bold text-base font-bold text-black dark:text-white">
                                {/* {strings.POLICYHOLDER_CONSENT} */}
                                Beneficiary consent :
                            </h2>
                            <label className="font-small mb-2.5 block text-left text-black dark:text-white">
                                {/* {strings.ENTER_OTP_TO_VERIFY_CLAIM} */}
                                Please enter OTP shared by payor to verify claim :
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
                                    {/* {strings.VERIFY_OTP_BUTTON} */}
                                    Verify OTP
                                </button>
                            )}
                        </div>
                    </div>
                </>
            ) : null}
        </>
    )
}
