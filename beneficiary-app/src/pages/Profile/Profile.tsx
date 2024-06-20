import { useEffect, useState } from 'react';
import { searchUser, userUpdate } from '../../services/hcxMockService';
import { toast } from 'react-toastify';
import InsuranceDetailsForm from '../../components/InsuranceDetailsForm';
import SelectInput from '../../components/SelectInput';
import TransparentLoader from '../../components/TransparentLoader';

const Profile = () => {
  const getMobileFromLocalStorage: any = localStorage.getItem('mobile');

  const [userInfo, setUserInformation] = useState<any>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUserName, setEditedUserName] = useState<string>('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedAddress, setEditedAddress] = useState('');
  const [editedAllergies, setEditedAllergies] = useState('');
  const [editedBloodGroup, setEditedBloodGroup] = useState('');
  const [loading, setLoading] = useState(false);
  const [beneficiaryName, setBeneficiaryName] = useState<string>('');
  const [payorParticipantCode, setPayorParticipantCode] = useState<string>('');
  const [insuranceId, setInsuranceId] = useState<string>('');
  const [payorName, setPayorName] = useState<string>('');
  const [isOpen, setOpen] = useState<boolean>(false)

  const search = async () => {
    try {
      console.log("getMobileFromLocalStorage", getMobileFromLocalStorage);
      let response: any = await searchUser("user/search", getMobileFromLocalStorage)
      setUserInformation(response?.data?.result);
    } catch (error) {
      console.log(error);
    }
  };

  const bloodGroupOptions = [
    {
      label: "Select",
      value: "",
    },
    { label: "O+", value: "O+" },
    { label: "O-", value: "O-" },
    { label: "A-", value: "A-" },
    { label: "A+", value: "A+" },
    { label: "B-", value: "B-" },
    { label: "B+", value: "B+" },
    { label: "AB+", value: "AB+" },
    { label: "AB-", value: "AB-" },
  ];

  const allergiesOptions = [
    {
      label: "Select",
      value: "",
    },
    { label: "Food", value: "Food" },
    { label: "Dust", value: "Dust" },
    { label: "Medication", value: "Medication" },
    { label: "Cosmatic", value: "Cosmatic" },
  ];

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };


  const updatePayload = {
    mobile: getMobileFromLocalStorage,
    name: editedUserName,
    address: editedAddress,
    medical_history: {
      blood_group: editedBloodGroup,
      allergies: editedAllergies
    }
  }

  const handleSaveClick = async () => {
    try {
      setIsEditing(false);
      const response: any = await userUpdate("user/update", updatePayload);
      if (response.status === 200) {
        setTimeout(async () => {
          let searchResponse: any = await searchUser("user/search", getMobileFromLocalStorage);
          setUserInformation(searchResponse?.data?.result);
        }, 2000);
        toast.success("Details updated successfully.");
      } else {
        toast.error("Failed to update details.");
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast.error("Failed to update details.");
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = () => {
    setInsuranceId(''),
      setBeneficiaryName('')
    setPayorName('')
    setPayorParticipantCode('')
  }

  const handleDelete = async (payorCode: any) => {
    try {
      setLoading(true);
      let filteredData = userInfo?.payorDetails.filter((ele: any) => ele.payor !== payorCode);
      const updatePayload = {
        mobile: getMobileFromLocalStorage,
        payor_details: filteredData,
      };
      const response: any = await userUpdate("user/update", updatePayload);
      if (response.status === 200) {
        setTimeout(async () => {
          let searchResponse: any = await searchUser("user/search", getMobileFromLocalStorage);
          setUserInformation(searchResponse?.data?.result);
          setLoading(false)
          toast.success("Details updated successfully..!");
        }, 2000);
      } else {
        toast.error("Failed to update details.");
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast.error("Failed to update details.");
    }
  };

  const handleAddRemoveClick = () => {
    handleStateChange()
    setOpen(!isOpen);
  };

  const newPayorDetails = {
    payor: payorParticipantCode,
    payorName: payorName,
    insurance_id: insuranceId,
    beneficiary_name: beneficiaryName
  }

  const handelAddInsuranceDetails = async () => {
    try {
      setLoading(true)
      let searchResponse: any = searchUser("user/search", getMobileFromLocalStorage);
      setUserInformation(searchResponse?.data?.result);
      const existPayorDetails = userInfo?.payorDetails && userInfo?.payorDetails
      const updatePayorDetails = [...existPayorDetails, newPayorDetails]
      const updatePayload = {
        mobile: getMobileFromLocalStorage,
        payor_details: updatePayorDetails
      }
      const response: any = await userUpdate("user/update", updatePayload);
      if (response.status === 200) {
        setTimeout(async () => {
          let searchResponse: any = await searchUser("user/search", getMobileFromLocalStorage);
          setUserInformation(searchResponse?.data?.result);
          setLoading(false)
          toast.success("Details updated successfully.");
        }, 2000);
      } else {
        toast.error("Failed to update details.");
      }
    } catch (error) {
      toast.error("Failed to update details.");
    } finally {
      setOpen(false)
    }
  };


  useEffect(() => {
    search();
  }, []);
  return (
    <>
      {loading ? <TransparentLoader /> : <>
        <h2 className="text-bold mb-3 text-2xl font-bold text-black dark:text-white">
          User profile
        </h2>
        <div className="relative border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h2 className="text-bold text-base font-bold text-black dark:text-white">
            Name :
          </h2>
          {isEditing ? (
            <input
              type="text"
              value={editedUserName === '' ? userInfo?.userName : editedUserName}
              className="w-full rounded-lg border border-stroke bg-transparent py-1 pl-2 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              onChange={(e) => setEditedUserName(e.target.value)}
            />
          ) : (
            <span className="text-base font-medium">{userInfo?.userName}</span>
          )}
          <h2 className="mt-2 text-bold text-base font-bold text-black dark:text-white">
            Mobile :
          </h2>
          <span className="text-base font-medium">{getMobileFromLocalStorage}</span>
          <h2 className="mt-2 text-bold text-base font-bold text-black dark:text-white">
            Email :
          </h2>
          {isEditing ? (
            <input
              type="text"
              value={editedEmail === '' ? userInfo?.email : editedEmail}
              className="w-full rounded-lg border border-stroke bg-transparent py-1 pl-2 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              onChange={(e) => setEditedEmail(e.target.value)}
            />
          ) : (
            <span className="text-base font-medium">{userInfo?.email}</span>
          )}
          <h2 className="mt-2 text-bold text-base font-bold text-black dark:text-white">
            Address :
          </h2>
          {isEditing ? (
            <input
              type="text"
              value={editedAddress === '' ? userInfo?.address : editedAddress}
              className="w-full rounded-lg border border-stroke bg-transparent py-1 pl-2 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              onChange={(e) => setEditedAddress(e.target.value)}
            />
          ) : (
            <span className="text-base font-medium">{userInfo?.address}</span>
          )}
          <h2 className="mt-2 text-bold font-bold mt-2 -p-1 -mb-2 text-1xl text-black dark:text-white">
            Medical history:
          </h2>
          <div className='mt-4 rounded-lg border border-stroke bg-white px-2 pb-2 shadow-default dark:border-strokedark dark:bg-boxdark'>
            {!isEditing ? <h2 className="text-bold font-bold mt-1 text-1xl text-black dark:text-white">
              Allergies :
            </h2> : <></>}
            {isEditing ? (
              <SelectInput
                label="Allergies :"
                value={editedAllergies === '' ? userInfo?.medicalHistory?.allergies : editedAllergies}
                onChange={(e: any) => setEditedAllergies(e.target.value)}
                disabled={false}
                options={allergiesOptions}
              />
            ) : (
              <span className="text-base font-medium">{userInfo?.medicalHistory?.allergies}</span>
            )}
            {!isEditing ? <h2 className="text-bold font-bold mt-1 text-1xl text-black dark:text-white">
              Blood group :
            </h2> : <></>}
            {isEditing ? (
              <SelectInput
                label="Blood group :"
                value={editedBloodGroup === '' ? userInfo?.medicalHistory?.blood_group : editedBloodGroup}
                onChange={(e: any) => setEditedBloodGroup(e.target.value)}
                disabled={false}
                options={bloodGroupOptions}
              />
            ) : (
              <span className="text-base font-medium">{userInfo?.medicalHistory?.blood_group}</span>
            )}
          </div>
          <div className="absolute top-0 right-0 text-end p-2 font-medium">
            {!isEditing && <button onClick={handleEditClick}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>}
          </div>
          {isEditing && (
            <div className='p-1 flex gap-6 justify-end'>
              <button onClick={handleSaveClick}>Save</button>
              <button onClick={handleCancelClick}>Cancel</button>
            </div>
          )}
        </div>
        <h5 className="text-bold mt-2 -p-1 -mb-2 text-2xl font-medium text-black dark:text-white">
          Insurance details:
        </h5>
        <div className='mt-3 rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark'>
          {userInfo?.payorDetails && userInfo.payorDetails.map(
            (
              detail: {
                beneficiary_name: any;
                insurance_id: any;
                payor: any;
                payorName: any;                
              },
              index: any
            ) => (
              <div
                key={index}
                className="relative mt-4 rounded-lg border border-stroke bg-white p-2 shadow-default dark:border-strokedark dark:bg-boxdark"
              >
                <button
                  className="absolute top-0 right-0 text-red-500 p-1"
                  onClick={() => handleDelete(detail.payor)} >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
                <div className="mb-2">
                <div className="gap-2">
                    <h2 className="text-bold text-base font-bold text-black dark:text-white">
                      Beneficiary Name:
                    </h2>
                    <span className="text-base font-medium">{detail.beneficiary_name}</span>
                  </div>
                  <div className="gap-2">
                    <h2 className="text-bold text-base font-bold text-black dark:text-white">
                      Insurance ID:
                    </h2>
                    <span className="text-base font-medium">{detail.insurance_id}</span>
                  </div>
                  <div className="gap-2 mt-2">
                    <h2 className="text-bold text-base font-bold text-black dark:text-white">
                      Payor code:
                    </h2>
                    <span className="text-base font-medium">{detail.payor}</span>
                  </div>
                  <div className="gap-2 mt-2">
                    <h2 className="text-bold text-base font-bold text-black dark:text-white">
                      Payor Name:
                    </h2>
                    <span className="text-  base font-medium">{detail.payorName}</span>
                  </div>
                </div>
              </div>
            )
          )}
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
          <div>
            {isOpen && (
              <InsuranceDetailsForm
                beneficiaryName={beneficiaryName} setBeneficiaryName={setBeneficiaryName}
                insuranceId={insuranceId} setInsuranceId={setInsuranceId}
                payorName={payorName} setPayorName={setPayorName}
                payorParticipantCode={payorParticipantCode} setPayorParticipantCode={setPayorParticipantCode}
              />
            )}
            {isOpen ? <button
              onClick={(event: any) => {
                event.preventDefault();
                handelAddInsuranceDetails();
              }}
              type="submit"
              className="align-center mt-4 flex w-full justify-center rounded bg-primary py-4 font-medium text-gray disabled:cursor-not-allowed disabled:bg-secondary disabled:text-gray">
              {"Update Insurance details"}
            </button> : ""
            }
          </div>
        </div>
      </>}
    </>
  )
};
export default Profile;

