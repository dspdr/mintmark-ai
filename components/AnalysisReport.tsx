

import React from 'react';
import { ParsedAnalysisSection, GroundingChunkWeb } from '../types';
import { InformationCircleIcon, SparklesIcon } from '../constants';
import { useTranslations } from '../contexts/LanguageContext';
// No longer need direct import of translations object here for salesDisclaimerOriginalEnglish
// import { translations } from '../translations'; 

// Helper to render inline styles (bold, italic)
const renderInlineFormatting = (text: string): React.ReactNode[] => {
  if (typeof text !== 'string') return [text];
  return text.split(/(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('__') && part.endsWith('__')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith('_') && part.endsWith('_')) return <em key={index}>{part.slice(1, -1)}</em>;
    return part;
  });
};

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  if (!text || typeof text !== 'string') return null;

  const output: React.ReactNode[] = [];
  const blocks = text.trim().split(/\n\s*\n/); 

  blocks.forEach((block) => {
    const lines = block.split('\n');
    let currentListItems: string[] = [];
    let listType: 'ul' | 'ol' | null = null;
    let paragraphBuffer: string[] = [];

    const flushParagraphBuffer = () => {
      if (paragraphBuffer.length > 0) {
        const paragraphContent = paragraphBuffer.join(' '); 
        output.push(
          <p key={`p-${output.length}-${Math.random()}`} className="my-2 leading-relaxed">
            {renderInlineFormatting(paragraphContent)}
          </p>
        );
        paragraphBuffer = [];
      }
    };

    const flushListBuffer = () => {
      if (currentListItems.length > 0 && listType) {
        const Tag = listType as keyof JSX.IntrinsicElements;
        output.push(
          <Tag 
            key={`list-${output.length}-${Math.random()}`} 
            className={`list-inside space-y-1 my-2 pl-5 ${listType === 'ol' ? 'list-decimal' : 'list-disc'}`}
          >
            {currentListItems.map((item, itemIndex) => (
              <li key={itemIndex}>{renderInlineFormatting(item)}</li>
            ))}
          </Tag>
        );
        currentListItems = [];
        listType = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      const unorderedMatch = trimmedLine.match(/^\s*([-*+])\s+(.*)/);
      const orderedMatch = trimmedLine.match(/^\s*(\d+)\.\s+(.*)/);

      if (unorderedMatch || orderedMatch) {
        flushParagraphBuffer(); 

        const currentItemContent = unorderedMatch ? unorderedMatch[2] : (orderedMatch ? orderedMatch[2] : '');
        const currentLineListType = orderedMatch ? 'ol' : 'ul';

        if (listType && listType !== currentLineListType) {
          flushListBuffer(); 
        }
        listType = currentLineListType;
        currentListItems.push(currentItemContent);

      } else {
        flushListBuffer(); 
        if (trimmedLine !== "") { 
          paragraphBuffer.push(line); 
        } else if (paragraphBuffer.length > 0) {
           paragraphBuffer.push('');
        }
      }
    }
    flushParagraphBuffer();
    flushListBuffer();
  });

  return <>{output.length > 0 ? output : null}</>;
};

const parseAnalysisText = (text: string, salesDisclaimerInCurrentLang: string): ParsedAnalysisSection[] => {
  const sections: ParsedAnalysisSection[] = [];
  if (!text || text.trim() === "") return sections;

  // These are the English titles we *might* expect from the AI, even if content is translated.
  // The AI was asked to translate everything, so these might also be translated by AI.
  // The getTranslatedSectionTitle will try to map these back for UI consistency if they appear in English.
  const knownSectionTitlesFromPrompt = [
    "About Your Coin", "Requested Analysis", "Grade and Condition", 
    "The Four Pillars of Grading Defined", "Problem Coin Assessment", 
    "Mintage and Rarity", "Recent Sales Data", "Grade Comparison", 
    "Coin Fingerprint (Descriptive)", "Other Specific Questions", "Analysis Overview"
    // "Important Disclaimer" is also a possible title if AI creates it.
  ];
  
  // The disclaimer to match in the AI's response should be in the language the AI was asked to respond in.
  const salesDisclaimerToMatch = salesDisclaimerInCurrentLang;

  const blocks = text.trim().split(/\n\s*\n/); 
  
  let currentAccumulatedContent = "";
  let currentTitle = "Analysis Overview"; // Default title for any leading content

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const firstLineOfBlock = block.split('\n')[0].trim();
    let identifiedTitleThisBlock: string | null = null;

    // Try matching known English titles first (AI might keep some headers English based on prompt structure)
    for (const known of knownSectionTitlesFromPrompt) {
      const escapedKnownTitle = known.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const titleRegex = new RegExp(`^\\s*(?:-\\s*)?${escapedKnownTitle}(?::)?\\s*$`, 'i');
      if (firstLineOfBlock.match(titleRegex)) {
        identifiedTitleThisBlock = known; 
        break;
      }
    }
    
    // If not a known English title, try a more generic header detection.
    // This might catch AI-translated headers.
    if (!identifiedTitleThisBlock) {
        // Regex to capture potential titles: lines starting with capital letter, 
        // relatively short, possibly ending with a colon.
        const genericHeaderRegex = /^\s*(?:-\s*)?([A-ZÀ-ÖØ-Þ][A-Za-zÀ-ÖØ-öø-ÿ0-9_()\s,/'-]{3,80})(?::)?\s*$/;
        const match = firstLineOfBlock.match(genericHeaderRegex);
        
        if (match && match[1]) {
            const potentialTitleText = match[1].trim();
            const wordCount = potentialTitleText.split(/\s+/).length;
            // Avoid treating full sentences as titles
            const endsWithSentencePunctuation = /[.!?]$/.test(potentialTitleText);
            const hasColon = /:$/.test(firstLineOfBlock);

            if (wordCount <= 12 && (!endsWithSentencePunctuation || hasColon)) {
                 // If the block is just this line, or the line is short, more likely a title
                if (block.split('\n').length === 1 || firstLineOfBlock.length < 100) {
                     identifiedTitleThisBlock = potentialTitleText;
                }
            }
        }
    }

    if (identifiedTitleThisBlock) {
      if (currentAccumulatedContent.trim()) {
        sections.push({ title: currentTitle, content: currentAccumulatedContent.trim() });
      }
      currentTitle = identifiedTitleThisBlock; // This title could be English or AI-translated
      const contentLines = block.split('\n');
      currentAccumulatedContent = contentLines.length > 1 ? contentLines.slice(1).join('\n') : "";
    } else {
      currentAccumulatedContent += (currentAccumulatedContent ? '\n\n' : '') + block;
    }
  }

  if (currentAccumulatedContent.trim()) {
    sections.push({ title: currentTitle, content: currentAccumulatedContent.trim() });
  }
  
  let finalSections: ParsedAnalysisSection[] = [];
  let salesDataSectionExists = false;
  let alreadyHasStyledDisclaimer = false;

  for (const sec of sections) {
    let sectionContent = sec.content;
    let sectionTitle = sec.title; 
    let isDisclaimerSec = false;

    // Check if the current section *is* the sales disclaimer.
    // The AI was instructed to translate its response, so salesDisclaimerToMatch is in the target language.
    // Also, check against a generic English "Important Disclaimer" title from the AI.
    if (sectionContent.trim() === salesDisclaimerToMatch || 
        (sectionTitle.toLowerCase() === "important disclaimer" && sectionContent.trim() === salesDisclaimerToMatch)) {
        isDisclaimerSec = true;
        sectionTitle = "Important Disclaimer"; // Standardize for later translation by UI
        sectionContent = salesDisclaimerToMatch; // Use the matched (potentially translated by AI) content
        alreadyHasStyledDisclaimer = true; 
    } else {
        // If it's a "Recent Sales Data" section, remove the disclaimer if present within its content.
        // This is important because the AI might embed the disclaimer within this section.
        const salesDataTitleVariants = ["recent sales data", "datos de ventas recientes", "données de ventes récentes"];
        if (salesDataTitleVariants.some(variant => sectionTitle.toLowerCase().includes(variant))) {
            salesDataSectionExists = true;
            if (sectionContent.includes(salesDisclaimerToMatch)) {
                sectionContent = sectionContent.replace(salesDisclaimerToMatch, '').trim();
            }
        }
    }


    if (sectionContent.trim() || isDisclaimerSec) { 
      finalSections.push({ title: sectionTitle, content: sectionContent.trim(), isDisclaimer: isDisclaimerSec });
    }
  }
  
  // If a sales data section existed but we haven't added our styled disclaimer yet, add it.
  if (salesDataSectionExists && !alreadyHasStyledDisclaimer) {
    // Remove any plain text disclaimer that might have been parsed as a separate section
    const existingDisclaimerIndex = finalSections.findIndex(s => s.content === salesDisclaimerToMatch && !s.isDisclaimer);
    if(existingDisclaimerIndex > -1) {
      finalSections.splice(existingDisclaimerIndex, 1);
    }
    
    finalSections.push({ 
        title: "Important Disclaimer", // This key will be used by getTranslatedSectionTitle
        content: salesDisclaimerInCurrentLang, // Display the UI-translated disclaimer
        isDisclaimer: true 
    });
  }
  
  return finalSections;
};


interface AnalysisReportProps {
  analysisResultText: string | null;
  groundingSources: GroundingChunkWeb[] | null;
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({ analysisResultText, groundingSources }) => {
  const { t } = useTranslations(); // Removed 'language' as aiAnalysisLanguageNotice is removed

  if (!analysisResultText && (!groundingSources || groundingSources.length === 0)) {
    return null; 
  }
  
  // The sales disclaimer to match in AI's response should be in the current UI language,
  // as AI is instructed to respond in that language.
  const parsedSections = analysisResultText ? parseAnalysisText(analysisResultText, t.salesDisclaimerText) : [];

  const getTranslatedSectionTitle = (rawTitleFromAI: string): string => {
    // Titles from AI might be in English (if it didn't translate headers) or in the target language.
    // We try to map known English variations to our consistent translated UI titles.
    const titleLower = rawTitleFromAI.toLowerCase();
    if (titleLower === "analysis overview") return t.analysisReportAnalysisDetailsTitle;
    if (titleLower === "important disclaimer") return t.analysisReportImportantDisclaimerTitle;
    
    // For other common sections, compare against English keys if AI kept them English
    if (titleLower === "grade and condition") return t.analysisOptionGradeAndCondition;
    if (titleLower === "mintage and rarity") return t.analysisOptionMintageAndRarity;
    if (titleLower === "recent sales data") return t.analysisOptionRecentSalesData;
    if (titleLower === "grade comparison") return t.analysisOptionGradeComparison;
    if (titleLower === "coin fingerprint (descriptive)") return t.analysisOptionCoinFingerprinting;
    if (titleLower === "other specific questions") return t.analysisOptionOther; // or a more specific title if defined

    return rawTitleFromAI; // Return AI's title if no specific mapping found
  };

  // const showAiLanguageNotice = language !== 'en' && analysisResultText; // Notice removed


  if (parsedSections.length === 0 && analysisResultText && analysisResultText.trim() !== "") { 
    // This case handles if parsing fails completely but there's text; display it raw.
    return (
      <div className="space-y-6">
        {/* AI Language Notice removed */}
        <section className="p-6 bg-white dark:bg-slate-700 shadow-xl rounded-xl ring-1 ring-slate-900/5">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3 border-b pb-2 border-slate-200 dark:border-slate-600 flex items-center">
            <InformationCircleIcon className="w-6 h-6 mr-2 text-blue-500" />
            {t.analysisReportAnalysisDetailsTitle} 
          </h3>
          <MarkdownRenderer text={analysisResultText} />
        </section>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* AI Language Notice removed */}

      {parsedSections.map((section, index) => (
        <section 
          key={index} 
          className={`shadow-xl rounded-xl ring-1 ring-slate-900/5 overflow-hidden
            ${section.isDisclaimer 
              ? 'bg-amber-50 dark:bg-amber-900/70 border border-amber-500 dark:border-amber-700' 
              : 'bg-white dark:bg-slate-800'}`}
        >
          <div className={`px-6 py-4 ${section.isDisclaimer ? '' : 'border-b border-slate-200 dark:border-slate-700'}`}>
            <h3 className={`text-xl font-semibold flex items-center
              ${section.isDisclaimer 
                ? 'text-amber-700 dark:text-amber-200' 
                : 'text-slate-900 dark:text-white'}`}
            >
              {section.isDisclaimer 
                ? <InformationCircleIcon className="w-6 h-6 mr-3 text-amber-500 dark:text-amber-400" />
                : <SparklesIcon className="w-6 h-6 mr-3 text-blue-500 dark:text-blue-400" />}
              {getTranslatedSectionTitle(section.title)}
            </h3>
          </div>
          { (section.content.trim() || section.isDisclaimer) && 
            <div className={`px-6 py-4 ${section.isDisclaimer ? 'text-amber-700 dark:text-amber-300 text-sm' : 'text-slate-700 dark:text-slate-300'}`}>
              <MarkdownRenderer text={section.content} />
            </div>
          }
        </section>
      ))}

      {groundingSources && groundingSources.length > 0 && (
         <section className="p-6 bg-white dark:bg-slate-800 shadow-xl rounded-xl ring-1 ring-slate-900/5">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 border-b pb-2 border-slate-200 dark:border-slate-700 flex items-center">
            <InformationCircleIcon className="w-6 h-6 mr-3 text-blue-500 dark:text-blue-400"/>
            {t.analysisReportSourcesTitle}
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
            {groundingSources.map((source, idx) => (
              <li key={idx}>
                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline">
                  {source.title || source.uri}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default AnalysisReport;