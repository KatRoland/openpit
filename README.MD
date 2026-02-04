#### **English version below**

# OpenPit

### **DISCLAIMER**: Jelenleg a projekt még nem nyújt out-of-the-box élményt, a futtatásához kisebb rendszerszintű módosításokra van szükség.

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

| Funkció | Állapot(Backend) | Állapot(Frontend) | Prioritás |
| :--- | :--- | :--- | :--- |
| Alap monitorozás (CPU/RAM) | 🚧 Folyamatban | 📅 Planned | Magas |
| Fáljrendszer kezelés       | ☑️ Kész | 📅 Planned | Magas |
| Docker Container kezelés | 📅 Elkezdve(szüneteltetve) | 📅 Planned | Magas |
| Samba Config Manager | ☑️ Részben kész | 📅 Planned | Magas |
| Alapvető IPV4 kezelés       | ☑️ Kész | 📅 Planned | Magas |
| Mélyebb IPV4 kezelés (vlan,bridge, stb)       | 📅 Tervezve | 📅 Planned | Alacsony |
| Alapvető IPV6 kezelés       | 📅 Tervezve | 📅 Planned | Alacsony |
| Felhasználói jogosultságkezelés | ☑️ Kész | 📅 Planned | Közepes |
| Fájlrendszer böngésző | 📅 Tervezve | 📅 Planned | Alacsony |
| Cluster Kezelés | ❔ Ötlet | ❔ Ötlet | Alacsony |

---

## 🤝 Közreműködés

Jelenleg nem lehetséges (későbbiekben változni fog)

---

## 📄 Licenc

Ez a projekt az **MIT Licenc** alatt érhető el – részletekért lásd a `LICENSE` fájlt.

---

### Miért az OpenPit?
Mert a hobbi rendszergazdák számára is teljesen kezelhetővé és átláthatóvá válik a Linux kezelése. Segít elkerülni azokat a helyzeteket, ahol a felhasználók elakadnak vagy olyan hibát vétenek, amivel kárt okoznak maguknak vagy a rendszerben. (Természetesen a dolgokat ettől függetlenül ajánlatos megtanulni)

# ENGLISH VERSION

### **⚠️ DISCLAIMER**: This project does not currently provide an "out-of-the-box" experience. Running it requires manual system-level modifications.

**Linux Infrastructure Management Panel**

**OpenPit** is an open-source, web-based administration interface designed to provide a modern and transparent solution for remote Linux system management. The project aims to serve as a stable, centralized **"Operations Center"** where sysadmins can monitor and modify critical system parameters through a single, intuitive interface.

---

## 🛠️ Key Features (Planned)

* **📈 Real-time Monitoring:** Visual representation of CPU, Memory, Network, and Disk usage based on live data.
* **🐳 Container Management (Docker):** A simplified, Portainer-like interface. Start, stop, and restart containers, with basic log viewing.
* **💾 Storage & Filesystem:** Drive identification, partitioning, and mount point management.
* **📂 Samba Integration:** Quick configuration of network shares, user permission management, and status monitoring.
* **⚙️ System Modifications:** Systemd service oversight, package updates, and direct access to system logs.

---

## 💻 Technology Stack

### Frontend (Anticipated)
* **React**
* **Tailwind CSS**
* **Lucide React** (Icons)
* **Recharts / Chart.js** (Data Visualization)

### Backend
* **Node.js & Express.js**
* **Socket.io** (For real-time updates)
* **Dockerode** (Docker API interaction)

### System Integration
* **Linux System Bridge**

---

## 🚀 Installation

**Currently unavailable.**

---

## 🗺️ Roadmap

| Feature | Status(Backend) | Status(Frontend) | Priority |
| :--- | :--- | :--- | :--- |
| Basic Monitoring (CPU/RAM) | 🚧 In Progress | 📅 Planned | High |
| Filesystem Management | ☑️ Done | 📅 Planned | High |
| Docker Container Management | 📅 Started (Paused) | 📅 Planned | High |
| Samba Config Manager | ☑️ Partially done | 📅 Planned | High |
| Basic IPV4 management | ☑️ Done | 📅 Planned | High |
| Advanced IPV4 management (vlan,bridge) | ☑️ Done | 📅 Planned | Low |
| Basic IPV6 management | 📅 Planned | 📅 Planned | Low |
| User Permission Management | ☑️ Done | 📅 Planned | Medium |
| Filesystem Browser | 📅 Planned | 📅 Planned | Low |
| Cluster Management | ❔ Idea | ❔ Idea | Low |

---

## 🤝 Contribution

Contributions are not accepted at this time (this will change as the project matures).

---

## 📄 License

This project is licensed under the **MIT License** – see the `LICENSE` file for details.

---

### Why OpenPit?
OpenPit aims to make Linux management completely accessible and transparent, even for **hobbyist sysadmins**. It helps prevent scenarios where users get stuck or make critical mistakes that could damage their system. While we provide the tools to make it easy, we still believe that learning the underlying mechanics is the best way to grow!