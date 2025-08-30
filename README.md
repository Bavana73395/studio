# LocaFind - AI-Powered Location Finder

LocaFind is a modern, AI-powered web application that helps you discover nearby places with ease. Whether you're looking for the best coffee shops, the closest hospital, or a quiet park, LocaFind provides high-quality, relevant results in an instant.

Built with Next.js, Genkit, and the Foursquare API, this application serves as an excellent starting point for building sophisticated, AI-driven, location-aware applications.

![LocaFind Screenshot](https://storage.googleapis.com/stablr-media/locafind-screenshot.png)

## ✨ Features

- **AI-Powered Search:** Uses natural language to find exactly what you're looking for.
- **Geolocation:** Automatically detects your location to provide nearby results.
- **Quality-Focused Results:** Prioritizes top-rated and popular locations.
- **Rich Details:** Displays ratings, hours, websites, and AI-generated descriptions.
- **Image & Voice Search:** Search by speaking or by uploading a picture.
- **Interactive Map:** Visualize your location and search results on an embedded map.
- **Responsive Design:** A clean, modern, and mobile-friendly interface.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **AI Integration:** [Genkit (Google AI)](https://firebase.google.com/docs/genkit)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Location Data:** [Foursquare Places API](https://location.foursquare.com/developer/)

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or later recommended)
- [pnpm](https://pnpm.io/installation) (or npm/yarn)

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/your-username/locafind.git
cd locafind
```

### 2. Install Dependencies

Install the necessary packages using your preferred package manager:

```bash
pnpm install
```

### 3. Set Up Environment Variables

This project requires an API key from the Foursquare Places API to fetch location data.

1.  Create a `.env` file in the root of the project by copying the example file:

    ```bash
    cp .env.example .env
    ```

2.  Sign up for a free developer account at [Foursquare for Developers](https://location.foursquare.com/developer/).

3.  Create a new project in your Foursquare dashboard and get your API Key.

4.  Open the `.env` file and add your Foursquare API key:

    ```
    FOURSQUARE_API_KEY="YOUR_FOURSQUARE_API_KEY_HERE"
    ```

### 4. Run the Development Server

Now you can start the development server:

```bash
pnpm dev
```

The application should now be running at [http://localhost:9002](http://localhost:9002).

## 💡 How It Works

The application uses Genkit to create an AI agent that can understand user queries. When you search for something like "top-rated restaurants near me," the AI uses its "tools" (in this case, the Foursquare API) to find relevant data, formats it, and returns it to the frontend for display. This tool-based approach makes the AI highly extensible and capable.
