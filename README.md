# CollegePoints — College Activity Points Management Portal

CollegePoints is a MERN-stack web application that simplifies college activity-point management by allowing students to submit certificates, track activity points, and monitor verification status. Faculty members can review certificate submissions and approve or reject them.

The project integrates **Ollama for AI-assisted extraction of structured information from certificate text**, helping organize certificate records and support duplicate detection.

## Features

- **Student Authentication:** Student registration and login.
- **Student Profiles:** Manage student details such as roll number, branch, academic year, and section.
- **Certificate Uploads:** Upload activity certificates using Cloudinary.
- **AI-Assisted Data Extraction:** Use Ollama to extract structured information from certificate text.
- **Duplicate Detection:** Use extracted certificate information to identify potential duplicate submissions.
- **Faculty Verification:** Review, approve, or reject certificate submissions.
- **Activity Points Tracking:** Track points awarded for approved activities.
- **Certificate History:** Maintain certificate records and verification status.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, JavaScript, Tailwind CSS |
| Routing | React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcrypt |
| File Storage | Cloudinary |
| AI Integration | Ollama |
| Development Tools | Vite, ESLint, Git, GitHub |

## Application Workflow

1. Students register and complete their profiles.
2. Students upload certificates for college activities.
3. Certificate files are stored using Cloudinary.
4. Ollama processes certificate text and extracts structured information.
5. Extracted information supports duplicate detection.
6. Faculty reviews certificate submissions and verifies their validity.
7. Activity points are awarded according to the verification outcome.
8. Students can track their certificate history and activity points.

## Project Structure

```text
CollegePoints/
├── ai/
├── public/
├── src/
│   ├── frontend/
│   │   ├── Components/
│   │   └── pages/
│   ├── backend/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

*Adjust the structure above if your actual folders differ.*

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB Atlas account or another configured MongoDB instance
- Cloudinary account
- Ollama installed and a compatible model configured for certificate text extraction

### Installation

Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/CollegePoints.git
cd CollegePoints
```

Install dependencies:

```bash
npm install
```

Configure the environment variables required by the backend in your local `.env` file. Do not commit credentials or API secrets to GitHub.

### Run the Application

Start the frontend:

```bash
npm run dev
```

Start the backend in a separate terminal:

```bash
npm run backend
```

The frontend and backend must both be running for the complete application to work locally.

### Production Build

Build the frontend using:

```bash
npm run build
```

## Project Objective

CollegePoints aims to digitize college activity-point management, reduce manual certificate processing, and improve the organization and verification of student activity records through full-stack web development and AI-assisted document processing.

## Future Enhancements

- Improve duplicate detection using text similarity and document comparison.
- Add notifications for certificate verification.
- Introduce activity-point analytics and reporting.
- Deploy the complete application with secure production configuration.

## Author

Developed as a full-stack college project using the MERN stack and AI-assisted certificate data extraction.