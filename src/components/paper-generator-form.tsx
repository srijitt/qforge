// src/components/paper-generator-form.tsx
'use client';

import type * as React from 'react';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { generateProbableQuestions } from '@/ai/flows/generate-probable-questions';
import { findPastYearQuestions } from '@/ai/flows/find-past-year-questions';
import { BOARDS, CLASS_LEVELS, SUBJECTS, MARK_OPTIONS } from '@/lib/constants';
import type { Question, PaperSettingsFormValues } from '@/lib/types';
import { Loader2, PlusCircle, Trash2, Wand2, Search } from 'lucide-react';
import { BoardIcon } from '@/components/icons/board-icon';
import { SubjectIcon } from '@/components/icons/subject-icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { selectAndAssignMarks, formatPaper } from '@/lib/paper-utils';
import { Label } from '@/components/ui/label';


// Updated schema to align with PaperSettingsFormValues type
const paperSettingsSchema = z.object({
  board: z.string().min(1, 'Board is required'),
  classLevel: z.string().min(1, 'Class is required'),
  subject: z.string().min(1, 'Subject is required'),
  topics: z.array(z.string().min(1, 'Topic cannot be empty')).min(1, 'At least one topic is required'),
  syllabusInputType: z.enum(['text', 'pdf']).default('text'),
  syllabusText: z.string().optional(),
  syllabusFile: z.any().optional(),
  totalMarks: z.coerce.number().int().positive('Total marks must be positive'),
  timeDuration: z.coerce.number().int().positive('Time duration must be positive'),
  markDistribution: z.record(z.coerce.number().int().min(0)).optional().default({}),
  includePYQs: z.boolean().default(false),
  generateProbables: z.boolean().default(true),
  instructions: z.string().optional(),
  header: z.string().optional(),
}).refine(data => {
    if (data.markDistribution && Object.keys(data.markDistribution).length > 0 && data.totalMarks > 0) {
        const sumOfDistributionMarks = Object.entries(data.markDistribution).reduce((sum, [mark, count]) => {
            const numericMark = Number(mark);
            const numericCount = Number(count);
            if (isNaN(numericMark) || isNaN(numericCount)) return sum;
            return sum + (numericMark * numericCount);
        }, 0);
        return Math.abs(sumOfDistributionMarks - data.totalMarks) < 0.01;
    }
    return true;
}, {
    message: "Sum of marks in distribution must equal Total Marks. Ensure Total Marks is also set.",
    path: ["markDistribution"],
});

interface PaperGeneratorFormProps {
  onPaperGenerated: (html: string | null, questions: Question[], settings: PaperSettingsFormValues | null) => void;
}


export function PaperGeneratorForm({ onPaperGenerated }: PaperGeneratorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [rawQuestions, setRawQuestions] = useState<Question[]>([]);
  // Removed isGeneratingProbables and isFindingPYQs, as isLoading and loadingMessage will cover these.

  const form = useForm<PaperSettingsFormValues>({
    resolver: zodResolver(paperSettingsSchema),
    defaultValues: {
      topics: [''],
      includePYQs: false,
      generateProbables: true,
      syllabusInputType: 'text',
      markDistribution: MARK_OPTIONS.reduce((acc, mark) => ({ ...acc, [String(mark)]: 0 }), {}),
      instructions: "1. All questions are compulsory.\n2. Marks are indicated against each question.",
      header: "Sample Question Paper",
      totalMarks: 0,
      timeDuration: 0,
    },
  });

   const { fields: topicFields, append: appendTopic, remove: removeTopic } = useFieldArray({
    control: form.control,
    name: "topics",
  });

  const syllabusInputType = form.watch('syllabusInputType');

  async function onSubmit(data: PaperSettingsFormValues) {
    setIsLoading(true);
    setLoadingMessage('Starting paper generation...');
    setRawQuestions([]);
    onPaperGenerated(null, [], null);
    let currentFetchedQuestions: Question[] = [];


    console.log('Form Data:', data);

    try {
      const generationPromises: Promise<void>[] = [];

      if (data.generateProbables) {
        setLoadingMessage('Generating probable questions using AI...');
        let syllabusContent = '';
        if (data.syllabusInputType === 'text') {
          syllabusContent = data.syllabusText || data.topics.join('\n');
        } else if (data.syllabusFile?.[0]) {
           try {
               const file = data.syllabusFile[0];
               if (file.type === 'application/pdf') {
                   console.warn("PDF processing is complex. Using topics as fallback for probable questions.");
                   syllabusContent = `PDF Syllabus Uploaded: ${file.name}. Topics for generation: ${data.topics.join(', ')}`;
                   toast({ title: "Info", description: "PDF Upload noted for context. Probable questions based on topics." });
               } else {
                    syllabusContent = await file.text();
               }
           } catch (fileError) {
                console.error("Error reading syllabus file:", fileError);
                toast({ title: "File Error", description: "Could not read the syllabus file. Using topics for generation.", variant: "destructive" });
                syllabusContent = data.topics.join(', ');
           }
        } else {
             syllabusContent = data.topics.join(', ');
        }

        const probableInput = {
          syllabus: syllabusContent,
          board: data.board,
          classLevel: data.classLevel,
          subject: data.subject,
        };

        generationPromises.push(
            generateProbableQuestions(probableInput).then(result => {
                const probableQuestionsResult = result.questions.map((q, index) => ({
                    id: `probable-${index}-${Date.now()}`,
                    text: q,
                    marks: 0,
                    topic: 'AI Generated',
                    source: 'AI Generated',
                }));
                currentFetchedQuestions.push(...probableQuestionsResult);
                setRawQuestions(prev => [...prev, ...probableQuestionsResult]);
            }).catch(err => {
                console.error("Error generating probable questions:", err);
                toast({ title: "AI Error", description: `Failed to generate probable questions. ${err.message}`, variant: "destructive" });
            })
        );
      }

      if (data.includePYQs) {
        const totalTopicsToSearch = data.topics.filter(t => t).length;
        let pyqTopicIndex = 0;

        const pyqSearchPromises = data.topics.map(async (topic) => {
            if (!topic) return;
            pyqTopicIndex++;
            // This message update might be rapid if topics are many. Consider updating less frequently or a general PYQ search message.
            setLoadingMessage(`Searching PYQs for topic ${pyqTopicIndex}/${totalTopicsToSearch} (${data.board.toUpperCase()}): "${topic.substring(0, 20)}${topic.length > 20 ? '...' : ''}"`);

            const pyqInput = { topic, board: data.board };
            try {
                const result = await findPastYearQuestions(pyqInput);
                const topicPyqs = result.questions.map((q, index) => ({
                    id: `pyq-${topic.replace(/\s+/g, '-')}-${index}-${Date.now()}`,
                    text: q,
                    marks: 0,
                    topic: topic,
                    source: `PYQ`,
                }));
                currentFetchedQuestions.push(...topicPyqs);
                setRawQuestions(prev => [...prev, ...topicPyqs]); // Update state incrementally
            } catch (err: any) {
                console.error(`Error finding PYQs for topic ${topic} (Board: ${data.board}):`, err);
                toast({ title: "PYQ Search Error", description: `Failed to find PYQs for ${topic} (${data.board}). ${err.message}`, variant: "destructive" });
            }
        });
        generationPromises.push(...pyqSearchPromises.map(p => p.then(() => {}))); // Add to main promises
      }

      if (generationPromises.length > 0) {
          setLoadingMessage('Gathering questions from AI and web sources...');
          await Promise.allSettled(generationPromises);
      }
      setLoadingMessage('All question sources processed. Preparing paper...');


      setLoadingMessage('Selecting questions and assigning marks...');
      const finalQuestions = selectAndAssignMarks(currentFetchedQuestions, data);

      if (finalQuestions.length === 0) {
        toast({
            title: 'No Questions Selected',
            description: 'Could not select any questions based on the criteria. Please check your settings or try broader topics.',
            variant: 'destructive',
        });
        onPaperGenerated(
            `<div class="text-center p-4 text-destructive-foreground bg-destructive rounded-md">
                <strong>No questions could be selected.</strong>
                <p>This might be due to very specific mark distribution, insufficient questions generated, or a mismatch between total marks and available question marks.</p>
                <p>Tips: Try adjusting total marks, mark distribution, or broaden your topics.</p>
            </div>`,
            [],
            data
        );
         setIsLoading(false);
        setLoadingMessage('');
        return;
      }

      setLoadingMessage('Formatting paper preview...');
      const htmlPreview = formatPaper(finalQuestions, data);
      onPaperGenerated(htmlPreview, finalQuestions, data);

      toast({
        title: 'Paper Generated',
        description: 'Preview is ready. You can edit it directly before downloading.',
      });

    } catch (error: any) {
      console.error('Error generating paper:', error);
       const errorMessage = error.message || 'An unknown error occurred.';
      toast({
        title: 'Generation Error',
        description: `Failed to generate paper: ${errorMessage}. Check console for details.`,
        variant: 'destructive',
      });
        onPaperGenerated(`<div class="text-destructive p-4 border border-destructive rounded-md"><strong>Error:</strong> ${errorMessage}</div>`, [], data);
    } finally {
      setIsLoading(false);
      // isGeneratingProbables and isFindingPYQs states are removed, isLoading covers it.
      setLoadingMessage('');
    }
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="board"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Board</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select board" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BOARDS.map((board) => (
                      <SelectItem key={board.value} value={board.value}>
                        <div className="flex items-center gap-2">
                          <BoardIcon boardValue={board.value} className="w-4 h-4" />
                          {board.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="classLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CLASS_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SUBJECTS.map((subject) => (
                    <SelectItem key={subject.value} value={subject.value}>
                      <div className="flex items-center gap-2">
                        <SubjectIcon subjectValue={subject.value} className="w-4 h-4" />
                        {subject.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Syllabus Input */}
        <FormField
          control={form.control}
          name="syllabusInputType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Syllabus/Topic Input</FormLabel>
              <FormControl>
                 <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                       <RadioGroupItem value="text" id="radio-text"/>
                    </FormControl>
                    <Label htmlFor="radio-text" className="font-normal cursor-pointer">Enter Topics / Syllabus Text</Label>
                  </FormItem>
                   <FormItem className="flex items-center space-x-2 space-y-0">
                     <FormControl>
                        <RadioGroupItem value="pdf" id="radio-pdf"/>
                     </FormControl>
                     <Label htmlFor="syllabus-file-upload-label" className="font-normal cursor-pointer">
                        Upload File (.pdf, .txt)
                     </Label>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        {syllabusInputType === 'pdf' && (
            <FormField
            control={form.control}
            name="syllabusFile"
            render={({ field: { onChange, onBlur, name, ref } }) => (
                <FormItem className="mt-2">
                    <FormLabel htmlFor="syllabus-file-upload" className="sr-only">Syllabus File Upload</FormLabel>
                    <FormControl>
                        <Input
                        type="file"
                        id="syllabus-file-upload"
                        accept=".pdf,.txt"
                        onChange={(e) => onChange(e.target.files)}
                        onBlur={onBlur}
                        name={name}
                        ref={ref}
                        className="block w-full text-sm 
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary/10 file:text-primary
                            hover:file:bg-primary/20"
                        />
                    </FormControl>
                    <FormDescription>
                        Selected file: {form.watch('syllabusFile')?.[0]?.name || "None"}
                        {form.watch('syllabusFile')?.[0]?.type === 'application/pdf' && " (PDF content extraction is complex)"}
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
            />
        )}


         {syllabusInputType === 'text' && (
          <div className="space-y-2">
            <FormLabel>Topics</FormLabel>
            <FormDescription>
              Enter the specific topics the paper should cover (at least one).
            </FormDescription>
            {topicFields.map((field, index) => (
               <FormField
                key={field.id}
                control={form.control}
                name={`topics.${index}`}
                render={({ field }) => (
                  <FormItem>
                     <div className="flex items-center gap-2">
                       <FormControl>
                          <Input placeholder={`Topic ${index + 1}`} {...field} />
                       </FormControl>
                        {topicFields.length > 1 && (
                            <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTopic(index)}
                             className="text-destructive hover:text-destructive/80"
                            >
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
             <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendTopic("")}
            >
               <PlusCircle className="mr-2 h-4 w-4" /> Add Topic
            </Button>

             <FormField
                control={form.control}
                name="syllabusText"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Or Paste Full Syllabus Text (Optional)</FormLabel>
                     <FormDescription>If provided, AI will use this for broader context along with topics.</FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="Paste relevant sections of the syllabus here..."
                        className="resize-y min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </div>
         )}


        {/* Paper Structure */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalMarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Marks</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 50" {...field} onChange={e => field.onChange(e.target.valueAsNumber || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timeDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Duration (Minutes)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 90" {...field} onChange={e => field.onChange(e.target.valueAsNumber || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Mark Distribution */}
         <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Mark Distribution</CardTitle>
             <FormDescription>Specify the exact number of questions for each mark value. The sum must equal Total Marks.</FormDescription>
          </CardHeader>
          <CardContent>
             <ScrollArea className="h-40">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pr-4">
              {MARK_OPTIONS.map((mark) => (
                <FormField
                  key={mark}
                  control={form.control}
                  name={`markDistribution.${mark}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{mark} Mark</FormLabel>
                      <FormControl>
                        <Input
                            type="number"
                            min="0"
                            placeholder="Count"
                            {...field}
                            value={field.value || 0}
                            onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                         />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            </ScrollArea>
            {form.formState.errors.markDistribution && (
                <p className="text-sm font-medium text-destructive mt-2">
                    {form.formState.errors.markDistribution.message}
                </p>
            )}
          </CardContent>
        </Card>


        {/* Question Sources */}
         <div className="space-y-4">
          <FormField
            control={form.control}
            name="generateProbables"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-card">
                 <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="generate-probables"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                   <Label htmlFor="generate-probables" className="flex items-center gap-1 cursor-pointer"><Wand2 className="w-4 h-4 text-accent"/> Generate Probable Questions (AI)</Label>
                  <FormDescription>
                    Suggest relevant questions based on syllabus/topics using AI.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="includePYQs"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-card">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="include-pyqs"
                  />
                </FormControl>
                 <div className="space-y-1 leading-none">
                  <Label htmlFor="include-pyqs" className="flex items-center gap-1 cursor-pointer"><Search className="w-4 h-4 text-accent"/> Include Past Year Questions (PYQs)</Label>
                  <FormDescription>
                    Search online for relevant PYQs for the specified topics.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>


        {/* Formatting Options */}
        <FormField
          control={form.control}
          name="header"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Header</FormLabel>
              <FormControl>
                <Input placeholder="e.g., My Tuition Center / School Name" {...field} />
              </FormControl>
              <FormDescription>Appears at the top of the paper.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., All questions are compulsory. Marks are indicated..."
                  className="resize-y min-h-[80px]"
                  {...field}
                />
              </FormControl>
               <FormDescription>Enter instructions, one per line.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? (
             <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loadingMessage || 'Processing...'}
             </>
          ) : (
             <>
                 <Wand2 className="mr-2 h-4 w-4" />
                 Generate Paper
             </>
          )}
        </Button>

      </form>
    </Form>
  );
}
