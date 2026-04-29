export const siteConfig = {
  name: "HTTP Cache Headers Generator",
  title: "HTTP Cache Headers Generator — Build Cache-Control Headers Instantly",
  description:
    "Generate correct Cache-Control headers for HTML, JS, images, fonts, and APIs. Configure max-age, stale-while-revalidate, immutable, and more. Get the header string + plain-English explanation.",
  url: "https://http-cache-headers-generator.tools.jagodana.com",
  ogImage: "/opengraph-image",

  // Header
  headerIcon: "Server",
  brandAccentColor: "#6366f1", // indigo-500 (must match --brand-accent in globals.css)

  // SEO
  keywords: [
    "cache-control header generator",
    "HTTP cache headers",
    "cache-control builder",
    "max-age generator",
    "stale-while-revalidate",
    "HTTP caching tool",
    "CDN cache headers",
    "browser cache headers",
    "cache policy generator",
    "HTTP headers tool",
  ],
  applicationCategory: "DeveloperApplication",

  // Theme
  themeColor: "#3b82f6", // blue-500

  // Branding
  creator: "Jagodana",
  creatorUrl: "https://jagodana.com",
  twitterHandle: "@jagodana",

  socialProfiles: [
    "https://twitter.com/jagodana",
  ],

  links: {
    github: "https://github.com/Jagodana-Studio-Private-Limited/http-cache-headers-generator",
    website: "https://jagodana.com",
  },

  footer: {
    about:
      "Free tool to generate correct HTTP Cache-Control headers for any resource type. No signup, no server — runs entirely in your browser.",
    featuresTitle: "Features",
    features: [
      "Resource-type presets",
      "All Cache-Control directives",
      "Plain-English explanations",
      "Nginx & Apache config output",
    ],
  },

  hero: {
    badge: "Free Developer Tool",
    titleLine1: "Generate HTTP",
    titleGradient: "Cache-Control Headers",
    subtitle:
      "Configure Cache-Control headers for HTML pages, JS/CSS bundles, images, fonts, and API responses. Get the exact directive string plus a plain-English breakdown of what each setting does.",
  },

  featureCards: [
    {
      icon: "⚡",
      title: "Resource Presets",
      description:
        "Start from a sensible baseline for HTML, CSS/JS, images, fonts, or API responses — then fine-tune.",
    },
    {
      icon: "🔍",
      title: "Plain-English Explanations",
      description:
        "Every directive gets a clear explanation of what it does and how browsers and CDNs interpret it.",
    },
    {
      icon: "📋",
      title: "Server Config Examples",
      description:
        "Get ready-to-paste Nginx and Apache configuration snippets alongside the header string.",
    },
  ],

  relatedTools: [
    {
      name: "Security Headers Generator",
      url: "https://security-headers-generator.tools.jagodana.com",
      icon: "🔐",
      description: "Generate HSTS, CSP, X-Frame-Options, and more security headers.",
    },
    {
      name: "CORS Headers Generator",
      url: "https://cors-headers-generator.tools.jagodana.com",
      icon: "🌐",
      description: "Build correct CORS headers for cross-origin resource sharing.",
    },
    {
      name: "HTTP Status Debugger",
      url: "https://http-status-debugger.tools.jagodana.com",
      icon: "🐛",
      description: "Decode and fix HTTP status codes instantly.",
    },
    {
      name: "JWT Decoder",
      url: "https://jwt-decoder.tools.jagodana.com",
      icon: "🔑",
      description: "Decode and inspect JSON Web Tokens.",
    },
    {
      name: "CSP Header Generator",
      url: "https://csp-header-generator.tools.jagodana.com",
      icon: "🛡️",
      description: "Build Content Security Policy headers visually.",
    },
    {
      name: "Robots.txt Generator",
      url: "https://robots-txt-generator.tools.jagodana.com",
      icon: "🤖",
      description: "Generate a robots.txt file for your site.",
    },
  ],

  howToSteps: [
    {
      name: "Select a resource type",
      text: "Pick the type of resource you want to configure: HTML page, CSS/JS bundle, image, font, or API response.",
      url: "",
    },
    {
      name: "Configure the directives",
      text: "Adjust max-age, visibility (public/private), stale-while-revalidate, immutable, and other directives using the controls.",
      url: "",
    },
    {
      name: "Copy the header",
      text: "Click Copy to grab the complete Cache-Control header string, or use the Nginx/Apache config snippets directly.",
      url: "",
    },
  ],
  howToTotalTime: "PT1M",

  faq: [
    {
      question: "What is a Cache-Control header?",
      answer:
        "Cache-Control is an HTTP header that tells browsers and intermediary caches (like CDNs) how long to store a response and under what conditions to revalidate it. Common directives include max-age (how many seconds to cache), public/private (who can cache it), no-cache (always revalidate before using), and no-store (never cache at all).",
    },
    {
      question: "What is the difference between no-cache and no-store?",
      answer:
        "no-cache does not mean 'do not cache' — it means 'cache the response, but always check with the server before using it'. no-store means 'never store this response anywhere'. Use no-cache for frequently updated pages where freshness matters. Use no-store for sensitive data like banking pages or private dashboards that should never be stored.",
    },
    {
      question: "What does stale-while-revalidate do?",
      answer:
        "stale-while-revalidate=N tells the browser it can serve a stale (expired) cached response immediately while fetching a fresh copy from the server in the background. This improves perceived performance because the user sees content instantly without waiting for a network round-trip. After N seconds, the background refresh must complete before serving the cached version again.",
    },
    {
      question: "When should I use immutable?",
      answer:
        "Use immutable together with a long max-age when you deploy assets with a content hash in the filename (e.g., main.a1b2c3d4.js). The immutable directive tells the browser the file will never change, so it can skip revalidation checks entirely during the cache lifetime. Without a hash-based filename, never use immutable — users would get stale files.",
    },
    {
      question: "What is the difference between max-age and s-maxage?",
      answer:
        "max-age controls caching in both browsers and shared caches (CDNs). s-maxage overrides max-age specifically for shared/proxy caches while leaving the browser max-age unchanged. This is useful when you want browsers to revalidate frequently but let your CDN cache responses for longer.",
    },
  ],

  pages: {
    "/": {
      title:
        "HTTP Cache Headers Generator — Build Cache-Control Headers Instantly",
      description:
        "Generate correct Cache-Control headers for HTML, JS, images, fonts, and APIs. Configure max-age, stale-while-revalidate, immutable, and more.",
      changeFrequency: "weekly" as const,
      priority: 1,
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
