import * as _ from "lodash"
import { useState } from "react";
import AccordionItemOne from "../../components/AccordionItemOne";
import { useNavigate } from "react-router-dom";

const Notification = () => {
    const navigate = useNavigate()
    const notificationData = [
        {
            "topic_code": "notif-new-network-feature-added",
            "message": "Swasth-HCX now supports v0.9 on its platform. All participants can now initiate transactions relating to v0.9.",
            "sentBy": "hcxgateway.swasth@swasth-hcx-dev",
            "timestamp": 1705565618414
        },
        {
            "topic_code": "notif-gateway-downtime",
            "message": "HCX will be facing downtime from 09/01/2023 to 10/01/2023 due to planned maintenance. Sorry for inconvenience and please plan your operations accordingly.",
            "sentBy": "hcxgateway.swasth@swasth-hcx-dev",
            "timestamp": 1705565618414
        },
        {
            "topic_code": "notif-new-network-feature-added",
            "message": "HCX will be facing downtime from 09/01/2023 to 10/01/2023 due to planned maintenance. Sorry for inconvenience and please plan your operations accordingly.",
            "sentBy": "hcxgateway.swasth@swasth-hcx-dev",
            "timestamp": 1705565618414
        },
        {
            "topic_code": "notif-gateway-downtime",
            "message": "HCX will be facing downtime from 09/01/2023 to 10/01/2023 due to planned maintenance. Sorry for inconvenience and please plan your operations accordingly.",
            "sentBy": "hcxgateway.swasth@swasth-hcx-dev",
            "timestamp": 1705565618414
        },
        {
            "topic_code": "notif-new-network-feature-added",
            "message": "HCX will be facing downtime from 09/01/2023 to 10/01/2023 due to planned maintenance. Sorry for inconvenience and please plan your operations accordingly.",
            "sentBy": "hcxgateway.swasth@swasth-hcx-dev",
            "timestamp": 1705565618414
        },
        {
            "topic_code": "notif-gateway-downtime",
            "message": "HCX will be facing downtime from 09/01/2023 to 10/01/2023 due to planned maintenance. Sorry for inconvenience and please plan your operations accordingly.",
            "sentBy": "hcxgateway.swasth@swasth-hcx-dev",
            "timestamp": 1705565618414
        }
    ]

    const [active, setActive] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        if (active === index) {
            setActive(null);
        } else {
            setActive(index);
        }
    };

    const faqs: any = _.map(notificationData, (notification: any, index: any) => {
        return {
            id: index,
            header: notification?.topic_code,
            text: notification?.message,
            sentBy: notification?.sentBy,
            date: new Date(notification?.timestamp).toLocaleString()
        }
    })

    return (
        <div className="relative rounded-md border min-h-screen border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="back flex items-center text-left border-stroke border-b-2 text-2xl font-medium text-black dark:text-white">
                <div
                    className="pl-3 mb-1 flex flex-row align-middle"
                    onClick={() => navigate(-1)}
                >
                    <svg
                        className="w-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                </div>
                <h2 className="text-left p-3 text-2xl font-medium text-black dark:text-white">
                    Notifications
                </h2>
            </div>
            <div className="grid grid-cols-1 gap-x-4">
                <div className="flex flex-col">
                    {faqs.map((faq: any) => {
                        return (
                            <AccordionItemOne
                                key={faq.id}
                                active={active}
                                handleToggle={handleToggle}
                                faq={faq}
                            />
                        );
                    })}
                </div>
            </div>

        </div>
    )
}

export default Notification