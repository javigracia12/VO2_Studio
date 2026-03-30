# Firebase — easy setup (5 steps)

You only need to do this **once** on your Mac. After that, the app saves workouts (done, RPE, notes) to the cloud by itself.

---

## Step 1 — Open the terminal in Cursor

- Menu: **Terminal → New Terminal**  
  or press **Ctrl + `** (backtick)

You should see a prompt at the **bottom** of Cursor.

---

## Step 2 — Go to your project folder

Copy this line, paste in the terminal, press **Enter**:

```bash
cd /Users/javiergracia/Desktop/Proyectos/riding
```

---

## Step 3 — Log in to Firebase (browser will open)

Copy, paste, **Enter**:

```bash
npm run firebase:login
```

- A **browser** window opens.  
- Sign in with the **same Google account** you use for Firebase.  
- Click **Allow** if it asks for permission.  
- When it says you’re logged in, you can close the browser tab.

---

## Step 4 — Check Firestore in the website

1. Open **[Firebase Console](https://console.firebase.google.com)** in your browser.  
2. Click your project (**vo2studio** or whatever you named it).  
3. Left menu → **Build** → **Firestore Database**.  
4. If it says **Create database** → click it → choose a region → **Enable**.

(If Firestore is already there, skip this step.)

---

## Step 5 — Upload security rules (one command)

Back in the **same terminal** (still in the project folder):

```bash
npm run firebase:deploy-rules
```

- If it asks you to pick a project, choose **vo2studio** (or your project name).  
- Wait until it says **Deploy complete**.

---

## Done

Open your app, sign in, mark a workout. In Firebase → Firestore you should eventually see:

`users` → *(your user id)* → `data` → `progress`

---

## If something fails

**“Project not found”**  
Your Firebase project id might not be `vo2studio`. Run:

```bash
npx firebase use --add
```

Pick the correct project from the list.

**“Permission denied”**  
Make sure Step 3 (login) finished and you used the Google account that owns the Firebase project.

**“Firestore API not enabled”**  
Finish Step 4 (create Firestore in the console), then run Step 5 again.

---

## Commands cheat sheet

| What you want      | Command                         |
|--------------------|---------------------------------|
| Log in             | `npm run firebase:login`        |
| Upload rules       | `npm run firebase:deploy-rules` |
| List your projects | `npm run firebase:projects`     |

(Fix: first row should be firebase:login not deploy-rules twice - I'll fix the table)

</think>


<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace