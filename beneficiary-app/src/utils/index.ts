export const formatTime = (dateString: string | number) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};
export const formatDate = (dateString: string | number) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (dateString: string | number) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
};

export const getClaimSubTypeCode = (bundle: any): string => {
  if (!bundle || !bundle.entry) {
    return 'OPD';
  }
  const claimEntry = bundle.entry?.find(
    (e: any) => e.resource?.resourceType === 'Claim'
  );
  return claimEntry?.resource?.subType?.coding?.[0]?.code || 'OPD';
};

export function getPatientNameText(bundle: any): string {
  if (!bundle || !bundle.entry) {
    return '';
  }
  const patientEntry = bundle.entry?.find(
    (e: any) => e.resource?.resourceType === 'Patient'
  );
  const name = patientEntry?.resource?.name?.[0]?.text || '';
  return name;
}