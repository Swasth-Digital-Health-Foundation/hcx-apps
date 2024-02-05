import { Html5QrcodeScanner } from 'html5-qrcode';
import React from 'react';
import { useEffect, useState } from 'react';
import { Html5QrcodePluginProps } from '../types'

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
  const { headerLable, startLable } = props;

  const startScanner = () => {
    if (html5QrcodeScanner) {
      html5QrcodeScanner.clear().catch((error: any) => {
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
      html5QrcodeScanner.clear().catch((error: any) => {
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
    <div>
      <div className='text-center pb-2'>
        {headerLable}
      </div>
      {!isScanning && (
        <div className='m-auto bg-primary p-3 text-center w-30 rounded'>
          <button onClick={startScanner} className='text-white'>
            {startLable}
          </button>
        </div>
      )}
      <div id={qrcodeRegionId} className='mt-3' />
    </div>
  );
};

export default Html5QrcodePlugin;

