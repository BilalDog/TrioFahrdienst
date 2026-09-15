// Minimaler Service Worker, nur damit Browser die Seite als PWA "installierbar"
// einstufen (Chrome verlangt einen registrierten fetch-Handler). Kein Caching,
// kein Offline-Modus - reines Pass-Through, damit sich App-Daten nie veralten.
self.addEventListener("fetch", () => {});
