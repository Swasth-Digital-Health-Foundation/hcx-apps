import React, { useEffect, useState } from 'react';
import { postRequest, putRequest } from '../../services/registryService';
import { toast } from 'react-toastify';

const Profile = () => {
  const getMobileFromLocalStorage: any = localStorage.getItem('mobile');

  const [userInfo, setUserInformation] = useState<any>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInsuranceId, setEditedInsuranceId] = useState('');
  const [editedPayor, setEditedPayor] = useState('');
  const [originalInsuranceId, setOriginalInsuranceId] = useState('');
  const [originalPayor, setOriginalPayor] = useState('');
  const [payorName, setPayorName] = useState('');
  const [originalPayorName, setOriginalPayorName] = useState('');

  const filter = {
    entityType: ['Beneficiary'],
    filters: {
      mobile: { eq: getMobileFromLocalStorage },
    },
  };

  const search = async () => {
    try {
      const searchUser = await postRequest('/search', filter);
      setUserInformation(searchUser.data);
    } catch (error) {
      console.log(error);
    }
  };


  const userProfileCard = [
    {
      key: 'Name :',
      value: userInfo[0]?.name,
    },
    {
      key: 'Mobile :',
      value: userInfo[0]?.mobile,
    },
    {
      key: 'Email address :',
      value: userInfo[0]?.email,
    },
  ];

  const handleEditClick = () => {
    setIsEditing(true);
    // Set initial values for editing based on the first element in the array
    setEditedInsuranceId(userInfo[0]?.payor_details[0]?.insurance_id || '');
    setEditedPayor(userInfo[0]?.payor_details[0]?.recipientCode || '');
    setPayorName(userInfo[0]?.payor_details[0]?.payorName || '')
    // Store original values
    setOriginalInsuranceId(userInfo[0]?.payor_details[0]?.insurance_id || '');
    setOriginalPayor(userInfo[0]?.payor_details[0]?.recipientCode || '');
    setOriginalPayorName(userInfo[0]?.payor_details[0]?.payorName || '')
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset edited values to original values
    setEditedInsuranceId(originalInsuranceId);
    setEditedPayor(originalPayor);
  };

  localStorage.setItem("payorCode", userInfo[0]?.payor_details[0]?.recipientCode)

  const updateUserInsuranceDetailsPayload = {
    payor_details: [
      {
        "insurance_id": editedInsuranceId,
        "payorName": payorName,
        "recipientCode": editedPayor
      }
    ]
  }

  const updateUserInfo = async () => {
    try {
      const update = await putRequest(userInfo[0]?.osid, updateUserInsuranceDetailsPayload)
      if (update.status === 200) {
        setTimeout(async () => {
          const searchUser = await postRequest('/search', filter);
          setUserInformation(searchUser.data);
        }, 2000);
      }
      toast.success("Details updated successfully.")
    }
    catch (err) {
      toast.error("Faild to update details.")
    }
  }

  const handleSaveClick = () => {
    if (editedInsuranceId === '' || editedPayor === '') {
      toast.error('Please fill in all the fields.');
    } else {
      setIsEditing(false);
      updateUserInfo();
    }
  };

  useEffect(() => {
    search();
  }, []);
  return (
    <>
      <h2 className="text-bold mb-3 text-2xl font-bold text-black dark:text-white">
        User profile
      </h2>
      <div className="rounded-lg border border-stroke bg-white p-2 px-3 shadow-default dark:border-strokedark dark:bg-boxdark">
        {userProfileCard.map((ele: any) => {
          return (
            <div className="mb-2 flex gap-2">
              <h2 className="text-bold text-base font-bold text-black dark:text-white">
                {ele.key}
              </h2>
              <span className="text-base font-medium">{ele.value}</span>
            </div>
          );
        })}
        <h2 className="text-bold -mb-2 text-2xl font-medium text-black dark:text-white">
          Insurance details :
        </h2>
        {/* {userInfo[0]?.payor_details.map((ele: any, index: number) => ( */}
        <div className="mt-5 rounded-lg border border-stroke bg-white p-2 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="mb-2">
            <div className="gap-2">
              <h2 className="text-bold text-base font-bold text-black dark:text-white">
                Insurance ID :
              </h2>
              {isEditing ? (
                <input
                  type="text"
                  value={editedInsuranceId}
                  className="w-full rounded-lg border border-stroke bg-transparent py-1 pl-2 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  onChange={(e) => setEditedInsuranceId(e.target.value)}
                />
              ) : (
                <span className="text-base font-medium">{userInfo[0]?.payor_details[0]?.insurance_id}</span>
              )}
            </div>
            <div className="gap-2 mt-2">
              <h2 className="text-bold text-base font-bold text-black dark:text-white">
                Payor code :
              </h2>
              {isEditing ? (
                <input
                  type="text"
                  value={editedPayor}
                  className="w-full rounded-lg border border-stroke bg-transparent py-1 pl-2 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  onChange={(e) => setEditedPayor(e.target.value)}
                />
              ) : (
                <span className="text-base font-medium">{userInfo[0]?.payor_details[0]?.recipientCode}</span>
              )}
            </div><div className="gap-2 mt-2">
              <h2 className="text-bold text-base font-bold text-black dark:text-white">
                Payor Name :
              </h2>
              {isEditing ? (
                <input
                  type="text"
                  value={payorName}
                  className="w-full rounded-lg border border-stroke bg-transparent py-1 pl-2 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  onChange={(e) => setPayorName(e.target.value)}
                />
              ) : (
                <span className="text-base font-medium">{userInfo[0]?.payor_details[0]?.payorName}</span>
              )}
            </div>

          </div>
        </div>
        {/* ))} */}

        <div className="text-end p-2 font-medium">
          {!isEditing && <button onClick={handleEditClick}>Edit</button>}
          {isEditing && (
            <div className='flex gap-6 justify-end'>
              <button onClick={handleSaveClick}>Save</button>
              <button onClick={handleCancelClick}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
