# hcx-apps

This repository contains code for below reference apps:
- Beneficiary App
- OPD Provider App

## Steps to run the OPD provider app in local 

You'll need to install Node.js >=v14.16+ (NPM comes along with it) and App uses Vite for frontend tooling, to peform installation and building production version, please follow these steps from below:

Step 1 : Clone the app and switch to opd-staging branch
```
git clone https://github.com/Swasth-Digital-Health-Foundation/hcx-apps.git
```
```
cd hcx-apps/opd-app
```
```
git checkout opd-staging
```
Step 2 : Create a .env file in the opd-app root directory and add the following details: 
```
registry_url="https://staging-hcx.swasth.app/registry/api/v1/Beneficiary"
hcx_mock_service="https://staging-hcx.swasth.app/hcx-mock-service/v0.7"
hcx_service="https://staging-hcx.swasth.app/api/v0.8"
SEARCH_PARTICIPANT_USERNAME="hosp_swasth_620420@swasth-hcx-staging"
SEARCH_PARTICIPANT_PASSWORD="qIqmhY44cL1c@"
```
Step 3 : Install dependencies and start the development server:
```
npm i 
npm run dev 
```