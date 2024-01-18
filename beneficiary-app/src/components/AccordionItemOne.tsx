import React, { useRef } from 'react'
import { FaqItem } from '../types/faqItem';

const AccordionItemOne: React.FC<FaqItem> = ({ active, handleToggle, faq }) => {
  const contentEl = useRef<HTMLDivElement>(null);

  const { header, id, text, sentBy, date } = faq;

  return (
    <div className="px-3 border-stroke border-b-2 dark:border-strokedark dark:shadow-none">
      <div>
        <button
          className={`flex w-full items-center justify-between gap-1.5 sm:gap-3 xl:gap-6 ${active === id ? 'active' : ''
            }`}
          onClick={() => handleToggle(Number(id))}
        >
          <div className='flex items-center gap-3'>
            <div>
              <svg
                className="fill-current duration-300 ease-in-out"
                width="25"
                height="25"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.9688 1.57495H7.03135C3.43135 1.57495 0.506348 4.41558 0.506348 7.90308C0.506348 11.3906 2.75635 13.8375 8.26885 16.3125C8.40947 16.3687 8.52197 16.3968 8.6626 16.3968C8.85947 16.3968 9.02822 16.3406 9.19697 16.2281C9.47822 16.0593 9.64697 15.75 9.64697 15.4125V14.2031H10.9688C14.5688 14.2031 17.522 11.3625 17.522 7.87495C17.522 4.38745 14.5688 1.57495 10.9688 1.57495ZM10.9688 12.9937H9.3376C8.80322 12.9937 8.35322 13.4437 8.35322 13.9781V15.0187C3.6001 12.825 1.74385 10.8 1.74385 7.9312C1.74385 5.14683 4.10635 2.8687 7.03135 2.8687H10.9688C13.8657 2.8687 16.2563 5.14683 16.2563 7.9312C16.2563 10.7156 13.8657 12.9937 10.9688 12.9937Z"
                  fill=""
                />
                <path
                  d="M5.42812 7.28442C5.0625 7.28442 4.78125 7.56567 4.78125 7.9313C4.78125 8.29692 5.0625 8.57817 5.42812 8.57817C5.79375 8.57817 6.075 8.29692 6.075 7.9313C6.075 7.56567 5.79375 7.28442 5.42812 7.28442Z"
                  fill=""
                />
                <path
                  d="M9.00015 7.28442C8.63452 7.28442 8.35327 7.56567 8.35327 7.9313C8.35327 8.29692 8.63452 8.57817 9.00015 8.57817C9.33765 8.57817 9.64702 8.29692 9.64702 7.9313C9.64702 7.56567 9.33765 7.28442 9.00015 7.28442Z"
                  fill=""
                />
                <path
                  d="M12.5719 7.28442C12.2063 7.28442 11.925 7.56567 11.925 7.9313C11.925 8.29692 12.2063 8.57817 12.5719 8.57817C12.9375 8.57817 13.2188 8.29692 13.2188 7.9313C13.2188 7.56567 12.9094 7.28442 12.5719 7.28442Z"
                  fill=""
                />
              </svg>
            </div>
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
          <p className="font-sm font-medium text-black mt-4 dark:text-white">Sent by : {sentBy}</p>
        </div>
        <p className="py-2 text-xs text-black dark:text-white">{date}</p>
      </div>
    </div>
  );
};

export default AccordionItemOne
