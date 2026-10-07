# Panta Intelligence v2

Read-only prediction-market intelligence powered by Panta.

## Signals
The dashboard combines:
- market price conviction;
- catalog volume;
- recent trade count;
- YES-vs-NO trade-flow pressure.

## Panta API integration
- `GET /markets/`
- `GET /markets/{marketId}/`
- `GET /markets/{marketId}/trades/`

With no API key, the app uses deterministic mock data so judges can inspect the UX without credentials.

## Run
```bash
cp .env.example .env.local
npm install
npm run dev
```

Optional live data:
```bash
PANTA_API_KEY=pk_test_...
PANTA_API_BASE_URL=https://live-api.panta.market/api/v1
```

## Safety
Read-only MVP. It does not build, sign, submit or broadcast Solana transactions.

## Attribution
Powered by Panta.
