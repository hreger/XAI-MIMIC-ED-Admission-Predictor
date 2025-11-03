# ED Risk Assessment System

An advanced emergency department admission prediction system that helps healthcare professionals make informed decisions through machine learning and explainable AI.

## Features

- Comprehensive patient assessment through vital signs and demographic data
- Natural language processing of triage notes
- Transparent decision-making with SHAP and LIME explanations
- Built-in fairness monitoring for equitable predictions

## Technology Stack

- React with TypeScript
- Vite for build tooling
- Google's Gemini API for advanced NLP
- Recharts for data visualization

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- A Gemini API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
