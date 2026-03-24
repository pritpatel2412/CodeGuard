import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Terms() {
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
                        <h1 className="text-2xl font-semibold tracking-tight">Terms of Service</h1>
                        <p className="text-sm text-muted-foreground">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Agreement to Terms</CardTitle>
                        <CardDescription>
                            Please read these terms carefully before using CodeGuard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">1. Acceptance of Terms</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">2. Use License</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Permission is granted to temporarily download one copy of the materials (information or software) on CodeGuard's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
                                <li>modify or copy the materials;</li>
                                <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                                <li>attempt to decompile or reverse engineer any software contained on CodeGuard's website;</li>
                                <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">3. Disclaimer</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                The materials on CodeGuard's website are provided on an 'as is' basis. CodeGuard makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">4. Limitations</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                In no event shall CodeGuard or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on CodeGuard's website, even if CodeGuard or a CodeGuard authorized representative has been notified orally or in writing of the possibility of such damage.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-medium">5. Revisions and Errata</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                The materials appearing on CodeGuard's website could include technical, typographical, or photographic errors. CodeGuard does not warrant that any of the materials on its website are accurate, complete or current. CodeGuard may make changes to the materials contained on its website at any time without notice.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
