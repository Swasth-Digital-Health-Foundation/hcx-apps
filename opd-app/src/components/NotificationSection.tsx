import React, { useRef } from 'react'
import { FaqItem } from '../types/faqItem';
import * as _ from "lodash"

const NotificationSection: React.FC<FaqItem> = ({ active, handleToggle, faq }) => {
  const contentEl = useRef<HTMLDivElement>(null);

  const { header, id, text, sender_code, date } = faq;

  return (
    <div className="px-3 border-stroke border-b-2 dark:border-strokedark dark:shadow-none">
      {_.isEmpty(faq) ? <></> : <div>
        <button
          className={`flex w-full items-center justify-between gap-1.5 sm:gap-3 xl:gap-6 ${active === id ? 'active' : ''
            }`}
          onClick={() => handleToggle(Number(id))}
        >
          <div className='flex items-center gap-3'>
            <h4 className="text-left text-title-xsm font-medium text-black dark:text-white">
              {header}
            </h4>
          </div>
          <div className="flex h-10.5 w-full max-w-10.5 items-center justify-center rounded-md">
            <svg
              className={`fill-primary stroke-primary duration-200 ease-in-out dark:fill-white dark:stroke-white ${active === id ? 'rotate-90' : ''
                }`} width="8"
              height="16"
              viewBox="0 0 8 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.819531 15.1156C0.650781 15.1156 0.510156 15.0593 0.369531 14.9468C0.116406 14.6937 0.116406 14.3 0.369531 14.0468L6.27578 7.99995L0.369531 1.9812C0.116406 1.72808 0.116406 1.33433 0.369531 1.0812C0.622656 0.828076 1.01641 0.828076 1.26953 1.0812L7.62578 7.54995C7.87891 7.80308 7.87891 8.19683 7.62578 8.44995L1.26953 14.9187C1.15703 15.0312 0.988281 15.1156 0.819531 15.1156Z"
                fill=""
              />
            </svg>
          </div>
        </button>
        <div
          ref={contentEl}
          className={`relative duration-200 ease-in-out ${active === id ? 'block' : 'hidden'
            }`}
        >
          <p className="font-medium">{text}</p>
          <p className="font-sm font-medium text-black mt-4 dark:text-white">Sent by : {sender_code}</p>
        </div>
        <p className="py-2 text-xs text-black dark:text-white">{date}</p>
      </div>}
    </div>
  );
};

export default NotificationSection
