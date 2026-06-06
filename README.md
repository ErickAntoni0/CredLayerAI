# CredLayer AI

<div align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Ethers.js-6-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" />
  <img src="https://img.shields.io/badge/Arbitrum-Sepolia-2D374B?style=for-the-badge&logo=arbitrum&logoColor=white" />
  <img src="https://img.shields.io/badge/Bitso-API-00B15D?style=for-the-badge" />
  <img src="https://img.shields.io/badge/jsPDF-2.x-FF6B35?style=for-the-badge" />
</div>

<br />

> **Infraestructura de Reputación Financiera Portátil para LATAM**
> Desarrollado para el **Ethereum México Hackathon 2026**

---

## El Problema

Millones de pequeñas empresas en Latinoamérica —freelancers, vendedores ambulantes, cooperativas informales y microemprendedores— generan actividad económica real y constante todos los días. Sin embargo, siguen siendo **financieramente invisibles**:

- **Sin historial financiero portátil** — La actividad en una comunidad no cuenta en ningún otro lado.
- **Sin capa de reputación verificable** — Es imposible demostrar estabilidad ante socios o prestamistas.
- **Sin acceso a crédito** — Los bancos exigen registros que las Pymes informales simplemente no tienen.

---

## La Solución

**CredLayer AI** transforma la actividad financiera cotidiana en una **reputación financiera portátil y verificable** anclada en la infraestructura de Ethereum.

Cada pago registrado genera una prueba inmutable on-chain que compone un **Trust Score** (0–1000) derivado de la consistencia, frecuencia y volumen de actividad. Este puntaje se vincula a la identidad ENS `.micro.eth` del usuario, haciéndolo portátil a través de cualquier protocolo DeFi.

---

## Inicio Rápido

### 1. Instalar dependencias

```bash
pnpm install
# o bien
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Variables disponibles:

| Variable | Requerido | Descripción |
|----------|-----------|-------------|
| `VITE_ANTHROPIC_API_KEY` | Opcional | Activa NOVA AI con Claude Sonnet |
| `VITE_GEMINI_API_KEY` | Opcional | Backend de IA alternativo (Gemini) |
| `VITE_SEPOLIA_RPC_URL` | Opcional | RPC para Ethereum Sepolia |
| `VITE_REPUTATION_ENS_ADDRESS` | Opcional | Dirección del contrato CredLayer |
| `VITE_DEMO_MODE` | Opcional | `true` para activar datos simulados sin wallet |

**Configuración mínima para demo:**
```env
VITE_DEMO_MODE=true
```

### 3. Iniciar servidor de desarrollo

```bash
pnpm dev
# → http://localhost:5173
```

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo con HMR |
| `pnpm build` | Bundle de producción en `dist/` |
| `pnpm preview` | Previsualizar build de producción |
| `pnpm lint` | Análisis de código con ESLint |

---

## Características Principales

### 1. Trust Score — Motor de Reputación On-Chain
- Métrica 0–1000 calculada por consistencia, volumen y tasa de éxito de pagos
- Niveles: `Beginner → Intermediate → Advanced → Expert → Master`
- Contrato: `0xcABFB7d02e1C32F2a26FFa244F1B1ba53f920431` (Ethereum Sepolia)

### 2. Pagos Multi-Chain con Simulación Demo
- **USDC en Ethereum Sepolia** — Aprobación ERC-20 + `registerPayment()` en CredLayer
- **MXNB en Arbitrum Sepolia** — Transferencia directa ERC-20 de bajo costo
- **Modo Simulación** — Flujo completo sin fondos reales para presentaciones

### 3. Integración Bitso (Oráculo de Tipo de Cambio)
- Consulta en tiempo real a la API pública de Bitso (`mxn_usd`)
- Refresco automático cada 30 segundos
- Fallback a tasa simulada (`$17.79 MXN/USD`) si hay problemas de CORS

### 4. Protección de Gas en Arbitrum
Buffer del 30% en `maxFeePerGas` para evitar reversiones por volatilidad de comisiones L2:
```javascript
const maxFeePerGas = (feeData.maxFeePerGas * 130n) / 100n
```

### 5. NOVA AI — Asistente Financiero
- Burbuja flotante persistente en todas las páginas
- Respuestas context-aware basadas en la sección activa del usuario
- Lee estado de `localStorage` para Trust Score y pagos (consistente en demo)
- Motor híbrido: Claude Sonnet → Gemini → Mock local (sin dependencias externas)

### 6. Reporte PDF Verificable
- Exportación desde Dashboard → Reports con jsPDF
- Certifica Trust Score, volumen on-chain y dirección de contrato verificable

---

## Implementación Técnica

### Bitso — Conversión MXN ↔ USD

```javascript
// Ticker público de Bitso
const res = await fetch('https://sandbox.bitso.com/api/v3/ticker/?book=mxn_usd')
const { payload } = await res.json()
setExchangeRate(parseFloat(payload.last))
```

Al seleccionar MXNB en el formulario de pagos, se calcula automáticamente la equivalencia en USDC para mostrar el impacto real de la transferencia.

### Arbitrum Sepolia — Red L2 para MXNB

```javascript
// Cambio automático a Arbitrum si se usa MXNB
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0x66EEE' }], // 421614 = Arbitrum Sepolia
})

// Transferencia directa ERC-20
const mxnbContract = new ethers.Contract(MXNB_ADDRESS, ERC20_ABI, signer)
const tx = await mxnbContract.transfer(recipient, amount, { maxFeePerGas })
```

El sistema detecta la red actual (`chainId`) antes de instanciar `BrowserProvider`, evitando el error `NETWORK_ERROR` de Ethers.js v6 cuando la red cambia durante la ejecución.

---

## Contratos Desplegados

| Contrato | Red | Dirección |
|----------|-----|-----------|
| CredLayer Core | Ethereum Sepolia | [`0xcABFB7d02e1C32F2a26FFa244F1B1ba53f920431`](https://sepolia.etherscan.io/address/0xcABFB7d02e1C32F2a26FFa244F1B1ba53f920431) |
| USDC | Ethereum Sepolia | [`0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`](https://sepolia.etherscan.io/address/0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238) |
| MXNB | Arbitrum Sepolia | [`0xf197ffc28c23e0309b5559e7a166f2c6164c80aa`](https://arbiscan.io/address/0xf197ffc28c23e0309b5559e7a166f2c6164c80aa) |

---

## Configuración de Wallet para la Demo

1. Instalar **MetaMask**
2. Añadir **Arbitrum Sepolia**:

| Campo | Valor |
|-------|-------|
| Nombre | `Arbitrum Sepolia` |
| RPC | `https://sepolia-rollup.arbitrum.io/rpc` |
| Chain ID | `421614` |
| Símbolo | `ETH` |

3. Obtener ETH de prueba: [Arbitrum Sepolia Faucet](https://www.alchemy.com/faucets/arbitrum-sepolia)

---

## Flujo de Demo Recomendado

1. **Conectar Wallet** — MetaMask en la barra superior
2. **Reclamar Identidad** — Subdominio `.micro.eth` en Comunidad
3. **Enviar Pago** — MXNB en Arbitrum Sepolia (o activar Modo Simulación)
4. **Ver Trust Score** — Sección Perfil muestra incremento inmediato
5. **Preguntar a NOVA** — *"¿Cómo incremento mi Trust Score?"*
6. **Descargar PDF** — Dashboard → Reports → Exportar certificado

---

## Stack Tecnológico

| Categoría | Tecnologías |
|-----------|-------------|
| **Frontend** | React 19, Vite 8, TailwindCSS 3 |
| **Web3** | Wagmi, Ethers.js v6, Viem |
| **Blockchain** | Ethereum Sepolia (CredLayer), Arbitrum Sepolia (MXNB) |
| **IA** | Claude Sonnet, Google Gemini, Mock local |
| **Animaciones** | GSAP, Lenis, Framer Motion, Anime.js |
| **Reportes** | jsPDF |
| **Identidad** | ENS `.micro.eth` subdomains |

---

## Despliegue en Vercel

```bash
npm i -g vercel
vercel --prod
```

---

**© 2026 CredLayer AI | Desarrollado con ❤️ para el ecosistema Ethereum México**
