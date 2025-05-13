# QForge: AI-Powered Question Paper Generator

QForge is an intelligent application designed to streamline and automate the creation of academic question papers for educators. It leverages Generative AI to assist in finding relevant questions and formatting them into professional, print-ready documents.

## Problem Statement

Teachers and educational institutions often spend a significant amount of time and effort in:
- Manually curating questions from various sources.
- Searching for relevant Past Year Questions (PYQs) that align with specific curriculum and examination boards.
- Formatting question papers to meet specific layout requirements, including headers, instructions, and consistent numbering.
- Ensuring accurate representation of mathematical formulas and special symbols.

This process can be tedious, repetitive, and prone to errors or inconsistencies, taking valuable time away from teaching and student interaction.

## Solution: QForge

QForge addresses these challenges by providing an AI-assisted platform that automates key aspects of question paper generation. Users can:

- **Specify Paper Parameters:** Define the educational board (CBSE, ICSE, State Boards), class level, subject, and specific topics or chapters to be covered.
- **Input Syllabus:** Provide syllabus information either as text or by uploading a document (future enhancement for direct PDF parsing).
- **Set Paper Structure:** Configure total marks, time duration, and a detailed mark distribution (e.g., number of 1-mark, 2-mark, 5-mark questions).
- **AI-Powered Question Sourcing:**
    - **Probable Questions:** QForge uses AI (powered by Google Gemini via Genkit) to generate a list of probable questions based on the provided syllabus and topics.
    - **Past Year Questions (PYQs):** The AI also searches the internet for relevant PYQs specific to the chosen board and topics.
- **Smart Question Selection:** The system intelligently selects from the pool of generated and found questions, attempting to match the user-defined mark distribution and total marks.
- **Live Editable Preview:** A real-time preview of the question paper is rendered, with mathematical formulas displayed using KaTeX. Users can make direct edits to the content in this preview.
- **Print-Ready PDF Export:** The final question paper can be downloaded as a PDF. For robust rendering, KaTeX mathematical expressions are converted to images during the PDF generation process, ensuring consistency across different PDF viewers and printers.
- **Customizable Formatting:** Users can specify a custom header (e.g., school/institution name) and instructions for the question paper.

## Key Features

- **Multi-Board & Multi-Class Support:** Preconfigurable for CBSE, ICSE, and major State Boards.
- **AI-Generated Probable Questions:** AI curates "highly expected" questions.
- **Real-time PYQ Search:** Finds relevant past year questions from the internet, specific to the board.
- **Syllabus Input:** Users can manually input syllabus text or specify topics.
- **Smart Paper Generation:**
    - Inputs: Class, board, subject, chapter/topic, marks distribution, time duration.
    - Output: Auto-generated paper with shuffled questions (from the pool) to aid variety.
- **Customization:** Option to edit questions in the preview.
- **Formatting & PDF Export:**
    - Print-ready PDF output.
    - Includes school/teacher header, instructions, and student info fields.
    - Consistent numbering, section-wise breaks.
    - LaTeX support for mathematical equations, converted to images in PDF for accuracy.
- **Professional UI:** Clean, intuitive interface built with ShadCN UI components and Tailwind CSS.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, ShadCN UI
- **State Management:** React Hooks (useState, useReducer), React Context (implicitly by ShadCN form)
- **AI Integration:** Firebase Genkit with Google Gemini models
    - `generateProbableQuestions` flow
    - `findPastYearQuestions` flow
- **Form Handling:** React Hook Form with Zod for validation
- **Mathematical Rendering:** KaTeX (for live preview)
- **PDF Generation:** `html2pdf.js` and `html2canvas` (to convert KaTeX elements to images before PDF creation)
- **Server-Side Logic:** Next.js Server Actions (for AI flow calls)

## Getting Started

### Prerequisites
- Node.js (v18.x or later recommended)
- npm or yarn
- A Google AI API Key (for GenAI features, specifically Google Gemini)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/srijitt/qforge.git
    cd qforge # Or your project directory name
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root of your project (or rename `.env.example` if provided). Add your Google AI API key:
    ```env
    GEMINI_API_KEY=your_google_ai_api_key_here
    ```
    You can obtain a key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Running the Application

1.  **Start the Next.js development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will typically be accessible at `http://localhost:9002` (as per `package.json` script).

2.  **(Optional) Start the Genkit development flow server:**
    For debugging AI flows or developing new ones, you can run the Genkit development UI. In a separate terminal:
    ```bash
    npm run genkit:dev
    # or for hot-reloading Genkit flows:
    # npm run genkit:watch
    ```
    The Genkit Developer UI will be accessible at `http://localhost:4000`.

## How It Works (User Flow)

1.  **Navigate to the "Generate Paper" page.**
2.  **Input Paper Details:**
    *   Select the educational board, class, and subject.
    *   Enter specific topics or paste relevant syllabus text.
3.  **Define Paper Structure:**
    *   Set the total marks for the paper.
    *   Specify the time duration in minutes.
    *   Distribute marks: indicate how many questions are needed for each mark value (e.g., five 1-mark questions, ten 2-mark questions).
4.  **Configure Generation Options:**
    *   Choose whether to include AI-generated probable questions.
    *   Choose whether to search for and include PYQs.
5.  **Set Formatting:**
    *   Provide a header text (e.g., school name, exam title).
    *   Enter general instructions for the students.
6.  **Initiate Generation:** Click the "Generate Paper" button.
    *   QForge communicates with the AI backend via Server Actions to fetch probable questions and PYQs. The UI shows loading messages indicating the current process (e.g., "Generating probable questions...", "Searching PYQs for topic X...").
7.  **Review and Edit Preview:**
    *   Once questions are fetched and processed, a live preview of the formatted question paper is displayed.
    *   Mathematical formulas are rendered using KaTeX.
    *   The content of this preview is editable, allowing for minor corrections or adjustments.
8.  **Download PDF:**
    *   Click the "Download Paper (PDF)" button.
    *   Before PDF generation, KaTeX elements in the preview are converted to images using `html2canvas` to ensure accurate rendering in the PDF.
    *   The paper is then converted to a PDF using `html2pdf.js` and downloaded by the user.

## Project Structure Highlights

-   `src/app/`: Next.js App Router pages.
    -   `src/app/generate/page.tsx`: Main page for paper generation.
    -   `src/app/layout.tsx`: Root layout.
    -   `src/app/globals.css`: Global styles and ShadCN theme variables.
-   `src/components/`: Reusable UI components.
    -   `src/components/ui/`: ShadCN UI components.
    -   `src/components/paper-generator-form.tsx`: The core form for inputting paper settings.
    -   `src/components/header.tsx`: Application header.
-   `src/ai/`: Genkit related files.
    -   `src/ai/ai-instance.ts`: Genkit AI instance configuration.
    -   `src/ai/flows/`: Genkit flows for AI operations (e.g., `generate-probable-questions.ts`, `find-past-year-questions.ts`).
-   `src/lib/`: Utility functions, constants, and type definitions.
    -   `src/lib/constants.ts`: Application-wide constants (boards, subjects, etc.).
    -   `src/lib/paper-utils.ts`: Logic for selecting questions, assigning marks, and formatting the paper HTML.
    -   `src/lib/types.ts`: TypeScript type definitions.

## Future Enhancements (Potential)

-   Support for DOCX export.
-   More advanced formatting and templating options for the question paper.
-   User accounts for saving paper configurations and generated papers.
-   Direct PDF syllabus upload and parsing.
-   A richer question bank/database feature.
-   Enhanced AI capabilities for question variation and difficulty assessment.
