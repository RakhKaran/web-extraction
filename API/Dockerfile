# Use official Node base for backend (not Airflow)
FROM node:18-bullseye

# Install all dependencies for Playwright, Puppeteer, and virtual display
RUN apt-get update && apt-get install -y \
    xvfb \
    x11-apps \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libgtk-3-0 \
    fonts-liberation \
    libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

# Create a writable /tmp/.X11-unix directory for Xvfb
RUN mkdir -p /tmp/.X11-unix && chmod 1777 /tmp/.X11-unix

# Create app directory
WORKDIR /usr/src/app

# Copy dependency files and install
COPY package*.json ./
RUN npm install

# Install Playwright (if required)
RUN npx playwright install --with-deps chromium

# Copy rest of the source
COPY . .

# Build LB4 app
RUN npm run build

# Expose port
EXPOSE 3000

# Use xvfb-run as entry command
CMD ["xvfb-run", "--server-args=-screen 0 1280x720x24", "node", "dist/scripts/run-main.js"]
