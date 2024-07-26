import React, { useState, useEffect } from 'react';
import Select, { MultiValue, SingleValue, StylesConfig } from 'react-select';
import axios from 'axios';
import { delay } from 'lodash';

export interface Option {
  value: string;
  label: string;
  system:string;
}

interface MultiProps {
    label:string;
    onSelect:(selected:MultiValue<Option>) => void;
}

const MultiSelectSearch: React.FC<MultiProps> = ({ label, onSelect }:MultiProps) =>  {
  const [query, setQuery] = useState<string>('');
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<MultiValue<Option>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query) {
        setIsLoading(true);
        fetchOptions(query);
      }
    }, 500); // Adjust the delay as needed

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchOptions = async (searchQuery: string) => {
    try {
        setIsLoading(true);
        let dataUser: any = [];
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://staging-hcx.swasth.app/hapi-fhir/fhir/ValueSet/$expand?url=https://example.com/dhruv3&filter=${query}`,
            headers: { }
          };
          
          axios.request(config)
          .then((response) => {
            response.data.expansion.contains? response.data.expansion.contains.map((value: any, index: any) => {
                dataUser.push({"value": value.code, "label":value.display,"system":value.system})
              }) : null;
              setOptions(dataUser);
          });
          let config1 = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://staging-hcx.swasth.app/hapi-fhir/fhir/ValueSet/$expand?url=https://staging-hcx.swasth.app/hapi-fhir/fhir/ValueSet/example-vs-01&filter=${query}`,
            headers: { }
          };
          axios.request(config1)
          .then((response) => {
            
            response.data.expansion.contains? response.data.expansion.contains.map((value: any, index: any) => {
                dataUser.push({"value": value.code, "label":value.display,"system":value.system})
              }) : null;
              setOptions(dataUser);
            }).catch(err => {
              console.error('Error fetching options:', err);
            });
    } catch (error) {
      console.error('Error fetching options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (inputValue: string) => {
    setQuery(inputValue);
  };

  const handleChange = (selected: MultiValue<Option> | SingleValue<Option>) => {
    console.log("option",selected);
    setSelectedOptions(selected as MultiValue<Option>);
    onSelect(selected as MultiValue<Option>);
  };

  const customStyles: StylesConfig<Option, true> = {
    control: (provided, state) => ({
      ...provided,
      display: 'flex',
      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db', // Tailwind colors: blue-500 and gray-300
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#3b82f6' : '#9ca3af', // Tailwind colors: blue-500 and gray-400
      },
      padding: '2px',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#e5e7eb', // Tailwind color: gray-200
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#1f2937', // Tailwind color: gray-800
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#6b7280', // Tailwind color: gray-500
      '&:hover': {
        backgroundColor: '#9ca3af', // Tailwind color: gray-400
        color: '#1f2937', // Tailwind color: gray-800
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 50,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#3b82f6' : '#ffffff', // Tailwind color: blue-500 and white
      color: state.isFocused ? '#ffffff' : '#1f2937', // Tailwind color: white and gray-800
      '&:hover': {
        backgroundColor: '#3b82f6', // Tailwind color: blue-500
        color: '#ffffff', // Tailwind color: white
      },
    }),
  };

  return (
    <div>
      <label className="mb-2.5 mt-3 block text-left font-bold text-black dark:text-white">
        {label}
      </label>
      <Select
        isMulti
        isLoading={isLoading}
        options={options}
        value={selectedOptions}
        onInputChange={handleInputChange}
        onChange={handleChange}
        placeholder="Search and select..."
        noOptionsMessage={() => (query ? 'No results found' : 'Type to search')}
        styles={customStyles}
      />
    </div>
  );
};

export default MultiSelectSearch;
