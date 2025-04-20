# Bookshop Framework & Beispiel-Anwendung

Ein minimalistisches MVC‑Framework auf Basis von Next.js & TypeScript, das Excel‑Dateien als Datenbank nutzt. Inkl. Authentifizierung, Buch‑Management, Warenkorb und Checkout.

---

## Inhaltsverzeichnis

1. [Installation](#installation)  
2. [Umgebungsvariablen](#umgebungsvariablen)  
3. [Projektstart](#projektstart)  
4. [Workflows](#workflows)  
   - [Signup & Login](#signup--login)  
   - [Shop durchsuchen](#shop-durchsuchen)  
   - [Warenkorb & Checkout](#warenkorb--checkout)  
   - [Inventory (Admin)](#inventory-admin)  
   - [Bestellungen ansehen](#bestellungen-ansehen)  
5. [Architektur & Komponenten‑Übersicht](#architektur--komponenten-übersicht)  
6. [Wartung & Weiterentwicklung](#wartung--weiterentwicklung)


## Installation

1. Repository klonen  
   ```bash
   git clone https://github.com/dein-benutzer/bookshop.git
   cd bookshop
   npm install
   ```

## Umgebungsvariablen

Lege im Projekt-Root eine Datei `.env` an mit folgenden Einträgen:

```env
# Muss mindestens 32 Zeichen lang sein, dient zum Verschlüsseln der Sessions
SESSION_SECRET=dein_langes_geheimes_password_mindestens_32_zeichen

# Basis‑URL für API‑Aufrufe (lokal)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Projektstart

```bash
# Development-Server starten
npm run dev
```

## Workflows

### Signup & Login

1. Rufe `/login` auf.  
2. Wechsle zum **Signup**‑Tab, gib Vorname, Nachname, E‑Mail, Passwort und Rolle ein.  
3. Nach erfolgreicher Registrierung wirst du automatisch eingeloggt.  
4. Für künftiges Einloggen im **Login**‑Tab E‑Mail und Passwort eingeben.

### Shop durchsuchen

1. Im Dashboard auf **Shop** klicken.  
2. Bücher filtern nach Preis (auf/ab), Genre und Seitenzahl.  
3. Auf eine Buch‑Card klicken, um Detailseite mit Titel, Autor, Genre, Seitenzahl, Preis und Stock zu sehen.

### Warenkorb & Checkout

1. Auf der Buch‑Detailseite **„In den Warenkorb“** auswählen.  
2. Floating‑Cart unten rechts öffnet die Warenkorb‑Seite.  
3. Mengen via ±‑Buttons anpassen oder Artikel entfernen.  
4. **Weiter zur Zahlung** → Zahlungsmethode wählen (Ghost Money / Cash).  
5. **Jetzt bezahlen** → Bestätigung und leere Cart.

### Inventory (Admin)

1. Als Admin einloggen (Rolle `admin`).  
2. Im Dashboard auf **Inventory** klicken.  
3. Tabelle aller eigenen Bücher sehen, **Bearbeiten**‑Button öffnet Modal‑Form.  
4. **+**‑Button öffnet Modal‑Form für neues Buch.  
5. Felder ausfüllen, **Speichern** klicken.

### Bestellungen ansehen

1. Im Dashboard auf **Bestellungen** klicken.  
2. Übersicht aller eigenen Orders mit ID, Datum, Status und Summe.  
3. **+**‑Button öffnet Inline‑Detailtabelle mit Titel, Autor, Einzelpreis, Menge und Zeilensumme.

## Architektur & Komponenten‑Übersicht

- **Model (Services):**  
  - `UserExcelService` – `readUsers()`, `writeUsers()`  
  - `BookExcelService` – `readBooks()`, `writeBooks()`  
  - `OrderExcelService` – `readOrders()`, `writeOrders()`

- **Controller (Business‑Logik):**  
  - `AuthController` – `signup()`, `login()`  
  - `BookController` – `listAll()`, `add()`, `update()`, `delete()`  
  - `OrderController` – `create()`, `listByUser()`

- **API‑Routes:**  
  - `/api/auth` – `POST?action=signup|login`, `GET`, `DELETE`  
  - `/api/books` – `GET`, `POST`, `PATCH`, `DELETE`  
  - `/api/orders` – `GET`, `POST`

- **Session:**  
  - Iron‑Session mit `sessionOptions` in `utils/session.ts`  
  - Cookie‑Name: `bookshop_session`, verschlüsselt via `SESSION_SECRET`

- **Frontend:**  
  - Next.js Pages & Client‑Components für Dashboard, Shop, Cart, Inventory, Orders.

## Wartung & Weiterentwicklung

- **Wartbarkeitsindex:** Alle Komponenten sind modular, dokumentiert und durch JSDoc‑Beispiele verständlich.  
- **Erweiterbarkeit:** Neue Sheets/Modelle über entsprechende Excel‑Services und Controller‑Methoden.  
- **Tests:** (Optional) Unit‑Tests für Controller‑Logik und Services mit Jest o. Ä.  
- **Deployment:** Für Produktion HTTPS verwenden, `SESSION_SECRET` aus sicherem Vault beziehen, `cookieOptions.secure: true`.

**Viel Spass!**
