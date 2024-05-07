import axios from 'axios';
import { toast } from 'react-toastify';
import * as _ from "lodash";

async function generateOutgoingRequest(url: any, payload: any) {
  const response = await axios.post(
    `${process.env.hcx_mock_service}/${url}`,
    payload
  );
  return response;
}

async function searchUser(url: any, payload: any) {
  const response = await axios.get(
    `${process.env.hcx_mock_service}/${url}/${payload}`
  );
  return response;
}

async function createUser(url: any,payload: any) {
  const response = await axios.post(
    `${process.env.hcx_mock_service}/${url}`,
        payload
  );
  return response;
}

async function getConsultationDetails(workflow_id: any) {
  const response = await axios.get(
    `${process.env.hcx_mock_service}/consultation/${workflow_id}`
  );
  return response;
}

const getCoverageEligibilityRequestList = async (setLoading: any, requestPayload: any, setActiveRequests: any, setFinalData: any, setDisplayedData: any) => {
  try {
    setLoading(true);
    let response = await generateOutgoingRequest(
      "request/list",
      requestPayload
    );
    const data = response.data.entries;
    setActiveRequests(data);

    const coverageArray = [];
    const claimArray = [];

    for (const entry of data) {
      // Iterate through each entry in the input data.
      const key = Object.keys(entry)[0];
      const objects = entry[key];

      if (objects.length === 1 && objects[0].type === "claim") {
        // If there's only one object and its type is "claim," add it to claimArray.
        claimArray.push(objects[0]);
      } else {
        // If there's more than one object or any object with type "coverageeligibility," add them to coverageArray.
        coverageArray.push(
          ...objects.filter((obj: any) => obj.type === "coverageeligibility")
        );
      }
    }
    // Create a new array containing both claimArray and coverageArray.
    const newArray = [...claimArray, ...coverageArray];
    const sortedData = newArray.slice().sort((a: any, b: any) => {
      return b.date - a.date;
    });

    setFinalData(sortedData);
    setDisplayedData(sortedData.slice(0, 5));
    setLoading(false);
  } catch (err) {
    setLoading(false);
  }
};

const handleUpload = async (mobileNumber: any, FileLists: any) => {
  try {
    const formData = new FormData();
    formData.append('mobile', mobileNumber);

    FileLists.forEach((file: any) => {
      formData.append(`file`, file);
    });
    toast.info('Uploading documents please wait...!');
    const response = await axios({
      url: `${process.env.hcx_mock_service}/upload/documents`,
      method: 'POST',
      data: formData,
    });
    toast.info('Documents uploaded successfully!');
    return response;
  } catch (error) {
    console.error('Error in uploading file', error);
  }
};

const getActivePlans = async ({ setLoading, preauthOrClaimListPayload, setpreauthOrClaimList }: any) => {
  try {
    setLoading(true);
    let response = await generateOutgoingRequest(
      'request/list',
      preauthOrClaimListPayload
    );
    let preAuthAndClaimList = response.data?.entries;
    setpreauthOrClaimList(preAuthAndClaimList);
    setLoading(false);
  } catch (err) {
    setLoading(false);
    console.log(err);
  }
};

export {
  generateOutgoingRequest,
  createUser,
  getConsultationDetails,
  getCoverageEligibilityRequestList,
  handleUpload,
  getActivePlans,
  searchUser
};
