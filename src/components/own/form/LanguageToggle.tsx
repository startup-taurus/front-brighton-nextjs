import React, { useState, useRef } from 'react';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { useLanguage } from '../context/LanguageContext';

const LanguageToggle = ({ onChangeLanguage }: any) => {
  const { language, setLanguage } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [buttonWidth, setButtonWidth] = useState(0);

  const toggle = () => {
    if (!dropdownOpen && buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
    setDropdownOpen((prevState) => !prevState);
  };

  const countryFlags = {
    en: 'us',
    es: 'es',
  };

  const handleChangeLanguage = (language: string) => {
    console.log(language);

    setLanguage(language);
    onChangeLanguage();
  };

  return (
    <div className="language-toggle d-flex justify-content-end mb-3">
      <Dropdown isOpen={dropdownOpen} toggle={toggle} direction="down">
        <DropdownToggle
          caret
          color="primary"
          className="d-flex align-items-center px-3 w-auto"
          style={{ minWidth: '100px' }}
          innerRef={buttonRef}
        >
          <i
            className={`flag-icon flag-icon-${countryFlags[language as keyof typeof countryFlags]} px-2`}
          ></i>
          <span className="me-2">
            {language === 'en' ? 'English' : 'Español'}
          </span>
        </DropdownToggle>
        <DropdownMenu
          style={{
            width: buttonWidth ? `${buttonWidth}px` : '100%',
            minWidth: '100px',
          }}
        >
          <DropdownItem
            onClick={() => handleChangeLanguage('en')}
            active={language === 'en'}
          >
            <div className="d-flex align-items-center">
              <i className="flag-icon flag-icon-us me-2"></i>
              English
            </div>
          </DropdownItem>
          <DropdownItem
            onClick={() => handleChangeLanguage('es')}
            active={language === 'es'}
          >
            <div className="d-flex align-items-center">
              <i className="flag-icon flag-icon-es me-2"></i>
              Español
            </div>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default LanguageToggle;
