import type { Question, PaperSettingsFormValues, FormattedSection } from '@/lib/types';
import { BOARDS } from '@/lib/constants';

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items An array containing the items.
 */
function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Selects questions based on mark distribution and total marks.
 * Prioritizes matching the mark distribution count first, then tries to fill remaining marks.
 */
export function selectAndAssignMarks(
    allQuestions: Question[],
    settings: PaperSettingsFormValues
): Question[] {
    const selectedQuestions: Question[] = [];
    const availableQuestions = shuffle([...allQuestions]); 
    let currentTotalMarks = 0;
    const { markDistribution, totalMarks } = settings;

    const questionPool = new Map(availableQuestions.map(q => [q.id, q]));

    if (markDistribution) {
        const markValues = Object.keys(markDistribution).map(Number).sort((a, b) => a - b); 

        for (const mark of markValues) {
            const countNeeded = markDistribution[String(mark)] || 0;
            let countFound = 0;

            const potentialQuestions = Array.from(questionPool.values());

            for (const question of potentialQuestions) {
                if (countFound >= countNeeded) break;
                 if (currentTotalMarks + mark > totalMarks) continue;

                selectedQuestions.push({ ...question, marks: mark });
                questionPool.delete(question.id);
                currentTotalMarks += mark;
                countFound++;
            }
        }
    }
    
    if (currentTotalMarks < totalMarks && questionPool.size > 0) {
        const remainingPool = Array.from(questionPool.values()).sort((a,b) => b.text.length - a.text.length); 

        for (const question of remainingPool) {
            const markToAssign = Math.min(5, totalMarks - currentTotalMarks); 
            if (markToAssign <= 0) break;

            if (currentTotalMarks + markToAssign <= totalMarks) {
                selectedQuestions.push({ ...question, marks: markToAssign });
                currentTotalMarks += markToAssign;
            }
            if (currentTotalMarks >= totalMarks) break;
        }
    }

    while (currentTotalMarks > totalMarks && selectedQuestions.length > 0) {
        const lastQuestion = selectedQuestions[selectedQuestions.length - 1];
        // Prefer removing lower mark questions if possible, or just the last one
        const questionToRemove = selectedQuestions.reduce((prev, curr) => (curr.marks < prev.marks ? curr : prev), lastQuestion);
        
        const indexToRemove = selectedQuestions.findIndex(q => q.id === questionToRemove.id);
        if (indexToRemove > -1) {
            const removedQuestion = selectedQuestions.splice(indexToRemove, 1)[0];
            currentTotalMarks -= removedQuestion.marks;
        } else { // Fallback if somehow the question isn't found (should not happen)
             const removedQuestion = selectedQuestions.pop();
             if(removedQuestion) currentTotalMarks -= removedQuestion.marks;
        }

    }
    // If currentTotalMarks is slightly less than totalMarks, try to adjust one question's marks up if possible.
    // This is complex and might be better handled by allowing slight deviation or specific AI instruction.
    // For now, we accept if it's close.

    return selectedQuestions;
}

/**
 * Groups questions by marks and prepares sections.
 */
function prepareSections(selectedQuestions: Question[]): FormattedSection[] {
     const questionsByMarks: { [mark: number]: Question[] } = {};
    selectedQuestions.forEach(q => {
        if (!questionsByMarks[q.marks]) {
            questionsByMarks[q.marks] = [];
        }
        questionsByMarks[q.marks].push(q);
    });

    const sortedMarkValues = Object.keys(questionsByMarks).map(Number).sort((a, b) => a - b);

    return sortedMarkValues.map((mark, index) => ({
        title: `Section ${String.fromCharCode(65 + index)} (${mark} Mark Questions)`,
        questions: questionsByMarks[mark],
    }));
}


/**
 * Formats the selected questions into HTML for preview.
 */
export function formatPaper(
    selectedQuestions: Question[],
    settings: PaperSettingsFormValues
): string {
    const { header, instructions, timeDuration, totalMarks, subject, classLevel, board } = settings;
    const sections = prepareSections(selectedQuestions);
    const boardLabel = BOARDS.find(b => b.value === board)?.label || board;

    const formatTextToHtml = (text: string): string => {
        // Basic escaping for HTML, but keep LaTeX delimiters intact.
        // This is simplified. For production, a proper sanitizer that understands LaTeX might be needed.
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\n/g, '<br />'); // Convert newlines to <br /> for instructions etc.
    };
    
    let html = `<div class="paper-light-theme prose max-w-none p-6 rounded-md border font-serif">`;

    // Header
    html += `<header class="text-center mb-6 border-b pb-4">`;
    if (header) {
        html += `<h1 class="text-2xl font-bold mb-1">${formatTextToHtml(header)}</h1>`;
    }
    html += `<p class="text-md font-semibold">Board: ${formatTextToHtml(boardLabel)}</p>`;
    html += `<p class="text-sm text-muted-foreground">Class: ${formatTextToHtml(classLevel)} | Subject: ${formatTextToHtml(subject)}</p>`;
    html += `<div class="flex justify-between text-sm font-semibold mt-2">`;
    html += `<span>Time Allowed: ${timeDuration} minutes</span>`;
    html += `<span>Maximum Marks: ${totalMarks}</span>`;
    html += `</div>`;
    html += `</header>`;

    // Instructions
    if (instructions) {
        html += `<div class="mb-6 p-4 border rounded paper-instructions-bg text-sm">`;
        html += `<h2 class="font-semibold mb-2 text-base">Instructions:</h2>`;
        // Use div with white-space: pre-line for instructions to respect newlines from textarea
        html += `<div style="white-space: pre-line;">${formatTextToHtml(instructions)}</div>`;
        html += `</div>`;
    }

    // Sections and Questions
    html += `<main>`;
    let questionCounter = 1;
    sections.forEach(section => {
        html += `<section class="mb-8">`;
        html += `<h2 class="text-lg font-semibold mb-4 border-b pb-1">${formatTextToHtml(section.title)}</h2>`;
        html += `<ol start="${questionCounter}" class="list-none p-0 m-0 space-y-6">`;
        section.questions.forEach(question => {
            html += `<li class="mb-4 break-words flex items-start">`;
            html += `<span class="font-semibold mr-3 w-auto min-w-[20px] text-left">${questionCounter}.</span>`;
            html += `<div class="flex-1 flex justify-between items-start">`;
            // Question text contains LaTeX, so it should not be HTML escaped by formatTextToHtml here.
            // KaTeX will handle its rendering in the preview.
            // For PDF generation, it will be converted to an image.
            html += `<span class="flex-1 mr-4">${question.text}</span>`; 
            html += `<span class="font-semibold text-muted-foreground whitespace-nowrap">[${question.marks}]</span>`;
            html += `</div>`;
            html += `</li>`;
            // Add space for answer line, make it less obtrusive visually.
            html += `<div class="mt-2 mb-6 border-b border-dashed border-gray-300 h-8" aria-label="Space for answer"></div>`;
            questionCounter++;
        });
        html += `</ol>`;
        html += `</section>`;
    });
    html += `</main>`;

    html += `</div>`;

    return html;
}
