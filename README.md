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
Hybrid AI: Critical decisions are deterministic (rule-based threshold), narrative & insight are AI-augmented (with fallback to template-based explanation when Gemini is unavailable).

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

## Development
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts
- `npm start` — Run dev server
- `npm run build` — Build for production
- `npm test` — Run tests

## License
Private project — © 2026 fanza