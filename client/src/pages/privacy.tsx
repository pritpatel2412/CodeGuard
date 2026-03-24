import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Privacy() {
    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Privacy Policy</h1>
                        <p className="text-sm text-muted-foreground">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Privacy Policy</CardTitle>
                        <CardDescription>
                            Your privacy is strictly protected.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Your privacy is important to us. It is CodeGuard's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">1. Information We Collect</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We may collect the following types of information:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
                                <li><strong>Personal Data:</strong> Name, email address, GitHub username.</li>
                                <li><strong>Usage Data:</strong> Information on how you use our service, including pages visited and duration.</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">2. How We Use Information</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We adhere to the following policies when using your data:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
                                <li>We only retain collected information for as long as necessary to provide you with your requested service.</li>
                                <li>What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</li>
                                <li>We don’t share any personally identifying information publicly or with third-parties, except when required to by law.</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">3. Third-Party Services</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Our website links to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">4. GitHub Integration</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                CodeGuard integrates with GitHub to provide code review services. We invoke GitHub APIs on your behalf. We do not store your code permanently; we analyze it for security vulnerabilities and providing reviews.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">5. Changes to This Policy</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately, after they are posted on this page.
                            </p>
                        </div>

                        <p className="pt-4 mt-2 border-t text-sm text-muted-foreground">
                            If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
