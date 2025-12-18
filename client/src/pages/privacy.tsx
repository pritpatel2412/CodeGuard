import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function PrivacyPolicy() {
    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-semibold">Privacy Policy</h1>
                <p className="text-sm text-muted-foreground">
                    Last updated: December 14, 2025
                </p>
            </div>

            <Card>
                <CardContent className="p-6">
                    <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
                            <section>
                                <h3 className="text-base font-medium text-foreground mb-2">1. Information We Collect</h3>
                                <p>
                                    We collect information you provide directly to us, such as when you create or modify your account,
                                    request customer support, or otherwise communicate with us. This information may include your name,
                                    email address, GitHub username, and repository details.
                                </p>
                                <p className="mt-2">
                                    When you use our services, we automatically collect information about your interactions with the
                                    Service, including code diffs and pull request metadata necessary for providing our AI analysis.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-base font-medium text-foreground mb-2">2. How We Use Your Information</h3>
                                <p>
                                    We use the information we collect to provide, maintain, and improve our services, such as to:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                                    <li>Process and analyze your code to provide review comments and risk assessments;</li>
                                    <li>Send you technical notices, updates, security alerts, and support messages;</li>
                                    <li>Respond to your comments, questions, and requests;</li>
                                    <li>Monitor and analyze trends, usage, and activities in connection with our Service;</li>
                                    <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities.</li>
                                </ul>
                            </section>

                            <section>
                                <h3 className="text-base font-medium text-foreground mb-2">3. Data Retention</h3>
                                <p>
                                    We store code snippets and analysis results only for as long as necessary to provide our services
                                    to you. We do not train our AI models on your private code repositories. We prioritize the security
                                    and confidentiality of your intellectual property.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-base font-medium text-foreground mb-2">4. Sharing of Information</h3>
                                <p>
                                    We do not share your personal information with third parties except as described in this policy.
                                    We may share your information with our third-party service providers (such as OpenAI for processing
                                    code analysis) who need access to such information to carry out work on our behalf. These service
                                    providers are bound by confidentiality agreements and are prohibited from using your personal
                                    information for any other purpose.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-base font-medium text-foreground mb-2">5. Security</h3>
                                <p>
                                    We take reasonable measures to help protect information about you from loss, theft, misuse, and
                                    unauthorized access, disclosure, alteration, and destruction. We use industry-standard encryption
                                    to protect your data in transit and at rest.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-base font-medium text-foreground mb-2">6. Your Rights</h3>
                                <p>
                                    You have the right to access, update, or delete your personal information at any time. You can
                                    manage these settings directly within your account dashboard or by contacting our support team.
                                </p>
                            </section>

                            <section>
                                <h3 className="text-base font-medium text-foreground mb-2">7. Changes to this Policy</h3>
                                <p>
                                    We may change this privacy policy from time to time. If we make changes, we will notify you by
                                    revising the date at the top of the policy and, in some cases, we may provide you with additional
                                    notice (such as updating our homepage or sending you an email notification).
                                </p>
                            </section>

                            <section>
                                <h3 className="text-base font-medium text-foreground mb-2">8. Contact Us</h3>
                                <p>
                                    If you have any questions about this privacy policy, please contact us at support@codeguard.dev.
                                </p>
                            </section>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
