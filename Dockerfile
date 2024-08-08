# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml to the container
COPY package.json pnpm-lock.yaml ./

# Install the dependencies using pnpm
RUN pnpm install

# Copy the rest of the application code to the container
COPY . .

# Generate Prisma client if you use Prisma (optional)
RUN npx prisma generate

# Expose port 3000 (or any other port your app uses)
EXPOSE 3000

# Run the development server using pnpm
CMD ["pnpm", "dev"]
