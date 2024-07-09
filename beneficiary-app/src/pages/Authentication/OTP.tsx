import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../images/swasth_logo.png';
import animationHcx from '../../images/banner.svg'
import { useState } from 'react';
import { toast } from 'react-toastify';
import LoadingButton from '../../components/LoadingButton';
import { sendOTP } from '../../services/hcxMockService';
import * as _ from 'lodash';
import strings from '../../utils/strings';
import ReferenceAppsPage from '../ReferenceAppsPage/ReferenceAppsPage';

const OTP = () => {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState<any>();
  const [isValid, setIsValid] = useState(true);
  const [loading, setLoading] = useState(false);
  localStorage.setItem('mobile', mobileNumber);

  const payload = {
    mobile: mobileNumber,
  };

   const formSubmit = async () => {
    try {
      setLoading(true);
      let response = await sendOTP(payload);
      if (response.status === 200) {
        toast.success('OTP sent successfully!');
        navigate('/verify-otp', { state: mobileNumber });
        setLoading(false);
      }
    } catch (err: any) {
      setLoading(false);
      toast.error(_.get(err, 'Please enter valid 6 digit OTP sent to your mobile number '));
    }
  };

  const handleMobileNumberChange = (e: any) => {
    const inputValue = e.target.value;
    const isValidInput = /^\d{10}$/.test(inputValue);
    setIsValid(isValidInput);
    setMobileNumber(inputValue);
  };

  return (
    <>
      <div className="realtive rounded-sm h-screen border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center">
          <div className="hidden w-full xl:block xl:w-1/2">
            <div className="py-17.5 px-26 text-center">
              <Link className="mb-5.5 inline-block" to="#">
                <img className="hidden dark:block w-48" src={Logo} alt="Logo" />
                <img className="dark:hidden w-48" src={Logo} alt="Logo" />
              </Link>
              <p className="2xl:px-20 font-bold text-xl text-black dark:text-white">
                HCX BSP App
              </p>
              <span className="mt-15 inline-block">
                <img className="block" src={animationHcx} alt="Logo" />
              </span>
            </div>
          </div>
          <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
            <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
              <div className="text-center w-full xl:hidden">
                <Link className="mb-5.5 inline-block" to="#">
                  <img className="hidden dark:block w-48" src={Logo} alt="Logo" />
                  <img className="dark:hidden w-48" src={Logo} alt="Logo" />
                </Link>
              </div>
              <h1 className="mb-5 text-3xl font-bold text-black dark:text-white sm:text-title-xl2">
                {strings.WELCOME}
              </h1>
              <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                {strings.SIGNIN}
              </h2>
              <ReferenceAppsPage />
              <form>
                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    {strings.ENTER_MOBILE_NUMBER}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder={strings.TEN_DIGIT}
                      onChange={handleMobileNumberChange}
                      className={`border ${isValid ? 'border-stroke' : 'border-red'
                        } w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary`}
                    />
                    <span className="absolute right-4 top-4">
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g opacity="0.5">
                          <path
                            d="M19.2516 3.30005H2.75156C1.58281 3.30005 0.585938 4.26255 0.585938 5.46567V16.6032C0.585938 17.7719 1.54844 18.7688 2.75156 18.7688H19.2516C20.4203 18.7688 21.4172 17.8063 21.4172 16.6032V5.4313C21.4172 4.26255 20.4203 3.30005 19.2516 3.30005ZM19.2516 4.84692C19.2859 4.84692 19.3203 4.84692 19.3547 4.84692L11.0016 10.2094L2.64844 4.84692C2.68281 4.84692 2.71719 4.84692 2.75156 4.84692H19.2516ZM19.2516 17.1532H2.75156C2.40781 17.1532 2.13281 16.8782 2.13281 16.5344V6.35942L10.1766 11.5157C10.4172 11.6875 10.6922 11.7563 10.9672 11.7563C11.2422 11.7563 11.5172 11.6875 11.7578 11.5157L19.8016 6.35942V16.5688C19.8703 16.9125 19.5953 17.1532 19.2516 17.1532Z"
                            fill=""
                          />
                        </g>
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="mb-5">
                  {!loading ? (
                    <button
                      type="submit"
                      className="align-end flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed disabled:bg-secondary disabled:text-gray"
                      onClick={formSubmit}
                      disabled={!isValid || mobileNumber === undefined}
                    >
                      {strings.SEND_OTP}
                    </button>
                  ) : (
                    <LoadingButton className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed" />
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OTP;
