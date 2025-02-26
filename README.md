# MongoDB Next.js

This project integrates MongoDB with a Next.js application.

## Overview

This repository connect a Next.js application with MongoDB to shorten links. It includes examples for CRUD operations, routing, and API endpoints.

## Setup

1. **Clone the repository:**
  ```bash
  git clone https://github.com/your_username/link.git
  cd link
  ```

2. **Install dependencies:**
  ```bash
  npm install
  ```

3. **Environment Variables:**
  Create a `.env.local` file in the root directory and add your MongoDB connection string:
  ```env
  MONGODB_URI=your_mongodb_connection_string
  ```

## Running the Application

Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

## Features

- MongoDB integration using official driver
- Next.js API routes for CRUD operations
- Server-side rendering & static site generation
- Easy environment configuration

## Contributing

Feel free to submit issues or pull requests for improvements. Please follow the repository's code of conduct.

## License

This project is licensed under the MIT License.