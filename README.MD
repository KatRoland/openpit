# OpenPit

**Linux Infrastructure Management Panel**

Az **OpenPit** egy nyílt forráskódú, web-alapú adminisztrációs felület, amely modern és átlátható megoldást nyújt Linux rendszerek távoli kezeléséhez. A projekt célja, hogy egy központi, stabil "műveleti központot" biztosítson, ahol a rendszergazdák egyetlen felületen láthatják és módosíthatják a rendszer kritikus paramétereit, a legegyszerűbb módon!

---

## 🛠️ Főbb funkciók (Terv)

* **📈 Valós idejű monitorozás:** CPU, memória, hálózat és lemezhasználat vizuális megjelenítése élő adatok alapján.
* **🐳 Konténer kezelés (Docker):** Leegyszerűsített, Portainer-szerű interfész. Konténerek indítása, leállítása, újraindítása és alapvető log-nézet.
* **💾 Tárolóhely & Fájlrendszer:** Meghajtók azonosítása, particionálás és csatolási pontok (mount) kezelése.
* **📂 Samba Integráció:** Hálózati megosztások gyors konfigurálása, felhasználói jogosultságok kezelése és állapotellenőrzés.
* **⚙️ Rendszer módosítások:** Systemd szolgáltatások felügyelete, csomagfrissítések és közvetlen hozzáférés a rendszernaplókhoz.

---

## 💻 Technológiai Stack
### Frontend (előreláthatólag)
* **React**
* **Tailwind CSS**
* **Lucide React**
* **Recharts / Chart.js**

### Backend
* **Node.js & Express.js**
* **Socket.io**
* **Dockerode**

### Rendszerintegráció
* **Linux System Bridge**

---

## 🚀 Telepítés

**Jelenleg nem elérhető**

---

## 🗺️ Útiterv (Roadmap)

| Funkció | Állapot | Prioritás |
| :--- | :--- | :--- |
| Alap monitorozás (CPU/RAM) | 📅 Tervezve | Magas |
| Docker Container kezelés | 📅 Tervezve | Magas |
| Samba Config Manager | 📅 Tervezve | Magas |
| Hálozatkezelés       | 📅 Tervezve | Magas |
| Felhasználói jogosultságkezelés | 📅 Tervezve | Közepes |
| Fájlrendszer böngésző | 📅 Tervezve | Alacsony |

---

## 🤝 Közreműködés

Jelenleg nem lehetséges (későbbiekben változni fog)

---

## 📄 Licenc

Ez a projekt az **MIT Licenc** alatt érhető el – részletekért lásd a `LICENSE` fájlt.

---

### Miért az OpenPit?
Mert a hobbi rendszergazdák számára is teljesen kezelhetővé és átláthatóvá válik a Linux kezelése. Segít elkerülni azokat a helyzeteket, ahol a felhasználók elakadnak vagy olyan hibát vétenek, amivel kárt okoznak maguknak vagy a rendszerben. (Természetesen a dolgokat ettől függetlenül ajánlatos megtanulni)