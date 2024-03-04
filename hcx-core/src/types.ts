export interface MessageFields {
  styles?: {
    textColor: string;
    timeColor: string;
    background: string;
    translateX: any;
    menu: {
      color: string;
      background: string;
    };
    linkIconColor: string;
  };
  references: {
    itemRef?: any;
    isOpen: boolean;
    popupRef: any;
    senderNameRef: any;
    messageRef: any;
    text: string;
    name: string;
    time: string;
    app?: string;
    image?: string;
    link?: string;
  };
  handleLongPressStart?: () => void;
  handleLongPressEnd?: () => void;
  handleMenuOpen?: () => void;
}

export interface Html5QrcodePluginProps {
  fps?: number;
  qrbox?: number;
  aspectRatio?: number;
  disableFlip?: boolean;
  verbose?: boolean;
  qrCodeSuccessCallback: any;
  qrCodeErrorCallback?: any;
  onStartScanner?: () => void;
  onStopScanner?: () => void;
  headerLable: string;
  startLable: string;
}

export interface ActiveRequestsProps {
  insurance_id: string,
  claimType: string,
  claimID: string,
  status: string,
  apiCallId: string,
  participantCode: string,
  payorCode: string,
  mobile: string,
  billAmount: string,
  workflowId: string,
  patientMobileNumber: string,
  patientName: string,
  recipient_code: string,
  date: any;
  type: string;
  data: object[];
}

export type FaqItem = {
  active: number | null;
  handleToggle: (index: number) => void;
  faq: FAQ;
};

export type FAQ = {
  header: string;
  id: number;
  text: string;
  sender_code: any;
  date: any;
};

