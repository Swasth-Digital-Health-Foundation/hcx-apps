import axios from "axios";

// Token Generation API 
export async function generateParticipantToken(apiUrl: string, payload: any) {
    const response = await axios.post(
        `${apiUrl}/participant/auth/token/generate`,
        payload,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );
    return response;
}


// Generating outgoing request API
export async function generateOutgoingRequest(apiUrl: string, payload: any, action: string) {
    const response = await axios.post(
        `${apiUrl}/${action}`,
        payload
    );
    return response;
}

// Check isCommunication request is initiated

export async function isCommnicationRequestInitiated(apiUrl: string, payload: any) {
    const response = await axios.post(
        `${apiUrl}/check/communication/request`,
        payload
    );
    return response;
}

// Send OTP 

export async function sendOTP(apiUrl: string, payload: any) {
    const response = await axios.post(
        `${apiUrl}/send/otp`,
        payload,
        {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        }
    );
    return response;
}

// Verify OTP

export async function verifyOTP(apiUrl: string, payload: any) {
    const response = await axios.post(
        `${apiUrl}/verify/otp`,
        payload
    );
    return response;
}

// Add consultation Details API

export async function addConsultation(apiUrl: string, payload: any) {
    const response = await axios.post(
        `${apiUrl}/consultation/add`,
        payload
    );
    return response;
}


// Get consultation  API 

export async function getConsultationDetails(apiUrl: string, workflow_id: string) {
    const response = await axios.get(
        `${apiUrl}/consultation/${workflow_id}`
    );
    return response;
}

// uploading documents 

export async function uploadDocuments(apiUrl: string, formData: any) {
    const response = await axios({
        url: `${apiUrl}/upload/documents`,
        method: 'POST',
        data: formData,
    });
}

// Beneficiary user create

export async function beneficaryUserCreate(apiUrl: string, payload: any) {
    const response = await axios.post(
        `${apiUrl}/invite`,
        payload
    );
    return response;
}


// Beneficiary user update  
export async function beneficiaryUserSearch(apiUrl: string, payload: any) {
    const response = await axios.put(
        `${apiUrl}/search`,
        payload
    );
    return response;
}

// Participant Search 

export async function searchParticipant(apiUrl: any, payload: any, config: any) {
    const response = await axios.post(
        `${apiUrl}/participant/search`,
        payload,
        config
    );
    return response;
}

export async function getRequestList(apiUrl: string, payload: any) {
    let response = await axios.post(
        `${apiUrl}/bsp/request/list`,
        payload
    );
    return response;
}

export function validateToken(jwtToken: any, role: any) {
    try {
        if (!jwtToken || jwtToken.trim() === "") {
            console.log("Error: JWT token is empty, null, or undefined");
            return false;
        }
        const decodeBase64String = (base64String: any) => JSON.parse(atob(base64String));
        const { realm_access: { roles } } = decodeBase64String(jwtToken.split('.')[1]);
        if (roles?.includes(role)) {
            console.log("Validation successful: User has the required role");
            return true
        } else {
            console.log("Validation failed: User does not have the required role");
            return false
        }
    } catch (error) {
        console.error("Error validating token:", error);
        return false;
    }
}

export const getCoverageEligibilityRequestList = async (setLoading: any, requestPayload: any, apiUrl: string, action: string, setActiveRequests: any, setFinalData: any, setDisplayedData: any) => {
    try {
        setLoading(true);
        let response = await generateOutgoingRequest(apiUrl, requestPayload, action);
        const data = response.data.entries;
        setActiveRequests(data);

        const coverageArray = [];
        const claimArray = [];

        for (const entry of data) {
            // Iterate through each entry in the input data.
            const key = Object.keys(entry)[0];
            const objects = entry[key];

            if (objects.length === 1 && objects[0].type === 'claim') {
                // If there's only one object and its type is "claim," add it to claimArray.
                claimArray.push(objects[0]);
            } else {
                // If there's more than one object or any object with type "coverageeligibility," add them to coverageArray.
                coverageArray.push(
                    ...objects.filter((obj: any) => obj.type === 'coverageeligibility')
                );
            }
        }
        // Create a new array containing both claim and coverage requests.
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

export async function registryPostRequest(apiUrl: string, payload: any, action: string) {
    const response = await axios.post(
        `${apiUrl}/${action}`,
        payload
    );
    return response;
}

export async function registryPutRequest(apiUrl: string, osid: any, payload: any) {
    const response = await axios.put(
        `${apiUrl}/${osid}`,
        payload
    );
    return response;
}