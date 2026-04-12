// ==================== Country Utilities ====================
// Country detection and mapping for IPTV channel categorization

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
}

/**
 * Comprehensive mapping of country codes, names, and common variations
 * to standardized country info with flag emojis.
 * Keys are UPPERCASE for case-insensitive lookup.
 */
export const COUNTRY_MAP: Record<string, CountryInfo> = {
  // Germany
  DE: { code: "DE", name: "Germany", flag: "\u{1F1E9}\u{1F1EA}" },
  GERMANY: { code: "DE", name: "Germany", flag: "\u{1F1E9}\u{1F1EA}" },
  DEUTSCHLAND: { code: "DE", name: "Germany", flag: "\u{1F1E9}\u{1F1EA}" },
  GERMAN: { code: "DE", name: "Germany", flag: "\u{1F1E9}\u{1F1EA}" },
  DEUTSCH: { code: "DE", name: "Germany", flag: "\u{1F1E9}\u{1F1EA}" },
  DEU: { code: "DE", name: "Germany", flag: "\u{1F1E9}\u{1F1EA}" },

  // United Kingdom
  UK: { code: "UK", name: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}" },
  GB: { code: "UK", name: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}" },
  GBR: { code: "UK", name: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}" },
  ENGLAND: { code: "UK", name: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}" },
  BRITISH: { code: "UK", name: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}" },
  "UNITED KINGDOM": { code: "UK", name: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}" },

  // United States
  US: { code: "US", name: "United States", flag: "\u{1F1FA}\u{1F1F8}" },
  USA: { code: "US", name: "United States", flag: "\u{1F1FA}\u{1F1F8}" },
  "UNITED STATES": { code: "US", name: "United States", flag: "\u{1F1FA}\u{1F1F8}" },
  AMERICA: { code: "US", name: "United States", flag: "\u{1F1FA}\u{1F1F8}" },
  AMERICAN: { code: "US", name: "United States", flag: "\u{1F1FA}\u{1F1F8}" },

  // Turkey
  TR: { code: "TR", name: "Turkey", flag: "\u{1F1F9}\u{1F1F7}" },
  TURKEY: { code: "TR", name: "Turkey", flag: "\u{1F1F9}\u{1F1F7}" },
  "TÜRKEI": { code: "TR", name: "Turkey", flag: "\u{1F1F9}\u{1F1F7}" },
  TURKISH: { code: "TR", name: "Turkey", flag: "\u{1F1F9}\u{1F1F7}" },
  "TÜRKIYE": { code: "TR", name: "Turkey", flag: "\u{1F1F9}\u{1F1F7}" },
  TUR: { code: "TR", name: "Turkey", flag: "\u{1F1F9}\u{1F1F7}" },

  // France
  FR: { code: "FR", name: "France", flag: "\u{1F1EB}\u{1F1F7}" },
  FRANCE: { code: "FR", name: "France", flag: "\u{1F1EB}\u{1F1F7}" },
  FRANKREICH: { code: "FR", name: "France", flag: "\u{1F1EB}\u{1F1F7}" },
  FRENCH: { code: "FR", name: "France", flag: "\u{1F1EB}\u{1F1F7}" },
  FRA: { code: "FR", name: "France", flag: "\u{1F1EB}\u{1F1F7}" },

  // Italy
  IT: { code: "IT", name: "Italy", flag: "\u{1F1EE}\u{1F1F9}" },
  ITALY: { code: "IT", name: "Italy", flag: "\u{1F1EE}\u{1F1F9}" },
  ITALIEN: { code: "IT", name: "Italy", flag: "\u{1F1EE}\u{1F1F9}" },
  ITALIAN: { code: "IT", name: "Italy", flag: "\u{1F1EE}\u{1F1F9}" },
  ITALIA: { code: "IT", name: "Italy", flag: "\u{1F1EE}\u{1F1F9}" },
  ITA: { code: "IT", name: "Italy", flag: "\u{1F1EE}\u{1F1F9}" },

  // Spain
  ES: { code: "ES", name: "Spain", flag: "\u{1F1EA}\u{1F1F8}" },
  SPAIN: { code: "ES", name: "Spain", flag: "\u{1F1EA}\u{1F1F8}" },
  SPANIEN: { code: "ES", name: "Spain", flag: "\u{1F1EA}\u{1F1F8}" },
  SPANISH: { code: "ES", name: "Spain", flag: "\u{1F1EA}\u{1F1F8}" },
  "ESPAÑA": { code: "ES", name: "Spain", flag: "\u{1F1EA}\u{1F1F8}" },
  ESP: { code: "ES", name: "Spain", flag: "\u{1F1EA}\u{1F1F8}" },

  // Netherlands
  NL: { code: "NL", name: "Netherlands", flag: "\u{1F1F3}\u{1F1F1}" },
  NETHERLANDS: { code: "NL", name: "Netherlands", flag: "\u{1F1F3}\u{1F1F1}" },
  HOLLAND: { code: "NL", name: "Netherlands", flag: "\u{1F1F3}\u{1F1F1}" },
  DUTCH: { code: "NL", name: "Netherlands", flag: "\u{1F1F3}\u{1F1F1}" },
  NIEDERLANDE: { code: "NL", name: "Netherlands", flag: "\u{1F1F3}\u{1F1F1}" },
  NLD: { code: "NL", name: "Netherlands", flag: "\u{1F1F3}\u{1F1F1}" },

  // Arabic / Saudi Arabia
  AR: { code: "AR", name: "Arabic", flag: "\u{1F1F8}\u{1F1E6}" },
  ARABIC: { code: "AR", name: "Arabic", flag: "\u{1F1F8}\u{1F1E6}" },
  ARABISCH: { code: "AR", name: "Arabic", flag: "\u{1F1F8}\u{1F1E6}" },
  ARAB: { code: "AR", name: "Arabic", flag: "\u{1F1F8}\u{1F1E6}" },
  SA: { code: "AR", name: "Arabic", flag: "\u{1F1F8}\u{1F1E6}" },
  "SAUDI ARABIA": { code: "AR", name: "Arabic", flag: "\u{1F1F8}\u{1F1E6}" },

  // India
  IN: { code: "IN", name: "India", flag: "\u{1F1EE}\u{1F1F3}" },
  INDIA: { code: "IN", name: "India", flag: "\u{1F1EE}\u{1F1F3}" },
  INDIEN: { code: "IN", name: "India", flag: "\u{1F1EE}\u{1F1F3}" },
  INDIAN: { code: "IN", name: "India", flag: "\u{1F1EE}\u{1F1F3}" },
  HINDI: { code: "IN", name: "India", flag: "\u{1F1EE}\u{1F1F3}" },
  IND: { code: "IN", name: "India", flag: "\u{1F1EE}\u{1F1F3}" },

  // Russia
  RU: { code: "RU", name: "Russia", flag: "\u{1F1F7}\u{1F1FA}" },
  RUSSIA: { code: "RU", name: "Russia", flag: "\u{1F1F7}\u{1F1FA}" },
  RUSSLAND: { code: "RU", name: "Russia", flag: "\u{1F1F7}\u{1F1FA}" },
  RUSSIAN: { code: "RU", name: "Russia", flag: "\u{1F1F7}\u{1F1FA}" },
  RUS: { code: "RU", name: "Russia", flag: "\u{1F1F7}\u{1F1FA}" },

  // Poland
  PL: { code: "PL", name: "Poland", flag: "\u{1F1F5}\u{1F1F1}" },
  POLAND: { code: "PL", name: "Poland", flag: "\u{1F1F5}\u{1F1F1}" },
  POLEN: { code: "PL", name: "Poland", flag: "\u{1F1F5}\u{1F1F1}" },
  POLISH: { code: "PL", name: "Poland", flag: "\u{1F1F5}\u{1F1F1}" },
  POLSKA: { code: "PL", name: "Poland", flag: "\u{1F1F5}\u{1F1F1}" },
  POL: { code: "PL", name: "Poland", flag: "\u{1F1F5}\u{1F1F1}" },

  // Portugal
  PT: { code: "PT", name: "Portugal", flag: "\u{1F1F5}\u{1F1F9}" },
  PORTUGAL: { code: "PT", name: "Portugal", flag: "\u{1F1F5}\u{1F1F9}" },
  PORTUGUESE: { code: "PT", name: "Portugal", flag: "\u{1F1F5}\u{1F1F9}" },
  PRT: { code: "PT", name: "Portugal", flag: "\u{1F1F5}\u{1F1F9}" },

  // Brazil
  BR: { code: "BR", name: "Brazil", flag: "\u{1F1E7}\u{1F1F7}" },
  BRAZIL: { code: "BR", name: "Brazil", flag: "\u{1F1E7}\u{1F1F7}" },
  BRASILIEN: { code: "BR", name: "Brazil", flag: "\u{1F1E7}\u{1F1F7}" },
  BRASIL: { code: "BR", name: "Brazil", flag: "\u{1F1E7}\u{1F1F7}" },
  BRAZILIAN: { code: "BR", name: "Brazil", flag: "\u{1F1E7}\u{1F1F7}" },
  BRA: { code: "BR", name: "Brazil", flag: "\u{1F1E7}\u{1F1F7}" },

  // Canada
  CA: { code: "CA", name: "Canada", flag: "\u{1F1E8}\u{1F1E6}" },
  CANADA: { code: "CA", name: "Canada", flag: "\u{1F1E8}\u{1F1E6}" },
  KANADA: { code: "CA", name: "Canada", flag: "\u{1F1E8}\u{1F1E6}" },
  CANADIAN: { code: "CA", name: "Canada", flag: "\u{1F1E8}\u{1F1E6}" },
  CAN: { code: "CA", name: "Canada", flag: "\u{1F1E8}\u{1F1E6}" },

  // Australia
  AU: { code: "AU", name: "Australia", flag: "\u{1F1E6}\u{1F1FA}" },
  AUSTRALIA: { code: "AU", name: "Australia", flag: "\u{1F1E6}\u{1F1FA}" },
  AUSTRALIEN: { code: "AU", name: "Australia", flag: "\u{1F1E6}\u{1F1FA}" },
  AUS: { code: "AU", name: "Australia", flag: "\u{1F1E6}\u{1F1FA}" },

  // Japan
  JP: { code: "JP", name: "Japan", flag: "\u{1F1EF}\u{1F1F5}" },
  JAPAN: { code: "JP", name: "Japan", flag: "\u{1F1EF}\u{1F1F5}" },
  JAPANESE: { code: "JP", name: "Japan", flag: "\u{1F1EF}\u{1F1F5}" },
  JPN: { code: "JP", name: "Japan", flag: "\u{1F1EF}\u{1F1F5}" },

  // South Korea
  KR: { code: "KR", name: "South Korea", flag: "\u{1F1F0}\u{1F1F7}" },
  KOREA: { code: "KR", name: "South Korea", flag: "\u{1F1F0}\u{1F1F7}" },
  "SOUTH KOREA": { code: "KR", name: "South Korea", flag: "\u{1F1F0}\u{1F1F7}" },
  KOREAN: { code: "KR", name: "South Korea", flag: "\u{1F1F0}\u{1F1F7}" },
  KOR: { code: "KR", name: "South Korea", flag: "\u{1F1F0}\u{1F1F7}" },

  // China
  CN: { code: "CN", name: "China", flag: "\u{1F1E8}\u{1F1F3}" },
  CHINA: { code: "CN", name: "China", flag: "\u{1F1E8}\u{1F1F3}" },
  CHINESE: { code: "CN", name: "China", flag: "\u{1F1E8}\u{1F1F3}" },
  CHN: { code: "CN", name: "China", flag: "\u{1F1E8}\u{1F1F3}" },

  // Mexico
  MX: { code: "MX", name: "Mexico", flag: "\u{1F1F2}\u{1F1FD}" },
  MEXICO: { code: "MX", name: "Mexico", flag: "\u{1F1F2}\u{1F1FD}" },
  MEXIKO: { code: "MX", name: "Mexico", flag: "\u{1F1F2}\u{1F1FD}" },
  MEX: { code: "MX", name: "Mexico", flag: "\u{1F1F2}\u{1F1FD}" },

  // Argentina
  AG: { code: "AG", name: "Argentina", flag: "\u{1F1E6}\u{1F1F7}" },
  ARGENTINA: { code: "AG", name: "Argentina", flag: "\u{1F1E6}\u{1F1F7}" },
  ARGENTINIEN: { code: "AG", name: "Argentina", flag: "\u{1F1E6}\u{1F1F7}" },
  ARG: { code: "AG", name: "Argentina", flag: "\u{1F1E6}\u{1F1F7}" },

  // Colombia
  CO: { code: "CO", name: "Colombia", flag: "\u{1F1E8}\u{1F1F4}" },
  COLOMBIA: { code: "CO", name: "Colombia", flag: "\u{1F1E8}\u{1F1F4}" },
  KOLUMBIEN: { code: "CO", name: "Colombia", flag: "\u{1F1E8}\u{1F1F4}" },
  COL: { code: "CO", name: "Colombia", flag: "\u{1F1E8}\u{1F1F4}" },

  // Chile
  CL: { code: "CL", name: "Chile", flag: "\u{1F1E8}\u{1F1F1}" },
  CHILE: { code: "CL", name: "Chile", flag: "\u{1F1E8}\u{1F1F1}" },
  CHL: { code: "CL", name: "Chile", flag: "\u{1F1E8}\u{1F1F1}" },

  // Sweden
  SE: { code: "SE", name: "Sweden", flag: "\u{1F1F8}\u{1F1EA}" },
  SWEDEN: { code: "SE", name: "Sweden", flag: "\u{1F1F8}\u{1F1EA}" },
  SCHWEDEN: { code: "SE", name: "Sweden", flag: "\u{1F1F8}\u{1F1EA}" },
  SWEDISH: { code: "SE", name: "Sweden", flag: "\u{1F1F8}\u{1F1EA}" },
  SWE: { code: "SE", name: "Sweden", flag: "\u{1F1F8}\u{1F1EA}" },

  // Norway
  NO: { code: "NO", name: "Norway", flag: "\u{1F1F3}\u{1F1F4}" },
  NORWAY: { code: "NO", name: "Norway", flag: "\u{1F1F3}\u{1F1F4}" },
  NORWEGEN: { code: "NO", name: "Norway", flag: "\u{1F1F3}\u{1F1F4}" },
  NORWEGIAN: { code: "NO", name: "Norway", flag: "\u{1F1F3}\u{1F1F4}" },
  NOR: { code: "NO", name: "Norway", flag: "\u{1F1F3}\u{1F1F4}" },

  // Denmark
  DK: { code: "DK", name: "Denmark", flag: "\u{1F1E9}\u{1F1F0}" },
  DENMARK: { code: "DK", name: "Denmark", flag: "\u{1F1E9}\u{1F1F0}" },
  "DÄNEMARK": { code: "DK", name: "Denmark", flag: "\u{1F1E9}\u{1F1F0}" },
  DANISH: { code: "DK", name: "Denmark", flag: "\u{1F1E9}\u{1F1F0}" },
  DNK: { code: "DK", name: "Denmark", flag: "\u{1F1E9}\u{1F1F0}" },

  // Finland
  FI: { code: "FI", name: "Finland", flag: "\u{1F1EB}\u{1F1EE}" },
  FINLAND: { code: "FI", name: "Finland", flag: "\u{1F1EB}\u{1F1EE}" },
  FINNLAND: { code: "FI", name: "Finland", flag: "\u{1F1EB}\u{1F1EE}" },
  FINNISH: { code: "FI", name: "Finland", flag: "\u{1F1EB}\u{1F1EE}" },
  FIN: { code: "FI", name: "Finland", flag: "\u{1F1EB}\u{1F1EE}" },

  // Austria
  AT: { code: "AT", name: "Austria", flag: "\u{1F1E6}\u{1F1F9}" },
  AUSTRIA: { code: "AT", name: "Austria", flag: "\u{1F1E6}\u{1F1F9}" },
  "ÖSTERREICH": { code: "AT", name: "Austria", flag: "\u{1F1E6}\u{1F1F9}" },
  AUT: { code: "AT", name: "Austria", flag: "\u{1F1E6}\u{1F1F9}" },

  // Switzerland
  CH: { code: "CH", name: "Switzerland", flag: "\u{1F1E8}\u{1F1ED}" },
  SWITZERLAND: { code: "CH", name: "Switzerland", flag: "\u{1F1E8}\u{1F1ED}" },
  SCHWEIZ: { code: "CH", name: "Switzerland", flag: "\u{1F1E8}\u{1F1ED}" },
  SWISS: { code: "CH", name: "Switzerland", flag: "\u{1F1E8}\u{1F1ED}" },
  CHE: { code: "CH", name: "Switzerland", flag: "\u{1F1E8}\u{1F1ED}" },

  // Belgium
  BE: { code: "BE", name: "Belgium", flag: "\u{1F1E7}\u{1F1EA}" },
  BELGIUM: { code: "BE", name: "Belgium", flag: "\u{1F1E7}\u{1F1EA}" },
  BELGIEN: { code: "BE", name: "Belgium", flag: "\u{1F1E7}\u{1F1EA}" },
  BELGIAN: { code: "BE", name: "Belgium", flag: "\u{1F1E7}\u{1F1EA}" },
  BEL: { code: "BE", name: "Belgium", flag: "\u{1F1E7}\u{1F1EA}" },

  // Greece
  GR: { code: "GR", name: "Greece", flag: "\u{1F1EC}\u{1F1F7}" },
  GREECE: { code: "GR", name: "Greece", flag: "\u{1F1EC}\u{1F1F7}" },
  GRIECHENLAND: { code: "GR", name: "Greece", flag: "\u{1F1EC}\u{1F1F7}" },
  GREEK: { code: "GR", name: "Greece", flag: "\u{1F1EC}\u{1F1F7}" },
  GRC: { code: "GR", name: "Greece", flag: "\u{1F1EC}\u{1F1F7}" },

  // Romania
  RO: { code: "RO", name: "Romania", flag: "\u{1F1F7}\u{1F1F4}" },
  ROMANIA: { code: "RO", name: "Romania", flag: "\u{1F1F7}\u{1F1F4}" },
  "RUMÄNIEN": { code: "RO", name: "Romania", flag: "\u{1F1F7}\u{1F1F4}" },
  ROMANIAN: { code: "RO", name: "Romania", flag: "\u{1F1F7}\u{1F1F4}" },
  ROU: { code: "RO", name: "Romania", flag: "\u{1F1F7}\u{1F1F4}" },

  // Hungary
  HU: { code: "HU", name: "Hungary", flag: "\u{1F1ED}\u{1F1FA}" },
  HUNGARY: { code: "HU", name: "Hungary", flag: "\u{1F1ED}\u{1F1FA}" },
  UNGARN: { code: "HU", name: "Hungary", flag: "\u{1F1ED}\u{1F1FA}" },
  HUNGARIAN: { code: "HU", name: "Hungary", flag: "\u{1F1ED}\u{1F1FA}" },
  HUN: { code: "HU", name: "Hungary", flag: "\u{1F1ED}\u{1F1FA}" },

  // Czech Republic
  CZ: { code: "CZ", name: "Czech Republic", flag: "\u{1F1E8}\u{1F1FF}" },
  CZECH: { code: "CZ", name: "Czech Republic", flag: "\u{1F1E8}\u{1F1FF}" },
  "CZECH REPUBLIC": { code: "CZ", name: "Czech Republic", flag: "\u{1F1E8}\u{1F1FF}" },
  TSCHECHIEN: { code: "CZ", name: "Czech Republic", flag: "\u{1F1E8}\u{1F1FF}" },
  CZE: { code: "CZ", name: "Czech Republic", flag: "\u{1F1E8}\u{1F1FF}" },

  // Slovakia
  SK: { code: "SK", name: "Slovakia", flag: "\u{1F1F8}\u{1F1F0}" },
  SLOVAKIA: { code: "SK", name: "Slovakia", flag: "\u{1F1F8}\u{1F1F0}" },
  SLOWAKEI: { code: "SK", name: "Slovakia", flag: "\u{1F1F8}\u{1F1F0}" },
  SVK: { code: "SK", name: "Slovakia", flag: "\u{1F1F8}\u{1F1F0}" },

  // Croatia
  HR: { code: "HR", name: "Croatia", flag: "\u{1F1ED}\u{1F1F7}" },
  CROATIA: { code: "HR", name: "Croatia", flag: "\u{1F1ED}\u{1F1F7}" },
  KROATIEN: { code: "HR", name: "Croatia", flag: "\u{1F1ED}\u{1F1F7}" },
  CROATIAN: { code: "HR", name: "Croatia", flag: "\u{1F1ED}\u{1F1F7}" },
  HRV: { code: "HR", name: "Croatia", flag: "\u{1F1ED}\u{1F1F7}" },

  // Serbia
  RS: { code: "RS", name: "Serbia", flag: "\u{1F1F7}\u{1F1F8}" },
  SERBIA: { code: "RS", name: "Serbia", flag: "\u{1F1F7}\u{1F1F8}" },
  SERBIEN: { code: "RS", name: "Serbia", flag: "\u{1F1F7}\u{1F1F8}" },
  SERBIAN: { code: "RS", name: "Serbia", flag: "\u{1F1F7}\u{1F1F8}" },
  SRB: { code: "RS", name: "Serbia", flag: "\u{1F1F7}\u{1F1F8}" },

  // Bulgaria
  BG: { code: "BG", name: "Bulgaria", flag: "\u{1F1E7}\u{1F1EC}" },
  BULGARIA: { code: "BG", name: "Bulgaria", flag: "\u{1F1E7}\u{1F1EC}" },
  BULGARIEN: { code: "BG", name: "Bulgaria", flag: "\u{1F1E7}\u{1F1EC}" },
  BULGARIAN: { code: "BG", name: "Bulgaria", flag: "\u{1F1E7}\u{1F1EC}" },
  BGR: { code: "BG", name: "Bulgaria", flag: "\u{1F1E7}\u{1F1EC}" },

  // Ukraine
  UA: { code: "UA", name: "Ukraine", flag: "\u{1F1FA}\u{1F1E6}" },
  UKRAINE: { code: "UA", name: "Ukraine", flag: "\u{1F1FA}\u{1F1E6}" },
  UKRAINIAN: { code: "UA", name: "Ukraine", flag: "\u{1F1FA}\u{1F1E6}" },
  UKR: { code: "UA", name: "Ukraine", flag: "\u{1F1FA}\u{1F1E6}" },

  // Israel
  IL: { code: "IL", name: "Israel", flag: "\u{1F1EE}\u{1F1F1}" },
  ISRAEL: { code: "IL", name: "Israel", flag: "\u{1F1EE}\u{1F1F1}" },
  HEBREW: { code: "IL", name: "Israel", flag: "\u{1F1EE}\u{1F1F1}" },
  ISR: { code: "IL", name: "Israel", flag: "\u{1F1EE}\u{1F1F1}" },

  // Iran
  IR: { code: "IR", name: "Iran", flag: "\u{1F1EE}\u{1F1F7}" },
  IRAN: { code: "IR", name: "Iran", flag: "\u{1F1EE}\u{1F1F7}" },
  PERSIAN: { code: "IR", name: "Iran", flag: "\u{1F1EE}\u{1F1F7}" },
  FARSI: { code: "IR", name: "Iran", flag: "\u{1F1EE}\u{1F1F7}" },
  IRN: { code: "IR", name: "Iran", flag: "\u{1F1EE}\u{1F1F7}" },

  // Pakistan
  PK: { code: "PK", name: "Pakistan", flag: "\u{1F1F5}\u{1F1F0}" },
  PAKISTAN: { code: "PK", name: "Pakistan", flag: "\u{1F1F5}\u{1F1F0}" },
  PAK: { code: "PK", name: "Pakistan", flag: "\u{1F1F5}\u{1F1F0}" },

  // Bangladesh
  BD: { code: "BD", name: "Bangladesh", flag: "\u{1F1E7}\u{1F1E9}" },
  BANGLADESH: { code: "BD", name: "Bangladesh", flag: "\u{1F1E7}\u{1F1E9}" },
  BANGLA: { code: "BD", name: "Bangladesh", flag: "\u{1F1E7}\u{1F1E9}" },
  BGD: { code: "BD", name: "Bangladesh", flag: "\u{1F1E7}\u{1F1E9}" },

  // Thailand
  TH: { code: "TH", name: "Thailand", flag: "\u{1F1F9}\u{1F1ED}" },
  THAILAND: { code: "TH", name: "Thailand", flag: "\u{1F1F9}\u{1F1ED}" },
  THAI: { code: "TH", name: "Thailand", flag: "\u{1F1F9}\u{1F1ED}" },
  THA: { code: "TH", name: "Thailand", flag: "\u{1F1F9}\u{1F1ED}" },

  // Vietnam
  VN: { code: "VN", name: "Vietnam", flag: "\u{1F1FB}\u{1F1F3}" },
  VIETNAM: { code: "VN", name: "Vietnam", flag: "\u{1F1FB}\u{1F1F3}" },
  VIETNAMESE: { code: "VN", name: "Vietnam", flag: "\u{1F1FB}\u{1F1F3}" },
  VNM: { code: "VN", name: "Vietnam", flag: "\u{1F1FB}\u{1F1F3}" },

  // Philippines
  PH: { code: "PH", name: "Philippines", flag: "\u{1F1F5}\u{1F1ED}" },
  PHILIPPINES: { code: "PH", name: "Philippines", flag: "\u{1F1F5}\u{1F1ED}" },
  PHILIPPINEN: { code: "PH", name: "Philippines", flag: "\u{1F1F5}\u{1F1ED}" },
  FILIPINO: { code: "PH", name: "Philippines", flag: "\u{1F1F5}\u{1F1ED}" },
  PHL: { code: "PH", name: "Philippines", flag: "\u{1F1F5}\u{1F1ED}" },

  // Indonesia
  ID: { code: "ID", name: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}" },
  INDONESIA: { code: "ID", name: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}" },
  INDONESIAN: { code: "ID", name: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}" },
  IDN: { code: "ID", name: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}" },

  // Malaysia
  MY: { code: "MY", name: "Malaysia", flag: "\u{1F1F2}\u{1F1FE}" },
  MALAYSIA: { code: "MY", name: "Malaysia", flag: "\u{1F1F2}\u{1F1FE}" },
  MALAY: { code: "MY", name: "Malaysia", flag: "\u{1F1F2}\u{1F1FE}" },
  MYS: { code: "MY", name: "Malaysia", flag: "\u{1F1F2}\u{1F1FE}" },

  // Egypt
  EG: { code: "EG", name: "Egypt", flag: "\u{1F1EA}\u{1F1EC}" },
  EGYPT: { code: "EG", name: "Egypt", flag: "\u{1F1EA}\u{1F1EC}" },
  "ÄGYPTEN": { code: "EG", name: "Egypt", flag: "\u{1F1EA}\u{1F1EC}" },
  EGYPTIAN: { code: "EG", name: "Egypt", flag: "\u{1F1EA}\u{1F1EC}" },
  EGY: { code: "EG", name: "Egypt", flag: "\u{1F1EA}\u{1F1EC}" },

  // Morocco
  MA: { code: "MA", name: "Morocco", flag: "\u{1F1F2}\u{1F1E6}" },
  MOROCCO: { code: "MA", name: "Morocco", flag: "\u{1F1F2}\u{1F1E6}" },
  MAROKKO: { code: "MA", name: "Morocco", flag: "\u{1F1F2}\u{1F1E6}" },
  MOROCCAN: { code: "MA", name: "Morocco", flag: "\u{1F1F2}\u{1F1E6}" },
  MAR: { code: "MA", name: "Morocco", flag: "\u{1F1F2}\u{1F1E6}" },

  // Tunisia
  TN: { code: "TN", name: "Tunisia", flag: "\u{1F1F9}\u{1F1F3}" },
  TUNISIA: { code: "TN", name: "Tunisia", flag: "\u{1F1F9}\u{1F1F3}" },
  TUNESIEN: { code: "TN", name: "Tunisia", flag: "\u{1F1F9}\u{1F1F3}" },
  TUN: { code: "TN", name: "Tunisia", flag: "\u{1F1F9}\u{1F1F3}" },

  // Algeria
  DZ: { code: "DZ", name: "Algeria", flag: "\u{1F1E9}\u{1F1FF}" },
  ALGERIA: { code: "DZ", name: "Algeria", flag: "\u{1F1E9}\u{1F1FF}" },
  ALGERIEN: { code: "DZ", name: "Algeria", flag: "\u{1F1E9}\u{1F1FF}" },
  DZA: { code: "DZ", name: "Algeria", flag: "\u{1F1E9}\u{1F1FF}" },

  // South Africa
  ZA: { code: "ZA", name: "South Africa", flag: "\u{1F1FF}\u{1F1E6}" },
  "SOUTH AFRICA": { code: "ZA", name: "South Africa", flag: "\u{1F1FF}\u{1F1E6}" },
  "SÜDAFRIKA": { code: "ZA", name: "South Africa", flag: "\u{1F1FF}\u{1F1E6}" },
  ZAF: { code: "ZA", name: "South Africa", flag: "\u{1F1FF}\u{1F1E6}" },

  // Nigeria
  NG: { code: "NG", name: "Nigeria", flag: "\u{1F1F3}\u{1F1EC}" },
  NIGERIA: { code: "NG", name: "Nigeria", flag: "\u{1F1F3}\u{1F1EC}" },
  NGA: { code: "NG", name: "Nigeria", flag: "\u{1F1F3}\u{1F1EC}" },

  // Ireland
  IE: { code: "IE", name: "Ireland", flag: "\u{1F1EE}\u{1F1EA}" },
  IRELAND: { code: "IE", name: "Ireland", flag: "\u{1F1EE}\u{1F1EA}" },
  IRLAND: { code: "IE", name: "Ireland", flag: "\u{1F1EE}\u{1F1EA}" },
  IRISH: { code: "IE", name: "Ireland", flag: "\u{1F1EE}\u{1F1EA}" },
  IRL: { code: "IE", name: "Ireland", flag: "\u{1F1EE}\u{1F1EA}" },

  // New Zealand
  NZ: { code: "NZ", name: "New Zealand", flag: "\u{1F1F3}\u{1F1FF}" },
  "NEW ZEALAND": { code: "NZ", name: "New Zealand", flag: "\u{1F1F3}\u{1F1FF}" },
  NEUSEELAND: { code: "NZ", name: "New Zealand", flag: "\u{1F1F3}\u{1F1FF}" },
  NZL: { code: "NZ", name: "New Zealand", flag: "\u{1F1F3}\u{1F1FF}" },

  // Albania
  AL: { code: "AL", name: "Albania", flag: "\u{1F1E6}\u{1F1F1}" },
  ALBANIA: { code: "AL", name: "Albania", flag: "\u{1F1E6}\u{1F1F1}" },
  ALBANIEN: { code: "AL", name: "Albania", flag: "\u{1F1E6}\u{1F1F1}" },
  ALBANIAN: { code: "AL", name: "Albania", flag: "\u{1F1E6}\u{1F1F1}" },
  ALB: { code: "AL", name: "Albania", flag: "\u{1F1E6}\u{1F1F1}" },

  // Bosnia
  BA: { code: "BA", name: "Bosnia", flag: "\u{1F1E7}\u{1F1E6}" },
  BOSNIA: { code: "BA", name: "Bosnia", flag: "\u{1F1E7}\u{1F1E6}" },
  BOSNIEN: { code: "BA", name: "Bosnia", flag: "\u{1F1E7}\u{1F1E6}" },
  BOSNIAN: { code: "BA", name: "Bosnia", flag: "\u{1F1E7}\u{1F1E6}" },
  BIH: { code: "BA", name: "Bosnia", flag: "\u{1F1E7}\u{1F1E6}" },

  // North Macedonia
  MK: { code: "MK", name: "North Macedonia", flag: "\u{1F1F2}\u{1F1F0}" },
  MACEDONIA: { code: "MK", name: "North Macedonia", flag: "\u{1F1F2}\u{1F1F0}" },
  MAZEDONIEN: { code: "MK", name: "North Macedonia", flag: "\u{1F1F2}\u{1F1F0}" },
  MKD: { code: "MK", name: "North Macedonia", flag: "\u{1F1F2}\u{1F1F0}" },

  // Slovenia
  SI: { code: "SI", name: "Slovenia", flag: "\u{1F1F8}\u{1F1EE}" },
  SLOVENIA: { code: "SI", name: "Slovenia", flag: "\u{1F1F8}\u{1F1EE}" },
  SLOWENIEN: { code: "SI", name: "Slovenia", flag: "\u{1F1F8}\u{1F1EE}" },
  SVN: { code: "SI", name: "Slovenia", flag: "\u{1F1F8}\u{1F1EE}" },

  // Montenegro
  ME: { code: "ME", name: "Montenegro", flag: "\u{1F1F2}\u{1F1EA}" },
  MONTENEGRO: { code: "ME", name: "Montenegro", flag: "\u{1F1F2}\u{1F1EA}" },
  MNE: { code: "ME", name: "Montenegro", flag: "\u{1F1F2}\u{1F1EA}" },

  // Kosovo
  XK: { code: "XK", name: "Kosovo", flag: "\u{1F1FD}\u{1F1F0}" },
  KOSOVO: { code: "XK", name: "Kosovo", flag: "\u{1F1FD}\u{1F1F0}" },

  // Latvia
  LV: { code: "LV", name: "Latvia", flag: "\u{1F1F1}\u{1F1FB}" },
  LATVIA: { code: "LV", name: "Latvia", flag: "\u{1F1F1}\u{1F1FB}" },
  LETTLAND: { code: "LV", name: "Latvia", flag: "\u{1F1F1}\u{1F1FB}" },
  LVA: { code: "LV", name: "Latvia", flag: "\u{1F1F1}\u{1F1FB}" },

  // Lithuania
  LT: { code: "LT", name: "Lithuania", flag: "\u{1F1F1}\u{1F1F9}" },
  LITHUANIA: { code: "LT", name: "Lithuania", flag: "\u{1F1F1}\u{1F1F9}" },
  LITAUEN: { code: "LT", name: "Lithuania", flag: "\u{1F1F1}\u{1F1F9}" },
  LTU: { code: "LT", name: "Lithuania", flag: "\u{1F1F1}\u{1F1F9}" },

  // Estonia
  EE: { code: "EE", name: "Estonia", flag: "\u{1F1EA}\u{1F1EA}" },
  ESTONIA: { code: "EE", name: "Estonia", flag: "\u{1F1EA}\u{1F1EA}" },
  ESTLAND: { code: "EE", name: "Estonia", flag: "\u{1F1EA}\u{1F1EA}" },
  EST: { code: "EE", name: "Estonia", flag: "\u{1F1EA}\u{1F1EA}" },

  // Iceland
  IS: { code: "IS", name: "Iceland", flag: "\u{1F1EE}\u{1F1F8}" },
  ICELAND: { code: "IS", name: "Iceland", flag: "\u{1F1EE}\u{1F1F8}" },
  ISLAND: { code: "IS", name: "Iceland", flag: "\u{1F1EE}\u{1F1F8}" },
  ISL: { code: "IS", name: "Iceland", flag: "\u{1F1EE}\u{1F1F8}" },

  // Luxembourg
  LU: { code: "LU", name: "Luxembourg", flag: "\u{1F1F1}\u{1F1FA}" },
  LUXEMBOURG: { code: "LU", name: "Luxembourg", flag: "\u{1F1F1}\u{1F1FA}" },
  LUXEMBURG: { code: "LU", name: "Luxembourg", flag: "\u{1F1F1}\u{1F1FA}" },
  LUX: { code: "LU", name: "Luxembourg", flag: "\u{1F1F1}\u{1F1FA}" },

  // Malta
  MT: { code: "MT", name: "Malta", flag: "\u{1F1F2}\u{1F1F9}" },
  MALTA: { code: "MT", name: "Malta", flag: "\u{1F1F2}\u{1F1F9}" },
  MLT: { code: "MT", name: "Malta", flag: "\u{1F1F2}\u{1F1F9}" },

  // Cyprus
  CY: { code: "CY", name: "Cyprus", flag: "\u{1F1E8}\u{1F1FE}" },
  CYPRUS: { code: "CY", name: "Cyprus", flag: "\u{1F1E8}\u{1F1FE}" },
  ZYPERN: { code: "CY", name: "Cyprus", flag: "\u{1F1E8}\u{1F1FE}" },
  CYP: { code: "CY", name: "Cyprus", flag: "\u{1F1E8}\u{1F1FE}" },

  // Georgia
  GE: { code: "GE", name: "Georgia", flag: "\u{1F1EC}\u{1F1EA}" },
  GEORGIA: { code: "GE", name: "Georgia", flag: "\u{1F1EC}\u{1F1EA}" },
  GEORGIEN: { code: "GE", name: "Georgia", flag: "\u{1F1EC}\u{1F1EA}" },
  GEO: { code: "GE", name: "Georgia", flag: "\u{1F1EC}\u{1F1EA}" },

  // Armenia
  AM: { code: "AM", name: "Armenia", flag: "\u{1F1E6}\u{1F1F2}" },
  ARMENIA: { code: "AM", name: "Armenia", flag: "\u{1F1E6}\u{1F1F2}" },
  ARMENIEN: { code: "AM", name: "Armenia", flag: "\u{1F1E6}\u{1F1F2}" },
  ARM: { code: "AM", name: "Armenia", flag: "\u{1F1E6}\u{1F1F2}" },

  // Azerbaijan
  AZ: { code: "AZ", name: "Azerbaijan", flag: "\u{1F1E6}\u{1F1FF}" },
  AZERBAIJAN: { code: "AZ", name: "Azerbaijan", flag: "\u{1F1E6}\u{1F1FF}" },
  ASERBAIDSCHAN: { code: "AZ", name: "Azerbaijan", flag: "\u{1F1E6}\u{1F1FF}" },
  AZE: { code: "AZ", name: "Azerbaijan", flag: "\u{1F1E6}\u{1F1FF}" },

  // Kuwait
  KW: { code: "KW", name: "Kuwait", flag: "\u{1F1F0}\u{1F1FC}" },
  KUWAIT: { code: "KW", name: "Kuwait", flag: "\u{1F1F0}\u{1F1FC}" },
  KWT: { code: "KW", name: "Kuwait", flag: "\u{1F1F0}\u{1F1FC}" },

  // Qatar
  QA: { code: "QA", name: "Qatar", flag: "\u{1F1F6}\u{1F1E6}" },
  QATAR: { code: "QA", name: "Qatar", flag: "\u{1F1F6}\u{1F1E6}" },
  KATAR: { code: "QA", name: "Qatar", flag: "\u{1F1F6}\u{1F1E6}" },
  QAT: { code: "QA", name: "Qatar", flag: "\u{1F1F6}\u{1F1E6}" },

  // UAE
  AE: { code: "AE", name: "UAE", flag: "\u{1F1E6}\u{1F1EA}" },
  UAE: { code: "AE", name: "UAE", flag: "\u{1F1E6}\u{1F1EA}" },
  EMIRATES: { code: "AE", name: "UAE", flag: "\u{1F1E6}\u{1F1EA}" },
  ARE: { code: "AE", name: "UAE", flag: "\u{1F1E6}\u{1F1EA}" },

  // Iraq
  IQ: { code: "IQ", name: "Iraq", flag: "\u{1F1EE}\u{1F1F6}" },
  IRAQ: { code: "IQ", name: "Iraq", flag: "\u{1F1EE}\u{1F1F6}" },
  IRAK: { code: "IQ", name: "Iraq", flag: "\u{1F1EE}\u{1F1F6}" },
  IRQ: { code: "IQ", name: "Iraq", flag: "\u{1F1EE}\u{1F1F6}" },

  // Lebanon
  LB: { code: "LB", name: "Lebanon", flag: "\u{1F1F1}\u{1F1E7}" },
  LEBANON: { code: "LB", name: "Lebanon", flag: "\u{1F1F1}\u{1F1E7}" },
  LIBANON: { code: "LB", name: "Lebanon", flag: "\u{1F1F1}\u{1F1E7}" },
  LBN: { code: "LB", name: "Lebanon", flag: "\u{1F1F1}\u{1F1E7}" },

  // Jordan
  JO: { code: "JO", name: "Jordan", flag: "\u{1F1EF}\u{1F1F4}" },
  JORDAN: { code: "JO", name: "Jordan", flag: "\u{1F1EF}\u{1F1F4}" },
  JORDANIEN: { code: "JO", name: "Jordan", flag: "\u{1F1EF}\u{1F1F4}" },
  JOR: { code: "JO", name: "Jordan", flag: "\u{1F1EF}\u{1F1F4}" },

  // Syria
  SY: { code: "SY", name: "Syria", flag: "\u{1F1F8}\u{1F1FE}" },
  SYRIA: { code: "SY", name: "Syria", flag: "\u{1F1F8}\u{1F1FE}" },
  SYRIEN: { code: "SY", name: "Syria", flag: "\u{1F1F8}\u{1F1FE}" },
  SYR: { code: "SY", name: "Syria", flag: "\u{1F1F8}\u{1F1FE}" },

  // Afghanistan
  AF: { code: "AF", name: "Afghanistan", flag: "\u{1F1E6}\u{1F1EB}" },
  AFGHANISTAN: { code: "AF", name: "Afghanistan", flag: "\u{1F1E6}\u{1F1EB}" },
  AFGHAN: { code: "AF", name: "Afghanistan", flag: "\u{1F1E6}\u{1F1EB}" },
  AFG: { code: "AF", name: "Afghanistan", flag: "\u{1F1E6}\u{1F1EB}" },

  // Singapore
  SG: { code: "SG", name: "Singapore", flag: "\u{1F1F8}\u{1F1EC}" },
  SINGAPORE: { code: "SG", name: "Singapore", flag: "\u{1F1F8}\u{1F1EC}" },
  SINGAPUR: { code: "SG", name: "Singapore", flag: "\u{1F1F8}\u{1F1EC}" },
  SGP: { code: "SG", name: "Singapore", flag: "\u{1F1F8}\u{1F1EC}" },

  // Hong Kong
  HK: { code: "HK", name: "Hong Kong", flag: "\u{1F1ED}\u{1F1F0}" },
  "HONG KONG": { code: "HK", name: "Hong Kong", flag: "\u{1F1ED}\u{1F1F0}" },
  HONGKONG: { code: "HK", name: "Hong Kong", flag: "\u{1F1ED}\u{1F1F0}" },
  HKG: { code: "HK", name: "Hong Kong", flag: "\u{1F1ED}\u{1F1F0}" },

  // Taiwan
  TW: { code: "TW", name: "Taiwan", flag: "\u{1F1F9}\u{1F1FC}" },
  TAIWAN: { code: "TW", name: "Taiwan", flag: "\u{1F1F9}\u{1F1FC}" },
  TWN: { code: "TW", name: "Taiwan", flag: "\u{1F1F9}\u{1F1FC}" },

  // Nepal
  NP: { code: "NP", name: "Nepal", flag: "\u{1F1F3}\u{1F1F5}" },
  NEPAL: { code: "NP", name: "Nepal", flag: "\u{1F1F3}\u{1F1F5}" },
  NPL: { code: "NP", name: "Nepal", flag: "\u{1F1F3}\u{1F1F5}" },

  // Sri Lanka
  LK: { code: "LK", name: "Sri Lanka", flag: "\u{1F1F1}\u{1F1F0}" },
  "SRI LANKA": { code: "LK", name: "Sri Lanka", flag: "\u{1F1F1}\u{1F1F0}" },
  SRILANKA: { code: "LK", name: "Sri Lanka", flag: "\u{1F1F1}\u{1F1F0}" },
  LKA: { code: "LK", name: "Sri Lanka", flag: "\u{1F1F1}\u{1F1F0}" },

  // Myanmar
  MM: { code: "MM", name: "Myanmar", flag: "\u{1F1F2}\u{1F1F2}" },
  MYANMAR: { code: "MM", name: "Myanmar", flag: "\u{1F1F2}\u{1F1F2}" },
  BURMA: { code: "MM", name: "Myanmar", flag: "\u{1F1F2}\u{1F1F2}" },
  MMR: { code: "MM", name: "Myanmar", flag: "\u{1F1F2}\u{1F1F2}" },

  // Cambodia
  KH: { code: "KH", name: "Cambodia", flag: "\u{1F1F0}\u{1F1ED}" },
  CAMBODIA: { code: "KH", name: "Cambodia", flag: "\u{1F1F0}\u{1F1ED}" },
  KAMBODSCHA: { code: "KH", name: "Cambodia", flag: "\u{1F1F0}\u{1F1ED}" },
  KHM: { code: "KH", name: "Cambodia", flag: "\u{1F1F0}\u{1F1ED}" },

  // Mongolia
  MN: { code: "MN", name: "Mongolia", flag: "\u{1F1F2}\u{1F1F3}" },
  MONGOLIA: { code: "MN", name: "Mongolia", flag: "\u{1F1F2}\u{1F1F3}" },
  MONGOLEI: { code: "MN", name: "Mongolia", flag: "\u{1F1F2}\u{1F1F3}" },
  MNG: { code: "MN", name: "Mongolia", flag: "\u{1F1F2}\u{1F1F3}" },

  // Kazakhstan
  KZ: { code: "KZ", name: "Kazakhstan", flag: "\u{1F1F0}\u{1F1FF}" },
  KAZAKHSTAN: { code: "KZ", name: "Kazakhstan", flag: "\u{1F1F0}\u{1F1FF}" },
  KASACHSTAN: { code: "KZ", name: "Kazakhstan", flag: "\u{1F1F0}\u{1F1FF}" },
  KAZ: { code: "KZ", name: "Kazakhstan", flag: "\u{1F1F0}\u{1F1FF}" },

  // Uzbekistan
  UZ: { code: "UZ", name: "Uzbekistan", flag: "\u{1F1FA}\u{1F1FF}" },
  UZBEKISTAN: { code: "UZ", name: "Uzbekistan", flag: "\u{1F1FA}\u{1F1FF}" },
  USBEKISTAN: { code: "UZ", name: "Uzbekistan", flag: "\u{1F1FA}\u{1F1FF}" },
  UZB: { code: "UZ", name: "Uzbekistan", flag: "\u{1F1FA}\u{1F1FF}" },

  // Turkmenistan
  TM: { code: "TM", name: "Turkmenistan", flag: "\u{1F1F9}\u{1F1F2}" },
  TURKMENISTAN: { code: "TM", name: "Turkmenistan", flag: "\u{1F1F9}\u{1F1F2}" },
  TKM: { code: "TM", name: "Turkmenistan", flag: "\u{1F1F9}\u{1F1F2}" },

  // Kyrgyzstan
  KG: { code: "KG", name: "Kyrgyzstan", flag: "\u{1F1F0}\u{1F1EC}" },
  KYRGYZSTAN: { code: "KG", name: "Kyrgyzstan", flag: "\u{1F1F0}\u{1F1EC}" },
  KIRGISTAN: { code: "KG", name: "Kyrgyzstan", flag: "\u{1F1F0}\u{1F1EC}" },
  KGZ: { code: "KG", name: "Kyrgyzstan", flag: "\u{1F1F0}\u{1F1EC}" },

  // Tajikistan
  TJ: { code: "TJ", name: "Tajikistan", flag: "\u{1F1F9}\u{1F1EF}" },
  TAJIKISTAN: { code: "TJ", name: "Tajikistan", flag: "\u{1F1F9}\u{1F1EF}" },
  TADSCHIKISTAN: { code: "TJ", name: "Tajikistan", flag: "\u{1F1F9}\u{1F1EF}" },
  TJK: { code: "TJ", name: "Tajikistan", flag: "\u{1F1F9}\u{1F1EF}" },

  // Kenya
  KE: { code: "KE", name: "Kenya", flag: "\u{1F1F0}\u{1F1EA}" },
  KENYA: { code: "KE", name: "Kenya", flag: "\u{1F1F0}\u{1F1EA}" },
  KENIA: { code: "KE", name: "Kenya", flag: "\u{1F1F0}\u{1F1EA}" },
  KEN: { code: "KE", name: "Kenya", flag: "\u{1F1F0}\u{1F1EA}" },

  // Ethiopia
  ET: { code: "ET", name: "Ethiopia", flag: "\u{1F1EA}\u{1F1F9}" },
  ETHIOPIA: { code: "ET", name: "Ethiopia", flag: "\u{1F1EA}\u{1F1F9}" },
  "ÄTHIOPIEN": { code: "ET", name: "Ethiopia", flag: "\u{1F1EA}\u{1F1F9}" },
  ETH: { code: "ET", name: "Ethiopia", flag: "\u{1F1EA}\u{1F1F9}" },

  // Ghana
  GH: { code: "GH", name: "Ghana", flag: "\u{1F1EC}\u{1F1ED}" },
  GHANA: { code: "GH", name: "Ghana", flag: "\u{1F1EC}\u{1F1ED}" },
  GHA: { code: "GH", name: "Ghana", flag: "\u{1F1EC}\u{1F1ED}" },

  // Cameroon
  CM: { code: "CM", name: "Cameroon", flag: "\u{1F1E8}\u{1F1F2}" },
  CAMEROON: { code: "CM", name: "Cameroon", flag: "\u{1F1E8}\u{1F1F2}" },
  KAMERUN: { code: "CM", name: "Cameroon", flag: "\u{1F1E8}\u{1F1F2}" },
  CMR: { code: "CM", name: "Cameroon", flag: "\u{1F1E8}\u{1F1F2}" },

  // Senegal
  SN: { code: "SN", name: "Senegal", flag: "\u{1F1F8}\u{1F1F3}" },
  SENEGAL: { code: "SN", name: "Senegal", flag: "\u{1F1F8}\u{1F1F3}" },
  SEN: { code: "SN", name: "Senegal", flag: "\u{1F1F8}\u{1F1F3}" },

  // Somalia
  SO: { code: "SO", name: "Somalia", flag: "\u{1F1F8}\u{1F1F4}" },
  SOMALIA: { code: "SO", name: "Somalia", flag: "\u{1F1F8}\u{1F1F4}" },
  SOM: { code: "SO", name: "Somalia", flag: "\u{1F1F8}\u{1F1F4}" },

  // Sudan
  SD: { code: "SD", name: "Sudan", flag: "\u{1F1F8}\u{1F1E9}" },
  SUDAN: { code: "SD", name: "Sudan", flag: "\u{1F1F8}\u{1F1E9}" },
  SDN: { code: "SD", name: "Sudan", flag: "\u{1F1F8}\u{1F1E9}" },

  // Libya
  LY: { code: "LY", name: "Libya", flag: "\u{1F1F1}\u{1F1FE}" },
  LIBYA: { code: "LY", name: "Libya", flag: "\u{1F1F1}\u{1F1FE}" },
  LIBYEN: { code: "LY", name: "Libya", flag: "\u{1F1F1}\u{1F1FE}" },
  LBY: { code: "LY", name: "Libya", flag: "\u{1F1F1}\u{1F1FE}" },

  // Yemen
  YE: { code: "YE", name: "Yemen", flag: "\u{1F1FE}\u{1F1EA}" },
  YEMEN: { code: "YE", name: "Yemen", flag: "\u{1F1FE}\u{1F1EA}" },
  JEMEN: { code: "YE", name: "Yemen", flag: "\u{1F1FE}\u{1F1EA}" },
  YEM: { code: "YE", name: "Yemen", flag: "\u{1F1FE}\u{1F1EA}" },

  // Oman
  OM: { code: "OM", name: "Oman", flag: "\u{1F1F4}\u{1F1F2}" },
  OMAN: { code: "OM", name: "Oman", flag: "\u{1F1F4}\u{1F1F2}" },
  OMN: { code: "OM", name: "Oman", flag: "\u{1F1F4}\u{1F1F2}" },

  // Bahrain
  BH: { code: "BH", name: "Bahrain", flag: "\u{1F1E7}\u{1F1ED}" },
  BAHRAIN: { code: "BH", name: "Bahrain", flag: "\u{1F1E7}\u{1F1ED}" },
  BHR: { code: "BH", name: "Bahrain", flag: "\u{1F1E7}\u{1F1ED}" },

  // Palestine
  PS: { code: "PS", name: "Palestine", flag: "\u{1F1F5}\u{1F1F8}" },
  PALESTINE: { code: "PS", name: "Palestine", flag: "\u{1F1F5}\u{1F1F8}" },
  "PALÄSTINA": { code: "PS", name: "Palestine", flag: "\u{1F1F5}\u{1F1F8}" },
  PSE: { code: "PS", name: "Palestine", flag: "\u{1F1F5}\u{1F1F8}" },

  // Cuba
  CU: { code: "CU", name: "Cuba", flag: "\u{1F1E8}\u{1F1FA}" },
  CUBA: { code: "CU", name: "Cuba", flag: "\u{1F1E8}\u{1F1FA}" },
  KUBA: { code: "CU", name: "Cuba", flag: "\u{1F1E8}\u{1F1FA}" },
  CUB: { code: "CU", name: "Cuba", flag: "\u{1F1E8}\u{1F1FA}" },

  // Dominican Republic
  DO: { code: "DO", name: "Dominican Republic", flag: "\u{1F1E9}\u{1F1F4}" },
  "DOMINICAN REPUBLIC": { code: "DO", name: "Dominican Republic", flag: "\u{1F1E9}\u{1F1F4}" },
  DOM: { code: "DO", name: "Dominican Republic", flag: "\u{1F1E9}\u{1F1F4}" },

  // Costa Rica
  CR: { code: "CR", name: "Costa Rica", flag: "\u{1F1E8}\u{1F1F7}" },
  "COSTA RICA": { code: "CR", name: "Costa Rica", flag: "\u{1F1E8}\u{1F1F7}" },
  CRI: { code: "CR", name: "Costa Rica", flag: "\u{1F1E8}\u{1F1F7}" },

  // Panama
  PA: { code: "PA", name: "Panama", flag: "\u{1F1F5}\u{1F1E6}" },
  PANAMA: { code: "PA", name: "Panama", flag: "\u{1F1F5}\u{1F1E6}" },
  PAN: { code: "PA", name: "Panama", flag: "\u{1F1F5}\u{1F1E6}" },

  // Peru
  PE: { code: "PE", name: "Peru", flag: "\u{1F1F5}\u{1F1EA}" },
  PERU: { code: "PE", name: "Peru", flag: "\u{1F1F5}\u{1F1EA}" },
  PER: { code: "PE", name: "Peru", flag: "\u{1F1F5}\u{1F1EA}" },

  // Venezuela
  VE: { code: "VE", name: "Venezuela", flag: "\u{1F1FB}\u{1F1EA}" },
  VENEZUELA: { code: "VE", name: "Venezuela", flag: "\u{1F1FB}\u{1F1EA}" },
  VEN: { code: "VE", name: "Venezuela", flag: "\u{1F1FB}\u{1F1EA}" },

  // Ecuador
  EC: { code: "EC", name: "Ecuador", flag: "\u{1F1EA}\u{1F1E8}" },
  ECUADOR: { code: "EC", name: "Ecuador", flag: "\u{1F1EA}\u{1F1E8}" },
  ECU: { code: "EC", name: "Ecuador", flag: "\u{1F1EA}\u{1F1E8}" },

  // Bolivia
  BO: { code: "BO", name: "Bolivia", flag: "\u{1F1E7}\u{1F1F4}" },
  BOLIVIA: { code: "BO", name: "Bolivia", flag: "\u{1F1E7}\u{1F1F4}" },
  BOLIVIEN: { code: "BO", name: "Bolivia", flag: "\u{1F1E7}\u{1F1F4}" },
  BOL: { code: "BO", name: "Bolivia", flag: "\u{1F1E7}\u{1F1F4}" },

  // Paraguay
  PY: { code: "PY", name: "Paraguay", flag: "\u{1F1F5}\u{1F1FE}" },
  PARAGUAY: { code: "PY", name: "Paraguay", flag: "\u{1F1F5}\u{1F1FE}" },
  PRY: { code: "PY", name: "Paraguay", flag: "\u{1F1F5}\u{1F1FE}" },

  // Uruguay
  UY: { code: "UY", name: "Uruguay", flag: "\u{1F1FA}\u{1F1FE}" },
  URUGUAY: { code: "UY", name: "Uruguay", flag: "\u{1F1FA}\u{1F1FE}" },
  URY: { code: "UY", name: "Uruguay", flag: "\u{1F1FA}\u{1F1FE}" },

  // Jamaica
  JM: { code: "JM", name: "Jamaica", flag: "\u{1F1EF}\u{1F1F2}" },
  JAMAICA: { code: "JM", name: "Jamaica", flag: "\u{1F1EF}\u{1F1F2}" },
  JAMAIKA: { code: "JM", name: "Jamaica", flag: "\u{1F1EF}\u{1F1F2}" },
  JAM: { code: "JM", name: "Jamaica", flag: "\u{1F1EF}\u{1F1F2}" },

  // Moldova
  MD: { code: "MD", name: "Moldova", flag: "\u{1F1F2}\u{1F1E9}" },
  MOLDOVA: { code: "MD", name: "Moldova", flag: "\u{1F1F2}\u{1F1E9}" },
  MOLDAWIEN: { code: "MD", name: "Moldova", flag: "\u{1F1F2}\u{1F1E9}" },
  MDA: { code: "MD", name: "Moldova", flag: "\u{1F1F2}\u{1F1E9}" },

  // Belarus
  BY: { code: "BY", name: "Belarus", flag: "\u{1F1E7}\u{1F1FE}" },
  BELARUS: { code: "BY", name: "Belarus", flag: "\u{1F1E7}\u{1F1FE}" },
  WEISSRUSSLAND: { code: "BY", name: "Belarus", flag: "\u{1F1E7}\u{1F1FE}" },
  BLR: { code: "BY", name: "Belarus", flag: "\u{1F1E7}\u{1F1FE}" },

  // North Korea
  KP: { code: "KP", name: "North Korea", flag: "\u{1F1F0}\u{1F1F5}" },
  "NORTH KOREA": { code: "KP", name: "North Korea", flag: "\u{1F1F0}\u{1F1F5}" },
  NORDKOREA: { code: "KP", name: "North Korea", flag: "\u{1F1F0}\u{1F1F5}" },
  PRK: { code: "KP", name: "North Korea", flag: "\u{1F1F0}\u{1F1F5}" },

  // Laos
  LA: { code: "LA", name: "Laos", flag: "\u{1F1F1}\u{1F1E6}" },
  LAOS: { code: "LA", name: "Laos", flag: "\u{1F1F1}\u{1F1E6}" },
  LAO: { code: "LA", name: "Laos", flag: "\u{1F1F1}\u{1F1E6}" },

  // Maldives
  MV: { code: "MV", name: "Maldives", flag: "\u{1F1F2}\u{1F1FB}" },
  MALDIVES: { code: "MV", name: "Maldives", flag: "\u{1F1F2}\u{1F1FB}" },
  MALEDIVEN: { code: "MV", name: "Maldives", flag: "\u{1F1F2}\u{1F1FB}" },
  MDV: { code: "MV", name: "Maldives", flag: "\u{1F1F2}\u{1F1FB}" },

  // Tanzania
  TZ: { code: "TZ", name: "Tanzania", flag: "\u{1F1F9}\u{1F1FF}" },
  TANZANIA: { code: "TZ", name: "Tanzania", flag: "\u{1F1F9}\u{1F1FF}" },
  TANSANIA: { code: "TZ", name: "Tanzania", flag: "\u{1F1F9}\u{1F1FF}" },
  TZA: { code: "TZ", name: "Tanzania", flag: "\u{1F1F9}\u{1F1FF}" },

  // Uganda
  UG: { code: "UG", name: "Uganda", flag: "\u{1F1FA}\u{1F1EC}" },
  UGANDA: { code: "UG", name: "Uganda", flag: "\u{1F1FA}\u{1F1EC}" },
  UGA: { code: "UG", name: "Uganda", flag: "\u{1F1FA}\u{1F1EC}" },

  // Zimbabwe
  ZW: { code: "ZW", name: "Zimbabwe", flag: "\u{1F1FF}\u{1F1FC}" },
  ZIMBABWE: { code: "ZW", name: "Zimbabwe", flag: "\u{1F1FF}\u{1F1FC}" },
  SIMBABWE: { code: "ZW", name: "Zimbabwe", flag: "\u{1F1FF}\u{1F1FC}" },
  ZWE: { code: "ZW", name: "Zimbabwe", flag: "\u{1F1FF}\u{1F1FC}" },

  // Mozambique
  MZ: { code: "MZ", name: "Mozambique", flag: "\u{1F1F2}\u{1F1FF}" },
  MOZAMBIQUE: { code: "MZ", name: "Mozambique", flag: "\u{1F1F2}\u{1F1FF}" },
  MOSAMBIK: { code: "MZ", name: "Mozambique", flag: "\u{1F1F2}\u{1F1FF}" },
  MOZ: { code: "MZ", name: "Mozambique", flag: "\u{1F1F2}\u{1F1FF}" },

  // Angola
  AO: { code: "AO", name: "Angola", flag: "\u{1F1E6}\u{1F1F4}" },
  ANGOLA: { code: "AO", name: "Angola", flag: "\u{1F1E6}\u{1F1F4}" },
  AGO: { code: "AO", name: "Angola", flag: "\u{1F1E6}\u{1F1F4}" },

  // Ivory Coast
  CI: { code: "CI", name: "Ivory Coast", flag: "\u{1F1E8}\u{1F1EE}" },
  "IVORY COAST": { code: "CI", name: "Ivory Coast", flag: "\u{1F1E8}\u{1F1EE}" },
  "COTE D'IVOIRE": { code: "CI", name: "Ivory Coast", flag: "\u{1F1E8}\u{1F1EE}" },
  ELFENBEINKÜSTE: { code: "CI", name: "Ivory Coast", flag: "\u{1F1E8}\u{1F1EE}" },
  CIV: { code: "CI", name: "Ivory Coast", flag: "\u{1F1E8}\u{1F1EE}" },

  // Madagascar
  MG: { code: "MG", name: "Madagascar", flag: "\u{1F1F2}\u{1F1EC}" },
  MADAGASCAR: { code: "MG", name: "Madagascar", flag: "\u{1F1F2}\u{1F1EC}" },
  MADAGASKAR: { code: "MG", name: "Madagascar", flag: "\u{1F1F2}\u{1F1EC}" },
  MDG: { code: "MG", name: "Madagascar", flag: "\u{1F1F2}\u{1F1EC}" },

  // Niger
  NE: { code: "NE", name: "Niger", flag: "\u{1F1F3}\u{1F1EA}" },
  NIGER: { code: "NE", name: "Niger", flag: "\u{1F1F3}\u{1F1EA}" },
  NER: { code: "NE", name: "Niger", flag: "\u{1F1F3}\u{1F1EA}" },

  // Mali
  ML: { code: "ML", name: "Mali", flag: "\u{1F1F2}\u{1F1F1}" },
  MALI: { code: "ML", name: "Mali", flag: "\u{1F1F2}\u{1F1F1}" },
  MLI: { code: "ML", name: "Mali", flag: "\u{1F1F2}\u{1F1F1}" },

  // Burkina Faso
  BF: { code: "BF", name: "Burkina Faso", flag: "\u{1F1E7}\u{1F1EB}" },
  "BURKINA FASO": { code: "BF", name: "Burkina Faso", flag: "\u{1F1E7}\u{1F1EB}" },
  BURKINA: { code: "BF", name: "Burkina Faso", flag: "\u{1F1E7}\u{1F1EB}" },
  BFA: { code: "BF", name: "Burkina Faso", flag: "\u{1F1E7}\u{1F1EB}" },

  // Congo (DRC)
  CD: { code: "CD", name: "DR Congo", flag: "\u{1F1E8}\u{1F1E9}" },
  CONGO: { code: "CD", name: "DR Congo", flag: "\u{1F1E8}\u{1F1E9}" },
  "DR CONGO": { code: "CD", name: "DR Congo", flag: "\u{1F1E8}\u{1F1E9}" },
  KONGO: { code: "CD", name: "DR Congo", flag: "\u{1F1E8}\u{1F1E9}" },
  COD: { code: "CD", name: "DR Congo", flag: "\u{1F1E8}\u{1F1E9}" },

  // Congo (Republic)
  CG: { code: "CG", name: "Congo", flag: "\u{1F1E8}\u{1F1EC}" },
  COG: { code: "CG", name: "Congo", flag: "\u{1F1E8}\u{1F1EC}" },

  // Rwanda
  RW: { code: "RW", name: "Rwanda", flag: "\u{1F1F7}\u{1F1FC}" },
  RWANDA: { code: "RW", name: "Rwanda", flag: "\u{1F1F7}\u{1F1FC}" },
  RUANDA: { code: "RW", name: "Rwanda", flag: "\u{1F1F7}\u{1F1FC}" },
  RWA: { code: "RW", name: "Rwanda", flag: "\u{1F1F7}\u{1F1FC}" },

  // Mauritius
  MU: { code: "MU", name: "Mauritius", flag: "\u{1F1F2}\u{1F1FA}" },
  MAURITIUS: { code: "MU", name: "Mauritius", flag: "\u{1F1F2}\u{1F1FA}" },
  MUS: { code: "MU", name: "Mauritius", flag: "\u{1F1F2}\u{1F1FA}" },

  // Benin
  BJ: { code: "BJ", name: "Benin", flag: "\u{1F1E7}\u{1F1EF}" },
  BENIN: { code: "BJ", name: "Benin", flag: "\u{1F1E7}\u{1F1EF}" },
  BEN: { code: "BJ", name: "Benin", flag: "\u{1F1E7}\u{1F1EF}" },

  // Togo
  TG: { code: "TG", name: "Togo", flag: "\u{1F1F9}\u{1F1EC}" },
  TOGO: { code: "TG", name: "Togo", flag: "\u{1F1F9}\u{1F1EC}" },
  TGO: { code: "TG", name: "Togo", flag: "\u{1F1F9}\u{1F1EC}" },

  // Gabon
  GA: { code: "GA", name: "Gabon", flag: "\u{1F1EC}\u{1F1E6}" },
  GABON: { code: "GA", name: "Gabon", flag: "\u{1F1EC}\u{1F1E6}" },
  GABUN: { code: "GA", name: "Gabon", flag: "\u{1F1EC}\u{1F1E6}" },
  GAB: { code: "GA", name: "Gabon", flag: "\u{1F1EC}\u{1F1E6}" },

  // Mauritania
  MR: { code: "MR", name: "Mauritania", flag: "\u{1F1F2}\u{1F1F7}" },
  MAURITANIA: { code: "MR", name: "Mauritania", flag: "\u{1F1F2}\u{1F1F7}" },
  MAURETANIEN: { code: "MR", name: "Mauritania", flag: "\u{1F1F2}\u{1F1F7}" },
  MRT: { code: "MR", name: "Mauritania", flag: "\u{1F1F2}\u{1F1F7}" },

  // Eritrea
  ER: { code: "ER", name: "Eritrea", flag: "\u{1F1EA}\u{1F1F7}" },
  ERITREA: { code: "ER", name: "Eritrea", flag: "\u{1F1EA}\u{1F1F7}" },
  ERI: { code: "ER", name: "Eritrea", flag: "\u{1F1EA}\u{1F1F7}" },

  // Djibouti
  DJ: { code: "DJ", name: "Djibouti", flag: "\u{1F1E9}\u{1F1EF}" },
  DJIBOUTI: { code: "DJ", name: "Djibouti", flag: "\u{1F1E9}\u{1F1EF}" },
  DSCHIBUTI: { code: "DJ", name: "Djibouti", flag: "\u{1F1E9}\u{1F1EF}" },
  DJI: { code: "DJ", name: "Djibouti", flag: "\u{1F1E9}\u{1F1EF}" },

  // Cape Verde
  CV: { code: "CV", name: "Cape Verde", flag: "\u{1F1E8}\u{1F1FB}" },
  "CAPE VERDE": { code: "CV", name: "Cape Verde", flag: "\u{1F1E8}\u{1F1FB}" },
  "KAP VERDE": { code: "CV", name: "Cape Verde", flag: "\u{1F1E8}\u{1F1FB}" },
  CPV: { code: "CV", name: "Cape Verde", flag: "\u{1F1E8}\u{1F1FB}" },

  // Seychelles
  SC: { code: "SC", name: "Seychelles", flag: "\u{1F1F8}\u{1F1E8}" },
  SEYCHELLES: { code: "SC", name: "Seychelles", flag: "\u{1F1F8}\u{1F1E8}" },
  SEYCHELLEN: { code: "SC", name: "Seychelles", flag: "\u{1F1F8}\u{1F1E8}" },
  SYC: { code: "SC", name: "Seychelles", flag: "\u{1F1F8}\u{1F1E8}" },

  // Guatemala
  GT: { code: "GT", name: "Guatemala", flag: "\u{1F1EC}\u{1F1F9}" },
  GUATEMALA: { code: "GT", name: "Guatemala", flag: "\u{1F1EC}\u{1F1F9}" },
  GTM: { code: "GT", name: "Guatemala", flag: "\u{1F1EC}\u{1F1F9}" },

  // Honduras
  HN: { code: "HN", name: "Honduras", flag: "\u{1F1ED}\u{1F1F3}" },
  HONDURAS: { code: "HN", name: "Honduras", flag: "\u{1F1ED}\u{1F1F3}" },
  HND: { code: "HN", name: "Honduras", flag: "\u{1F1ED}\u{1F1F3}" },

  // El Salvador
  SV: { code: "SV", name: "El Salvador", flag: "\u{1F1F8}\u{1F1FB}" },
  "EL SALVADOR": { code: "SV", name: "El Salvador", flag: "\u{1F1F8}\u{1F1FB}" },
  SALVADOR: { code: "SV", name: "El Salvador", flag: "\u{1F1F8}\u{1F1FB}" },
  SLV: { code: "SV", name: "El Salvador", flag: "\u{1F1F8}\u{1F1FB}" },

  // Nicaragua
  NI: { code: "NI", name: "Nicaragua", flag: "\u{1F1F3}\u{1F1EE}" },
  NICARAGUA: { code: "NI", name: "Nicaragua", flag: "\u{1F1F3}\u{1F1EE}" },
  NIC: { code: "NI", name: "Nicaragua", flag: "\u{1F1F3}\u{1F1EE}" },

  // Trinidad and Tobago
  TT: { code: "TT", name: "Trinidad & Tobago", flag: "\u{1F1F9}\u{1F1F9}" },
  TRINIDAD: { code: "TT", name: "Trinidad & Tobago", flag: "\u{1F1F9}\u{1F1F9}" },
  "TRINIDAD AND TOBAGO": { code: "TT", name: "Trinidad & Tobago", flag: "\u{1F1F9}\u{1F1F9}" },
  TTO: { code: "TT", name: "Trinidad & Tobago", flag: "\u{1F1F9}\u{1F1F9}" },

  // Haiti
  HT: { code: "HT", name: "Haiti", flag: "\u{1F1ED}\u{1F1F9}" },
  HAITI: { code: "HT", name: "Haiti", flag: "\u{1F1ED}\u{1F1F9}" },
  HTI: { code: "HT", name: "Haiti", flag: "\u{1F1ED}\u{1F1F9}" },

  // Puerto Rico
  PR: { code: "PR", name: "Puerto Rico", flag: "\u{1F1F5}\u{1F1F7}" },
  "PUERTO RICO": { code: "PR", name: "Puerto Rico", flag: "\u{1F1F5}\u{1F1F7}" },
  PRI: { code: "PR", name: "Puerto Rico", flag: "\u{1F1F5}\u{1F1F7}" },

  // Bhutan
  BT: { code: "BT", name: "Bhutan", flag: "\u{1F1E7}\u{1F1F9}" },
  BHUTAN: { code: "BT", name: "Bhutan", flag: "\u{1F1E7}\u{1F1F9}" },
  BTN: { code: "BT", name: "Bhutan", flag: "\u{1F1E7}\u{1F1F9}" },

  // Brunei
  BN: { code: "BN", name: "Brunei", flag: "\u{1F1E7}\u{1F1F3}" },
  BRUNEI: { code: "BN", name: "Brunei", flag: "\u{1F1E7}\u{1F1F3}" },
  BRN: { code: "BN", name: "Brunei", flag: "\u{1F1E7}\u{1F1F3}" },

  // Fiji
  FJ: { code: "FJ", name: "Fiji", flag: "\u{1F1EB}\u{1F1EF}" },
  FIJI: { code: "FJ", name: "Fiji", flag: "\u{1F1EB}\u{1F1EF}" },
  FIDSCHI: { code: "FJ", name: "Fiji", flag: "\u{1F1EB}\u{1F1EF}" },
  FJI: { code: "FJ", name: "Fiji", flag: "\u{1F1EB}\u{1F1EF}" },

  // Papua New Guinea
  PG: { code: "PG", name: "Papua New Guinea", flag: "\u{1F1F5}\u{1F1EC}" },
  "PAPUA NEW GUINEA": { code: "PG", name: "Papua New Guinea", flag: "\u{1F1F5}\u{1F1EC}" },
  PNG: { code: "PG", name: "Papua New Guinea", flag: "\u{1F1F5}\u{1F1EC}" },

  // Andorra
  AD: { code: "AD", name: "Andorra", flag: "\u{1F1E6}\u{1F1E9}" },
  ANDORRA: { code: "AD", name: "Andorra", flag: "\u{1F1E6}\u{1F1E9}" },
  AND: { code: "AD", name: "Andorra", flag: "\u{1F1E6}\u{1F1E9}" },

  // Monaco
  MC: { code: "MC", name: "Monaco", flag: "\u{1F1F2}\u{1F1E8}" },
  MONACO: { code: "MC", name: "Monaco", flag: "\u{1F1F2}\u{1F1E8}" },
  MCO: { code: "MC", name: "Monaco", flag: "\u{1F1F2}\u{1F1E8}" },

  // San Marino
  SM: { code: "SM", name: "San Marino", flag: "\u{1F1F8}\u{1F1F2}" },
  "SAN MARINO": { code: "SM", name: "San Marino", flag: "\u{1F1F8}\u{1F1F2}" },
  SMR: { code: "SM", name: "San Marino", flag: "\u{1F1F8}\u{1F1F2}" },

  // Liechtenstein
  LI: { code: "LI", name: "Liechtenstein", flag: "\u{1F1F1}\u{1F1EE}" },
  LIECHTENSTEIN: { code: "LI", name: "Liechtenstein", flag: "\u{1F1F1}\u{1F1EE}" },
  LIE: { code: "LI", name: "Liechtenstein", flag: "\u{1F1F1}\u{1F1EE}" },

  // Guyana
  GY: { code: "GY", name: "Guyana", flag: "\u{1F1EC}\u{1F1FE}" },
  GUYANA: { code: "GY", name: "Guyana", flag: "\u{1F1EC}\u{1F1FE}" },
  GUY: { code: "GY", name: "Guyana", flag: "\u{1F1EC}\u{1F1FE}" },

  // Suriname
  SR: { code: "SR", name: "Suriname", flag: "\u{1F1F8}\u{1F1F7}" },
  SURINAME: { code: "SR", name: "Suriname", flag: "\u{1F1F8}\u{1F1F7}" },
  SUR: { code: "SR", name: "Suriname", flag: "\u{1F1F8}\u{1F1F7}" },

  // Belize
  BZ: { code: "BZ", name: "Belize", flag: "\u{1F1E7}\u{1F1FF}" },
  BELIZE: { code: "BZ", name: "Belize", flag: "\u{1F1E7}\u{1F1FF}" },
  BLZ: { code: "BZ", name: "Belize", flag: "\u{1F1E7}\u{1F1FF}" },

  // Barbados
  BB: { code: "BB", name: "Barbados", flag: "\u{1F1E7}\u{1F1E7}" },
  BARBADOS: { code: "BB", name: "Barbados", flag: "\u{1F1E7}\u{1F1E7}" },
  BRB: { code: "BB", name: "Barbados", flag: "\u{1F1E7}\u{1F1E7}" },

  // Bahamas
  BS: { code: "BS", name: "Bahamas", flag: "\u{1F1E7}\u{1F1F8}" },
  BAHAMAS: { code: "BS", name: "Bahamas", flag: "\u{1F1E7}\u{1F1F8}" },
  BHS: { code: "BS", name: "Bahamas", flag: "\u{1F1E7}\u{1F1F8}" },

  // Zambia
  ZM: { code: "ZM", name: "Zambia", flag: "\u{1F1FF}\u{1F1F2}" },
  ZAMBIA: { code: "ZM", name: "Zambia", flag: "\u{1F1FF}\u{1F1F2}" },
  SAMBIA: { code: "ZM", name: "Zambia", flag: "\u{1F1FF}\u{1F1F2}" },
  ZMB: { code: "ZM", name: "Zambia", flag: "\u{1F1FF}\u{1F1F2}" },

  // Botswana
  BW: { code: "BW", name: "Botswana", flag: "\u{1F1E7}\u{1F1FC}" },
  BOTSWANA: { code: "BW", name: "Botswana", flag: "\u{1F1E7}\u{1F1FC}" },
  BOTSUANA: { code: "BW", name: "Botswana", flag: "\u{1F1E7}\u{1F1FC}" },
  BWA: { code: "BW", name: "Botswana", flag: "\u{1F1E7}\u{1F1FC}" },

  // Namibia
  NA: { code: "NA", name: "Namibia", flag: "\u{1F1F3}\u{1F1E6}" },
  NAMIBIA: { code: "NA", name: "Namibia", flag: "\u{1F1F3}\u{1F1E6}" },
  NAM: { code: "NA", name: "Namibia", flag: "\u{1F1F3}\u{1F1E6}" },

  // Malawi
  MW: { code: "MW", name: "Malawi", flag: "\u{1F1F2}\u{1F1FC}" },
  MALAWI: { code: "MW", name: "Malawi", flag: "\u{1F1F2}\u{1F1FC}" },
  MWI: { code: "MW", name: "Malawi", flag: "\u{1F1F2}\u{1F1FC}" },

  // Chad
  TD: { code: "TD", name: "Chad", flag: "\u{1F1F9}\u{1F1E9}" },
  CHAD: { code: "TD", name: "Chad", flag: "\u{1F1F9}\u{1F1E9}" },
  TSCHAD: { code: "TD", name: "Chad", flag: "\u{1F1F9}\u{1F1E9}" },
  TCD: { code: "TD", name: "Chad", flag: "\u{1F1F9}\u{1F1E9}" },

  // Guinea
  GN: { code: "GN", name: "Guinea", flag: "\u{1F1EC}\u{1F1F3}" },
  GUINEA: { code: "GN", name: "Guinea", flag: "\u{1F1EC}\u{1F1F3}" },
  GIN: { code: "GN", name: "Guinea", flag: "\u{1F1EC}\u{1F1F3}" },

  // Sierra Leone
  SL: { code: "SL", name: "Sierra Leone", flag: "\u{1F1F8}\u{1F1F1}" },
  "SIERRA LEONE": { code: "SL", name: "Sierra Leone", flag: "\u{1F1F8}\u{1F1F1}" },
  SLE: { code: "SL", name: "Sierra Leone", flag: "\u{1F1F8}\u{1F1F1}" },

  // Liberia
  LR: { code: "LR", name: "Liberia", flag: "\u{1F1F1}\u{1F1F7}" },
  LIBERIA: { code: "LR", name: "Liberia", flag: "\u{1F1F1}\u{1F1F7}" },
  LBR: { code: "LR", name: "Liberia", flag: "\u{1F1F1}\u{1F1F7}" },

  // Gambia
  GM: { code: "GM", name: "Gambia", flag: "\u{1F1EC}\u{1F1F2}" },
  GAMBIA: { code: "GM", name: "Gambia", flag: "\u{1F1EC}\u{1F1F2}" },
  GMB: { code: "GM", name: "Gambia", flag: "\u{1F1EC}\u{1F1F2}" },

  // Comoros
  KM: { code: "KM", name: "Comoros", flag: "\u{1F1F0}\u{1F1F2}" },
  COMOROS: { code: "KM", name: "Comoros", flag: "\u{1F1F0}\u{1F1F2}" },
  KOMOREN: { code: "KM", name: "Comoros", flag: "\u{1F1F0}\u{1F1F2}" },
  COM: { code: "KM", name: "Comoros", flag: "\u{1F1F0}\u{1F1F2}" },

  // Equatorial Guinea
  GQ: { code: "GQ", name: "Equatorial Guinea", flag: "\u{1F1EC}\u{1F1F6}" },
  "EQUATORIAL GUINEA": { code: "GQ", name: "Equatorial Guinea", flag: "\u{1F1EC}\u{1F1F6}" },
  "ÄQUATORIALGUINEA": { code: "GQ", name: "Equatorial Guinea", flag: "\u{1F1EC}\u{1F1F6}" },
  GNQ: { code: "GQ", name: "Equatorial Guinea", flag: "\u{1F1EC}\u{1F1F6}" },

  // Lesotho
  LS: { code: "LS", name: "Lesotho", flag: "\u{1F1F1}\u{1F1F8}" },
  LESOTHO: { code: "LS", name: "Lesotho", flag: "\u{1F1F1}\u{1F1F8}" },
  LSO: { code: "LS", name: "Lesotho", flag: "\u{1F1F1}\u{1F1F8}" },

  // Eswatini
  SZ: { code: "SZ", name: "Eswatini", flag: "\u{1F1F8}\u{1F1FF}" },
  ESWATINI: { code: "SZ", name: "Eswatini", flag: "\u{1F1F8}\u{1F1FF}" },
  SWAZILAND: { code: "SZ", name: "Eswatini", flag: "\u{1F1F8}\u{1F1FF}" },
  SWZ: { code: "SZ", name: "Eswatini", flag: "\u{1F1F8}\u{1F1FF}" },

  // Kurdish
  KURDISH: { code: "KU", name: "Kurdish", flag: "\u{1F3F3}\u{FE0F}" },
  KURD: { code: "KU", name: "Kurdish", flag: "\u{1F3F3}\u{FE0F}" },
  KURDISTAN: { code: "KU", name: "Kurdish", flag: "\u{1F3F3}\u{FE0F}" },

  // Ex-Yugoslavia (very common in IPTV)
  "EX-YU": { code: "EXYU", name: "Ex-Yugoslavia", flag: "\u{1F1F7}\u{1F1F8}" },
  EXYU: { code: "EXYU", name: "Ex-Yugoslavia", flag: "\u{1F1F7}\u{1F1F8}" },
  "EX YU": { code: "EXYU", name: "Ex-Yugoslavia", flag: "\u{1F1F7}\u{1F1F8}" },
  "EX-YUGO": { code: "EXYU", name: "Ex-Yugoslavia", flag: "\u{1F1F7}\u{1F1F8}" },
  YUGOSLAVIA: { code: "EXYU", name: "Ex-Yugoslavia", flag: "\u{1F1F7}\u{1F1F8}" },
  JUGOSLAWIEN: { code: "EXYU", name: "Ex-Yugoslavia", flag: "\u{1F1F7}\u{1F1F8}" },
  BALKAN: { code: "EXYU", name: "Ex-Yugoslavia", flag: "\u{1F1F7}\u{1F1F8}" },

  // Nordic
  NORDIC: { code: "NORD", name: "Nordic", flag: "\u{2744}\u{FE0F}" },
  SKANDINAVIEN: { code: "NORD", name: "Nordic", flag: "\u{2744}\u{FE0F}" },
  SCANDINAVIA: { code: "NORD", name: "Nordic", flag: "\u{2744}\u{FE0F}" },
  SCANDINAVIAN: { code: "NORD", name: "Nordic", flag: "\u{2744}\u{FE0F}" },

  // Caribbean
  CARIBBEAN: { code: "CARIB", name: "Caribbean", flag: "\u{1F3DD}\u{FE0F}" },
  KARIBIK: { code: "CARIB", name: "Caribbean", flag: "\u{1F3DD}\u{FE0F}" },

  // Oceania
  OCEANIA: { code: "OCE", name: "Oceania", flag: "\u{1F30F}" },
  OZEANIEN: { code: "OCE", name: "Oceania", flag: "\u{1F30F}" },

  // Sports (common IPTV category)
  SPORT: { code: "SPORT", name: "Sports", flag: "\u{26BD}" },
  SPORTS: { code: "SPORT", name: "Sports", flag: "\u{26BD}" },

  // Movies/Cinema (common IPTV category)
  MOVIES: { code: "MOVIE", name: "Movies", flag: "\u{1F3AC}" },
  CINEMA: { code: "MOVIE", name: "Movies", flag: "\u{1F3AC}" },
  KINO: { code: "MOVIE", name: "Movies", flag: "\u{1F3AC}" },
  FILME: { code: "MOVIE", name: "Movies", flag: "\u{1F3AC}" },

  // Music (common IPTV category)
  MUSIC: { code: "MUSIC", name: "Music", flag: "\u{1F3B5}" },
  MUSIK: { code: "MUSIC", name: "Music", flag: "\u{1F3B5}" },

  // Kids (common IPTV category)
  KIDS: { code: "KIDS", name: "Kids", flag: "\u{1F476}" },
  KINDER: { code: "KIDS", name: "Kids", flag: "\u{1F476}" },
  CHILDREN: { code: "KIDS", name: "Kids", flag: "\u{1F476}" },
  CARTOONS: { code: "KIDS", name: "Kids", flag: "\u{1F476}" },

  // News (common IPTV category)
  NEWS: { code: "NEWS", name: "News", flag: "\u{1F4F0}" },
  NACHRICHTEN: { code: "NEWS", name: "News", flag: "\u{1F4F0}" },

  // Documentary (common IPTV category)
  DOCUMENTARY: { code: "DOC", name: "Documentary", flag: "\u{1F4DA}" },
  DOKUMENTATION: { code: "DOC", name: "Documentary", flag: "\u{1F4DA}" },
  DOKU: { code: "DOC", name: "Documentary", flag: "\u{1F4DA}" },

  // Entertainment (common IPTV category)
  ENTERTAINMENT: { code: "ENT", name: "Entertainment", flag: "\u{1F3AD}" },
  UNTERHALTUNG: { code: "ENT", name: "Entertainment", flag: "\u{1F3AD}" },

  // Religious (common IPTV category)
  RELIGIOUS: { code: "REL", name: "Religious", flag: "\u{1F54C}" },
  RELIGION: { code: "REL", name: "Religious", flag: "\u{1F54C}" },

  // Adult/XXX (common IPTV category)
  XXX: { code: "XXX", name: "Adult", flag: "\u{1F51E}" },
  ADULT: { code: "XXX", name: "Adult", flag: "\u{1F51E}" },
  "FOR ADULTS": { code: "XXX", name: "Adult", flag: "\u{1F51E}" },

  // Latin America general
  LATINO: { code: "LATAM", name: "Latin America", flag: "\u{1F30E}" },
  LATAM: { code: "LATAM", name: "Latin America", flag: "\u{1F30E}" },
  "LATIN AMERICA": { code: "LATAM", name: "Latin America", flag: "\u{1F30E}" },
  LATINOAMERICA: { code: "LATAM", name: "Latin America", flag: "\u{1F30E}" },
  LATEINAMERIKA: { code: "LATAM", name: "Latin America", flag: "\u{1F30E}" },

  // Africa general
  AFRICA: { code: "AFR", name: "Africa", flag: "\u{1F30D}" },
  AFRICAN: { code: "AFR", name: "Africa", flag: "\u{1F30D}" },
  AFRIKA: { code: "AFR", name: "Africa", flag: "\u{1F30D}" },

  // Asia general
  ASIA: { code: "ASIA", name: "Asia", flag: "\u{1F30F}" },
  ASIAN: { code: "ASIA", name: "Asia", flag: "\u{1F30F}" },
  ASIEN: { code: "ASIA", name: "Asia", flag: "\u{1F30F}" },

  // Middle East
  "MIDDLE EAST": { code: "MENA", name: "Middle East", flag: "\u{1F54C}" },
  NAHOST: { code: "MENA", name: "Middle East", flag: "\u{1F54C}" },
  MENA: { code: "MENA", name: "Middle East", flag: "\u{1F54C}" },

  // Europe
  EUROPE: { code: "EU", name: "Europe", flag: "\u{1F1EA}\u{1F1FA}" },
  EUROPA: { code: "EU", name: "Europe", flag: "\u{1F1EA}\u{1F1FA}" },
  EUROPEAN: { code: "EU", name: "Europe", flag: "\u{1F1EA}\u{1F1FA}" },

  // International
  INTERNATIONAL: { code: "INT", name: "International", flag: "\u{1F310}" },
  INT: { code: "INT", name: "International", flag: "\u{1F310}" },
  WORLD: { code: "INT", name: "International", flag: "\u{1F310}" },
  GLOBAL: { code: "INT", name: "International", flag: "\u{1F310}" },
  WELT: { code: "INT", name: "International", flag: "\u{1F310}" },
};

// Patterns commonly found in IPTV group names: "DE:", "|DE|", "[DE]", "DE -", "(DE)"
const DELIMITED_PATTERN =
  /(?:^|\||\[|\(|:\s*)\s*([A-Z]{2,3})\s*(?:\||]|\)|:|[-\s])/i;

// "Germany", "Deutschland", etc. as standalone words in group titles
const COUNTRY_NAME_KEYS = Object.keys(COUNTRY_MAP).filter(
  (k) => k.length > 3
);

/**
 * Extract country info from an IPTV group/category title string.
 * Tries multiple patterns commonly used by IPTV providers.
 *
 * Examples:
 *   "DE: Entertainment" -> Germany
 *   "|UK| Sports"       -> United Kingdom
 *   "France - Cinema"   -> France
 *   "TR Spor"           -> Turkey
 *   "EX-YU: Balkan"     -> Ex-Yugoslavia
 *   "SPORT: Football"   -> Sports
 *   "KIDS"              -> Kids
 */
export function extractCountryFromGroup(
  groupTitle: string
): CountryInfo | null {
  if (!groupTitle) return null;

  const upper = groupTitle.toUpperCase().trim();

  // 0) Check EXACT match first (for short category names like "SPORT", "KIDS", "XXX")
  if (COUNTRY_MAP[upper]) return COUNTRY_MAP[upper];

  // 1) Try delimited patterns first (highest confidence)
  //    Matches: "DE:", "|DE|", "[DE]", "(DE)", "DE -", "DE |"
  const delimMatch = upper.match(
    /(?:^|\||\[|\()\s*([A-Z]{2,3})\s*(?:\||]|\)|:|\s*-)/
  );
  if (delimMatch) {
    const code = delimMatch[1];
    if (COUNTRY_MAP[code]) return COUNTRY_MAP[code];
  }

  // 2) Check for "XX:" or "XX-YY:" at start of string (very common pattern)
  const colonMatch = upper.match(/^([A-Z]{2,3}(?:-[A-Z]{2,3})?)\s*:/);
  if (colonMatch) {
    const code = colonMatch[1];
    if (COUNTRY_MAP[code]) return COUNTRY_MAP[code];
  }

  // 3) Check for pipe-delimited: "|XX|"
  const pipeMatch = upper.match(/\|([A-Z]{2,3}(?:-[A-Z]{2,3})?)\|/);
  if (pipeMatch) {
    const code = pipeMatch[1];
    if (COUNTRY_MAP[code]) return COUNTRY_MAP[code];
  }

  // 3.5) Check for bracket-delimited: "[XX]"
  const bracketMatch = upper.match(/\[([A-Z]{2,3}(?:-[A-Z]{2,3})?)\]/);
  if (bracketMatch) {
    const code = bracketMatch[1];
    if (COUNTRY_MAP[code]) return COUNTRY_MAP[code];
  }

  // 4) Try full country/category name matching (longer names first to avoid partial matches)
  const sortedNames = COUNTRY_NAME_KEYS.sort((a, b) => b.length - a.length);
  for (const name of sortedNames) {
    // Use word boundary matching to avoid partial matches
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:^|\\W)${escaped}(?:\\W|$)`, "i");
    if (regex.test(upper)) {
      return COUNTRY_MAP[name];
    }
  }

  // 5) Try 2-letter code at the very start followed by space
  const startCodeMatch = upper.match(/^([A-Z]{2})\s+/);
  if (startCodeMatch) {
    const code = startCodeMatch[1];
    if (COUNTRY_MAP[code]) return COUNTRY_MAP[code];
  }

  // 6) Try hyphenated patterns like "EX-YU" anywhere in string
  const hyphenMatch = upper.match(/([A-Z]{2,3}-[A-Z]{2,3})/);
  if (hyphenMatch) {
    const code = hyphenMatch[1];
    if (COUNTRY_MAP[code]) return COUNTRY_MAP[code];
  }

  // 7) Try 2-letter code at end of string: "Sports DE"
  const endCodeMatch = upper.match(/\s([A-Z]{2})$/);
  if (endCodeMatch) {
    const code = endCodeMatch[1];
    if (COUNTRY_MAP[code]) return COUNTRY_MAP[code];
  }

  return null;
}

/**
 * Generate flag emoji from any ISO 2-letter country code.
 * Works for ALL countries - no lookup table needed.
 */
export function codeToFlag(code: string): string {
  if (!code || code.length !== 2) return "\u{1F3F3}\u{FE0F}";
  const upper = code.toUpperCase();
  const a = 0x1F1E6;
  return String.fromCodePoint(
    a + upper.charCodeAt(0) - 65,
    a + upper.charCodeAt(1) - 65
  );
}

/**
 * Get a country flag emoji from a country code.
 * Falls back to auto-generated flag for unknown codes.
 */
export function getCountryFlag(code: string): string {
  const upper = code.toUpperCase();
  const info = COUNTRY_MAP[upper];
  if (info) return info.flag;
  // Auto-generate flag for any 2-letter ISO code
  if (upper.length === 2 && /^[A-Z]{2}$/.test(upper)) return codeToFlag(upper);
  return "\u{1F3F3}\u{FE0F}";
}

/**
 * Look up country info, auto-creating entry for unknown 2-letter codes.
 */
export function getCountryInfo(code: string): CountryInfo {
  const upper = code.toUpperCase();
  const info = COUNTRY_MAP[upper];
  if (info) return info;
  // Auto-generate for unknown 2-letter codes
  if (upper.length === 2 && /^[A-Z]{2}$/.test(upper)) {
    return { code: upper, name: upper, flag: codeToFlag(upper) };
  }
  return { code: upper, name: upper, flag: "\u{1F310}" };
}

/**
 * Sort country names/codes, putting preferred countries first.
 * Default preferred order reflects common IPTV usage.
 */
export function sortCountries(
  countries: string[],
  preferredCodes: string[] = [
    "DE",
    "UK",
    "US",
    "TR",
    "FR",
    "IT",
    "ES",
    "NL",
    "AR",
    "IN",
    "PK",
    "RU",
    "PL",
  ]
): string[] {
  const preferredSet = new Set(preferredCodes.map((c) => c.toUpperCase()));

  return [...countries].sort((a, b) => {
    const aInfo = COUNTRY_MAP[a.toUpperCase()];
    const bInfo = COUNTRY_MAP[b.toUpperCase()];
    const aCode = aInfo?.code ?? a.toUpperCase();
    const bCode = bInfo?.code ?? b.toUpperCase();
    const aPreferred = preferredSet.has(aCode);
    const bPreferred = preferredSet.has(bCode);

    if (aPreferred && !bPreferred) return -1;
    if (!aPreferred && bPreferred) return 1;

    if (aPreferred && bPreferred) {
      return preferredCodes.indexOf(aCode) - preferredCodes.indexOf(bCode);
    }

    // Alphabetical for the rest
    const aName = aInfo?.name ?? a;
    const bName = bInfo?.name ?? b;
    return aName.localeCompare(bName);
  });
}

/**
 * Get all unique country codes from the map (deduplicated by code).
 */
export function getAllCountries(): CountryInfo[] {
  const seen = new Set<string>();
  const result: CountryInfo[] = [];
  for (const info of Object.values(COUNTRY_MAP)) {
    if (!seen.has(info.code)) {
      seen.add(info.code);
      result.push(info);
    }
  }
  return result;
}
