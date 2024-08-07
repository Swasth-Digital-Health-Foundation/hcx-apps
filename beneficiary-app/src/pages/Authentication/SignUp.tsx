import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingButton from '../../components/LoadingButton';
import strings from '../../utils/strings';
import { createUser } from '../../services/hcxMockService'
import * as _ from "lodash";
import InsuranceDetailsForm from '../../components/InsuranceDetailsForm';

const SignUp = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState();
  const [email, setEmail] = useState();
  const [loading, setLoading] = useState(false);
  const getMobileFromLocalStorage: any = localStorage.getItem('mobile');
  const [insuranceId, setInsuranceId] = useState<string>('');
  const [insuranceId1, setInsuranceId1] = useState<string>('');
  const [payorName, setPayorName] = useState<string>('');
  const [payorName1, setPayorName1] = useState<string>('');
  const [address, setAddress] = useState<string>("");
  const [payorParticipantCode, setPayorParticipantCode] = useState<string>('');
  const [payorParticipantCode1, setPayorParticipantCode1] = useState<string>('');
  const [beneficiaryName, setBeneficiaryName] = useState<string>('');
  const [beneficiaryName1, setBeneficiaryName1] = useState<string>('');
  const [isOpen, setOpen] = useState<boolean>(false)
  const [mobile, setMobile] = useState<string>("")


  const insuranceDetails = {
    insurance_id: insuranceId,
    payorName: payorName,
    payor: payorParticipantCode,
    beneficiary_name: beneficiaryName1
  }

  const newInsuranceDetails = {
    insurance_id: insuranceId1,
    payorName: payorName1,
    payor: payorParticipantCode1,
    beneficiary_name: beneficiaryName1
  }
  let insuranceList = [insuranceDetails];

  if (newInsuranceDetails.beneficiary_name && insuranceDetails.payor) {
    insuranceList.push(newInsuranceDetails);
  }

  let payload = {
    email: email,
    mobile: getMobileFromLocalStorage || mobile,
    name: userName,
    payor_details: insuranceList,
    address: address,
  };


  const registerUser = async () => {
    try {
      setLoading(true);
      let registerResponse: any = createUser("/user/create", payload);
      if (registerResponse?.status === 200) {
        setLoading(false);
        toast.success('User registered successfully!');
        navigate('/home', { state: getMobileFromLocalStorage || mobile });
      }
      setLoading(false);
      toast.success('User registered successfully!');
      navigate('/home', { state: getMobileFromLocalStorage || mobile });
    } catch (error: any) {
      setLoading(false);
      toast.error(error.response.data.params.errmsg);
    }
  };

  const handleAddRemoveClick = () => {
    setOpen(!isOpen); // Toggle isOpen state
  };

  return (
    <div >
      <h2 className="sm:text-title-xl1 mb-2 text-2xl font-bold text-black dark:text-white">
        {strings.ADD_PROFILE_DETAILS}
      </h2>
      <div className="relative rounded-lg border border-stroke bg-white p-3 mt-1 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
        <form>
          <div className="mb-3">
            <div>
              <label className="mb-3  block text-left font-medium text-black dark:text-white">
                {"Beneficiary Name"}
              </label>
              <div className="relative">
                <input
                  required
                  onChange={(e: any) => {
                    setUserName(e.target.value);
                    setBeneficiaryName(e.target.value);
                  }}
                  type="text"
                  placeholder={strings.ENTER_YOUR_NAME}
                  className={
                    'w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
                  }
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="mb-2.5 block text-left font-medium text-black dark:text-white">
                {strings.MOBILE}
              </label>
              <div className="relative">
                <input
                  onChange={(e: any) => setMobile(e.target.value)}
                  value={mobile}
                  placeholder={"Enter mobile number"}
                  type='number'
                  className={
                    'w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
                  }
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="mb-2.5 block text-left font-medium text-black dark:text-white">
                {strings.EMAILID}
              </label>
              <div className="relative">
                <input
                  onChange={(e: any) => setEmail(e.target.value)}
                  type="email"
                  placeholder={strings.ENTER_EMAIL_ADDRESS}
                  className={
                    'w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
                  }
                />
              </div>
            </div>
            <div className='mt-3'>
              <label className="mb-2.5 block text-left font-medium text-black dark:text-white">
                {"Address :"}
              </label>
              <div className="relative">
                <input
                  onChange={(e: any) => setAddress(e.target.value)}
                  value={address}
                  type="text"
                  placeholder="Enter address"
                  className={
                    'w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
                  }
                />
              </div>
            </div>
          </div>
        </form>
      </div>
      <InsuranceDetailsForm
        beneficiaryName={beneficiaryName} setBeneficiaryName={setBeneficiaryName}
        insuranceId={insuranceId} setInsuranceId={setInsuranceId}
        payorName={payorName} setPayorName={setPayorName}
        payorParticipantCode={payorParticipantCode} setPayorParticipantCode={setPayorParticipantCode}
      />
      <div>
        <div className='flex justify-end'>
          <button
            onClick={handleAddRemoveClick}
            className="mt-2 text-blue-500 underline cursor-pointer justify-center"
          >
            {isOpen ? (
              "Remove"
            ) : (
              "Add Another"
            )}
          </button>

        </div>

        {isOpen && (
          <InsuranceDetailsForm
            beneficiaryName={beneficiaryName1} setBeneficiaryName={setBeneficiaryName1}
            insuranceId={insuranceId1} setInsuranceId={setInsuranceId1}
            payorName={payorName1} setPayorName={setPayorName1}
            payorParticipantCode={payorParticipantCode1} setPayorParticipantCode={setPayorParticipantCode1}
          />
        )}
      </div>
      <div className="mb-5">
        {!loading ? (
          <button
            onClick={(event: any) => {
              event.preventDefault();
              registerUser();
            }}
            type="submit"
            disabled={userName === "" || email === "" || mobile === ""}
            className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed disabled:bg-secondary disabled:text-gray"
          >
            {strings.SAVE_PROFILE_DETAILS}
          </button>
        ) : (
          <LoadingButton className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed" />
        )}
      </div>
    </div>
  );
};

export default SignUp;
