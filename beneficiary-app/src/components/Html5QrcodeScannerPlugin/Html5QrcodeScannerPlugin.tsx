// import { Html5QrcodeScanner } from 'html5-qrcode';
// import { useEffect } from 'react';

// const qrcodeRegionId = "html5qr-code-full-region";

// const createConfig = (props: any) => {
//   let config: any = {};
//   if (props.fps) {
//     config.fps = props.fps;
//   }
//   if (props.qrbox) {
//     config.qrbox = props.qrbox;
//   }
//   if (props.aspectRatio) {
//     config.aspectRatio = props.aspectRatio;
//   }
//   if (props.disableFlip !== undefined) {
//     config.disableFlip = props.disableFlip;
//   }
//   return config;
// };

// const Html5QrcodePlugin = (props: any) => {
//   useEffect(() => {
//     const config = createConfig(props);
//     const verbose = props.verbose === true;

//     // Request camera permission
//     navigator.mediaDevices
//       .getUserMedia({ video: true })
//       .then(() => {
//         // Permission granted, proceed with scanner setup
//         if (!(props.qrCodeSuccessCallback)) {
//           throw "qrCodeSuccessCallback is a required callback.";
//         }

//         const html5QrcodeScanner = new Html5QrcodeScanner(
//           qrcodeRegionId,
//           config,
//           verbose
//         );

//         html5QrcodeScanner.render(
//           props.qrCodeSuccessCallback,
//           props.qrCodeErrorCallback
//         );  

//         // Cleanup function when component will unmount
//         return () => {
//           html5QrcodeScanner.clear().catch((error) => {
//             console.error("Failed to clear html5QrcodeScanner. ", error);
//           });
//         };
//       })
//       .catch((error) => {
//         // Handle permission denied or other errors
//         console.error("Failed to access camera. ", error);
//       });
//   }, []);

//   return (
//     <>
//       <div className='text-center'>
//         Scan the provider QR code to initiate claim cycle
//       </div>
//       <div id={qrcodeRegionId} />
//     </>
//   );
// };

// export default Html5QrcodePlugin;

import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useState } from 'react';

interface Html5QrcodePluginProps {
  fps?: number;
  qrbox?: number;
  aspectRatio?: number;
  disableFlip?: boolean;
  verbose?: boolean;
  qrCodeSuccessCallback: any;
  qrCodeErrorCallback?: any;
  onStartScanner?: () => void;
  onStopScanner?: () => void;
}

const qrcodeRegionId = "html5qr-code-full-region";

const createConfig = (props: Html5QrcodePluginProps) => {
  let config: any = {};
  if (props.fps) {
    config.fps = props.fps;
  }
  if (props.qrbox) {
    config.qrbox = props.qrbox;
  }
  if (props.aspectRatio) {
    config.aspectRatio = props.aspectRatio;
  }
  if (props.disableFlip !== undefined) {
    config.disableFlip = props.disableFlip;
  }
  return config;
};

const Html5QrcodePlugin: React.FC<Html5QrcodePluginProps> = (props) => {
  const [isScanning, setIsScanning] = useState(false);
  let html5QrcodeScanner: Html5QrcodeScanner | undefined;

  const startScanner = () => {
    if (html5QrcodeScanner) {
      html5QrcodeScanner.clear().catch((error) => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    }

    const config = createConfig(props);
    const verbose = props.verbose === true;

    html5QrcodeScanner = new Html5QrcodeScanner(
      qrcodeRegionId,
      config,
      verbose
    );

    html5QrcodeScanner.render(
      props.qrCodeSuccessCallback,
      props.qrCodeErrorCallback
    );

    setIsScanning(true);

    if (props.onStartScanner) {
      props.onStartScanner();
    }
  };

  const stopScanner = () => {
    if (html5QrcodeScanner) {
      html5QrcodeScanner.clear().catch((error) => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });

      // Remove the HTML elements used by the scanner
      const qrcodeRegion = document.getElementById(qrcodeRegionId);
      if (qrcodeRegion) {
        qrcodeRegion.innerHTML = '';
      }

      // Optionally, you can also remove any event listeners added by the library
      // html5QrcodeScanner._element?.removeEventListener(...);

      setIsScanning(false);

      if (props.onStopScanner) {
        props.onStopScanner();
      }
    }
  };

  useEffect(() => {
    // Cleanup function when component will unmount
    return () => {
      stopScanner();
    };
  }, [props]);

  return (
    <>
      <div className='text-center pb-2'>
        Scan the provider QR code to initiate the claim cycle
      </div>
      <div className='m-auto bg-primary p-3 text-center w-30 rounded'>
        <button onClick={startScanner} className='text-white'>
          Start Scanner
        </button>
      </div>
      <div id={qrcodeRegionId} className='mt-3' />
    </>
  );
};

export default Html5QrcodePlugin;

