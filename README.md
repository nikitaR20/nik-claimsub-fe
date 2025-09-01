# 🏥 Medical Insurance Claim Frontend (React) – Beginner Friendly

This project is a **frontend app** that lets you:

* **View a list of claims** (with pages).
* **Submit new claims** and get a request ID.
* Prepare for **AI/LLM integration** in the future.

> ⚠️ **Important:** You must run the **backend project** first. The frontend needs the backend to fetch or submit claims.


## ✅ What You Need

1. **A computer** (Windows, Mac, or Linux).
2. **Internet connection**.
3. **Visual Studio Community (FREE)** → [Download here](https://visualstudio.microsoft.com/).

   * During installation, check ✅ **Node.js development** or **JavaScript/TypeScript development**.
4. **Backend project** → Make sure it is running.
5. **Git** → [Download here](https://git-scm.com/downloads).
6. **Node.js and npm** → Needed to run React apps.

---

## 🛠 Step 1: Install Node.js and npm

1. Go to [https://nodejs.org/](https://nodejs.org/).
2. Download the **LTS (Long Term Support)** version.
3. Install it by following the instructions.
4. Make sure to **check “Add to PATH”** during installation (Windows only).

After installation, check that Node.js and npm are installed:

1. Open **Visual Studio Terminal** (**View → Terminal**) or **Command Prompt**.
2. Type:

```bash
node --version
npm --version
```

✅ You should see a **version number** for both.

> 💡 **Why it’s needed:**
>
> * **npm** installs the tools your React app needs.
> * It also runs the development server so you can view your app in a browser.

---

## 🛠 Step 2: Run the Backend

The backend must be running before the frontend can work:

1. Open **Visual Studio**.
2. Open your **backend project**.
3. Follow the backend README instructions to:

   * Install dependencies
   * Start the server
4. Make sure the backend opens at a URL like:

```
http://localhost:5000
```

> ✅ The frontend will **not work** if the backend is not running.

---

## 🛠 Step 3: Open the Frontend Project in Visual Studio

1. Open **Visual Studio**.
2. Go to **File → Clone Repository**.
3. Paste the frontend project GitHub link: NIK-CLAIMSUB-FE
4. Choose a folder on your computer where you want to save the project (like `Documents/`).
5. Click **Clone** → Visual Studio will download and open the project.

> 💡 The folder where the project is saved is called the “project folder”. Think of it as the main folder that contains all the frontend files.

---

## 🛠 Step 4: Install Required Tools (Dependencies)

1. In Visual Studio, go to **View → Terminal**.
2. Make sure the terminal shows your **project folder**.
3. Type the following and press **Enter**:

```
npm install
```

* This downloads all the tools the app needs to work.
* You only need to do this **once**.

---

## 🛠 Step 5: Set the Backend URL

If your backend runs on a different address than `http://localhost:5000`, do this:

1. In **Solution Explorer** (right panel), right-click the project → **Add → New Item**.
2. Select **Text File**, name it `.env` (include the dot at the start).
3. Open `.env` and type:

```
REACT_APP_API_URL=http://localhost:8000
```

* Replace the URL with your backend URL if it’s different.
* Save the file.

---

## ▶️ Step 6: Run the Frontend

1. In **Solution Explorer**, right-click the `package.json` file → **Set as Startup Project**.
2. In the terminal at the bottom, type:

```bash
npm start
```

3. A browser window should open automatically at:

```
http://localhost:3000
```

✅ Now you can **see the claims list** and **submit new claims**.

> ⚠️ Remember: The backend must be running first!

---

## 📑 Step 7: What You Can Do in the App

* **Claim List Page** → View all claims, with pagination.
* **Add Claim Form** → Submit new claims and get a request ID.
* **Future AI/LLM Integration** → Later, you can connect AI to automatically analyze claims.

---IGNORE THIS STEP FOR NOW----

## 🛠 Step 8: Build for Deployment

When ready to share the app (e.g., on **Heroku**):

1. In the terminal, type:

```bash
npm run build
```

2. This creates a folder called `build` → you can upload this folder to a server.

---

## ❓ Troubleshooting

* **App doesn’t open** → Check port 3000 is free or open the browser manually at `http://localhost:3000`.
* **Backend errors** → Make sure the backend is running.
* **npm errors** → Run `npm install` again.
* **Command not found** → Ensure Node.js is installed and added to PATH.
