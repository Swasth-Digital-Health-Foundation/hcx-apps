import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useState } from 'react';
import Logo from "../../../public/qr-code-scan-icon.png";

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
      <div className='text-center'>
        Scan the provider QR code to initiate the claim cycle
      </div>
      {!isScanning && (
        <>
          <div className='m-auto p-1 text-center w-30 rounded'>
            <button onClick={startScanner} className='text-white mt-3'>
              <div>
                <img className="inline w-15 h-15 m-auto" src={Logo} alt="Logo" />
              </div>
              Start Scanner
            </button>
          </div>
        </>
      )}
      <div id={qrcodeRegionId} className='mt-1' />
    </>
  );
};

export default Html5QrcodePlugin;
