# Use Node.js as the base image
FROM node:20-bullseye

# Install Python, Java, and C++ compiler for our code execution
RUN apt-get update && apt-get install -y \
    python3 \
    python-is-python3 \
    default-jdk \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Start the application
CMD [ "npm", "start" ]
