import { Navigate, Route, Routes } from 'react-router-dom';
import OTP from './pages/Authentication/OTP';
import VerifyOTP from './pages/Authentication/VerifyOTP';
import DefaultLayout from './layout/DefaultLayout';
import { useEffect, useState } from 'react';
import Loader from './common/Loader';
import Home from './pages/Home/Home';
import NewClaim from './pages/NewClaimCycle/NewClaim';
import SignUp from './pages/Authentication/SignUp';
import CoverageEligibility from './pages/ViewCoverageEligibilityDetails/CoverageEligibility';
import InitiateNewClaimRequest from './pages/InitiateNewClaimRequest/InitiateNewClaimRequest';
import ViewClaimRequestDetails from './pages/ViewClaimRequestDetails/ViewClaimRequestDetails';
import PreAuthRequest from './pages/InitiatePreAuthRequest/PreAuthRequest';
import RequestSuccess from './components/RequestSuccess';
import { ToastContainer } from 'react-toastify';
import Profile from './pages/Profile/Profile';
import SendBankDetails from './pages/SendBankDetails/SendBankDetails';
import Success from './pages/SendBankDetails/Success';
import CoverageEligibilitySuccessPage from './components/CoverageEligibilitySuccessPage';
import Notification from './pages/Notification/Notification';
import LinkedBeneficiaries from './pages/linkedBeneficiaries/LinkedBeneficiaries';
import BeneficiaryProfiles from './pages/beneficiary-profiles/BeneficiaryProfiles';

const App = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Routes>
        <Route path="/beneficiary-otp" element={<OTP />}></Route>
        <Route path="/verify-otp" element={<VerifyOTP />}></Route>
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<Navigate to="/beneficiary-otp" />} />
          <Route path="/signup" element={<SignUp />}></Route>
          <Route path="/home" element={<Home />} />
          <Route path="/new-claim" element={<NewClaim />} />
          <Route
            path="/coverage-eligibility"
            element={<CoverageEligibility />}
          />
          <Route
            path="/initiate-claim-request"
            element={<InitiateNewClaimRequest />}
          />
          <Route
            path="/initiate-preauth-request"
            element={<PreAuthRequest />}
          />
          <Route
            path="/view-active-request"
            element={<ViewClaimRequestDetails />}
          />
          <Route
            path="/coverage-eligibility-success-page"
            element={<CoverageEligibilitySuccessPage />}
          />
          <Route
            path="/beneficiary-profiles"
            element={<BeneficiaryProfiles />}
          />
          <Route
            path="/notification"
            element={<Notification />}
          />
          <Route path="/request-success" element={<RequestSuccess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/linked-beneficiaries" element={<LinkedBeneficiaries />} />
          <Route path="/bank-details" element={<SendBankDetails />} />
          <Route path="/success" element={<Success />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
