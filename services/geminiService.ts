

import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { CoinDetails, AnalysisOptions, ImageFile, GroundingMetadata } from '../types';

const API_KEY = process.env.API_KEY;

const fileToGenerativePart = async (file: File): Promise<Part> => {
  console.log('[MintMark AI Debug] fileToGenerativePart: Starting for file -', file.name, 'Type:', file.type, 'Size:', file.size);
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        console.log('[MintMark AI Debug] fileToGenerativePart: FileReader success for', file.name);
        resolve(reader.result.split(',')[1]);
      } else {
        console.error('[MintMark AI Debug] fileToGenerativePart: FileReader result is not a string for', file.name);
        reject(new Error("Failed to read file as base64 string. Result was not a string."));
      }
    };
    reader.onerror = (error) => {
      console.error('[MintMark AI Debug] fileToGenerativePart: FileReader error for', file.name, error);
      reject(error);
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      mimeType: file.type,
      data: base64EncodedData,
    },
  };
};

const getFullLanguageName = (langCode: string): string => {
  switch (langCode) {
    case 'es':
      return 'Spanish';
    case 'fr':
      return 'French';
    case 'en':
    default:
      return 'English';
  }
};

export const analyzeCoin = async (
  primaryImage: ImageFile | null,
  reverseImage: ImageFile | null,
  details: CoinDetails,
  options: AnalysisOptions,
  currentLanguage: string // Added language parameter
): Promise<{ text: string; groundingMetadata?: GroundingMetadata | null }> => {
  console.log('[MintMark AI Debug] analyzeCoin: Function called.');
  console.log(`[MintMark AI Debug] analyzeCoin: Requested language for AI response: ${currentLanguage} (${getFullLanguageName(currentLanguage)})`);
  console.log('[MintMark AI Debug] analyzeCoin: Current API_KEY value:', API_KEY ? `"${API_KEY.substring(0, 5)}..."` : API_KEY);

  if (!API_KEY) {
    console.error('[MintMark AI Debug] analyzeCoin: API_KEY is not set. Throwing error.');
    throw new Error("API_KEY environment variable not set.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = 'gemini-2.5-flash-preview-04-17';

  const imageParts: Part[] = [];
  try {
    if (primaryImage) {
      console.log('[MintMark AI Debug] analyzeCoin: Processing primary image.');
      imageParts.push(await fileToGenerativePart(primaryImage.file));
    }
    if (reverseImage) {
      console.log('[MintMark AI Debug] analyzeCoin: Processing optional reverse image.');
      imageParts.push(await fileToGenerativePart(reverseImage.file));
    }
  } catch (fileError) {
    console.error('[MintMark AI Debug] analyzeCoin: Error processing image file(s).', fileError);
    throw new Error(`Failed to process image files: ${fileError instanceof Error ? fileError.message : String(fileError)}`);
  }
  
  console.log('[MintMark AI Debug] analyzeCoin: Image parts processed. Count:', imageParts.length);

  let imageDescriptionForPrompt = "Primary Image: " + (primaryImage ? '[Image provided - This may show the obverse, or both obverse and reverse if captured in a single photo]' : '[No primary image provided]');
  if (reverseImage) {
    imageDescriptionForPrompt += "\nSeparate Reverse Image: [Image provided]";
  } else {
    imageDescriptionForPrompt += "\nSeparate Reverse Image: [Not provided]";
  }

  let prompt = `You are an expert numismatist. Please analyze the coin based on the provided image(s) and details.
If only the primary image is provided, it may contain the obverse, or both obverse and reverse.
If a separate reverse image is also provided, consider both for a comprehensive analysis.
Refer to the comprehensive numismatic grading principles outlined below when assessing grade and condition.

Part 1: About Your Coin
Image(s) Provided:
${imageDescriptionForPrompt}

Known Details:
Year: ${details.year || 'Not provided'}
Denomination: ${details.denomination || 'Not provided'}
Country of Origin: ${details.country || 'Not provided'}
Metal (if known): ${details.metal || 'Not provided'}
Mint Mark (if visible): ${details.mintMark || 'Not provided'}`;

  if (details.isGraded) {
    prompt += `
This coin has been professionally graded:
  Grading Agency: ${details.gradingAgency || 'Not provided'}
  Assigned Grade: ${details.grade || 'Not provided'}`;
  }

prompt += `

Part 2: Requested Analysis
Please provide detailed information for the following selected services:
`;

  if (options.gradeAndCondition) {
    const isLikelyProof = details.grade?.toUpperCase().startsWith('PF') ||
                         details.grade?.toUpperCase().startsWith('PR') ||
                         details.denomination?.toLowerCase().includes('proof') ||
                         details.otherQuestions?.toLowerCase().includes('proof');

    prompt += `
- Grade and Condition:
  Your assessment should be based on a holistic evaluation of the "Four Pillars of Grading": Strike, Luster, Surface Preservation, and Eye Appeal.

  The Four Pillars of Grading Defined:
  1.  Strike: The quality and sharpness of the impression transferred from the coining dies to the planchet. A strong or "full" strike exhibits crisp, well-defined details. A weak strike results in details that appear soft, fuzzy, or incomplete. Differentiate a weak strike from circulation wear.
  2.  Luster: The reflective quality of a coin's surface as originally minted, created by microscopic flow lines. It creates a "cartwheel" effect when tilted under light. Luster is fragile and paramount in determining grades in AU and MS/PF ranges.
  3.  Surface Preservation: Assessment of imperfections on the coin's surface. These include:
      *   Contact Marks (Bag Marks): Nicks and scratches from contact with other coins.
      *   Hairlines: Fine, shallow scratches, often from improper cleaning.
      *   Other Damage: Rim dings, spots, corrosion, etc.
      The number, size, severity, and location of these marks are critical.
  4.  Eye Appeal: The overall aesthetic quality and visual attractiveness. It's a synthesis of the other three pillars, plus factors like toning. Exceptional eye appeal may be noted by TPGs with designations like NGC Star (⭐) or PCGS Plus (+).

  Consider the following detailed Sheldon Scale / Proof Grading Scale descriptions:

  The Sheldon Scale for Circulated and Mint State Coins (PO-1 to MS-70):
    | Grade   | Adjectival             | Description                                                                                                                               |
    |---------|------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
    | PO-1    | Poor                   | Clear enough to identify date, mintmark, and type. May be very badly worn or corroded.                                                    |
    | FR-2    | Fair                   | Entire coin is worn flat. Some detail shows, but only traces of peripheral lettering are visible.                                         |
    | AG-3    | About Good             | Very heavily worn. Rims are worn into the tops of the lettering, but most lettering is still readable.                                      |
    | G-4     | Good                   | Heavily worn. Rims are mostly full but may be worn into the lettering in spots. Design is visible but faint. Principal design elements outlines, coin largely flat with little interior detail. |
    | G-6     | Choice Good            | Rims and peripheral lettering are full. Design is flat and visible only in outline form. Slightly more distinct than G-4.                     |
    | VG-8    | Very Good              | Most central detail is worn flat. Rims remain full. Two to three letters of LIBERTY may show (if applicable to design). Considerable wear, but more design details apparent. |
    | VG-10   | Very Good              | Considerable wear has flattened most fine details. Most lettering is readable. Five or six letters of LIBERTY may show (if applicable).      |
    | F-12    | Fine                   | Moderate but even wear. About half of the design detail is worn flat, but all lettering is visible. Major design elements clearly defined.  |
    | F-15    | Fine                   | Slightly less than half of the finer detail is worn flat. All lettering remains sharp and clear. Sharper details than F-12.                 |
    | VF-20   | Very Fine              | Moderate wear is evident, with some loss of finer detail. All lettering is full and sharp. Major features and lettering sharp.             |
    | VF-25   | Very Fine              | Entire surface shows wear, but major design features remain clear and distinct. Less wear, some finer details sharper than VF-20.          |
    | VF-30   | Very Fine              | Wear is evident over the entire surface. Intricate design details are beginning to flatten. Most details sharp, light wear on highest points. |
    | VF-35   | Choice Very Fine       | Light, even wear over the entire surface, though all major details are still visible and sharp. Traces of luster may be present.         |
    | XF-40   | Extremely Fine         | Overall sharpness with light wear on the highest points. Details are sharp, but high points are worn flat. Some luster visible.        |
    | XF-45   | Extremely Fine         | Light wear on the high points of the design is evident. Some luster may be visible in protected areas. Minimal wear, stronger luster.      |
    | AU-50   | About Uncirculated     | A trace of wear is visible on the highest points of the design. Bits of luster may remain in protected areas. Noticeable friction.        |
    | AU-53   | About Uncirculated     | Slight flatness and loss of luster on the high points of the design. Some luster remains. Less friction than AU-50.                       |
    | AU-55   | About Uncirculated     | Full detail with light friction on the high points. Considerable mint luster remains. Good luster and eye appeal.                          |
    | AU-58   | Choice About Uncirculated| Only the slightest friction on the highest points of the design. Virtually full mint luster remains. Minimal friction, looks nearly MS. |
    | MS/PF-60| Uncirculated / Proof   | No wear from circulation. May be poorly struck with many heavy marks, scratches, or impaired luster. (For Proofs: numerous distracting marks/hairlines, possibly impaired fields). |
    | MS/PF-61| Uncirculated / Proof   | No wear, but may have a weak strike and multiple heavy marks or distracting hairlines. Slightly fewer negative factors than 60.           |
    | MS/PF-62| Uncirculated / Proof   | No wear, but strike may be average or weak. Numerous marks or hairlines are present. Marks still noticeable, luster might be impaired.  |
    | MS/PF-63| Choice Uncirculated / Proof | Average or slightly weak strike with a moderate number of contact marks or hairlines. Acceptable strike & luster. Benchmark "average" MS. |
    | MS/PF-64| Choice Uncirculated / Proof | Average or better strike with scattered marks, though none are severe. Pleasing eye appeal. Better-than-average strike & good luster. |
    | MS/PF-65| Gem Uncirculated / Proof    | Above-average strike with minor marks that are mostly outside of focal areas. Strong eye appeal. Strong strike, attractive luster.     |
    | MS/PF-66| Gem Uncirculated / Proof    | Well-struck with a few minor marks or hairlines, none of which are in primary focal areas. Very few light marks, full vibrant luster. |
    | MS/PF-67| Superb Gem Uncirculated / Proof | A sharply struck coin with only minor imperfections visible without magnification. Exceptional luster, strike, eye appeal.         |
    | MS/PF-68| Superb Gem Uncirculated / Proof | Very sharp strike with a few tiny, barely visible imperfections. Nearly flawless, requires magnification to see tiny imperfections.  |
    | MS/PF-69| Superb Gem Uncirculated / Proof | A fully struck coin with minuscule, nearly imperceptible imperfections not in focal areas. Nearly perfect, microscopic imperfections. |
    | MS/PF-70| Perfect Uncirculated / Proof  | A flawless coin with no post-production imperfections visible under 5x magnification. Fully struck with original, vibrant luster.   |

  Problem Coin Assessment:
  Carefully examine for signs of "problem coins," which cannot be assigned a standard numerical grade. These include:
    - Harshly Cleaned: Fine, parallel hairlines or scratches. May have bright but unnatural appearance. Detect by rotating under light.
    - Dipped (Improper Chemical Cleaning): Luster stripped, leaving dull, lifeless, or "flat" surface. May appear unnaturally white/bright. Copper may show pale pink/orange hue.
    - Whizzed: Unnaturally brilliant, "greasy" luster. Metal may appear pushed up around devices. Fine, swirling brush marks under magnification.
    - Rubbed/Thumed: Hazy, filmy, or cloudy areas, often over marks or high points to conceal scratches. Luster appears deadened/muted.
    - Filed Rims: Unnatural smoothness or tool marks on edge. Unusual profile.
    - Environmental Damage: Pitting, roughness, significant corrosion (green on copper, dark/rough on silver). Granular/porous surface.
    - Artificial Toning: Unnatural, "crayon-like" colors. Colors may "float" or appear in unusual patterns or over scratches.
    - Scratched: Deep, random lines or gouges that are clearly post-mint damage.
  If such problems are detected, explain them and state that the coin would likely receive a "Details" grade (e.g., "VF Details - Cleaned"). Differentiate between mint-made imperfections (e.g., die polish lines, weak strike) and post-mint damage.
`;

    if (details.isGraded && details.gradingAgency && details.grade) {
        prompt += `
  This coin is reported as professionally graded (Agency: ${details.gradingAgency}, Grade: ${details.grade}).
  Based on the images and the grading criteria above:
  1. Provide your independent assessment of each of the Four Pillars (Strike, Luster, Surface Preservation, Eye Appeal) as visible in the image.
  2. Do you concur with the provided grade of ${details.grade}?
  3. Explain your reasoning in detail, referencing specific features visible in the images and correlating them to the Sheldon Scale descriptions provided.
  4. If your assessment differs, explain the discrepancies. Identify any "problem coin" characteristics if they seem to have been overlooked or contradict the given grade.
`;
    } else { // Coin is not pre-graded
        prompt += `
  Assign a numismatic grade to this coin using the ${isLikelyProof ? "Proof (PF-60 to PF-70)" : "Sheldon (PO-1 to MS-70)"} scale.
  Provide a specific numerical grade (e.g., G-4, VF-20, MS-65, PF-68).
  Explain your reasoning in detail:
  1.  Discuss each of the Four Pillars:
      *   Strike: Evaluate the sharpness and completeness of details.
      *   Luster: Describe its presence, quality, and any "cartwheel" effect. ${isLikelyProof ? "For Proofs, comment on the reflectivity of mirrored fields." : "For Mint State coins, describe the vibrancy and completeness of luster. Slight impairments or breaks in luster can differentiate grades."}
      *   Surface Preservation: Detail all observed marks, hairlines, or damage. Reference their impact based on the grading scale. For Mint State coins (MS-60 to MS-70), pay extremely close attention to the number, size, severity, and location of contact marks and hairlines, as these are primary differentiators between grades like MS-63, MS-64, and MS-65. Note whether marks are in focal areas.
      *   Eye Appeal: Summarize the overall visual attractiveness, including toning. ${isLikelyProof ? "For Proofs, consider the cameo contrast if present (Cameo, Deep/Ultra Cameo)." : ""}
  2.  Correlate your observations for each pillar directly to the chosen grade from the detailed scale above. If significant wear is observed, pay close attention to the criteria for grades PO-1 through F-15. Specifically, for heavily worn coins:
      *   Assess if the design elements are primarily outlines with little to no interior detail (characteristic of G-4/G-6).
      *   Note the condition of the rims and their relationship to the lettering (e.g., rims worn into lettering for G-4 vs. full rims for G-6).
      *   Determine if details are merely faint or if intricate details are beginning to flatten (differentiating G from F/VF, and lower grades from G).
  3.  Explicitly state if you detect any "problem coin" characteristics. If so, explain why it would receive a "Details" grade.
  4.  Justify your grade: Explain why the coin *does not* qualify for the next higher grade and why it is *better than* the next lower grade, based on the specific criteria in the table.
  ${isLikelyProof ? "Since this might be a Proof coin, pay special attention to the mirror-like fields, sharpness of devices, and any hairlines or marks affecting the fields. Note if it exhibits Cameo (CAM) or Deep/Ultra Cameo (DCAM/UC) characteristics." : ""}
`;
    }
  }

  if (options.mintageAndRarity) {
    prompt += `
- Mintage and Rarity:
  Provide the original mintage figures for this specific coin (considering year, denomination, country, and mint mark if available).
  Discuss its relative rarity in the current numismatic market. Consider factors like survival rates and collector demand.
`;
  }
  if (options.recentSalesData) {
    prompt += `
- Recent Sales Data:
  Provide 2-3 examples of recent (within the last 1-2 years, if possible) auction or sale prices for coins of the exact same type (year, denomination, mint mark) AND in a grade similar to the one you assigned (or the provided grade if assessing that) above.
  For each example, specify the source (e.g., auction house, sales platform name), the sale date, and the price realized.
  Include a disclaimer: "Note: Market prices are dynamic and this data is a snapshot, not a guaranteed valuation. Prices can vary based on the specific auction, buyer demand, and subtle differences in coin condition not apparent in all images."
`;
  }
  if (options.gradeComparison) {
    prompt += `
- Grade Comparison:
  If a grade was assigned or assessed above:
    1. Describe the typical characteristics (strike, luster, surface preservation, eye appeal based on the guide's criteria) of a coin of the SAME TYPE that is ONE GRADE HIGHER on the scale. What specific improvements would be expected?
    2. Describe the typical characteristics of a coin of the SAME TYPE that is ONE GRADE LOWER on the scale. What specific additional wear or detractions would be present?
  Focus on tangible differences as outlined in the provided grading scale. If grading was not possible or assessed, explain generally how coin grades differ.
`;
  }
  if (options.coinFingerprinting) {
    prompt += `
- Coin Fingerprint (Descriptive):
  Carefully examine the provided images for unique, permanent, and objectively identifiable micro-features that could help distinguish this specific coin from others of the same type and general condition.
  List these features with as much precision as possible regarding their nature, size, shape, and location (e.g., "Small V-shaped scratch above the 'T' in LIBERTY," "Die crack running from the rim at 2 o'clock through the third hair curl," "Unusual raised metal dot to the left of the mint mark," "Specific pattern of bag marks on the obverse field below the portrait's chin").
  Focus on features that are unlikely to change with normal handling and are not common to all coins of this type (e.g., avoid common die markers unless exceptionally prominent).
  The goal is to create a detailed textual description that acts as a unique identifier for this coin based on its visual characteristics.
  Disclaimer: This descriptive fingerprint is based on visual analysis. Its uniqueness and reproducibility depend on the clarity and detail of the provided images and the distinctiveness of the coin's features.
`;
  }
  if (options.other && details.otherQuestions) {
    prompt += `
- Other Specific Questions:
  Please answer the following question(s): "${details.otherQuestions}"
`;
  }

  prompt += `
Please structure your response clearly, addressing each requested analysis section by section.
If images are not clear enough for a certain aspect, please state that clearly for that aspect.
For recent sales data, use available tools if necessary to find current information.
Adhere strictly to the numismatic principles and grading descriptions provided in this prompt.
`;

  if (currentLanguage !== 'en') {
    const fullLanguageName = getFullLanguageName(currentLanguage);
    prompt += `
IMPORTANT FINAL INSTRUCTION: Please provide your entire analysis response in ${fullLanguageName}. All parts of your answer, including all text, explanations, and any disclaimers like the sales data note, should be in ${fullLanguageName}.
`;
  }
  
  const contents: Part[] = [...imageParts, { text: prompt }];
  
  console.log('[MintMark AI Debug] analyzeCoin: Final prompt constructed (first 500 chars):', prompt.substring(0, 500));
  console.log('[MintMark AI Debug] analyzeCoin: Number of content parts for API:', contents.length);
  
  const config: { tools?: any[]; thinkingConfig?: { thinkingBudget: number } } = {};

  if (options.recentSalesData) {
    console.log('[MintMark AI Debug] analyzeCoin: Google Search tool will be enabled.');
    config.tools = [{googleSearch: {}}];
  } else {
    console.log('[MintMark AI Debug] analyzeCoin: Google Search tool disabled. Default thinking config will apply.');
  }

  try {
    console.log('[MintMark AI Debug] analyzeCoin: Making API call to Gemini...');
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: [{ parts: contents }],
      config: config,
    });
    console.log('[MintMark AI Debug] analyzeCoin: API call successful.');

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;
    if (groundingMetadata) {
        console.log('[MintMark AI Debug] analyzeCoin: Grounding metadata found:', groundingMetadata);
    }
    
    return { text: response.text, groundingMetadata };

  } catch (error) {
    console.error("[MintMark AI Debug] analyzeCoin: Gemini API call failed. Full error object:", error);
    let errorMessage = "An unknown error occurred while communicating with the Gemini API.";

    if (error instanceof Error) {
        const errorDetails = (error as any).details || ((error as any).cause as any)?.details || '';
        const errorName = (error as any).name || '';

        if ( (error.message.includes("Proxying failed") || errorName === "NotSupportedError" ) &&
             (error.message.includes("ReadableStream") || (typeof errorDetails === 'string' && errorDetails.includes("ReadableStream")))
           ) {
             errorMessage = "The AI analysis failed, possibly due to a browser or network proxy incompatibility with streaming data. This can sometimes occur with Safari-based browsers. Please try a different browser or check your network configuration if the issue persists.";
        } else if (error.message.includes("API key not valid")) {
            errorMessage = "The Gemini API key is not valid. Please ensure it is configured correctly in the application environment.";
        } else {
            // Generic Gemini API error if not specifically handled above
            errorMessage = `Gemini API error: ${error.message}`;
        }
    }
    // For non-Error objects or if the message is too generic, keep the default or use a generic one.
     else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = `Gemini API error: ${(error as {message: string}).message}`;
    }


    console.error("[MintMark AI Debug] analyzeCoin: Processed error message to be thrown:", errorMessage);
    throw new Error(errorMessage);
  }
};