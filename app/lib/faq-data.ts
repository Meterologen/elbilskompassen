export type FaqCategory = "myter" | "ekonomi" | "laddning" | "premie" | "ovrigt";

export interface FaqItem {
  q: string;
  a: string;
  category: FaqCategory;
}

export const CATEGORY_META: { value: FaqCategory; label: string; icon: string }[] = [
  { value: "premie", label: "Elbilspremien 2026", icon: "\uD83C\uDFF7\uFE0F" },
  { value: "ekonomi", label: "Ekonomi & kostnad", icon: "$" },
  { value: "laddning", label: "Laddning", icon: "\u26A1" },
  { value: "ovrigt", label: "Övrigt", icon: "\u2139\uFE0F" },
  { value: "myter", label: "Myter & fakta", icon: "?" },
];

export const FILTER_OPTIONS: { value: FaqCategory | "all"; label: string }[] = [
  { value: "all", label: "Alla" },
  ...CATEGORY_META.map((c) => ({ value: c.value, label: c.label })),
];

export const FAQS: FaqItem[] = [
  // ── Myter & fakta ──
  {
    category: "myter",
    q: "Är elbilar för dyra?",
    a: "Nypriset har sjunkit kraftigt. Räknar du in lägre driftskostnad – billigare bränsle, lägre skatt och mindre underhåll – blir totalkostnaden ofta lägre än bensin redan efter 2–3 år.",
  },
  {
    category: "myter",
    q: "Dör batteriet efter 5 år?",
    a: "Nej. De flesta tillverkare ger 8–15 års garanti på batteriet. Moderna batterier behåller 70–80 % av sin kapacitet efter 200 000 km.",
  },
  {
    category: "myter",
    q: "Finns det tillräckligt med laddstationer?",
    a: "Sverige har över 25 000 publika laddpunkter och nätverket växer snabbt. Cirka 80 % av all laddning sker hemma, så publik laddning behövs främst på längre resor.",
  },
  {
    category: "myter",
    q: "Räcker elen i Sverige om alla kör elbil?",
    a: "Ja. Om hela Sveriges bilflotta vore elektrisk skulle elanvändningen öka med cirka 10 %. Idag står elbilar för ungefär 2 % av den totala elförbrukningen.",
  },
  {
    category: "myter",
    q: "Brinner elbilar lättare?",
    a: "Nej, statistik visar lägre brandrisk per körd kilometer jämfört med fossildrivna bilar.",
  },
  {
    category: "myter",
    q: "Fungerar elbilar i kyla?",
    a: "Räckvidden kan minska 10–30 % vid kyla, men med förvärmning fungerar bilen utmärkt. Tusentals elbilsägare i Norrland kör varje vinter utan problem.",
  },
  {
    category: "myter",
    q: "Tappar elbilar allt sitt värde?",
    a: "Andrahandsvärdena förbättras stadigt. Modeller som Tesla Model 3 och Volvo EX30 håller värdet bra jämfört med fossildrivna bilar i samma klass.",
  },
  {
    category: "myter",
    q: "Borde jag inte vänta med att köpa elbil?",
    a: "Priserna sjunker, laddnätverket växer och besparingarna börjar dag 1. Ju längre du väntar, desto mer pengar betalar du i dyrare bränsle och underhåll.",
  },

  // ── Ekonomi ──
  {
    category: "ekonomi",
    q: "Vad kostar det att ladda en elbil hemma?",
    a: "Med ett genomsnittligt elpris på 1 kr/kWh kostar det cirka 20–30 kr att ladda för 20 mils räckvidd. Det kan jämföras med 150–200 kr i bensin för samma sträcka.",
  },
  {
    category: "ekonomi",
    q: "Är det billigare att leasa eller köpa?",
    a: "Det beror på din situation. Leasing ger lägre ingångskostnad och du slipper risken med andrahandsvärdet. Köp lönar sig ofta på längre sikt. Använd vår kostnadskalkyl för att jämföra.",
  },
  {
    category: "ekonomi",
    q: "Hur mycket sparar jag på underhåll?",
    a: "Elbilar har färre rörliga delar – ingen oljebyte, enklare bromsar (tack vare regenerering) och ingen avgasrening. Underhållskostnaden är ofta 30–50 % lägre.",
  },
  {
    category: "ekonomi",
    q: "Hur påverkas försäkringskostnaden?",
    a: "Försäkringen kan vara något dyrare på grund av högt nypris och dyra reservdelar, men det vägs ofta upp av lägre bränsle- och underhållskostnader.",
  },

  // ── Laddning ──
  {
    category: "laddning",
    q: "Hur lång tid tar det att ladda?",
    a: "Hemma med en wallbox (11 kW): cirka 6–8 timmar för en full laddning. Vid snabbladdare (50–350 kW): 20–40 minuter för 10–80 %. De flesta laddar över natten hemma.",
  },
  {
    category: "laddning",
    q: "Behöver jag installera en laddbox hemma?",
    a: "Det rekommenderas starkt. En wallbox ger säker och snabb laddning. Installationen kostar vanligtvis 10 000–20 000 kr inklusive arbete.",
  },
  {
    category: "laddning",
    q: "Kan jag ladda i ett vanligt vägguttag?",
    a: "Det går, men det är långsamt (ca 1 mil per timme) och rekommenderas inte som permanent lösning. Uttaget måste vara jordat och i gott skick.",
  },
  {
    category: "laddning",
    q: "Vad kostar det att snabbladda på resande fot?",
    a: "Snabbladdning kostar vanligtvis 4–7 kr/kWh beroende på operatör och effekt. En laddning från 10 till 80 % kostar ungefär 200–400 kr.",
  },

  // ── Elbilspremien ──
  {
    category: "premie",
    q: "Vad är elbilspremien?",
    a: "Elbilspremien är ett statligt stöd som ger 1 300 kr/månad i upp till tre år (totalt 46 800 kr) till hushåll som köper eller leasar en elbil. Stödet administreras av Naturvårdsverket och finansieras via EU:s sociala klimatfond.",
  },
  {
    category: "premie",
    q: "Vem kan söka elbilspremien?",
    a: "Privatpersoner vars hushållsinkomst är lägre än 80 % av medelinkomsten och som bor i en av de cirka 177 landsbygdskommuner eller 99 kommuner med begränsad kollektivtrafik som ingår. 14 storstadskommuner är helt uteslutna. Du får inte redan äga en elbil eller laddhybrid.",
  },
  {
    category: "premie",
    q: "Hur mycket kan jag få?",
    a: "Grundpremien är 1 300 kr/månad i upp till 36 månader, totalt 46 800 kr. Har hushållet en inkomst under 50 % av medelinkomsten tillkommer ett starttillägg på 18 000 kr vid första utbetalningen – totalt upp till 64 800 kr.",
  },
  {
    category: "premie",
    q: "Vilka bilar gäller premien för?",
    a: "Premien gäller rena elbilar (inga hybrider eller laddhybrider) med ett inköpspris på max 450 000 kr. Både nya och begagnade bilar omfattas, liksom köp och leasing.",
  },
  {
    category: "premie",
    q: "När kan jag ansöka?",
    a: "Elbilspremien öppnade för ansökningar den 18 mars 2026. Sista ansökningsdag är 30 juni 2029, men för ansökningar efter 30 juni 2028 kan beloppen bli lägre.",
  },
  {
    category: "premie",
    q: "Hur ansöker jag?",
    a: "Ansökan görs digitalt via Naturvårdsverkets webbplats. Besök naturvardsverket.se/elbilspremien för mer information och för att ansöka.",
  },

  // ── Övrigt ──
  {
    category: "ovrigt",
    q: "Kan jag dra husvagn med en elbil?",
    a: "Ja, allt fler elbilar har dragkrok med kapacitet upp till 1 000–2 500 kg. Tänk på att räckvidden minskar med släp. Filtrera på dragkrok i vår modellguide.",
  },
  {
    category: "ovrigt",
    q: "Hur länge håller en elbil?",
    a: "Det finns inga indikationer på att en elbil håller kortare tid än en fossilbil. Elmotorn har extremt lång livslängd och batterierna är garanterade i 8–15 år.",
  },
  {
    category: "ovrigt",
    q: "Är elbilen bra för miljön på riktigt?",
    a: "Ja. Även med hänsyn till batteritillverkning är en elbils totala klimatavtryck 50–70 % lägre än en fossilbils under hela livscykeln, särskilt i Sverige med ren el.",
  },
  {
    category: "ovrigt",
    q: "Kan jag köra långt med elbil?",
    a: "Absolut. Många moderna elbilar har 400–600 km räckvidd. Med snabbladdarnätverket tar en 15-minuterspaus dig ytterligare 15–20 mil. Stockholm–Göteborg går utan problem.",
  },
];
