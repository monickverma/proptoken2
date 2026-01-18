# 🚀 Run Instructions for PropToken Autonomous Platform

Follow these steps to start the complete application (Backend + Frontend).

## 1. Environment Setup

Ensure you have:
- **Node.js**: v18+ installed
- **Base Sepolia Wallet**: Private key in `proptoken-autonomous/contracts/.env` (Already configured)

## 2. Start the Backend

The backend handles the Autonomous Asset Onboarding, ABM logic, and Blockchain interactions.

1. Open a terminal.
2. Navigate to the backend directory:
   ```bash
   cd c:\Users\KIIT\proptoken2\proptoken-autonomous\backend
   ```
3. Install dependencies (if not already done):
   ```bash
   npm install
   ```
4. Start the server (Development Mode):
   ```bash
   npm run start:dev
   ```
   ✅ **Success**: You should see:
   `[NestApplication] Nest application successfully started`
   Running on **http://localhost:3001**

## 3. Start the Frontend

The React frontend allows user submission and visualization.

1. Open a **second** terminal.
2. Navigate to the root directory:
   ```bash
   cd c:\Users\KIIT\proptoken2
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Vite server:
   ```bash
   npm run dev:frontend
   ```
   ✅ **Success**: You should see:
   `➜  Local:   http://localhost:3003/`

## 4. Using the App

1. Open **http://localhost:3003** in your browser.
2. **Submit an Asset**:
   - Use the UI to submit a property (Select "TEST" category for mock bypass).
3. **Verify Onboarding**:
   - The backend will process the submission.
   - Check the **Activity Feed** or **Console Logs** in the backend terminal.
4. **Mock SPV (CLI Option)**:
   - You can also submit via terminal using the prepared script:
   ```bash
   # In backend terminal
   ./test-mock-spv.sh
   console.log("Mock SPV Submitted")
   ```

## 5. Troubleshooting

- **Port in Use**:
  - If 3001 is busy, kill the process `npx kill-port 3001`.
  - If 3003 is busy, Vite will auto-select the next port (e.g., 5174). Check the terminal output.
- **Backend Connection Failed**:
  - Ensure backend is running ON 3001.
  - The frontend proxies requests via `vite.config.ts`. I have updated it to point `/abm` -> `http://localhost:3001/submissions`.

---

**System Status:**
- **Blockchain**: Base Sepolia (Live)
- **Contracts**: Deployed & Integrated
- **Backend**: Ready (Port 3001)
- **Frontend**: Ready (Port 3003)
