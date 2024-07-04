interface PayorDetails {
    payor: string;
    payorName: string;
    insurance_id: string;
    beneficiary_name?: string;
}

interface User {
    address: string;
    gender: string;
    userName: string;
    payorDetails: PayorDetails[];
    medicalHistory: {
        allergies: string;
        blood_group: string;
    };
    email: string;
    age: number;
    beneficiaryId: string;
}

const users: User[] = [
    {
        address: "Bengaluru",
        gender: "Male",
        userName: "Abhishek Gaddi",
        payorDetails: [
            {
                payor: "payr_demomo_790424@swasth-hcx-dev",
                payorName: "Demo Mock Payor",
                insurance_id: "ABCD1234",
                beneficiary_name: "Abhishek"
            },
            {
                payor: "payr_demoin_428283@swasth-hcx-dev",
                payorName: "Demo Insurance 2",
                insurance_id: "ABCD211",
                beneficiary_name: "Abhishek"
            }
        ],
        medicalHistory: {
            allergies: "Food",
            blood_group: "O+"
        },
        email: "abhigaddi4@gmail.com",
        age: 24,
        beneficiaryId: "74dbc36a-8995-43ac-9db4-6a0c27d1909c"
    },
    {
        address: "Bengaluru",
        gender: "Male",
        userName: "Abhishek",
        payorDetails: [
            {
                payor: "payr_demomo_790424@swasth-hcx-dev",
                payorName: "ABCD1234",
                insurance_id: "Demo Mock Payor"
            }
        ],
        medicalHistory: {
            allergies: "",
            blood_group: ""
        },
        email: "abhigaddi4@gmail.com",
        age: 24,
        beneficiaryId: "4c6ba7f5-3d31-4c79-b4d3-6954091f513a"
    },
    {
        address: "Bengaluru",
        gender: "Male",
        userName: "Abhishek G",
        payorDetails: [
            {
                payor: "payr_demomo_790424@swasth-hcx-dev",
                payorName: "Demo Mock Payor",
                insurance_id: "ABCD123"
            }
        ],
        medicalHistory: {
            allergies: "Food",
            blood_group: "O+"
        },
        email: "abhigaddi4@gmail.com",
        age: 24,
        beneficiaryId: "3431a6fa-3d2e-405c-82f6-1591ea61f568"
    }
];

function userExists(age: number, gender: string, name: string): boolean {
    for (const user of users) {
        if (user.age === age && user.gender === gender && user.userName.toLowerCase() === name.toLowerCase()) {
            return true ;
        }
    }
    return false;
}

// Example usage:
const mobileInput = "1234567890";  // Assuming mobile is not used for matching in the provided data.
const ageInput = 24;
const genderInput = "Male";
const nameInput = "Abhishek Gaddi";

const exists = userExists(ageInput, genderInput, nameInput);
console.log(exists);  // Output: true or false
