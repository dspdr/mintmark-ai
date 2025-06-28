

export type TranslationKeys = {
  appTitle: string;
  appSubtitle: string;
  coinImagesTitle: string;
  primaryImageLabel: string; // Changed from obverseLabel
  optionalReverseImageLabel: string; // Changed from reverseLabel
  imageInputNoImage: string;
  imageInputUpload: string;
  imageInputCapture: string;
  imageInputFileTooLargeError: string;
  imageInputInvalidFileTypeError: string;
  imageInputInfo: string;
  knownCoinDetailsTitle: string;
  yearLabel: string;
  denominationLabel: string;
  countryLabel: string;
  metalLabel: string;
  mintMarkLabel: string;
  isGradedLabel: string;
  gradingAgencyLabel: string;
  gradingAgencyPlaceholder: string;
  assignedGradeLabel: string;
  assignedGradePlaceholder: string;
  requestedAnalysisTitle: string;
  analysisOptionGradeAndCondition: string;
  analysisOptionGradeAndConditionDesc: string;
  analysisOptionMintageAndRarity: string;
  analysisOptionMintageAndRarityDesc: string;
  analysisOptionRecentSalesData: string;
  analysisOptionRecentSalesDataDesc: string;
  analysisOptionGradeComparison: string;
  analysisOptionGradeComparisonDesc: string;
  analysisOptionCoinFingerprinting: string;
  analysisOptionCoinFingerprintingDesc: string;
  analysisOptionOther: string;
  otherQuestionsLabel: string;
  otherQuestionsPlaceholder: string;
  submitButtonDefault: string;
  submitButtonLoading: string;
  errorMinPrimaryImage: string; // Changed from errorMinOneImage
  analysisReportTitle: string;
  nextStepsTitle: string;
  shopOnEbayButton: string;
  searchWebButton: string;
  footerText: string;
  safariNoticeTitle: string;
  safariNoticeP1: string;
  safariNoticeP2: string;
  safariNoticeButton: string;
  analysisReportSourcesTitle: string;
  analysisReportImportantDisclaimerTitle: string;
  analysisReportAnalysisDetailsTitle: string;
  salesDisclaimerText: string;
  languageSelectorLabel: string;
  // aiAnalysisLanguageNotice key removed
};

export const translations: Record<string, TranslationKeys> = {
  en: {
    appTitle: "MintMark AI",
    appSubtitle: "Get an expert analysis of your coins using cutting-edge AI.",
    coinImagesTitle: "1. Coin Image(s)",
    primaryImageLabel: "Primary Coin Image (Obverse or Both Sides)",
    optionalReverseImageLabel: "Reverse Image (Optional)",
    imageInputNoImage: "No image selected",
    imageInputUpload: "Upload",
    imageInputCapture: "Capture",
    imageInputFileTooLargeError: "File size exceeds 5MB. Please choose a smaller image.",
    imageInputInvalidFileTypeError: "Invalid file type. Please select an image (JPEG, PNG, GIF, WebP).",
    imageInputInfo: "For best results, use clear, well-lit photos. Max file size: 5MB. Supported formats: JPG, PNG, GIF, WebP.",
    knownCoinDetailsTitle: "2. Known Coin Details (Optional)",
    yearLabel: "Year",
    denominationLabel: "Denomination",
    countryLabel: "Country of Origin",
    metalLabel: "Metal (if known)",
    mintMarkLabel: "Mint Mark (if visible)",
    isGradedLabel: "This coin has already been professionally graded",
    gradingAgencyLabel: "Grading Agency",
    gradingAgencyPlaceholder: "e.g., PCGS, NGC",
    assignedGradeLabel: "Assigned Grade",
    assignedGradePlaceholder: "e.g., MS65, VF20",
    requestedAnalysisTitle: "3. Requested Analysis",
    analysisOptionGradeAndCondition: "Grade and Condition",
    analysisOptionGradeAndConditionDesc: "Assign grade and explain based on wear, marks, luster. If pre-graded, provide your assessment.",
    analysisOptionMintageAndRarity: "Mintage and Rarity",
    analysisOptionMintageAndRarityDesc: "Original mintage figures and current rarity.",
    analysisOptionRecentSalesData: "Recent Sales Data",
    analysisOptionRecentSalesDataDesc: "Examples of recent auction/sale prices.",
    analysisOptionGradeComparison: "Grade Comparison",
    analysisOptionGradeComparisonDesc: "Compare with higher/lower grades.",
    analysisOptionCoinFingerprinting: "Coin Fingerprinting (Descriptive)",
    analysisOptionCoinFingerprintingDesc: "Identify unique, permanent micro-features to help distinguish this coin.",
    analysisOptionOther: "Other",
    otherQuestionsLabel: "Other Specific Questions",
    otherQuestionsPlaceholder: "e.g., What is the history of this design?",
    submitButtonDefault: "Analyze Coin",
    submitButtonLoading: "Analyzing...",
    errorMinPrimaryImage: "Please upload the primary coin image. This image can show the obverse or both sides of the coin.",
    analysisReportTitle: "Analysis Report",
    nextStepsTitle: "Next Steps",
    shopOnEbayButton: "Shop for this coin on eBay",
    searchWebButton: "Search Web for This Coin",
    footerText: "© {year} MintMark AI. Powered by Gemini.",
    safariNoticeTitle: "Browser Notice",
    safariNoticeP1: "Due to technical limitations with certain proxy configurations, MintMark AI currently provides the best experience on Chrome.",
    safariNoticeP2: "We recommend using Google Chrome for full functionality.",
    safariNoticeButton: "Get Google Chrome",
    analysisReportSourcesTitle: "Sources from Google Search",
    analysisReportImportantDisclaimerTitle: "Important Disclaimer",
    analysisReportAnalysisDetailsTitle: "Analysis Details",
    salesDisclaimerText: "Note: Market prices are dynamic and this data is a snapshot, not a guaranteed valuation. Prices can vary based on the specific auction, buyer demand, and subtle differences in coin condition not apparent in all images.",
    languageSelectorLabel: "Language:",
  },
  es: {
    appTitle: "MintMark IA",
    appSubtitle: "Obtenga un análisis experto de sus monedas utilizando IA de vanguardia.",
    coinImagesTitle: "1. Imagen(es) de la Moneda",
    primaryImageLabel: "Imagen Principal de la Moneda (Anverso o Ambos Lados)",
    optionalReverseImageLabel: "Imagen del Reverso (Opcional)",
    imageInputNoImage: "Ninguna imagen seleccionada",
    imageInputUpload: "Subir",
    imageInputCapture: "Capturar",
    imageInputFileTooLargeError: "El tamaño del archivo supera los 5MB. Por favor, elija una imagen más pequeña.",
    imageInputInvalidFileTypeError: "Tipo de archivo no válido. Por favor, seleccione una imagen (JPEG, PNG, GIF, WebP).",
    imageInputInfo: "Para mejores resultados, use fotos claras y bien iluminadas. Tamaño máximo de archivo: 5MB. Formatos admitidos: JPG, PNG, GIF, WebP.",
    knownCoinDetailsTitle: "2. Detalles Conocidos de la Moneda (Opcional)",
    yearLabel: "Año",
    denominationLabel: "Denominación",
    countryLabel: "País de Origen",
    metalLabel: "Metal (si se conoce)",
    mintMarkLabel: "Marca de Ceca (si es visible)",
    isGradedLabel: "Esta moneda ya ha sido graduada profesionalmente",
    gradingAgencyLabel: "Agencia de Graduación",
    gradingAgencyPlaceholder: "ej., PCGS, NGC",
    assignedGradeLabel: "Grado Asignado",
    assignedGradePlaceholder: "ej., MS65, VF20",
    requestedAnalysisTitle: "3. Análisis Solicitado",
    analysisOptionGradeAndCondition: "Grado y Condición",
    analysisOptionGradeAndConditionDesc: "Asignar grado y explicar basándose en desgaste, marcas, lustre. Si está pre-graduada, proporcione su evaluación.",
    analysisOptionMintageAndRarity: "Acuñación y Rareza",
    analysisOptionMintageAndRarityDesc: "Cifras originales de acuñación y rareza actual.",
    analysisOptionRecentSalesData: "Datos de Ventas Recientes",
    analysisOptionRecentSalesDataDesc: "Ejemplos de precios recientes de subastas/ventas.",
    analysisOptionGradeComparison: "Comparación de Grados",
    analysisOptionGradeComparisonDesc: "Comparar con grados superiores/inferiores.",
    analysisOptionCoinFingerprinting: "Huella Digital de la Moneda (Descriptiva)",
    analysisOptionCoinFingerprintingDesc: "Identificar micro-características únicas y permanentes para ayudar a distinguir esta moneda.",
    analysisOptionOther: "Otro",
    otherQuestionsLabel: "Otras Preguntas Específicas",
    otherQuestionsPlaceholder: "ej., ¿Cuál es la historia de este diseño?",
    submitButtonDefault: "Analizar Moneda",
    submitButtonLoading: "Analizando...",
    errorMinPrimaryImage: "Por favor, suba la imagen principal de la moneda. Esta imagen puede mostrar el anverso o ambos lados de la moneda.",
    analysisReportTitle: "Informe de Análisis",
    nextStepsTitle: "Próximos Pasos",
    shopOnEbayButton: "Comprar esta moneda en eBay",
    searchWebButton: "Buscar esta Moneda en la Web",
    footerText: "© {year} MintMark IA. Impulsado por Gemini.",
    safariNoticeTitle: "Aviso del Navegador",
    safariNoticeP1: "Debido a limitaciones técnicas con ciertas configuraciones de proxy, MintMark IA actualmente ofrece la mejor experiencia en Chrome.",
    safariNoticeP2: "Recomendamos usar Google Chrome para una funcionalidad completa.",
    safariNoticeButton: "Obtener Google Chrome",
    analysisReportSourcesTitle: "Fuentes de Google Search",
    analysisReportImportantDisclaimerTitle: "Descargo de Responsabilidad Importante",
    analysisReportAnalysisDetailsTitle: "Detalles del Análisis",
    salesDisclaimerText: "Nota: Los precios de mercado son dinámicos y estos datos son una instantánea, no una valoración garantizada. Los precios pueden variar según la subasta específica, la demanda del comprador y diferencias sutiles en la condición de la moneda no aparentes en todas las imágenes.",
    languageSelectorLabel: "Idioma:",
  },
  fr: {
    appTitle: "MintMark AI",
    appSubtitle: "Obtenez une analyse experte de vos pièces de monnaie grâce à une IA de pointe.",
    coinImagesTitle: "1. Image(s) de la Pièce",
    primaryImageLabel: "Image Principale de la Pièce (Avers ou Deux Côtés)",
    optionalReverseImageLabel: "Image du Revers (Facultatif)",
    imageInputNoImage: "Aucune image sélectionnée",
    imageInputUpload: "Télécharger",
    imageInputCapture: "Capturer",
    imageInputFileTooLargeError: "La taille du fichier dépasse 5 Mo. Veuillez choisir une image plus petite.",
    imageInputInvalidFileTypeError: "Type de fichier non valide. Veuillez sélectionner une image (JPEG, PNG, GIF, WebP).",
    imageInputInfo: "Pour de meilleurs résultats, utilisez des photos claires et bien éclairées. Taille max. du fichier : 5 Mo. Formats pris en charge : JPG, PNG, GIF, WebP.",
    knownCoinDetailsTitle: "2. Détails Connus de la Pièce (Facultatif)",
    yearLabel: "Année",
    denominationLabel: "Dénomination",
    countryLabel: "Pays d'Origine",
    metalLabel: "Métal (si connu)",
    mintMarkLabel: "Marque d'Atelier (si visible)",
    isGradedLabel: "Cette pièce a déjà été gradée professionnellement",
    gradingAgencyLabel: "Agence de Notation",
    gradingAgencyPlaceholder: "ex., PCGS, NGC",
    assignedGradeLabel: "Grade Attribué",
    assignedGradePlaceholder: "ex., MS65, VF20",
    requestedAnalysisTitle: "3. Analyse Demandée",
    analysisOptionGradeAndCondition: "Grade et État",
    analysisOptionGradeAndConditionDesc: "Attribuer un grade et expliquer en fonction de l'usure, des marques, du lustre. Si pré-gradée, donnez votre évaluation.",
    analysisOptionMintageAndRarity: "Tirage et Rareté",
    analysisOptionMintageAndRarityDesc: "Chiffres du tirage original et rareté actuelle.",
    analysisOptionRecentSalesData: "Données de Ventes Récentes",
    analysisOptionRecentSalesDataDesc: "Exemples de prix récents d'enchères/ventes.",
    analysisOptionGradeComparison: "Comparaison de Grades",
    analysisOptionGradeComparisonDesc: "Comparer avec des grades supérieurs/inférieurs.",
    analysisOptionCoinFingerprinting: "Empreinte de la Pièce (Descriptive)",
    analysisOptionCoinFingerprintingDesc: "Identifier les micro-caractéristiques uniques et permanentes pour aider à distinguer cette pièce.",
    analysisOptionOther: "Autre",
    otherQuestionsLabel: "Autres Questions Spécifiques",
    otherQuestionsPlaceholder: "ex., Quelle est l'histoire de ce design ?",
    submitButtonDefault: "Analyser la Pièce",
    submitButtonLoading: "Analyse en cours...",
    errorMinPrimaryImage: "Veuillez télécharger l'image principale de la pièce. Cette image peut montrer l'avers ou les deux côtés de la pièce.",
    analysisReportTitle: "Rapport d'Analyse",
    nextStepsTitle: "Prochaines Étapes",
    shopOnEbayButton: "Acheter cette pièce sur eBay",
    searchWebButton: "Rechercher cette Pièce sur le Web",
    footerText: "© {year} MintMark AI. Optimisé par Gemini.",
    safariNoticeTitle: "Avis de Navigateur",
    safariNoticeP1: "En raison de limitations techniques avec certaines configurations de proxy, MintMark AI offre actuellement la meilleure expérience sur Chrome.",
    safariNoticeP2: "Nous recommandons d'utiliser Google Chrome pour une fonctionnalité complète.",
    safariNoticeButton: "Obtenir Google Chrome",
    analysisReportSourcesTitle: "Sources de Google Search",
    analysisReportImportantDisclaimerTitle: "Avis Important",
    analysisReportAnalysisDetailsTitle: "Détails de l'Analyse",
    salesDisclaimerText: "Remarque : Les prix du marché sont dynamiques et ces données sont un instantané, pas une évaluation garantie. Les prix peuvent varier en fonction de l'enchère spécifique, de la demande de l'acheteur et de différences subtiles dans l'état de la pièce non apparentes sur toutes les images.",
    languageSelectorLabel: "Langue :",
  },
};