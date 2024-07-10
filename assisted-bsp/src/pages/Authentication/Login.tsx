import { Link, useNavigate } from "react-router-dom";
import Logo from "../../images/swasth_logo.png";
import { useState } from "react";
import { toast } from "react-toastify";
import LoadingButton from "../../components/LoadingButton";
import * as _ from "lodash";
import { login } from "../../services/hcxService";
import animationImage from '../../images/banner.svg';
import ReferenceAppsPage from "../ReferenceAppsPage/ReferenceAppsPage";

const Login = () => {
  const navigate = useNavigate();
  const [participantCode, setParticipantCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  localStorage.setItem("email", participantCode);
  localStorage.setItem("password", password);

  const loginCredentials = {
    username: participantCode,
    password: password,
  };

  const userLogin = async () => {
    try {
      setLoading(true);
      const loginResponse = await login(loginCredentials);
      if (loginResponse.status === 200) {
        toast.success("Signed in succcessfully!");
        navigate("/home");
      }
    } catch (err: any) {
      setLoading(false);
      toast.error("Please enter valid user credentials!");
    }
  };

  const handleTogglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <>
      <div className="rounded-sm h-screen border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center">
          <div className="hidden w-full xl:block xl:w-1/2">
            <div className="py-17.5 px-26 text-center">
              <Link className="mb-5.5 inline-block" to="#">
                <img className="hidden dark:block w-48" src={Logo} alt="Logo" />
                <img className="dark:hidden w-48" src={Logo} alt="Logo" />
              </Link>

              <p className="2xl:px-20 font-bold text-xl text-black dark:text-white">
                Assisted Beneficiary Service Platform
              </p>

              <span className="mt-15 inline-block">
                <img className="block" src={animationImage} alt="Logo" />
              </span>
            </div>
          </div>
          <ReferenceAppsPage />
          <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
            <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
              <div className="text-center w-full xl:hidden">
                <Link className="mb-5.5 inline-block" to="#">
                  <img className="hidden dark:block w-48" src={Logo} alt="Logo" />
                  <img className="dark:hidden w-48" src={Logo} alt="Logo" />
                </Link>
              </div>
              <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Sign In
              </h2>

              <form>
                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Participant Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter your registered participant code"
                      className={"w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"}
                      onChange={(event) => { setParticipantCode(event.target.value) }}
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

                <div className="mb-6">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordVisible ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className={"w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"}
                      onChange={(event) => { setPassword(event.target.value) }}
                    />
                    <div className='absolute top-4 right-5' onClick={handleTogglePassword}>
                      {passwordVisible ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                      }
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  {!loading ? (
                    <button
                      type="submit"
                      className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
                      disabled={participantCode === "" || password === ""}
                      onClick={(e: any) => {
                        e.preventDefault();
                        userLogin();
                      }}
                    >
                      Sign In
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

export default Login;