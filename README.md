# NHSC Confessions

An anonymous confession platform for students to share their thoughts, memories, stories, and experiences.

## Why?

This website was inspired by my high school days, when students had a strong desire to share their thoughts freely. What they needed was absolute anonymity and a fast, convenient way to submit posts.

So, instead of forcing students to submit content through restrictive forms with limited interaction, I built this custom web interface to provide a more modern, intuitive, and seamless submission experience.

## Requirements

Before running the project, make sure you have:

* **Node.js**
* **npm**
* **A Supabase project**

## Getting the Source Code

Clone the repository:

```bash
git clone https://github.com/nhsconfessions/confessions.git
cd confessions
```

Install the dependencies:

```bash
npm install
```
 
```text
confessions
comments
```

## Environment File

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-client-key
VITE_GIPHY_KEY=your-giphy-api-key
```

Replace the example values with those from your Supabase project and GIPHY API application.

Vite exposes `VITE_*` values in the frontend bundle, so only use public client/API keys here. Never put a Supabase service-role key or other server-side secret in this file.

## Development

Start the development server:

```bash
npm run dev
```

Vite will start a local development server.

## Disclaimer

This project is provided as open-source software.

Anyone deploying their own instance is responsible for:

* Supabase configuration
* Database security
* Row Level Security policies
* Content moderation
* Privacy practices
* Abuse prevention
* Deployment configuration
* Compliance with applicable laws and regulations

The maintainers of this repository are **not responsible** for independently deployed instances or the data handled by them.

## License

See the repository's license file for the applicable license and usage terms.
