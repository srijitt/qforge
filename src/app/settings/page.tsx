import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-foreground">Settings</h1>

      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl">Profile</CardTitle>
          <CardDescription>Manage your account details (currently read-only).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name / Organization</Label>
            <Input id="name" placeholder="Your Name / Tuition Center Name" disabled className="bg-muted/50"/>
          </div>
           <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="your.email@example.com" disabled className="bg-muted/50"/>
          </div>
          <Button disabled className="w-full sm:w-auto">Save Changes (Coming Soon)</Button>
        </CardContent>
      </Card>

       <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl">Preferences</CardTitle>
          <CardDescription>Customize your QForge experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Alert variant="default">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>More Options Coming Soon!</AlertTitle>
                <AlertDescription>
                    We are working on adding more customization options to enhance your experience.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card>

       {/* <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl">API Keys</CardTitle>
          <CardDescription>Manage API keys for AI features.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="google-ai-key">Google AI API Key</Label>
                <Input 
                    id="google-ai-key" 
                    type="password" 
                    placeholder="Configured via environment variable" 
                    value={process.env.GOOGLE_GENAI_API_KEY ? '••••••••' : 'Not Set'} 
                    disabled 
                    className="bg-muted/50"
                />
                 <p className="text-xs text-muted-foreground">
                    This key is configured via the GOOGLE_GENAI_API_KEY environment variable for security.
                    Changes here are not persisted.
                </p>
            </div>
            <Alert variant="warning">
                 <AlertCircle className="h-4 w-4" />
                <AlertTitle>Environment Variable Configuration</AlertTitle>
                <AlertDescription>
                   For security and proper deployment, API keys should be set as environment variables on your server or hosting platform, not hardcoded or managed through the UI.
                </AlertDescription>
            </Alert>
        </CardContent>
      </Card> */}
    </div>
  );
}

