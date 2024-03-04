import * as _ from "lodash"
import { useEffect, useState } from "react";
import { getNotifications } from "../../services/hcxMockService";
import { toast } from "react-toastify";
import { NotificationPage } from "hcx-core";

const Notification = () => {
    const [notificationData, setNotificationData] = useState<any>([]);
    const [active, setActive] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const notificationPayload = {
        "participant_role": "bsp"
    }

    useEffect(() => {
        setLoading(true)
        getNotifications(notificationPayload).then((response: any) => {
            setNotificationData(_.get(response, 'data.result', []))
            setLoading(false)
        }).catch((err: any) => {
            setLoading(false)
            toast.error("Faild to get notifications")
        })
    }, [])

    const handleToggle = (index: number) => {
        if (active === index) {
            setActive(null);
        } else {
            setActive(index);
        }
    };

    const faqs: any = _.map(notificationData, (notification: any, index: any) => {
        if (notification?.sender_code) {
            return {
                id: index,
                header: notification?.topic_code,
                text: notification?.message,
                sender_code: notification?.sender_code,
                date: new Date(notification?.timestamp).toLocaleString()
            }
        }
        else {
            return []
        }
    })

    return (
        // <div>
        //     {!loading ? <div className="relative rounded-md border min-h-screen border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        //         <div className="back flex items-center text-left border-stroke border-b-2 text-2xl font-medium text-black dark:text-white">
        //             <div
        //                 className="pl-3 mb-1 flex flex-row align-middle"
        //                 onClick={() => navigate(-1)}
        //             >
        //                 <svg
        //                     className="w-6"
        //                     fill="currentColor"
        //                     viewBox="0 0 20 20"
        //                     xmlns="http://www.w3.org/2000/svg"
        //                 >
        //                     <path
        //                         fillRule="evenodd"
        //                         d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
        //                         clipRule="evenodd"
        //                     ></path>
        //                 </svg>
        //             </div>
        //             <h2 className="text-left p-3 text-1xl font-medium text-black dark:text-white">
        //                 Notifications
        //             </h2>
        //         </div>
        //         {_.isEmpty(notificationData) ? <>
        //             <h2 className="text-center p-3 text-2xl font-medium text-black dark:text-white">
        //                 No notifications available
        //             </h2>
        //         </> :
        //             <div className="grid grid-cols-1 gap-x-4">
        //                 <div className="flex flex-col">
        //                     {faqs.map((faq: any) => {
        //                         return (
        //                             <NotificationSection
        //                                 key={faq.id}
        //                                 active={active}
        //                                 handleToggle={handleToggle}
        //                                 faq={faq}
        //                             />
        //                         );
        //                     })}
        //                 </div>
        //             </div>
        //         }
        //     </div> : <TransparentLoader />}
        // </div>
        // <div>
        <div>
            <NotificationPage
                loading={loading}
                notificationData={notificationData}
                faqs={faqs}
                active={active}
                handleToggle={handleToggle} />
        </div>
    )
}

export default Notification