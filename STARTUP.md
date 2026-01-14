# How to Start the PropToken Project

This project consists of three main components that need to be running simultaneously.

### 1. Legacy Backend (Registry & Auth)
**Run this in Terminal 1:**
```bash
cd /Users/shivanshtomar/Desktop/proptoken2
npm run dev
```
*Port: 3000*

### 2. Autonomous Backend (Oracle & Legal Wrapper)
**Run this in Terminal 2:**
```bash
cd /Users/shivanshtomar/Desktop/proptoken2/proptoken-autonomous/backend
npm start
```
*Port: 3001*

### 3. Web Frontend (Vite)
**Run this in Terminal 3:**
```bash
cd /Users/shivanshtomar/Desktop/proptoken2
npm run dev:frontend
```
*Port: 3003*

---

### Accessing the Platform
Once all three are running, open your browser and go to:
**[http://localhost:3003](http://localhost:3003)**

### Test Assets (Real Data)
You can find real-world asset coordinates and data for testing in:
`valid_assets.json`
