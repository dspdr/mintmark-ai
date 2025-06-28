

import React, { useState, useCallback, ChangeEvent, useEffect } from 'react';
import { CoinDetails, AnalysisOptions, ImageFile, ImageType, GroundingMetadata, GroundingChunkWeb } from './types';
import { analyzeCoin } from './services/geminiService';
import ImageInput from './components/ImageInput';
import LoadingSpinner from './components/LoadingSpinner';
import AnalysisReport from './components/AnalysisReport'; 
import { SparklesIcon, InformationCircleIcon, CheckCircleIcon, ExternalLinkIcon } from './constants';
import { useTranslations } from './contexts/LanguageContext';
import { translations } from './translations'; // To access available languages

const initialCoinDetails: CoinDetails = { 
  year: '',
  denomination: '',
  country: '',
  metal: '',
  mintMark: '',
  isGraded: false,
  gradingAgency: '',
  grade: '',
  otherQuestions: '',
};

const initialAnalysisOptions: AnalysisOptions = {
  gradeAndCondition: true,
  mintageAndRarity: true,
  recentSalesData: true,
  gradeComparison: true,
  coinFingerprinting: false,
  other: false,
};

// Commenting out Safari check for now, as AI language handling might make this less critical
// or require different handling.
// const isSafariBrowser = (): boolean => {
//   const ua = navigator.userAgent.toLowerCase();
//   return ua.includes('safari/') && !ua.includes('chrome/') && !ua.includes('crios/') && !ua.includes('fxios/') && !ua.includes('edgios/');
// };


const App: React.FC = () => {
  const { t, language, setLanguage } = useTranslations();
  const [obverseImage, setObverseImage] = useState<ImageFile | null>(null); // This is now the primary image
  const [reverseImage, setReverseImage] = useState<ImageFile | null>(null); // This is the optional reverse
  const [coinDetails, setCoinDetails] = useState<CoinDetails>(initialCoinDetails);
  const [analysisOptions, setAnalysisOptions] = useState<AnalysisOptions>(initialAnalysisOptions);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [groundingSources, setGroundingSources] = useState<GroundingChunkWeb[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // const [isSafari, setIsSafari] = useState<boolean>(false);

  // useEffect(() => {
  //   setIsSafari(isSafariBrowser());
  // }, []);

  const handleImageSelect = useCallback((file: File, type: ImageType, previewUrl: string) => {
    const imageFile = { file, previewUrl, type };
    if (type === ImageType.OBVERSE) { // OBVERSE type is used for primary image
      setObverseImage(imageFile);
    } else {
      setReverseImage(imageFile);
    }
  }, []);

  const handleDetailsChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setCoinDetails(prev => ({ 
            ...prev, 
            [name]: checked,
            gradingAgency: checked ? prev.gradingAgency : '',
            grade: checked ? prev.grade : '',
        }));
    } else {
        setCoinDetails(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleAnalysisOptionChange = useCallback((optionKey: keyof AnalysisOptions) => {
    setAnalysisOptions(prev => ({ ...prev, [optionKey]: !prev[optionKey] }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!obverseImage) { // Only primary image is mandatory
      setError(t.errorMinPrimaryImage);
      return;
    }
    setError(null);
    setIsLoading(true);
    setAnalysisResult(null);
    setGroundingSources(null);

    try {
      // Pass the current language to the analyzeCoin function
      const { text, groundingMetadata } = await analyzeCoin(obverseImage, reverseImage, coinDetails, analysisOptions, language);
      setAnalysisResult(text);
      if (groundingMetadata?.groundingChunks) {
        const webChunks = groundingMetadata.groundingChunks
          .map(chunk => {
            if (chunk.web) {
              let finalUri = chunk.web.uri;
              try {
                const urlObj = new URL(chunk.web.uri);
                if (urlObj.hostname.includes('google.com') && urlObj.pathname === '/url') {
                  const targetUrl = urlObj.searchParams.get('url');
                  if (targetUrl) {
                    finalUri = targetUrl; 
                  }
                }
              } catch (e) {
                console.warn(`Could not parse URI for grounding source: ${chunk.web.uri}`, e);
              }
              return { ...chunk.web, uri: finalUri };
            }
            return undefined;
          })
          .filter(web => web !== undefined) as GroundingChunkWeb[];
        
        if (webChunks.length > 0) {
          setGroundingSources(webChunks);
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const isSubmitDisabled = isLoading || !obverseImage; // Submit disabled if loading or no primary image

  const handleShopOnEbay = () => {
    const baseUrl = 'https://www.ebay.com/sch/i.html?_nkw=';
    const queryComponents: string[] = [];

    const coreDetailsProvided = coinDetails.year || coinDetails.denomination || coinDetails.country || coinDetails.mintMark || coinDetails.grade;

    if (coinDetails.year) queryComponents.push(coinDetails.year.trim());
    if (coinDetails.country) queryComponents.push(coinDetails.country.trim());
    if (coinDetails.denomination) queryComponents.push(coinDetails.denomination.trim());
    if (coinDetails.mintMark) queryComponents.push(coinDetails.mintMark.trim());
    
    queryComponents.push('coin');

    if (coinDetails.isGraded) {
      if (coinDetails.gradingAgency) queryComponents.push(coinDetails.gradingAgency.trim());
      if (coinDetails.grade) queryComponents.push(coinDetails.grade.trim());
      else queryComponents.push('certified'); // Graded but no specific agency/grade
    } else {
      // Only add "raw" if other significant details are present, to avoid "raw coin" as the only search term
      if (coreDetailsProvided || coinDetails.year || coinDetails.denomination || coinDetails.country || coinDetails.mintMark) {
        queryComponents.push('raw');
      }
    }

    const otherQuestionsLower = coinDetails.otherQuestions.toLowerCase();
    if (otherQuestionsLower.includes('error') && !queryComponents.map(qc => qc.toLowerCase()).includes('error')) queryComponents.push('error');
    if (otherQuestionsLower.includes('variety') && !queryComponents.map(qc => qc.toLowerCase()).includes('variety')) queryComponents.push('variety');
    if (otherQuestionsLower.includes('toned') && !queryComponents.map(qc => qc.toLowerCase()).includes('toned')) queryComponents.push('toned');
    if (otherQuestionsLower.includes('proof') && 
        !queryComponents.map(qc => qc.toLowerCase()).includes('proof') && 
        !coinDetails.grade?.toLowerCase().match(/p[rf]/) && // check if grade already implies proof
        !coinDetails.denomination?.toLowerCase().includes('proof')) { // check if denomination implies proof
      queryComponents.push('proof');
    }

    let searchQuery = queryComponents.filter(part => part && part.trim() !== '').join(' ');

    // Fallback if very few specifics are provided
    const significantQueryParts = queryComponents.filter(part => !['coin', 'raw', 'certified', 'proof', 'error', 'variety', 'toned'].includes(part.toLowerCase()));
    if (significantQueryParts.length === 0) {
        searchQuery = 'coin'; 
    }
    
    const url = baseUrl + encodeURIComponent(searchQuery);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSearchWebForCoin = () => {
    const baseUrl = 'https://www.google.com/search?q=';
    const queryComponents: string[] = [];

    const coreQueryDetailsProvided = coinDetails.year || coinDetails.denomination || coinDetails.country || coinDetails.mintMark || coinDetails.grade;

    if (coinDetails.year) queryComponents.push(coinDetails.year.trim());
    if (coinDetails.country) queryComponents.push(coinDetails.country.trim());
    if (coinDetails.denomination) queryComponents.push(coinDetails.denomination.trim());
    if (coinDetails.mintMark) queryComponents.push(coinDetails.mintMark.trim());

    queryComponents.push('coin');

    const otherQuestionsLower = coinDetails.otherQuestions.toLowerCase();
    let specificContextAdded = false;
    if (otherQuestionsLower.includes('value') && !queryComponents.map(qc => qc.toLowerCase()).includes('value')) { queryComponents.push('value'); specificContextAdded = true; }
    if (otherQuestionsLower.includes('history') && !queryComponents.map(qc => qc.toLowerCase()).includes('history')) { queryComponents.push('history'); specificContextAdded = true; }
    if (otherQuestionsLower.includes('mintage') && !queryComponents.map(qc => qc.toLowerCase()).includes('mintage')) { queryComponents.push('mintage'); specificContextAdded = true; }
    if (otherQuestionsLower.includes('identification') && !queryComponents.map(qc => qc.toLowerCase()).includes('identification')) { queryComponents.push('identification'); specificContextAdded = true; }
    
    if (coinDetails.isGraded) {
      if (coinDetails.gradingAgency) queryComponents.push(coinDetails.gradingAgency.trim());
      if (coinDetails.grade) queryComponents.push(coinDetails.grade.trim());
    }
    
    if (otherQuestionsLower.includes('error') && !queryComponents.map(qc => qc.toLowerCase()).includes('error')) queryComponents.push('error');
    if (otherQuestionsLower.includes('variety') && !queryComponents.map(qc => qc.toLowerCase()).includes('variety')) queryComponents.push('variety');

    // Add a general informational term if no specific context was added from otherQuestions, but core details are present
    if (!specificContextAdded && (coreQueryDetailsProvided || coinDetails.year || coinDetails.denomination || coinDetails.country || coinDetails.mintMark)) {
        queryComponents.push('information');
    }
    
    let searchQuery = queryComponents.filter(part => part && part.trim() !== '').join(' ');
    
    const significantQueryParts = queryComponents.filter(part => !['coin', 'information', 'value', 'history', 'mintage', 'identification', 'error', 'variety'].includes(part.toLowerCase()));
    if (significantQueryParts.length === 0 && !specificContextAdded) { // If only generic terms and no specific contexts were added
        searchQuery = 'coin information'; 
    } else if (significantQueryParts.length === 0 && specificContextAdded) {
        // If specific context (e.g. "value") was added from otherQuestions, but no other coin details,
        // the query might be something like "coin value", which is acceptable.
    }


    const url = baseUrl + encodeURIComponent(searchQuery);
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  const analysisOptionDisplayMap: Record<keyof AnalysisOptions, {label: string, description: string}> = {
    gradeAndCondition: { label: t.analysisOptionGradeAndCondition, description: t.analysisOptionGradeAndConditionDesc },
    mintageAndRarity: { label: t.analysisOptionMintageAndRarity, description: t.analysisOptionMintageAndRarityDesc },
    recentSalesData: { label: t.analysisOptionRecentSalesData, description: t.analysisOptionRecentSalesDataDesc },
    gradeComparison: { label: t.analysisOptionGradeComparison, description: t.analysisOptionGradeComparisonDesc },
    coinFingerprinting: { label: t.analysisOptionCoinFingerprinting, description: t.analysisOptionCoinFingerprintingDesc },
    other: { label: t.analysisOptionOther, description: ""}, // No specific description for "Other" itself
  };

  // if (isSafari) { // Safari notice commented out
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-800 dark:to-sky-900 text-slate-800 dark:text-slate-200 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center">
  //       <div className="max-w-md mx-auto text-center p-8 bg-white dark:bg-slate-800 shadow-xl rounded-xl ring-1 ring-slate-900/5">
  //         <InformationCircleIcon className="w-16 h-16 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
  //         <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{t.safariNoticeTitle}</h1>
  //         <p className="text-slate-600 dark:text-slate-300">{t.safariNoticeP1}</p>
  //         <p className="mt-2 text-slate-600 dark:text-slate-300">{t.safariNoticeP2}</p>
  //         <a
  //           href="https://www.google.com/chrome/"
  //           target="_blank"
  //           rel="noopener noreferrer"
  //           className="mt-6 inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md transition-colors"
  //         >
  //           {t.safariNoticeButton}
  //         </a>
  //       </div>
  //       <footer className="text-center mt-12 py-6 border-t border-slate-300 dark:border-slate-700 w-full max-w-4xl">
  //        <p className="text-sm text-slate-600 dark:text-slate-400">{t.footerText.replace('{year}', new Date().getFullYear().toString())}</p>
  //       </footer>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 dark:from-slate-800 dark:to-sky-900 text-slate-800 dark:text-slate-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
                <SparklesIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{t.appTitle}</h1>
            </div>
            <div className="relative">
                <label htmlFor="language-select" className="sr-only">{t.languageSelectorLabel}</label>
                 <select
                    id="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="language-selector block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                >
                    {Object.keys(translations).map((langCode) => (
                    <option key={langCode} value={langCode}>
                        {langCode.toUpperCase()}
                    </option>
                    ))}
                </select>
            </div>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-300 text-center">
            {t.appSubtitle}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="p-6 bg-white dark:bg-slate-800 shadow-xl rounded-xl ring-1 ring-slate-900/5">
            <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-white border-b pb-3 border-slate-300 dark:border-slate-600">{t.coinImagesTitle}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <ImageInput
                id="primaryImage" // Changed id for clarity
                label={t.primaryImageLabel} // Use new label
                imageType={ImageType.OBVERSE} // Still treated as OBVERSE internally for simplicity
                onImageSelect={handleImageSelect}
                currentPreviewUrl={obverseImage?.previewUrl || null}
              />
              <ImageInput
                id="reverseImage" // Changed id for clarity
                label={t.optionalReverseImageLabel} // Use new label
                imageType={ImageType.REVERSE}
                onImageSelect={handleImageSelect}
                currentPreviewUrl={reverseImage?.previewUrl || null}
              />
            </div>
             <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              <InformationCircleIcon className="inline w-4 h-4 mr-1"/>
              {t.imageInputInfo}
            </p>
          </section>

          <section className="p-6 bg-white dark:bg-slate-800 shadow-xl rounded-xl ring-1 ring-slate-900/5">
            <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-white border-b pb-3 border-slate-300 dark:border-slate-600">{t.knownCoinDetailsTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-slate-700 dark:text-slate-200">{t.yearLabel}</label>
                <input type="text" name="year" id="year" value={coinDetails.year} onChange={handleDetailsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
              </div>
              <div>
                <label htmlFor="denomination" className="block text-sm font-medium text-slate-700 dark:text-slate-200">{t.denominationLabel}</label>
                <input type="text" name="denomination" id="denomination" value={coinDetails.denomination} onChange={handleDetailsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-200">{t.countryLabel}</label>
                <input type="text" name="country" id="country" value={coinDetails.country} onChange={handleDetailsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
              </div>
              <div>
                <label htmlFor="metal" className="block text-sm font-medium text-slate-700 dark:text-slate-200">{t.metalLabel}</label>
                <input type="text" name="metal" id="metal" value={coinDetails.metal} onChange={handleDetailsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="mintMark" className="block text-sm font-medium text-slate-700 dark:text-slate-200">{t.mintMarkLabel}</label>
                <input type="text" name="mintMark" id="mintMark" value={coinDetails.mintMark} onChange={handleDetailsChange} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" />
              </div>
              
              <div className="md:col-span-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="relative flex items-start">
                    <div className="flex h-6 items-center">
                        <input
                        id="isGraded"
                        name="isGraded"
                        type="checkbox"
                        checked={!!coinDetails.isGraded}
                        onChange={handleDetailsChange}
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:ring-offset-slate-800"
                        />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                        <label htmlFor="isGraded" className="font-medium text-slate-900 dark:text-slate-100">
                        {t.isGradedLabel}
                        </label>
                    </div>
                </div>
              </div>

              {coinDetails.isGraded && (
                <>
                  <div className="md:col-span-1">
                    <label htmlFor="gradingAgency" className="block text-sm font-medium text-slate-700 dark:text-slate-200">{t.gradingAgencyLabel}</label>
                    <input 
                      type="text" 
                      name="gradingAgency" 
                      id="gradingAgency" 
                      value={coinDetails.gradingAgency} 
                      onChange={handleDetailsChange} 
                      className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" 
                      placeholder={t.gradingAgencyPlaceholder} 
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label htmlFor="grade" className="block text-sm font-medium text-slate-700 dark:text-slate-200">{t.assignedGradeLabel}</label>
                    <input 
                      type="text" 
                      name="grade" 
                      id="grade" 
                      value={coinDetails.grade} 
                      onChange={handleDetailsChange} 
                      className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2" 
                      placeholder={t.assignedGradePlaceholder} 
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="p-6 bg-white dark:bg-slate-800 shadow-xl rounded-xl ring-1 ring-slate-900/5">
            <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-white border-b pb-3 border-slate-300 dark:border-slate-600">{t.requestedAnalysisTitle}</h2>
            <div className="space-y-4">
              {(Object.keys(analysisOptions) as Array<keyof AnalysisOptions>).map((key) => (
                <div key={key} className="relative flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      id={key}
                      name={key}
                      type="checkbox"
                      checked={analysisOptions[key]}
                      onChange={() => handleAnalysisOptionChange(key)}
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:ring-offset-slate-800"
                    />
                  </div>
                  <div className="ml-3 text-sm leading-6">
                    <label htmlFor={key} className="font-medium text-slate-900 dark:text-slate-100">
                      {analysisOptionDisplayMap[key].label}
                    </label>
                    {analysisOptionDisplayMap[key].description && (
                         <p className="text-slate-500 dark:text-slate-400">{analysisOptionDisplayMap[key].description}</p>
                    )}
                  </div>
                </div>
              ))}
              {analysisOptions.other && (
                <div className="mt-4">
                  <label htmlFor="otherQuestions" className="block text-sm font-medium text-slate-700 dark:text-slate-200">{t.otherQuestionsLabel}</label>
                  <textarea
                    name="otherQuestions"
                    id="otherQuestions"
                    rows={3}
                    value={coinDetails.otherQuestions}
                    onChange={handleDetailsChange}
                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                    placeholder={t.otherQuestionsPlaceholder}
                  />
                </div>
              )}
            </div>
          </section>

          <div className="pt-2">
            {error && <p className="text-center text-red-600 dark:text-red-400 mb-4">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`w-full flex items-center justify-center rounded-md px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors duration-150 ease-in-out
                ${isSubmitDisabled 
                  ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900'}`}
            >
              {isLoading ? <LoadingSpinner /> : <><SparklesIcon className="w-5 h-5 mr-2" /> {t.submitButtonDefault}</>}
            </button>
          </div>
        </form>

        {!isLoading && (analysisResult || groundingSources) && (
          <section className="mt-12">
            {analysisResult && (
                 <h2 className="text-3xl font-semibold mb-6 text-slate-900 dark:text-white flex items-center">
                    <CheckCircleIcon className="w-8 h-8 mr-3 text-green-500"/>
                    {t.analysisReportTitle}
                </h2>
            )}
            <AnalysisReport analysisResultText={analysisResult} groundingSources={groundingSources} />
          </section>
        )}

        {!isLoading && analysisResult && (
          <section className="mt-8 p-6 bg-white dark:bg-slate-800 shadow-xl rounded-xl ring-1 ring-slate-900/5">
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">{t.nextStepsTitle}</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleShopOnEbay}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-orange-500"
              >
                <ExternalLinkIcon className="w-5 h-5 mr-2" />
                {t.shopOnEbayButton}
              </button>
              <button
                type="button"
                onClick={handleSearchWebForCoin}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-sky-500"
              >
                <ExternalLinkIcon className="w-5 h-5 mr-2" />
                {t.searchWebButton}
              </button>
            </div>
          </section>
        )}
      </div>
      <footer className="text-center mt-12 py-6 border-t border-slate-300 dark:border-slate-700">
        <p className="text-sm text-slate-600 dark:text-slate-400">{t.footerText.replace('{year}', new Date().getFullYear().toString())}</p>
      </footer>
    </div>
  );
};

export default App;