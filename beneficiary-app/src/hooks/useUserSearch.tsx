import { useState, useEffect, useCallback } from 'react';
import { searchUser } from '../services/hcxMockService';
import { useLocation } from 'react-router-dom';
import { isEmpty } from 'lodash';

export const useUserSearch = (mobile: string | null) => {
    const location = useLocation();
    
    const [userInfo, setUserInfo] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        if (!mobile) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await searchUser('user/search', mobile);
                if (location && !isEmpty(location.state) && 'insuranceId' in location.state) {
                    const filteredObject = response.data.find((ele: any) => ele.payorDetails.length > 0 && ele.payorDetails[0].insurance_id === location.state.insuranceId);
                    if (filteredObject) {
                        setUserInfo([filteredObject]);
                    }
                } else {
                    setUserInfo(response.data);
                }
            } catch (err) {
                setError(err);
                setUserInfo([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [mobile]);

    const findUserByDynamicKey = useCallback((key: string, value: string) =>  (userInfo ? [userInfo.find((ele: any) => ele.payorDetails.length > 0 && ele.payorDetails[0][key] === value)] : []), [userInfo]);

    return { userInfo, loading, error, findUserByDynamicKey };
};
