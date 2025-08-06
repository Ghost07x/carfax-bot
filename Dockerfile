# Use Playwright’s official Docker image
FROM mcr.microsoft.com/playwright/node:v22

# Set working directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN npm install

# Run the script with dynamic VIN support
CMD ["node", "index.js"]
