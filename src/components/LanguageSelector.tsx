import { useState, useEffect, createContext, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Select, ConfigProvider } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';

const { Option } = Select;

interface LanguageOption {
  code: string;
  name: string;
  antdLocale: any;
  dayjsLocale?: string;
}

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (languageCode: string) => void;
  languages: LanguageOption[];
  getCurrentAntdLocale: () => any;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n: i18nInstance } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18nInstance.language || 'en');

  const languages: LanguageOption[] = [
    {
      code: 'en',
      name: 'English',
      antdLocale: enUS,
      dayjsLocale: 'en'
    },
    {
      code: 'zh',
      name: '中文',
      antdLocale: zhCN,
      dayjsLocale: 'zh-cn'
    }
  ];

  useEffect(() => {
    // Initialize language from localStorage or i18n
    const savedLanguage = localStorage.getItem('language') || i18nInstance.language || 'en';
    setCurrentLanguage(savedLanguage);

    // Set initial dayjs locale
    const selectedLanguage = languages.find(lang => lang.code === savedLanguage);
    if (selectedLanguage?.dayjsLocale) {
      dayjs.locale(selectedLanguage.dayjsLocale);
    }
  }, [i18nInstance]);

  useEffect(() => {
    // Update local state when i18n language changes
    setCurrentLanguage(i18nInstance.language || 'en');
  }, [i18nInstance.language]);

  const changeLanguage = (languageCode: string) => {
    try {
      // Change i18next language
      i18nInstance.changeLanguage(languageCode);

      // Update local state
      setCurrentLanguage(languageCode);

      // Store preference in localStorage
      localStorage.setItem('language', languageCode);

      // Update dayjs locale
      const selectedLanguage = languages.find(lang => lang.code === languageCode);
      if (selectedLanguage?.dayjsLocale) {
        dayjs.locale(selectedLanguage.dayjsLocale);
      }
    } catch {
      // no-op
    }
  };

  const getCurrentAntdLocale = () => {
    const selectedLanguage = languages.find(lang => lang.code === currentLanguage);
    return selectedLanguage?.antdLocale || enUS;
  };

  const contextValue: LanguageContextType = {
    currentLanguage,
    changeLanguage,
    languages,
    getCurrentAntdLocale
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      <ConfigProvider locale={getCurrentAntdLocale()}>
        {children}
      </ConfigProvider>
    </LanguageContext.Provider>
  );
};

export function LanguageSelector() {
  const { currentLanguage, changeLanguage, languages } = useLanguage();

  return (
    <Select
      value={currentLanguage}
      onChange={changeLanguage}
      className="language-selector"
      style={{ width: 120 }}
      suffixIcon={<GlobalOutlined />}
      placeholder="Language"
    >
      {languages.map((language) => (
        <Option key={language.code} value={language.code}>
          {language.name}
        </Option>
      ))}
    </Select>
  );
}
