const PayorDetailsCard = ({ onInputChange, cardKey, searchResults}: any) => {
  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    // Pass the updated data back to the parent component
    onInputChange({ [name]: value });
  };
  return (
    <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
     <h2 className="sm:text-title-xl1 mb-2 text-2xl font-bold text-black dark:text-white">
            {"Insurance Details"}
          </h2>
          <div className="rounded-lg mb-3 border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex flex-col gap-5.5 p-3">
              <label className="block text-left font-medium text-black dark:text-white">
                {"Beneficiary name *"}
              </label>
              <div className="-mt-2 relative">
                <input
                  required
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter beneficiary name"
                  className={
                    'w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
                  }
                />
              </div>
              <label className="-mt-2 block text-left font-medium text-black dark:text-white">
                {" Insurance ID *"}
              </label>
              <div className="-mt-2 relative">
                <input
                  required
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter insurance id"
                  className={
                    'w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
                  }
                />
              </div>
              <div>
                <h2 className="-mt-2 block text-left font-medium text-black dark:text-white">
                  Payor name *:
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search insurer name"
                      value={payorName}
                      required
                      onChange={(e) => {
                        const inputText = e.target.value;
                        setPayorName(inputText)
                        const hasMatchingRecords = searchResults.some((result: any) =>
                          result.participant_name.toLowerCase().includes(inputText.toLowerCase())
                        );
                        setOpenDropdown(hasMatchingRecords);
                      }
                      }
                      // onChange={(e) => setPayorName(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />

                    <span
                      className="absolute top-8 right-4 z-30 -translate-y-1/2"
                      onClick={() => {
                        setOpenDropdown(!openDropdown);
                      }}
                    >
                      <svg
                        className="fill-current"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g opacity="0.8">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                            fill=""
                          ></path>
                        </g>
                      </svg>
                    </span>
                    {filteredResults.length !== 0 && openDropdown ? (
                      <div className="max-h-40 overflow-y-auto overflow-x-hidden">
                        <ul className="border-gray-300 left-0 w-full rounded-lg bg-gray px-2 text-black">
                          {_.map(filteredResults, (result: any, index: any) => (
                            <li
                              key={index}
                              onClick={() => {
                                setOpenDropdown(!openDropdown)
                                handleSelect(
                                  result?.participant_name,
                                  result?.participant_code
                                )
                              }
                              }
                              className="hover:bg-gray-200 cursor-pointer p-2"
                            >
                              {result?.participant_name +
                                `(${result?.participant_code})` || ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <></>
                    )}

                  </div>
                </h2>
                <div className='items-center'>
                  <label className="mt-2 block text-left font-medium text-black dark:text-white">
                    {" Participant code : *"}
                  </label>
                  <div className="mt-2 relative">
                    <input
                      disabled
                      required
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Search above for participant code"
                      className={
                        'w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
      {/* <div className="flex flex-col gap-5.5 p-4">
        <div>
          <label className="mb-2.5 block text-left font-medium text-black dark:text-white">
            Payor Details *
          </label>
          <div className="relative z-20 bg-white dark:bg-form-input">
            <select
              required
              name={`payor`}
              onChange={handleInputChange}
              className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-4 px-6 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
            >
              <option value="none">none</option>
              <option value="wemeanhospital Mock Payor">wemeanhospital Mock Payor</option>
            </select>
            <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity="0.8">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                    fill="#637381"
                  ></path>
                </g>
              </svg>
            </span>
          </div>
        </div>
        <div>
          <label className="mb-2.5 block text-left font-medium text-black dark:text-white">
            Insurance ID *
          </label>
          <div className="relative">
            <input
              required
              name={`insurance_id`}
              onChange={handleInputChange}
              type="text"
              placeholder="Insurance ID"
              className={
                'w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary'
              }
            />
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default PayorDetailsCard;
