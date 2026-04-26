# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

# XDR — eXtended Detection & Response

AI-powered IP threat analysis system with deterministic risk classification + LLM narrative augmentation.

## Stack
- **Frontend:** React (port 30080)
- **Backend:** Node.js Express (port 5001)
- **Storage:** Elasticsearch 8.12 (port 9200) + Kibana (5601)
- **Automation:** n8n (port 5678)
- **AI:** Google Gemini 2.0-flash (with graceful fallback)
- **Alerts:** Telegram Bot (@xdr_alert_bot)

## Architecture
Hybrid AI: Critical decisions are deterministic (rule-based threshold), 
narrative & insight are AI-augmented (with fallback to template-based 
explanation when Gemini is unavailable).

## Setup
1. Clone repo
2. Copy `.env.example` to `.env`, fill credentials
3. `docker-compose up -d`
4. Import n8n workflow from `n8n_backup/XDR_IP_Threat_Analysis.json`
5. Access FE at http://localhost:30080

## Threat Classification Rules
- AbuseIPDB 0-9: LOW + ALLOW
- 10-39: LOW + MONITOR
- 40-69: MEDIUM + MONITOR
- 70-89: HIGH + BLOCK
- 90-100: CRITICAL + BLOCK
- Override: Reputable ISP (Google/Cloudflare/AWS/MS/Apple) + score 0 → LOW + ALLOW
- Override: Russia/China/Iran/North Korea + score >= 40 → bump to HIGH + BLOCK

## Telegram Alert Triggers
- ai_risk_level: CRITICAL/HIGH/MEDIUM
- ai_recommended_action: BLOCK
- country: Russia/China/Iran