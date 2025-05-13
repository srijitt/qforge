import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText, PlusCircle, Settings } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Welcome to QForge
        </h1>
        <p className="mt-3 text-lg text-muted-foreground sm:mt-5 sm:text-xl">
          Your intelligent assistant for creating professional question papers effortlessly.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">
              Settings
            </CardTitle>
            <Settings className="h-6 w-6 text-accent" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4 text-sm">
              Configure your preferences and API keys for QForge.
            </CardDescription>
            <Link href="/settings" passHref>
              <Button variant="outline" size="lg" className="w-full text-base">
                 Configure Settings
              </Button>
            </Link>
          </CardContent>
        </Card>


        <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">
              Generate New Paper
            </CardTitle>
            <FileText className="h-6 w-6 text-accent" />
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4 text-sm">
              Start creating a new question paper from scratch or using AI-powered suggestions.
            </CardDescription>
            <Link href="/generate" passHref>
              <Button size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base">
                <PlusCircle className="mr-2 h-5 w-5" /> Create Paper
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">
              Recent Papers
            </CardTitle>
            <FileText className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm">
              Access your recently generated question papers. (Feature coming soon)
            </CardDescription>
             <div className="text-center text-muted-foreground mt-6 py-4 border-t">
                No recent papers yet.
             </div>
          </CardContent>
        </Card>
        
      </div>

      <Card className="bg-card shadow-lg rounded-lg">
        <CardHeader>
            <CardTitle className="text-xl font-semibold">How it Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-muted-foreground">
            <p>1. Go to the <Link href="/generate" className="text-accent hover:underline font-medium">Generate Paper</Link> page.</p>
            <p>2. Fill in the details like board, class, subject, topics, and paper structure.</p>
            <p>3. Let our AI generate probable questions and find relevant Past Year Questions (PYQs).</p>
            <p>4. Preview the generated paper, make edits if needed, and download as a PDF.</p>
        </CardContent>
      </Card>

    </div>
  );
}

