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
  "T\u00DCRKEI": { code: "TR", name: "Turkey", flag: "\u{1F1F9}\u{1F1F7}" },
  TURKISH: { code: "TR", name: "Turkey", flag: "\u{1F1F9}\u{1F1F7}" },
  "T\u00DCRKIYE": { code: "TR", name: "Turkey", flag: "\u{1F1F9}\u{1F1F7}" },
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
  "ESPA\u00D1A": { code: "ES", name: "Spain", flag: "\u{1F1EA}\u{1F1F8}" },
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
  "D\u00C4NEMARK": { code: "DK", name: "Denmark", flag: "\u{1F1E9}\u{1F1F0}" },
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
  "\u00D6STERREICH": { code: "AT", name: "Austria", flag: "\u{1F1E6}\u{1F1F9}" },
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
  "RUM\u00C4NIEN": { code: "RO", name: "Romania", flag: "\u{1F1F7}\u{1F1F4}" },
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
  "\u00C4GYPTEN": { code: "EG", name: "Egypt", flag: "\u{1F1EA}\u{1F1EC}" },
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
  "S\u00DCDAFRIKA": { code: "ZA", name: "South Africa", flag: "\u{1F1FF}\u{1F1E6}" },
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

  // Kurdish
  KURDISH: { code: "KU", name: "Kurdish", flag: "\u{1F3F3}\u{FE0F}" },
  KURD: { code: "KU", name: "Kurdish", flag: "\u{1F3F3}\u{FE0F}" },
  KURDISTAN: { code: "KU", name: "Kurdish", flag: "\u{1F3F3}\u{FE0F}" },

  // Latin America general
  LATINO: { code: "LATAM", name: "Latin America", flag: "\u{1F30E}" },
  LATAM: { code: "LATAM", name: "Latin America", flag: "\u{1F30E}" },
  "LATIN AMERICA": { code: "LATAM", name: "Latin America", flag: "\u{1F30E}" },

  // Africa general
  AFRICA: { code: "AFR", name: "Africa", flag: "\u{1F30D}" },
  AFRICAN: { code: "AFR", name: "Africa", flag: "\u{1F30D}" },
  AFRIKA: { code: "AFR", name: "Africa", flag: "\u{1F30D}" },

  // Asia general
  ASIA: { code: "ASIA", name: "Asia", flag: "\u{1F30F}" },
  ASIAN: { code: "ASIA", name: "Asia", flag: "\u{1F30F}" },
  ASIEN: { code: "ASIA", name: "Asia", flag: "\u{1F30F}" },

  // International
  INTERNATIONAL: { code: "INT", name: "International", flag: "\u{1F310}" },
  INT: { code: "INT", name: "International", flag: "\u{1F310}" },
  WORLD: { code: "INT", name: "International", flag: "\u{1F310}" },
  GLOBAL: { code: "INT", name: "International", flag: "\u{1F310}" },
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
 */
export function extractCountryFromGroup(
  groupTitle: string
): CountryInfo | null {
  if (!groupTitle) return null;

  const upper = groupTitle.toUpperCase().trim();

  // 1) Try delimited patterns first (highest confidence)
  //    Matches: "DE:", "|DE|", "[DE]", "(DE)", "DE -", "DE |"
  const delimMatch = upper.match(
    /(?:^|\||\[|\()\s*([A-Z]{2,3})\s*(?:\||]|\)|:|\s*-)/
  );
  if (delimMatch) {
    const code = delimMatch[1];
    if (COUNTRY_MAP[code]) return COUNTRY_MAP[code];
  }

  // 2) Check for "XX:" at start of string (very common pattern)
  const colonMatch = upper.match(/^([A-Z]{2,3})\s*:/);
  if (colonMatch) {
    const code = colonMatch[1];
    if (COUNTRY_MAP[code]) return COUNTRY_MAP[code];
  }

  // 3) Check for pipe-delimited: "|XX|"
  const pipeMatch = upper.match(/\|([A-Z]{2,3})\|/);
  if (pipeMatch) {
    const code = pipeMatch[1];
    if (COUNTRY_MAP[code]) return COUNTRY_MAP[code];
  }

  // 4) Try full country name matching (longer names first to avoid partial matches)
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

  return null;
}

/**
 * Get a country flag emoji from a country code.
 */
export function getCountryFlag(code: string): string {
  const upper = code.toUpperCase();
  const info = COUNTRY_MAP[upper];
  return info?.flag ?? "\u{1F3F3}\u{FE0F}";
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
