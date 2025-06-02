# Use official Node.js LTS image
FROM node:18
RUN npm install -g http-server

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port (adjust if needed)
EXPOSE 3000

# Start your app (change if you use a different entry point)
CMD ["http-server", ".", "-p", "8080"]
