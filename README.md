# Next.js Filmadatbázis Projekt

Ez a projekt egy **Next.js-alapú webes alkalmazás** fejlesztési leírása, amely egy film- és rendező-adatbázis rendszert valósít meg. A rendszer a **filmek** és **rendezők** entitások közötti **1:N** kapcsolatra épül, és teljes körű funkciókat biztosít a felhasználói jogosultságok kezelésével.

---

### Technológiai Stack

A projekt a következő modern technológiákra épül:

* **Frontend:** **Next.js 15** (TypeScript-tel), **React 19**, **Tailwind CSS v4.0**, **Shadcn/ui**
* **Backend:** **Next.js API Routes**, **Next.js Server Actions**, **Drizzle ORM**
* **Adatbázis:** **PostgreSQL** + **Drizzle ORM** a kezeléshez
* **Authentikáció:** **BetterAuth** TypeScript alapú auth
* **Deployment:** **Vercel** (free plan)

---

### Funkcionális Követelmények

A projekt az alábbi funkciókat valósítja meg a megadott szinteknek megfelelően:

* **1. szint:**
    * **Filmek CRUD:** Teljes CRUD (létrehozás, olvasás, módosítás, törlés) felület a filmekhez.
    * **Rendezők (csak olvasás):** A rendezők listája csak olvasható formában érhető el.
    * **Navigáció:** Könnyű navigáció a filmek és rendezők oldalai között.

* **2. szint:**
    * **Filmek és Rendezők CRUD:** Teljes CRUD funkciók mind a filmek, mind a rendezők számára.

* **3. szint:**
    * **BetterAuth Integráció:** Biztonságos bejelentkezés és jogosultság alapú hozzáférés.
    * **Szerepkörök:** Két felhasználói szerepkör: **`user`** és **`admin`**.
        * A **`user`** csak a saját maga által hozzáadott filmeket szerkesztheti/törölheti.
        * Az **`admin`** minden filmen és rendezőn végrehajthat CRUD műveleteket.
    * **Adatbázisban tárolt user adatok:** Felhasználói adatok (email, hashelt jelszó, szerepkör) tárolása PostgreSQL adatbázisban.

* **4. szint (Extra munka):**
    * **Egyedi CSS:** Egyedi stílusok alkalmazása **Tailwind CSS**-szel a sablonoktól eltérő, vizuálisan vonzó felület kialakítására.
    * **Egyedi komponens:**
        * Egyedi, nem Shadcn/ui alapú komponensek fejlesztése.
        * **Filmajánló karusszel:** A legújabb/legnépszerűbb filmeket megjelenítő, animált komponens, amely a Framer Motion-t használja.
        * **Többlépéses film hozzáadás:** Animált űrlap a filmek hozzáadására, lépésenként haladva.
    * **Drizzle ORM:** Modern, TypeScript-orientált ORM használata az adatbázis-interakcióhoz.
    * **Vercel Deployment:** A projekt üzembe helyezése Vercel platformon.

---

### Adatbázis Séma

* **`users`** tábla: `id`, `email`, `password` (hashelt), `role`.
* **`directors`** tábla: `id`, `name`, `birthYear`, `addedBy`.
* **`movies`** tábla: `id`, `title`, `releaseYear`, `description`, `directorId` (külső kulcs), `userId` (külső kulcs).
