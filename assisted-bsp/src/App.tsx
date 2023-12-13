import { Navigate, Route, Routes } from "react-router-dom";
import DefaultLayout from "./layout/DefaultLayout";
import { useEffect, useState } from "react";
import Loader from "./common/Loader";
import Home from "./pages/Home/Home";
import InitiateNewClaimRequest from "./pages/InitiateNewClaimRequest/InitiateNewClaimRequest";
import PreAuthRequest from "./pages/InitiatePreAuthRequest/PreAuthRequest";
import RequestSuccess from "./components/RequestSuccess";
import { ToastContainer } from "react-toastify";
import AddPatientAndInitiateCoverageEligibility from "./pages/AddPatientAndInitiateCoverageEligibility/AddPatientAndInitiateCoverageEligibility";
import Login from "./pages/Authentication/Login";
import ViewPatientDetails from "./pages/ViewPatientDetails/ViewPatientDetails";
import VerifyClaim from "./pages/VerifyClaim/VerifyClaim";
import SendBankDetails from "./pages/SendBankDetails/SendBankDetails";

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
        autoClose={1500}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<Navigate to="/assisted-bsp-login" />} />
          <Route path="/assisted-bsp-login" element={<Login />}></Route>
          <Route path="/home" element={<Home />} />
          <Route
            path="/add-patient"
            element={<AddPatientAndInitiateCoverageEligibility />}
          />
          <Route
            path="/initiate-claim-request"
            element={<InitiateNewClaimRequest />}
          />
          {/* <Route path="/add-consultation" element={<AddConsultation />} /> */}
          <Route
            path="/coverage-eligibility"
            element={<ViewPatientDetails />}
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
            path="/verify-claim"
            element={<VerifyClaim />}
          />
          <Route path="/bank-details" element={<SendBankDetails />} />
          <Route path="/request-success" element={<RequestSuccess />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
