import { useState } from 'react';

/* ══════════════════ TRANSLATIONS (5 Languages) ══════════════════ */
const T = {
  en: {
    selectLang: 'Select Language',
    reportContents: 'Report Contents',
    execSummary: 'Executive Summary',
    execSummaryDesc: 'AI analysis overview',
    keyMetrics: 'Key Budget Metrics',
    keyMetricsDesc: '6 financial indicators',
    divisionFlow: 'Division-wise Fund Flow',
    divisionFlowDesc: 'Amravati · Aurangabad · Nagpur',
    deptBreakdown: 'Department Breakdown',
    deptBreakdownDesc: 'Agriculture, Rural Dev, Infra, Education',
    anomalySummary: 'Anomaly Summary',
    anomalySummaryDesc: '3 detected irregularities',
    preview: 'Preview',
    exportPDF: 'Export PDF',
    exportSuccess: '✅ Export Initiated!',
    readyBadge: 'Report ready to export',
    reportTitle: 'Maharashtra State Budget Analysis Report',
    reportSubtitle: 'ArthaRakshak AI — Budget Intelligence & Leakage Detection Platform',
    fiscalYear: 'Fiscal Year 2025-26',
    summaryText: 'This comprehensive report presents the budget allocation, expenditure analysis, and anomaly detection findings for the state of Maharashtra across Amravati, Aurangabad, and Nagpur divisions. The AI-powered analysis has identified 3 anomalies across monitored departments with an estimated leakage of ₹342 Crore requiring immediate attention from the authorities.',
    confidential: 'CONFIDENTIAL — FOR OFFICIAL USE ONLY',
    totalBudget: 'Total Budget',
    totalExpenditure: 'Total Expenditure',
    avgUtilisation: 'Avg Utilisation',
    beneficiaryFarmers: 'Beneficiary Farmers',
    detectedAnomalies: 'Detected Anomalies',
    estimatedLeakage: 'Estimated Leakage',
    division: 'Division',
    allocated: 'Allocated (₹ Lakh)',
    spent: 'Spent (₹ Lakh)',
    utilisation: 'Utilisation %',
    department: 'Department',
    progress: 'Progress',
    anomaly1: 'Irregular fund disbursement pattern detected in Amravati Rural Development — ₹12.4 Cr released with zero ground expenditure for 3 consecutive quarters.',
    anomaly2: 'Education department in Aurangabad showing 157% quarter-on-quarter spending spike without corresponding scheme approval records.',
    anomaly3: 'Nagpur Infrastructure allocation-release gap exceeds 22% threshold — ₹4.1 Cr allocated but only ₹3.2 Cr released to implementing agencies.',
    generatedOn: 'Generated on',
    pageInfo: 'Page 1 of 1',
    dataSource: 'Data sourced from data.gov.in · Firebase Live Sync',
    ltr: 'LTR',
  },
  hi: {
    selectLang: 'भाषा चुनें',
    reportContents: 'रिपोर्ट सामग्री',
    execSummary: 'कार्यकारी सारांश',
    execSummaryDesc: 'AI विश्लेषण अवलोकन',
    keyMetrics: 'प्रमुख बजट मेट्रिक्स',
    keyMetricsDesc: '6 वित्तीय संकेतक',
    divisionFlow: 'प्रभाग-वार निधि प्रवाह',
    divisionFlowDesc: 'अमरावती · औरंगाबाद · नागपुर',
    deptBreakdown: 'विभाग विवरण',
    deptBreakdownDesc: 'कृषि, ग्रामीण विकास, बुनियादी ढांचा, शिक्षा',
    anomalySummary: 'विसंगति सारांश',
    anomalySummaryDesc: '3 अनियमितताएं पाई गईं',
    preview: 'पूर्वावलोकन',
    exportPDF: 'PDF निर्यात',
    exportSuccess: '✅ निर्यात शुरू हुआ!',
    readyBadge: 'रिपोर्ट निर्यात के लिए तैयार',
    reportTitle: 'महाराष्ट्र राज्य बजट विश्लेषण रिपोर्ट',
    reportSubtitle: 'अर्थरक्षक AI — बजट खुफिया और रिसाव पहचान मंच',
    fiscalYear: 'वित्तीय वर्ष 2025-26',
    summaryText: 'यह व्यापक रिपोर्ट अमरावती, औरंगाबाद और नागपुर प्रभागों में महाराष्ट्र राज्य के बजट आवंटन, व्यय विश्लेषण और विसंगति पहचान निष्कर्ष प्रस्तुत करती है। AI-संचालित विश्लेषण ने निगरानी विभागों में 3 विसंगतियों की पहचान की है, जिसमें अनुमानित ₹342 करोड़ का रिसाव है जिस पर अधिकारियों को तत्काल ध्यान देने की आवश्यकता है।',
    confidential: 'गोपनीय — केवल आधिकारिक उपयोग के लिए',
    totalBudget: 'कुल बजट',
    totalExpenditure: 'कुल व्यय',
    avgUtilisation: 'औसत उपयोग',
    beneficiaryFarmers: 'लाभार्थी किसान',
    detectedAnomalies: 'पहचानी गई विसंगतियां',
    estimatedLeakage: 'अनुमानित रिसाव',
    division: 'प्रभाग',
    allocated: 'आवंटित (₹ लाख)',
    spent: 'व्यय (₹ लाख)',
    utilisation: 'उपयोग %',
    department: 'विभाग',
    progress: 'प्रगति',
    anomaly1: 'अमरावती ग्रामीण विकास में अनियमित निधि वितरण पैटर्न का पता चला — ₹12.4 करोड़ जारी किए गए लेकिन लगातार 3 तिमाहियों में शून्य जमीनी व्यय।',
    anomaly2: 'औरंगाबाद में शिक्षा विभाग में तिमाही-दर-तिमाही 157% व्यय वृद्धि बिना संबंधित योजना अनुमोदन रिकॉर्ड के।',
    anomaly3: 'नागपुर बुनियादी ढांचा आवंटन-जारी अंतर 22% सीमा से अधिक — ₹4.1 करोड़ आवंटित लेकिन कार्यान्वयन एजेंसियों को केवल ₹3.2 करोड़ जारी।',
    generatedOn: 'निर्मित तिथि',
    pageInfo: 'पृष्ठ 1 का 1',
    dataSource: 'डेटा स्रोत: data.gov.in · Firebase लाइव सिंक',
    ltr: 'LTR',
  },
  mr: {
    selectLang: 'भाषा निवडा',
    reportContents: 'अहवाल सामग्री',
    execSummary: 'कार्यकारी सारांश',
    execSummaryDesc: 'AI विश्लेषण आढावा',
    keyMetrics: 'प्रमुख अर्थसंकल्प मापदंड',
    keyMetricsDesc: '6 आर्थिक निर्देशक',
    divisionFlow: 'विभागनिहाय निधी प्रवाह',
    divisionFlowDesc: 'अमरावती · औरंगाबाद · नागपूर',
    deptBreakdown: 'विभाग तपशील',
    deptBreakdownDesc: 'कृषी, ग्रामविकास, पायाभूत सुविधा, शिक्षण',
    anomalySummary: 'विसंगती सारांश',
    anomalySummaryDesc: '3 अनियमितता आढळल्या',
    preview: 'पूर्वावलोकन',
    exportPDF: 'PDF निर्यात',
    exportSuccess: '✅ निर्यात सुरू झाला!',
    readyBadge: 'अहवाल निर्यातासाठी तयार',
    reportTitle: 'महाराष्ट्र राज्य अर्थसंकल्प विश्लेषण अहवाल',
    reportSubtitle: 'अर्थरक्षक AI — अर्थसंकल्प गुप्तचर आणि गळती शोध व्यासपीठ',
    fiscalYear: 'आर्थिक वर्ष 2025-26',
    summaryText: 'हा सर्वसमावेशक अहवाल अमरावती, औरंगाबाद आणि नागपूर विभागांमध्ये महाराष्ट्र राज्याचे अर्थसंकल्प वाटप, खर्च विश्लेषण आणि विसंगती शोध निष्कर्ष सादर करतो। AI-चालित विश्लेषणाने देखरेख विभागांमध्ये 3 विसंगती ओळखल्या आहेत, ज्यामध्ये अंदाजे ₹342 कोटींची गळती आहे ज्यावर अधिकाऱ्यांनी तात्काळ लक्ष देणे आवश्यक आहे.',
    confidential: 'गोपनीय — केवळ अधिकृत वापरासाठी',
    totalBudget: 'एकूण अर्थसंकल्प',
    totalExpenditure: 'एकूण खर्च',
    avgUtilisation: 'सरासरी वापर',
    beneficiaryFarmers: 'लाभार्थी शेतकरी',
    detectedAnomalies: 'आढळलेल्या विसंगती',
    estimatedLeakage: 'अंदाजित गळती',
    division: 'विभाग',
    allocated: 'वाटप (₹ लाख)',
    spent: 'खर्च (₹ लाख)',
    utilisation: 'वापर %',
    department: 'विभाग',
    progress: 'प्रगती',
    anomaly1: 'अमरावती ग्रामविकासमध्ये अनियमित निधी वितरण पद्धत आढळली — ₹12.4 कोटी जारी केले परंतु सलग 3 तिमाहींमध्ये शून्य जमीनी खर्च.',
    anomaly2: 'औरंगाबादमधील शिक्षण विभागात संबंधित योजना मंजुरी नोंदींशिवाय तिमाही-दर-तिमाही 157% खर्च वाढ.',
    anomaly3: 'नागपूर पायाभूत सुविधा वाटप-जारी अंतर 22% मर्यादेपेक्षा जास्त — ₹4.1 कोटी वाटप परंतु अंमलबजावणी संस्थांना केवळ ₹3.2 कोटी जारी.',
    generatedOn: 'निर्मिती दिनांक',
    pageInfo: 'पृष्ठ 1 पैकी 1',
    dataSource: 'डेटा स्रोत: data.gov.in · Firebase लाइव्ह सिंक',
    ltr: 'LTR',
  },
  gu: {
    selectLang: 'ભાષા પસંદ કરો',
    reportContents: 'અહેવાલ સામગ્રી',
    execSummary: 'કાર્યકારી સારાંશ',
    execSummaryDesc: 'AI વિશ્લેષણ સમીક્ષા',
    keyMetrics: 'મુખ્ય બજેટ માપદંડ',
    keyMetricsDesc: '6 નાણાકીય સૂચકાંક',
    divisionFlow: 'વિભાગ મુજબ ભંડોળ પ્રવાહ',
    divisionFlowDesc: 'અમરાવતી · ઔરંગાબાદ · નાગપુર',
    deptBreakdown: 'વિભાગ વિગત',
    deptBreakdownDesc: 'કૃષિ, ગ્રામ વિકાસ, ઈન્ફ્રા, શિક્ષણ',
    anomalySummary: 'વિસંગતતા સારાંશ',
    anomalySummaryDesc: '3 અનિયમિતતાઓ મળી',
    preview: 'પૂર્વાવલોકન',
    exportPDF: 'PDF નિકાસ',
    exportSuccess: '✅ નિકાસ શરૂ થઈ!',
    readyBadge: 'અહેવાલ નિકાસ માટે તૈયાર',
    reportTitle: 'મહારાષ્ટ્ર રાજ્ય બજેટ વિશ્લેષણ અહેવાલ',
    reportSubtitle: 'અર્થરક્ષક AI — બજેટ ગુપ્તચર અને ગળતી શોધ પ્લેટફોર્મ',
    fiscalYear: 'નાણાકીય વર્ષ 2025-26',
    summaryText: 'આ વ્યાપક અહેવાલ અમરાવતી, ઔરંગાબાદ અને નાગપુર વિભાગોમાં મહારાષ્ટ્ર રાજ્યના બજેટ ફાળવણી, ખર્ચ વિશ્લેષણ અને વિસંગતતા શોધ તારણો રજૂ કરે છે. AI-સંચાલિત વિશ્લેષણે દેખરેખ વિભાગોમાં 3 વિસંગતતાઓ ઓળખી છે, જેમાં અંદાજિત ₹342 કરોડનો ગળતી છે જેના પર અધિકારીઓએ તાત્કાલિક ધ્યાન આપવાની જરૂર છે.',
    confidential: 'ગોપનીય — ફક્ત સત્તાવાર ઉપયોગ માટે',
    totalBudget: 'કુલ બજેટ',
    totalExpenditure: 'કુલ ખર્ચ',
    avgUtilisation: 'સરેરાશ ઉપયોગ',
    beneficiaryFarmers: 'લાભાર્થી ખેડૂતો',
    detectedAnomalies: 'મળેલ વિસંગતતાઓ',
    estimatedLeakage: 'અંદાજિત ગળતી',
    division: 'વિભાગ',
    allocated: 'ફાળવણી (₹ લાખ)',
    spent: 'ખર્ચ (₹ લાખ)',
    utilisation: 'ઉપયોગ %',
    department: 'વિભાગ',
    progress: 'પ્રગતિ',
    anomaly1: 'અમરાવતી ગ્રામ વિકાસમાં અનિયમિત ભંડોળ વિતરણ પેટર્ન મળી — ₹12.4 કરોડ જારી કરવામાં આવ્યા પરંતુ સતત 3 ત્રિમાસિકમાં શૂન્ય જમીની ખર્ચ.',
    anomaly2: 'ઔરંગાબાદમાં શિક્ષણ વિભાગમાં સંબંધિત યોજના મંજૂરી રેકોર્ડ વિના ત્રિમાસિક-દર-ત્રિમાસિક 157% ખર્ચ વધારો.',
    anomaly3: 'નાગપુર ઈન્ફ્રાસ્ટ્રક્ચર ફાળવણી-જારી અંતર 22% મર્યાદાથી વધુ — ₹4.1 કરોડ ફાળવણી પરંતુ અમલીકરણ એજન્સીઓને ₹3.2 કરોડ જ જારી.',
    generatedOn: 'નિર્માણ તારીખ',
    pageInfo: 'પૃષ્ઠ 1 માંથી 1',
    dataSource: 'ડેટા સ્ત્રોત: data.gov.in · Firebase લાઇવ સિંક',
    ltr: 'LTR',
  },
  ur: {
    selectLang: 'زبان منتخب کریں',
    reportContents: 'رپورٹ کے مشمولات',
    execSummary: 'ایگزیکٹو خلاصہ',
    execSummaryDesc: 'AI تجزیہ جائزہ',
    keyMetrics: 'اہم بجٹ میٹرکس',
    keyMetricsDesc: '6 مالی اشارے',
    divisionFlow: 'ڈویژن وار فنڈ فلو',
    divisionFlowDesc: 'امراوتی · اورنگ آباد · ناگپور',
    deptBreakdown: 'محکمہ تفصیلات',
    deptBreakdownDesc: 'زراعت، دیہی ترقی، انفرا، تعلیم',
    anomalySummary: 'بے قاعدگی خلاصہ',
    anomalySummaryDesc: '3 بے قاعدگیاں پائی گئیں',
    preview: 'پیش نظارہ',
    exportPDF: 'PDF برآمد',
    exportSuccess: '✅ برآمد شروع ہوئی!',
    readyBadge: 'رپورٹ برآمد کے لیے تیار',
    reportTitle: 'مہاراشٹر ریاستی بجٹ تجزیہ رپورٹ',
    reportSubtitle: 'ارتھ رکشک AI — بجٹ انٹیلیجنس اور لیکیج ڈیٹیکشن پلیٹ فارم',
    fiscalYear: 'مالی سال 2025-26',
    summaryText: 'یہ جامع رپورٹ امراوتی، اورنگ آباد اور ناگپور ڈویژنوں میں مہاراشٹر ریاست کی بجٹ مختص، اخراجات تجزیہ اور بے قاعدگی کی نشاندہی کے نتائج پیش کرتی ہے۔ AI سے چلنے والے تجزیے نے نگرانی محکموں میں 3 بے قاعدگیاں شناخت کی ہیں، جن میں تخمینی ₹342 کروڑ کا لیکیج ہے جس پر حکام کو فوری توجہ دینے کی ضرورت ہے۔',
    confidential: 'خفیہ — صرف سرکاری استعمال کے لیے',
    totalBudget: 'کل بجٹ',
    totalExpenditure: 'کل اخراجات',
    avgUtilisation: 'اوسط استعمال',
    beneficiaryFarmers: 'مستفید کسان',
    detectedAnomalies: 'دریافت شدہ بے قاعدگیاں',
    estimatedLeakage: 'تخمینی لیکیج',
    division: 'ڈویژن',
    allocated: 'مختص (₹ لاکھ)',
    spent: 'خرچ (₹ لاکھ)',
    utilisation: 'استعمال %',
    department: 'محکمہ',
    progress: 'پیش رفت',
    anomaly1: 'امراوتی دیہی ترقی میں بے قاعدہ فنڈ تقسیم کا نمونہ پایا گیا — ₹12.4 کروڑ جاری کیے گئے لیکن مسلسل 3 سہ ماہیوں میں صفر زمینی اخراجات۔',
    anomaly2: 'اورنگ آباد میں تعلیم محکمے میں متعلقہ اسکیم منظوری ریکارڈ کے بغیر سہ ماہی بہ سہ ماہی 157% اخراجات میں اضافہ۔',
    anomaly3: 'ناگپور انفراسٹرکچر مختص-جاری فرق 22% حد سے تجاوز — ₹4.1 کروڑ مختص لیکن عمل درآمد ایجنسیوں کو صرف ₹3.2 کروڑ جاری۔',
    generatedOn: 'تیار کردہ',
    pageInfo: 'صفحہ 1 از 1',
    dataSource: 'ڈیٹا ماخذ: data.gov.in · Firebase لائیو سنک',
    ltr: 'RTL',
  },
};

const LANGS = [
  { code: 'en', flag: '🇬🇧', native: 'English', label: 'English' },
  { code: 'hi', flag: '🇮🇳', native: 'हिन्दी', label: 'Hindi' },
  { code: 'mr', flag: '🇮🇳', native: 'मराठी', label: 'Marathi' },
  { code: 'gu', flag: '🇮🇳', native: 'ગુજરાતી', label: 'Gujarati' },
  { code: 'ur', flag: '🇵🇰', native: 'اردو', label: 'Urdu' },
];

/* ══════════════════ COLOURS ══════════════════ */
const C = {
  govBlue: '#1E3A8A', brightBlue: '#3B82F6', bg: '#F8FAFC',
  card: '#FFFFFF', border: '#E2E8F0', text: '#0F172A', muted: '#64748B',
  green: '#16A34A', amber: '#F59E0B', red: '#DC2626',
};

/* ══════════════════ BUILD PDF HTML ══════════════════ */
function buildPDFHTML(lang) {
  const t = T[lang];
  const isRTL = lang === 'ur';
  const dir = isRTL ? 'rtl' : 'ltr';
  const fontFamily = lang === 'ur'
    ? "'Noto Nastaliq Urdu', 'Noto Sans', serif"
    : lang === 'gu'
      ? "'Noto Sans Gujarati', 'Noto Sans', sans-serif"
      : (lang === 'hi' || lang === 'mr')
        ? "'Noto Sans Devanagari', 'Noto Sans', sans-serif"
        : "'DM Sans', 'Noto Sans', sans-serif";

  const divisions = [
    { name: lang === 'hi' || lang === 'mr' ? 'अमरावती' : lang === 'gu' ? 'અમરાવતી' : lang === 'ur' ? 'امراوتی' : 'Amravati', allocated: '40,88,380', spent: '31,20,233', util: '76.3', color: C.green },
    { name: lang === 'hi' || lang === 'mr' ? 'औरंगाबाद' : lang === 'gu' ? 'ઔરંગાબાદ' : lang === 'ur' ? 'اورنگ آباد' : 'Aurangabad', allocated: '31,63,260', spent: '24,72,066', util: '78.1', color: C.brightBlue },
    { name: lang === 'hi' || lang === 'mr' ? 'नागपुर' : lang === 'gu' ? 'નાગપુર' : lang === 'ur' ? 'ناگپور' : 'Nagpur', allocated: '18,81,670', spent: '16,33,938', util: '86.8', color: C.amber },
  ];

  const departments = [
    { name: lang === 'hi' ? 'कृषि' : lang === 'mr' ? 'कृषी' : lang === 'gu' ? 'કૃષિ' : lang === 'ur' ? 'زراعت' : 'Agriculture', pct: 72 },
    { name: lang === 'hi' ? 'ग्रामीण विकास' : lang === 'mr' ? 'ग्रामविकास' : lang === 'gu' ? 'ગ્રામ વિકાસ' : lang === 'ur' ? 'دیہی ترقی' : 'Rural Development', pct: 58 },
    { name: lang === 'hi' ? 'बुनियादी ढांचा' : lang === 'mr' ? 'पायाभूत सुविधा' : lang === 'gu' ? 'ઈન્ફ્રાસ્ટ્રક્ચર' : lang === 'ur' ? 'انفراسٹرکچر' : 'Infrastructure', pct: 84 },
    { name: lang === 'hi' ? 'शिक्षा' : lang === 'mr' ? 'शिक्षण' : lang === 'gu' ? 'શિક્ષણ' : lang === 'ur' ? 'تعلیم' : 'Education', pct: 67 },
  ];

  const deptBarColor = (p) => p >= 80 ? C.green : p >= 65 ? C.amber : C.red;
  const now = new Date().toLocaleDateString(lang === 'ur' ? 'ur-PK' : lang === 'gu' ? 'gu-IN' : lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${t.reportTitle}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Noto+Sans:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Sans+Gujarati:wght@400;600;700&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:${fontFamily};background:#fff;color:${C.text};font-size:13px;line-height:1.6;direction:${dir}}
@media print{body{background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:A4 landscape;margin:0.4in}}
.header{background:linear-gradient(135deg,${C.govBlue},#2B4FC7);color:#fff;padding:28px 40px;display:flex;align-items:center;gap:20px}
.header-logo{font-size:36px;background:rgba(255,255,255,0.15);width:56px;height:56px;border-radius:14px;display:flex;align-items:center;justify-content:center}
.header h1{font-size:22px;font-weight:800;margin-bottom:2px}
.header p{font-size:12px;opacity:0.8}
.meta-row{display:flex;gap:20px;margin-top:8px;font-size:11px;opacity:0.7}
.meta-row span{display:flex;align-items:center;gap:4px}
.confidential{background:${C.red};color:#fff;text-align:center;padding:6px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase}
.body{padding:32px 40px}
.section{margin-bottom:28px}
.section-title{font-size:15px;font-weight:700;color:${C.govBlue};margin-bottom:12px;padding-bottom:6px;border-bottom:2px solid ${C.border}}
.summary-box{background:#EFF6FF;border-${isRTL ? 'right' : 'left'}:4px solid ${C.brightBlue};padding:16px 20px;border-radius:0 8px 8px 0;font-size:13px;line-height:1.7;color:#1E40AF}
.metrics-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.metric-card{background:${C.bg};border:1px solid ${C.border};border-radius:10px;padding:16px;text-align:center}
.metric-card .value{font-size:22px;font-weight:800;margin-bottom:2px}
.metric-card .label{font-size:11px;color:${C.muted};font-weight:600}
table{width:100%;border-collapse:collapse;font-size:12px;margin-top:8px}
th{background:${C.govBlue};color:#fff;padding:10px 14px;text-align:${isRTL ? 'right' : 'left'};font-weight:600}
td{padding:10px 14px;border-bottom:1px solid ${C.border}}
tr:nth-child(even){background:#F8FAFC}
.bar-container{width:120px;height:8px;background:#E2E8F0;border-radius:4px;overflow:hidden;display:inline-block;vertical-align:middle}
.bar-fill{height:100%;border-radius:4px}
.anomaly-box{background:#FEF2F2;border-${isRTL ? 'right' : 'left'}:4px solid ${C.red};padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:10px;font-size:12px;color:#991B1B;display:flex;align-items:flex-start;gap:8px}
.anomaly-box .icon{font-size:16px;flex-shrink:0}
.footer{background:#F1F5F9;padding:16px 40px;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:${C.muted};border-top:1px solid ${C.border}}
</style>
</head>
<body>
<div class="header">
  <div class="header-logo">₹</div>
  <div>
    <h1>${t.reportTitle}</h1>
    <p>${t.reportSubtitle}</p>
    <div class="meta-row">
      <span>📅 ${t.fiscalYear}</span>
      <span>📄 ${t.generatedOn}: ${now}</span>
      <span>🟢 Live Sync</span>
    </div>
  </div>
</div>
<div class="confidential">${t.confidential}</div>
<div class="body">
  <div class="section">
    <div class="section-title">📊 ${t.execSummary}</div>
    <div class="summary-box">${t.summaryText}</div>
  </div>
  <div class="section">
    <div class="section-title">💰 ${t.keyMetrics}</div>
    <div class="metrics-grid">
      <div class="metric-card"><div class="value" style="color:${C.govBlue}">₹91,32,527 L</div><div class="label">${t.totalBudget}</div></div>
      <div class="metric-card"><div class="value" style="color:${C.brightBlue}">₹72,25,617 L</div><div class="label">${t.totalExpenditure}</div></div>
      <div class="metric-card"><div class="value" style="color:${C.green}">80%</div><div class="label">${t.avgUtilisation}</div></div>
      <div class="metric-card"><div class="value" style="color:${C.govBlue}">1,16,27,803</div><div class="label">${t.beneficiaryFarmers}</div></div>
      <div class="metric-card"><div class="value" style="color:${C.red}">3</div><div class="label">${t.detectedAnomalies}</div></div>
      <div class="metric-card"><div class="value" style="color:${C.red}">₹342 Cr</div><div class="label">${t.estimatedLeakage}</div></div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">🗺 ${t.divisionFlow}</div>
    <table>
      <thead><tr><th>${t.division}</th><th>${t.allocated}</th><th>${t.spent}</th><th>${t.utilisation}</th></tr></thead>
      <tbody>${divisions.map(d => `<tr><td style="font-weight:600">${d.name}</td><td>₹${d.allocated}</td><td>₹${d.spent}</td><td><span style="color:${d.color};font-weight:700">${d.util}%</span></td></tr>`).join('')}</tbody>
    </table>
  </div>
  <div class="section">
    <div class="section-title">🏛 ${t.deptBreakdown}</div>
    <table>
      <thead><tr><th>${t.department}</th><th>${t.utilisation}</th><th>${t.progress}</th></tr></thead>
      <tbody>${departments.map(d => `<tr><td style="font-weight:600">${d.name}</td><td style="font-weight:700;color:${deptBarColor(d.pct)}">${d.pct}%</td><td><div class="bar-container"><div class="bar-fill" style="width:${d.pct}%;background:${deptBarColor(d.pct)}"></div></div></td></tr>`).join('')}</tbody>
    </table>
  </div>
  <div class="section">
    <div class="section-title">⚠️ ${t.anomalySummary}</div>
    <div class="anomaly-box"><span class="icon">⚠️</span><span>${t.anomaly1}</span></div>
    <div class="anomaly-box"><span class="icon">⚠️</span><span>${t.anomaly2}</span></div>
    <div class="anomaly-box"><span class="icon">⚠️</span><span>${t.anomaly3}</span></div>
  </div>
</div>
<div class="footer">
  <span>ArthaRakshak AI · ${t.dataSource}</span>
  <span>${t.pageInfo}</span>
</div>
</body>
</html>`;
}

/* ══════════════════ MAIN COMPONENT ══════════════════ */
export default function ExportPDFMultilang() {
  const [lang, setLang] = useState('en');
  const [exported, setExported] = useState(false);
  const t = T[lang];
  const isRTL = lang === 'ur';

  const handleExport = () => {
    const html = buildPDFHTML(lang);
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    setTimeout(() => { w.print(); }, 800);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const handlePreview = () => {
    const html = buildPDFHTML(lang);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const contentItems = [
    { icon: '📊', title: t.execSummary, desc: t.execSummaryDesc },
    { icon: '💰', title: t.keyMetrics, desc: t.keyMetricsDesc },
    { icon: '🗺️', title: t.divisionFlow, desc: t.divisionFlowDesc },
    { icon: '🏛️', title: t.deptBreakdown, desc: t.deptBreakdownDesc },
    { icon: '⚠️', title: t.anomalySummary, desc: t.anomalySummaryDesc },
  ];

  const s = {
    page: { minHeight: '100%', background: C.bg, fontFamily: "'DM Sans', sans-serif", animation: 'fadeUp 0.5s ease-out both' },
    grid: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, marginTop: 20 },
    card: { background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: 20 },
    sectionTitle: { fontSize: 13, fontWeight: 700, color: C.govBlue, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
    langBtn: (active) => ({
      width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
      borderRadius: 10, border: `2px solid ${active ? C.govBlue : C.border}`,
      background: active ? C.govBlue : C.card, cursor: 'pointer',
      transition: 'all 0.18s ease', marginBottom: 6,
    }),
    langBtnHover: { background: '#EFF6FF', borderColor: C.brightBlue },
    pill: (active) => ({
      padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
      fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
      background: active ? C.govBlue : '#E2E8F0', color: active ? '#fff' : C.muted,
      transition: 'all 0.18s ease',
    }),
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pop { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
      `}</style>

      <div style={s.page}>
        {/* Page Title */}
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>Multilingual PDF Export</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>Generate professional budget analysis reports in 5 languages</p>
        </div>

        <div style={s.grid}>
          {/* ── LEFT: Language Selector ── */}
          <div style={s.card}>
            <div style={s.sectionTitle}>{t.selectLang}</div>
            {LANGS.map(l => {
              const active = lang === l.code;
              return (
                <button key={l.code} onClick={() => setLang(l.code)}
                  style={s.langBtn(active)}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.borderColor = C.brightBlue; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = C.card; e.currentTarget.style.borderColor = C.border; } }}
                >
                  <span style={{ fontSize: 24 }}>{l.flag}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: active ? '#fff' : C.text, fontFamily: "'DM Sans', sans-serif" }}>{l.native}</div>
                    <div style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.7)' : C.muted, fontFamily: "'DM Sans', sans-serif" }}>{l.label}</div>
                  </div>
                  {active && <span style={{ marginLeft: 'auto', color: '#fff', fontWeight: 700 }}>✓</span>}
                </button>
              );
            })}
          </div>

          {/* ── RIGHT: 3 stacked cards ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Card 1: Report Contents */}
            <div style={s.card}>
              <div style={s.sectionTitle}>{t.reportContents}</div>
              {contentItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < contentItems.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <span style={{ fontSize: 20, width: 36, height: 36, background: '#EFF6FF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Card 2: Live Preview Snippet */}
            <div style={{ ...s.card, direction: isRTL ? 'rtl' : 'ltr' }}>
              <div style={s.sectionTitle}>Live Preview</div>
              <div style={{
                background: `linear-gradient(135deg, ${C.govBlue}, #2B4FC7)`, borderRadius: 10,
                padding: '20px 24px', marginBottom: 14,
              }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>{t.fiscalYear}</div>
                <div style={{ fontSize: 19, fontWeight: 800, color: '#fff', marginBottom: 4, lineHeight: 1.3 }}>{t.reportTitle}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{t.reportSubtitle}</div>
              </div>
              <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                {t.summaryText.slice(0, 120)}…
              </p>
            </div>

            {/* Card 3: Action Buttons + Status */}
            <div style={s.card}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <button onClick={handlePreview} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '11px 20px', borderRadius: 10, border: `2px solid ${C.govBlue}`,
                  background: 'transparent', color: C.govBlue, fontWeight: 700, fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 0.18s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  👁 {t.preview}
                </button>
                <button onClick={handleExport} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '11px 20px', borderRadius: 10, border: 'none',
                  background: exported ? C.green : C.govBlue, color: '#fff', fontWeight: 700, fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  animation: exported ? 'pop 0.4s ease' : 'none',
                  transform: 'translateY(0)',
                  boxShadow: '0 2px 8px rgba(30,58,138,0.25)',
                }}
                  onMouseEnter={e => { if (!exported) { e.currentTarget.style.background = C.brightBlue; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(30,58,138,0.35)'; } }}
                  onMouseLeave={e => { if (!exported) { e.currentTarget.style.background = C.govBlue; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(30,58,138,0.25)'; } }}
                >
                  {exported ? t.exportSuccess : `⬇ ${t.exportPDF}`}
                </button>
              </div>
              <div style={{
                background: '#F0FDF4', border: `1px solid #BBF7D0`, borderRadius: 10,
                padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>{LANGS.find(l => l.code === lang)?.flag}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.green }}>{t.readyBadge}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{LANGS.find(l => l.code === lang)?.label} · {t.ltr} Layout</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom: Language Quick-Switch Bar ── */}
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24, paddingBottom: 12,
        }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)} style={s.pill(lang === l.code)}>
              {l.flag} {l.native}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
