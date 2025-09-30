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

---

## Next.js README:

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
