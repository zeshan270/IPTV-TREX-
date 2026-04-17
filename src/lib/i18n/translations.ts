// ==================== i18n Translation System ====================
// All UI strings in one place. Add new languages by adding a new object.

export type Locale = "de" | "en" | "tr";

export const LOCALE_NAMES: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  tr: "Türkçe",
};

export interface TranslationKeys {
  // Navigation
  "nav.home": string;
  "nav.favorites": string;
  "nav.liveTV": string;
  "nav.tvGuide": string;
  "nav.movies": string;
  "nav.series": string;
  "nav.search": string;
  "nav.settings": string;

  // Player
  "player.connecting": string;
  "player.buffering": string;
  "player.reconnecting": string;
  "player.retry": string;
  "player.retryAttempt": string;
  "player.connectionReleasing": string;
  "player.loadingStream": string;
  "player.mediaError": string;
  "player.altCodec": string;
  "player.altFormat": string;
  "player.streamBlocked": string;
  "player.maxConnections": string;
  "player.loadFailed": string;
  "player.tryAgain": string;
  "player.back": string;
  "player.live": string;
  "player.sleepTimer": string;
  "player.off": string;
  "player.quality": string;
  "player.auto": string;
  "player.audio": string;
  "player.subtitles": string;
  "player.pip": string;

  // Live TV
  "live.title": string;
  "live.searchChannels": string;
  "live.favorites": string;
  "live.allChannels": string;
  "live.countries": string;
  "live.selectCategory": string;
  "live.selectCategoryDesc": string;
  "live.noChannels": string;
  "live.noFavorites": string;
  "live.channels": string;
  "live.loading": string;
  "live.loadingAll": string;

  // EPG
  "epg.title": string;
  "epg.noFavorites": string;
  "epg.noChannels": string;
  "epg.noEpg": string;
  "epg.watchNow": string;
  "epg.catchup": string;
  "epg.goToChannel": string;
  "epg.noTitle": string;
  "epg.channels": string;

  // Movies
  "movies.title": string;
  "movies.play": string;
  "movies.continue": string;
  "movies.continueFrom": string;
  "movies.favorite": string;
  "movies.trailer": string;
  "movies.director": string;
  "movies.cast": string;
  "movies.originalTitle": string;
  "movies.showMore": string;
  "movies.showLess": string;
  "movies.notFound": string;
  "movies.loading": string;

  // Series
  "series.title": string;
  "series.season": string;
  "series.seasons": string;
  "series.episode": string;
  "series.play": string;
  "series.continue": string;
  "series.noEpisodes": string;
  "series.loading": string;
  "series.cast": string;
  "series.director": string;
  "series.asFavorite": string;
  "series.showMore": string;
  "series.showLess": string;

  // Favorites
  "favorites.title": string;
  "favorites.saved": string;
  "favorites.numberKeys": string;
  "favorites.all": string;
  "favorites.noFavorites": string;
  "favorites.noFavoritesDesc": string;
  "favorites.channel": string;

  // Settings
  "settings.title": string;
  "settings.playlists": string;
  "settings.newPlaylist": string;
  "settings.activePlaylist": string;
  "settings.savedPlaylists": string;
  "settings.edit": string;
  "settings.activate": string;
  "settings.display": string;
  "settings.fontSize": string;
  "settings.fontSizeDesc": string;
  "settings.fontNormal": string;
  "settings.fontLarge": string;
  "settings.fontXL": string;
  "settings.remoteMode": string;
  "settings.remoteModeDesc": string;
  "settings.channelNumbers": string;
  "settings.channelNumbersDesc": string;
  "settings.playerSection": string;
  "settings.bufferSize": string;
  "settings.bufferSizeDesc": string;
  "settings.format": string;
  "settings.formatDesc": string;
  "settings.autoplay": string;
  "settings.autoplayDesc": string;
  "settings.language": string;
  "settings.languageDesc": string;
  "settings.parental": string;
  "settings.pinLock": string;
  "settings.pinSet": string;
  "settings.pinNotSet": string;
  "settings.change": string;
  "settings.set": string;
  "settings.data": string;
  "settings.clearHistory": string;
  "settings.clearHistoryDesc": string;
  "settings.delete": string;
  "settings.device": string;
  "settings.macAddress": string;
  "settings.appVersion": string;
  "settings.logout": string;
  "settings.logoutConfirm": string;
  "settings.logoutDesc": string;
  "settings.cancel": string;
  "settings.save": string;
  "settings.deleteConfirm": string;
  "settings.deleteDesc": string;
  "settings.name": string;
  "settings.serverUrl": string;
  "settings.username": string;
  "settings.password": string;
  "settings.xtreamCodes": string;
  "settings.m3uUrl": string;
  "settings.addAndActivate": string;

  // Search
  "search.placeholder": string;
  "search.noResults": string;

  // Common
  "common.loading": string;
  "common.error": string;
  "common.back": string;
  "common.close": string;
  "common.confirm": string;
  "common.min": string;
  "common.hour": string;
  "common.pressAgainToExit": string;
}

const de: TranslationKeys = {
  "nav.home": "Home",
  "nav.favorites": "Favoriten",
  "nav.liveTV": "Live TV",
  "nav.tvGuide": "TV Guide",
  "nav.movies": "Filme",
  "nav.series": "Serien",
  "nav.search": "Suche",
  "nav.settings": "Einstellungen",

  "player.connecting": "Verbinde...",
  "player.buffering": "Buffering...",
  "player.reconnecting": "Verbindung wird wiederhergestellt...",
  "player.retry": "Erneut versuchen",
  "player.retryAttempt": "Neuer Versuch",
  "player.connectionReleasing": "Verbindung wird freigegeben",
  "player.loadingStream": "Lade Stream...",
  "player.mediaError": "Medien-Fehler wird behoben...",
  "player.altCodec": "Versuche alternatives Codec...",
  "player.altFormat": "Versuche alternatives Format...",
  "player.streamBlocked": "Stream blockiert (Fehler 456). Bitte prüfe dein Abo oder warte kurz.",
  "player.maxConnections": "Maximale Verbindungen erreicht. Bitte warte kurz und versuche es erneut.",
  "player.loadFailed": "Stream konnte nicht geladen werden.",
  "player.tryAgain": "Erneut versuchen",
  "player.back": "Zurück",
  "player.live": "LIVE",
  "player.sleepTimer": "Sleep Timer",
  "player.off": "Aus",
  "player.quality": "Qualität",
  "player.auto": "Auto",
  "player.audio": "Audio",
  "player.subtitles": "Untertitel",
  "player.pip": "Bild-in-Bild",

  "live.title": "Live TV",
  "live.searchChannels": "Kanäle suchen...",
  "live.favorites": "Favoriten",
  "live.allChannels": "Alle Kanäle",
  "live.countries": "Länder",
  "live.selectCategory": "Kategorie auswählen",
  "live.selectCategoryDesc": "Wähle ein Land und eine Kategorie um Kanäle zu laden",
  "live.noChannels": "Keine Kanäle gefunden",
  "live.noFavorites": "Noch keine Favoriten. Tippe auf das Herz um Kanäle hinzuzufügen!",
  "live.channels": "Kanäle",
  "live.loading": "Lade Live TV...",
  "live.loadingAll": "Lade alle Kanäle...",

  "epg.title": "TV Guide",
  "epg.noFavorites": "Keine Favoriten vorhanden. Zuerst Kanäle als Favorit markieren.",
  "epg.noChannels": "Keine Kanäle in dieser Kategorie.",
  "epg.noEpg": "Keine EPG-Daten",
  "epg.watchNow": "Jetzt ansehen",
  "epg.catchup": "Catchup",
  "epg.goToChannel": "Zum Kanal",
  "epg.noTitle": "Kein Titel",
  "epg.channels": "Kanäle",

  "movies.title": "Filme",
  "movies.play": "Abspielen",
  "movies.continue": "Fortsetzen",
  "movies.continueFrom": "Fortsetzen ab",
  "movies.favorite": "Favorit",
  "movies.trailer": "Trailer",
  "movies.director": "Regie",
  "movies.cast": "Besetzung",
  "movies.originalTitle": "Originaltitel",
  "movies.showMore": "Mehr anzeigen",
  "movies.showLess": "Weniger",
  "movies.notFound": "Film nicht gefunden",
  "movies.loading": "Film wird geladen...",

  "series.title": "Serien",
  "series.season": "Staffel",
  "series.seasons": "Staffeln",
  "series.episode": "Episode",
  "series.play": "Abspielen",
  "series.continue": "Fortsetzen",
  "series.noEpisodes": "Keine Episoden verfügbar.",
  "series.loading": "Serie wird geladen...",
  "series.cast": "Besetzung",
  "series.director": "Regie",
  "series.asFavorite": "Als Favorit",
  "series.showMore": "Mehr anzeigen",
  "series.showLess": "Weniger anzeigen",

  "favorites.title": "Favoriten",
  "favorites.saved": "gespeichert",
  "favorites.numberKeys": "Zahlentasten zum Umschalten",
  "favorites.all": "Alle",
  "favorites.noFavorites": "Noch keine Favoriten",
  "favorites.noFavoritesDesc": "Füge deine Lieblingssender, Filme und Serien hinzu, indem du das Herz-Symbol antippst.",
  "favorites.channel": "Channel",

  "settings.title": "Einstellungen",
  "settings.playlists": "Playlisten",
  "settings.newPlaylist": "Neue Playlist",
  "settings.activePlaylist": "Aktive Playlist",
  "settings.savedPlaylists": "Gespeicherte Playlisten",
  "settings.edit": "Bearbeiten",
  "settings.activate": "Aktivieren",
  "settings.display": "Anzeige & Bedienung",
  "settings.fontSize": "Schriftgröße",
  "settings.fontSizeDesc": "Für bessere Lesbarkeit vergrößern",
  "settings.fontNormal": "Normal",
  "settings.fontLarge": "Groß",
  "settings.fontXL": "Sehr Groß",
  "settings.remoteMode": "Fernbedienungs-Modus",
  "settings.remoteModeDesc": "Größere Buttons und einfachere Bedienung",
  "settings.channelNumbers": "Kanalnummern anzeigen",
  "settings.channelNumbersDesc": "Nummern auf Favoriten für schnellen Zugriff",
  "settings.playerSection": "Player",
  "settings.bufferSize": "Buffer-Größe",
  "settings.bufferSizeDesc": "Höhere Werte = weniger Puffer-Unterbrechungen",
  "settings.format": "Format",
  "settings.formatDesc": "Stream-Ausgabeformat",
  "settings.autoplay": "Autoplay",
  "settings.autoplayDesc": "Automatisch abspielen beim Öffnen",
  "settings.language": "Sprache",
  "settings.languageDesc": "App-Sprache ändern",
  "settings.parental": "Kindersicherung",
  "settings.pinLock": "PIN-Sperre",
  "settings.pinSet": "PIN ist gesetzt. Tippen zum Ändern.",
  "settings.pinNotSet": "4-stellige PIN zum Sperren festlegen",
  "settings.change": "Ändern",
  "settings.set": "Festlegen",
  "settings.data": "Daten",
  "settings.clearHistory": "Verlauf löschen",
  "settings.clearHistoryDesc": "Alle zuletzt gesehenen Einträge entfernen",
  "settings.delete": "Löschen",
  "settings.device": "Gerät",
  "settings.macAddress": "MAC-Adresse",
  "settings.appVersion": "App-Version",
  "settings.logout": "Abmelden",
  "settings.logoutConfirm": "Abmelden?",
  "settings.logoutDesc": "Du musst dich erneut anmelden.",
  "settings.cancel": "Abbrechen",
  "settings.save": "Speichern",
  "settings.deleteConfirm": "Verlauf löschen?",
  "settings.deleteDesc": "Alle Einträge werden unwiderruflich gelöscht.",
  "settings.name": "Name",
  "settings.serverUrl": "Server URL",
  "settings.username": "Benutzername",
  "settings.password": "Passwort",
  "settings.xtreamCodes": "Xtream Codes",
  "settings.m3uUrl": "M3U URL",
  "settings.addAndActivate": "Hinzufügen & Aktivieren",

  "search.placeholder": "Kanäle, Filme, Serien suchen...",
  "search.noResults": "Keine Ergebnisse gefunden",

  "common.loading": "Laden...",
  "common.error": "Fehler",
  "common.back": "Zurück",
  "common.close": "Schließen",
  "common.confirm": "Bestätigen",
  "common.min": "Min",
  "common.hour": "Std",
  "common.pressAgainToExit": "Nochmal drücken zum Beenden",
};

const en: TranslationKeys = {
  "nav.home": "Home",
  "nav.favorites": "Favorites",
  "nav.liveTV": "Live TV",
  "nav.tvGuide": "TV Guide",
  "nav.movies": "Movies",
  "nav.series": "Series",
  "nav.search": "Search",
  "nav.settings": "Settings",

  "player.connecting": "Connecting...",
  "player.buffering": "Buffering...",
  "player.reconnecting": "Reconnecting...",
  "player.retry": "Retry",
  "player.retryAttempt": "Retrying",
  "player.connectionReleasing": "Releasing connection",
  "player.loadingStream": "Loading stream...",
  "player.mediaError": "Fixing media error...",
  "player.altCodec": "Trying alternative codec...",
  "player.altFormat": "Trying alternative format...",
  "player.streamBlocked": "Stream blocked (Error 456). Please check your subscription or wait.",
  "player.maxConnections": "Maximum connections reached. Please wait and try again.",
  "player.loadFailed": "Stream could not be loaded.",
  "player.tryAgain": "Try again",
  "player.back": "Back",
  "player.live": "LIVE",
  "player.sleepTimer": "Sleep Timer",
  "player.off": "Off",
  "player.quality": "Quality",
  "player.auto": "Auto",
  "player.audio": "Audio",
  "player.subtitles": "Subtitles",
  "player.pip": "Picture in Picture",

  "live.title": "Live TV",
  "live.searchChannels": "Search channels...",
  "live.favorites": "Favorites",
  "live.allChannels": "All Channels",
  "live.countries": "Countries",
  "live.selectCategory": "Select category",
  "live.selectCategoryDesc": "Choose a country and category to load channels",
  "live.noChannels": "No channels found",
  "live.noFavorites": "No favorites yet. Tap the heart to add channels!",
  "live.channels": "Channels",
  "live.loading": "Loading Live TV...",
  "live.loadingAll": "Loading all channels...",

  "epg.title": "TV Guide",
  "epg.noFavorites": "No favorites. Add channels as favorites first.",
  "epg.noChannels": "No channels in this category.",
  "epg.noEpg": "No EPG data",
  "epg.watchNow": "Watch now",
  "epg.catchup": "Catchup",
  "epg.goToChannel": "Go to channel",
  "epg.noTitle": "No title",
  "epg.channels": "Channels",

  "movies.title": "Movies",
  "movies.play": "Play",
  "movies.continue": "Continue",
  "movies.continueFrom": "Continue from",
  "movies.favorite": "Favorite",
  "movies.trailer": "Trailer",
  "movies.director": "Director",
  "movies.cast": "Cast",
  "movies.originalTitle": "Original title",
  "movies.showMore": "Show more",
  "movies.showLess": "Less",
  "movies.notFound": "Movie not found",
  "movies.loading": "Loading movie...",

  "series.title": "Series",
  "series.season": "Season",
  "series.seasons": "Seasons",
  "series.episode": "Episode",
  "series.play": "Play",
  "series.continue": "Continue",
  "series.noEpisodes": "No episodes available.",
  "series.loading": "Loading series...",
  "series.cast": "Cast",
  "series.director": "Director",
  "series.asFavorite": "Add to favorites",
  "series.showMore": "Show more",
  "series.showLess": "Show less",

  "favorites.title": "Favorites",
  "favorites.saved": "saved",
  "favorites.numberKeys": "Use number keys to switch",
  "favorites.all": "All",
  "favorites.noFavorites": "No favorites yet",
  "favorites.noFavoritesDesc": "Add your favorite channels, movies and series by tapping the heart icon.",
  "favorites.channel": "Channel",

  "settings.title": "Settings",
  "settings.playlists": "Playlists",
  "settings.newPlaylist": "New Playlist",
  "settings.activePlaylist": "Active Playlist",
  "settings.savedPlaylists": "Saved Playlists",
  "settings.edit": "Edit",
  "settings.activate": "Activate",
  "settings.display": "Display & Controls",
  "settings.fontSize": "Font size",
  "settings.fontSizeDesc": "Increase for better readability",
  "settings.fontNormal": "Normal",
  "settings.fontLarge": "Large",
  "settings.fontXL": "Extra Large",
  "settings.remoteMode": "Remote control mode",
  "settings.remoteModeDesc": "Larger buttons and simpler controls",
  "settings.channelNumbers": "Show channel numbers",
  "settings.channelNumbersDesc": "Numbers on favorites for quick access",
  "settings.playerSection": "Player",
  "settings.bufferSize": "Buffer size",
  "settings.bufferSizeDesc": "Higher = fewer buffering interruptions",
  "settings.format": "Format",
  "settings.formatDesc": "Stream output format",
  "settings.autoplay": "Autoplay",
  "settings.autoplayDesc": "Play automatically when opening",
  "settings.language": "Language",
  "settings.languageDesc": "Change app language",
  "settings.parental": "Parental Controls",
  "settings.pinLock": "PIN Lock",
  "settings.pinSet": "PIN is set. Tap to change.",
  "settings.pinNotSet": "Set a 4-digit PIN to lock content",
  "settings.change": "Change",
  "settings.set": "Set",
  "settings.data": "Data",
  "settings.clearHistory": "Clear history",
  "settings.clearHistoryDesc": "Remove all recently watched entries",
  "settings.delete": "Delete",
  "settings.device": "Device",
  "settings.macAddress": "MAC Address",
  "settings.appVersion": "App Version",
  "settings.logout": "Log out",
  "settings.logoutConfirm": "Log out?",
  "settings.logoutDesc": "You will need to log in again.",
  "settings.cancel": "Cancel",
  "settings.save": "Save",
  "settings.deleteConfirm": "Clear history?",
  "settings.deleteDesc": "All entries will be permanently deleted.",
  "settings.name": "Name",
  "settings.serverUrl": "Server URL",
  "settings.username": "Username",
  "settings.password": "Password",
  "settings.xtreamCodes": "Xtream Codes",
  "settings.m3uUrl": "M3U URL",
  "settings.addAndActivate": "Add & Activate",

  "search.placeholder": "Search channels, movies, series...",
  "search.noResults": "No results found",

  "common.loading": "Loading...",
  "common.error": "Error",
  "common.back": "Back",
  "common.close": "Close",
  "common.confirm": "Confirm",
  "common.min": "min",
  "common.hour": "hr",
  "common.pressAgainToExit": "Press again to exit",
};

const tr: TranslationKeys = {
  "nav.home": "Ana Sayfa",
  "nav.favorites": "Favoriler",
  "nav.liveTV": "Canlı TV",
  "nav.tvGuide": "TV Rehberi",
  "nav.movies": "Filmler",
  "nav.series": "Diziler",
  "nav.search": "Ara",
  "nav.settings": "Ayarlar",

  "player.connecting": "Bağlanıyor...",
  "player.buffering": "Arabelleğe alınıyor...",
  "player.reconnecting": "Yeniden bağlanıyor...",
  "player.retry": "Tekrar dene",
  "player.retryAttempt": "Yeniden deneniyor",
  "player.connectionReleasing": "Bağlantı serbest bırakılıyor",
  "player.loadingStream": "Yayın yükleniyor...",
  "player.mediaError": "Medya hatası düzeltiliyor...",
  "player.altCodec": "Alternatif codec deneniyor...",
  "player.altFormat": "Alternatif format deneniyor...",
  "player.streamBlocked": "Yayın engellendi (Hata 456). Aboneliğinizi kontrol edin.",
  "player.maxConnections": "Maksimum bağlantıya ulaşıldı. Lütfen bekleyin.",
  "player.loadFailed": "Yayın yüklenemedi.",
  "player.tryAgain": "Tekrar dene",
  "player.back": "Geri",
  "player.live": "CANLI",
  "player.sleepTimer": "Uyku Zamanlayıcı",
  "player.off": "Kapalı",
  "player.quality": "Kalite",
  "player.auto": "Otomatik",
  "player.audio": "Ses",
  "player.subtitles": "Altyazılar",
  "player.pip": "Resim içinde Resim",

  "live.title": "Canlı TV",
  "live.searchChannels": "Kanal ara...",
  "live.favorites": "Favoriler",
  "live.allChannels": "Tüm Kanallar",
  "live.countries": "Ülkeler",
  "live.selectCategory": "Kategori seçin",
  "live.selectCategoryDesc": "Kanalları yüklemek için bir ülke ve kategori seçin",
  "live.noChannels": "Kanal bulunamadı",
  "live.noFavorites": "Henüz favori yok. Kanal eklemek için kalp simgesine dokunun!",
  "live.channels": "Kanal",
  "live.loading": "Canlı TV yükleniyor...",
  "live.loadingAll": "Tüm kanallar yükleniyor...",

  "epg.title": "TV Rehberi",
  "epg.noFavorites": "Favori yok. Önce kanalları favori olarak ekleyin.",
  "epg.noChannels": "Bu kategoride kanal yok.",
  "epg.noEpg": "EPG verisi yok",
  "epg.watchNow": "Şimdi izle",
  "epg.catchup": "Tekrar izle",
  "epg.goToChannel": "Kanala git",
  "epg.noTitle": "Başlık yok",
  "epg.channels": "Kanallar",

  "movies.title": "Filmler",
  "movies.play": "Oynat",
  "movies.continue": "Devam et",
  "movies.continueFrom": "Devam et",
  "movies.favorite": "Favori",
  "movies.trailer": "Fragman",
  "movies.director": "Yönetmen",
  "movies.cast": "Oyuncular",
  "movies.originalTitle": "Orijinal başlık",
  "movies.showMore": "Daha fazla",
  "movies.showLess": "Daha az",
  "movies.notFound": "Film bulunamadı",
  "movies.loading": "Film yükleniyor...",

  "series.title": "Diziler",
  "series.season": "Sezon",
  "series.seasons": "Sezon",
  "series.episode": "Bölüm",
  "series.play": "Oynat",
  "series.continue": "Devam et",
  "series.noEpisodes": "Bölüm bulunamadı.",
  "series.loading": "Dizi yükleniyor...",
  "series.cast": "Oyuncular",
  "series.director": "Yönetmen",
  "series.asFavorite": "Favorilere ekle",
  "series.showMore": "Daha fazla",
  "series.showLess": "Daha az göster",

  "favorites.title": "Favoriler",
  "favorites.saved": "kayıtlı",
  "favorites.numberKeys": "Geçiş için sayı tuşları",
  "favorites.all": "Tümü",
  "favorites.noFavorites": "Henüz favori yok",
  "favorites.noFavoritesDesc": "Kalp simgesine dokunarak favori kanallarınızı, filmlerinizi ve dizilerinizi ekleyin.",
  "favorites.channel": "Kanal",

  "settings.title": "Ayarlar",
  "settings.playlists": "Oynatma Listeleri",
  "settings.newPlaylist": "Yeni Liste",
  "settings.activePlaylist": "Aktif Liste",
  "settings.savedPlaylists": "Kayıtlı Listeler",
  "settings.edit": "Düzenle",
  "settings.activate": "Etkinleştir",
  "settings.display": "Görünüm & Kontrol",
  "settings.fontSize": "Yazı boyutu",
  "settings.fontSizeDesc": "Daha iyi okunabilirlik için büyütün",
  "settings.fontNormal": "Normal",
  "settings.fontLarge": "Büyük",
  "settings.fontXL": "Çok Büyük",
  "settings.remoteMode": "Uzaktan kumanda modu",
  "settings.remoteModeDesc": "Daha büyük düğmeler ve basit kontrol",
  "settings.channelNumbers": "Kanal numaralarını göster",
  "settings.channelNumbersDesc": "Hızlı erişim için favorilerde numara",
  "settings.playerSection": "Oynatıcı",
  "settings.bufferSize": "Tampon boyutu",
  "settings.bufferSizeDesc": "Yüksek = daha az kesinti",
  "settings.format": "Format",
  "settings.formatDesc": "Yayın çıkış formatı",
  "settings.autoplay": "Otomatik oynat",
  "settings.autoplayDesc": "Açıldığında otomatik oynat",
  "settings.language": "Dil",
  "settings.languageDesc": "Uygulama dilini değiştir",
  "settings.parental": "Ebeveyn Kontrolü",
  "settings.pinLock": "PIN Kilidi",
  "settings.pinSet": "PIN ayarlandı. Değiştirmek için dokunun.",
  "settings.pinNotSet": "İçeriği kilitlemek için 4 haneli PIN belirleyin",
  "settings.change": "Değiştir",
  "settings.set": "Ayarla",
  "settings.data": "Veriler",
  "settings.clearHistory": "Geçmişi temizle",
  "settings.clearHistoryDesc": "Son izlenen tüm kayıtları kaldır",
  "settings.delete": "Sil",
  "settings.device": "Cihaz",
  "settings.macAddress": "MAC Adresi",
  "settings.appVersion": "Uygulama Sürümü",
  "settings.logout": "Çıkış yap",
  "settings.logoutConfirm": "Çıkış yapılsın mı?",
  "settings.logoutDesc": "Tekrar giriş yapmanız gerekecek.",
  "settings.cancel": "İptal",
  "settings.save": "Kaydet",
  "settings.deleteConfirm": "Geçmiş silinsin mi?",
  "settings.deleteDesc": "Tüm kayıtlar kalıcı olarak silinecek.",
  "settings.name": "Ad",
  "settings.serverUrl": "Sunucu URL",
  "settings.username": "Kullanıcı adı",
  "settings.password": "Şifre",
  "settings.xtreamCodes": "Xtream Codes",
  "settings.m3uUrl": "M3U URL",
  "settings.addAndActivate": "Ekle ve Etkinleştir",

  "search.placeholder": "Kanal, film, dizi ara...",
  "search.noResults": "Sonuç bulunamadı",

  "common.loading": "Yükleniyor...",
  "common.error": "Hata",
  "common.back": "Geri",
  "common.close": "Kapat",
  "common.confirm": "Onayla",
  "common.min": "dk",
  "common.hour": "sa",
  "common.pressAgainToExit": "Çıkmak için tekrar basın",
};

export const translations: Record<Locale, TranslationKeys> = { de, en, tr };
