// src/app/generate/page.tsx
'use client';

import * as React from 'react';
import { PaperGeneratorForm } from '@/components/paper-generator-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Question, PaperSettingsFormValues } from '@/lib/types';
import 'katex/dist/katex.min.css';
import renderMathInElement from 'katex/dist/contrib/auto-render';
import html2canvas from 'html2canvas';


const KATEX_VERSION = "0.16.9"; 

export default function GeneratePaperPage() {
  const [paperHtml, setPaperHtml] = React.useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = React.useState<Question[]>([]);
  const [formValues, setFormValues] = React.useState<PaperSettingsFormValues | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [katexCssText, setKatexCssText] = React.useState<string | null>(null);

  React.useEffect(() => {
    const katexCSSHref = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.css`;
    const katexFontBase = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/`;

    fetch(katexCSSHref)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch KaTeX CSS: ${response.statusText}`);
        }
        return response.text();
      })
      .then(text => {
        const correctedText = text.replace(/url\(fonts\//g, `url(${katexFontBase}fonts/`);
        setKatexCssText(correctedText);
      })
      .catch(err => {
        console.error("Failed to pre-fetch or process KaTeX CSS:", err);
        toast({
          title: "KaTeX CSS Error",
          description: "Could not load KaTeX styles. Math may not render correctly in preview or PDF.",
          variant: "destructive",
        });
      });
  }, [toast]);


  const handlePaperGenerated = (html: string | null, questions: Question[], settings: PaperSettingsFormValues | null) => {
    setPaperHtml(html);
    setSelectedQuestions(questions);
    setFormValues(settings);
  };

  React.useEffect(() => {
    if (paperHtml && previewRef.current) {
      previewRef.current.innerHTML = paperHtml;
      requestAnimationFrame(() => {
        if (previewRef.current) {
          try {
            renderMathInElement(previewRef.current, {
              delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false },
              ],
              throwOnError: false,
              output: 'html',
            });
          } catch (error) {
            console.error("KaTeX auto-rendering error in preview:", error);
            toast({
              title: "Math Rendering Error",
              description: "Some mathematical expressions might not have rendered correctly in the preview.",
              variant: "destructive",
            });
          }
        }
      });
    } else if (previewRef.current && !paperHtml) {
      previewRef.current.innerHTML = '<span class="flex items-center justify-center h-full text-muted-foreground p-4">Preview will appear here after generation</span>';
    }
  }, [paperHtml, toast]);


  async function handleDownload() {
    if (!previewRef.current || !paperHtml || paperHtml.includes("Preview will appear here")) {
      toast({ title: "Error", description: "No paper preview available to download.", variant: "destructive" });
      return;
    }

    if (!formValues || selectedQuestions.length === 0) {
      toast({ title: "Error", description: "Missing data needed for PDF generation. Please generate the paper first.", variant: "destructive" });
      return;
    }
    if (!katexCssText) {
      toast({
        title: "KaTeX CSS Not Ready",
        description: "KaTeX styles are still loading or failed to load. PDF rendering might be incorrect. Please wait a moment or try refreshing. If the problem persists, check your internet connection.",
        variant: "default", // Changed from warning to default for neutrality
      });
       // Do not return here, let the process continue with a warning.
    }

    setIsDownloading(true);
    toast({ title: "PDF Generation Started", description: `Preparing your paper for download...` });
    
    let html2pdfLib: any;
    try {
        html2pdfLib = (await import('html2pdf.js')).default;
    } catch (e) {
        console.error("Failed to load html2pdf.js", e);
        toast({ title: "Download Error", description: "Could not load PDF generation library. Please try again.", variant: "destructive" });
        setIsDownloading(false);
        return;
    }
    
    const elementToPrint = previewRef.current.cloneNode(true) as HTMLDivElement;

    const katexElements = Array.from(elementToPrint.querySelectorAll('.katex, .katex-display'));
    if (katexElements.length > 0) {
      toast({ title: "Processing Math", description: `Converting ${katexElements.length} math expressions to images... This may take a moment.`, duration: 5000 });
    }

    const conversionPromises = katexElements.map(async (elem) => {
        try {
            const htmlElement = elem as HTMLElement;
            
            const canvas = await html2canvas(htmlElement, {
                scale: 3, 
                backgroundColor: null, 
                logging: false,
                useCORS: true, 
                width: htmlElement.offsetWidth, // Use offsetWidth for better accuracy
                height: htmlElement.offsetHeight, // Use offsetHeight
                windowWidth: document.documentElement.scrollWidth, // Use document scroll width
                windowHeight: document.documentElement.scrollHeight, // Use document scroll height
            });
            const img = document.createElement('img');
            img.src = canvas.toDataURL('image/png');
            
            img.style.maxWidth = '100%'; 
            if (htmlElement.classList.contains('katex-display')) {
                img.style.display = 'block';
                const originalStyle = window.getComputedStyle(htmlElement);
                img.style.marginTop = originalStyle.marginTop;
                img.style.marginBottom = originalStyle.marginBottom;
                if (originalStyle.textAlign === 'center' || htmlElement.style.textAlign === 'center') {
                    img.style.marginLeft = 'auto';
                    img.style.marginRight = 'auto';
                }
            } else { 
                img.style.display = 'inline-block';
                img.style.verticalAlign = 'middle'; 
                const parentLineHeight = window.getComputedStyle(htmlElement.parentElement || document.body).lineHeight;
                if (parentLineHeight && parentLineHeight !== 'normal') {
                    // Attempt to make image height proportional to line height, adjust factor as needed
                    img.style.height = `calc(${parentLineHeight} * 0.9)`; 
                } else {
                     img.style.height = '1.2em'; 
                }
                img.style.width = 'auto'; 
            }

            htmlElement.parentNode?.replaceChild(img, htmlElement);
        } catch (e) {
            console.warn('Failed to convert KaTeX element to image:', e, elem);
            toast({
                title: "KaTeX Image Conversion Issue",
                description: "A math formula might not appear correctly in the PDF.",
                variant: "warning",
            });
        }
    });
    
    await Promise.all(conversionPromises);
    if (katexElements.length > 0) {
        toast({ title: "Math Processing Complete", description: `Converted math expressions. Generating PDF...`, duration: 2000});
    }


    const fileName = `${formValues.subject}_Class${formValues.classLevel}_Board_${formValues.board}_Paper.pdf`.replace(/[^a-zA-Z0-9_.-]/g, '_');

    const opt = {
      margin: [15, 15, 15, 15], 
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2, // Increased scale for overall page rendering
        useCORS: true,
        logging: false,
        letterRendering: true,
        onclone: (document: Document) => {
          Array.from(document.querySelectorAll('.katex-mathml')).forEach(el => el.remove()); 

          if (katexCssText) {
            const styleElement = document.createElement('style');
            styleElement.textContent = katexCssText; 
            document.head.appendChild(styleElement);

            const customStyles = document.createElement('style');
            customStyles.textContent = `
                  body { font-family: 'Times New Roman', Times, serif; } 
                  .paper-light-theme { font-size: 12pt; line-height: 1.6; } /* Adjust line-height for PDF */
                  /* Ensure specific styles for fractions if they are NOT converted to images or if conversion fails */
                  .katex .mfrac > span > span { vertical-align: middle !important; } /* Attempt to align fraction parts if rendered as text */
                  .katex .vlist-t { display: inline-block; vertical-align: middle; } /* Adjust vertical alignment for KaTeX text nodes */

                `; // Added line-height and potential fraction fixes
            document.head.appendChild(customStyles);
          }
        }
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      const contentForPdf = elementToPrint.querySelector('.paper-light-theme') || elementToPrint;
      if (!contentForPdf || contentForPdf.innerHTML.trim() === "") {
           throw new Error("Content for PDF is empty after processing.");
      }
      
      await html2pdfLib().from(contentForPdf).set(opt).save();
      toast({ title: "Download Complete", description: `${fileName} has been downloaded.` });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ title: "PDF Generation Error", description: `Failed to create PDF. ${error instanceof Error ? error.message : String(error)}`, variant: "destructive" });
    } finally {
      setIsDownloading(false);
    }
  }


  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-center text-foreground">Question Paper Generator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"> {/* Added items-start for alignment */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-8"> {/* Made card sticky */}
            <CardHeader>
              <CardTitle>Paper Settings</CardTitle>
              <CardDescription>Configure the details for your question paper.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Ensure ScrollArea has a defined height or is within a container with defined height */}
              <ScrollArea className="h-[calc(100vh-20rem)] pr-4"> {/* Adjusted height */}
                <PaperGeneratorForm onPaperGenerated={handlePaperGenerated} />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle>Paper Preview &amp; Export</CardTitle>
                  <CardDescription>Review the generated paper. Minor edits can be made here. Click Download when ready.</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownload}
                  disabled={isDownloading || !paperHtml || selectedQuestions.length === 0 || (paperHtml && paperHtml.includes("Preview will appear here"))}
                  className="w-full sm:w-auto"
                >
                  {isDownloading ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Download className="mr-2 h-4 w-4" />)}
                  Download Paper (PDF)
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Alert variant="warning" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Editable Preview</AlertTitle>
                <AlertDescription>
                  The preview below is editable. Edits here will be reflected in the downloaded PDF. Math formulas are rendered using KaTeX.
                  Conversion to images for PDF might cause minor visual differences from this live preview.
                </AlertDescription>
              </Alert>
              <div
                ref={previewRef}
                id="paper-preview-area"
                className="mt-4 border rounded-md p-0 min-h-[600px] bg-background overflow-auto focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 max-w-none" // Increased min-height
                contentEditable="true"
                suppressContentEditableWarning={true}
                aria-label="Editable Paper Preview Area"
                role="textbox"
              >
                <span className="flex items-center justify-center h-full text-muted-foreground p-4">Preview will appear here after generation</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
