import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TermsAndConditions() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">Terms and Conditions</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: December 14, 2025
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
              <section>
                <h3 className="text-base font-medium text-foreground mb-2">1. Introduction</h3>
                <p>
                  Welcome to CodeGuard ("we," "our," or "us"). By accessing or using our
                  AI-powered code review service, you agree to be bound by these Terms and Conditions.
                  If you disagree with any part of these terms, you may not access the service.
                </p>
              </section>

              <section>
                <h3 className="text-base font-medium text-foreground mb-2">2. Use License</h3>
                <p>
                  Permission is granted to temporarily download one copy of the materials (information or software)
                  on CodeGuard's website for personal, non-commercial transitory viewing only. This is the grant
                  of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 pl-2">
                  <li>Modify or copy the materials;</li>
                  <li>Use the materials for any commercial purpose, or for any public display;</li>
                  <li>Attempt to decompile or reverse engineer any software contained on CodeGuard's website;</li>
                  <li>Remove any copyright or other proprietary notations from the materials; or</li>
                  <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-base font-medium text-foreground mb-2">3. Disclaimer</h3>
                <p>
                  The materials on CodeGuard's website are provided on an 'as is' basis. CodeGuard makes no
                  warranties, expressed or implied, and hereby disclaims and negates all other warranties
                  including, without limitation, implied warranties or conditions of merchantability, fitness
                  for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
                <p className="mt-2">
                  Further, CodeGuard does not warrant or make any representations concerning the accuracy, likely
                  results, or reliability of the use of the materials on its website or otherwise relating to
                  such materials or on any sites linked to this site.
                </p>
              </section>

              <section>
                <h3 className="text-base font-medium text-foreground mb-2">4. Limitations</h3>
                <p>
                  In no event shall CodeGuard or its suppliers be liable for any damages (including, without limitation,
                  damages for loss of data or profit, or due to business interruption) arising out of the use or
                  inability to use the materials on CodeGuard's website, even if CodeGuard or a CodeGuard authorized
                  representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </section>

              <section>
                <h3 className="text-base font-medium text-foreground mb-2">5. Accuracy of Materials</h3>
                <p>
                  The materials appearing on CodeGuard's website could include technical, typographical, or photographic
                  errors. CodeGuard does not warrant that any of the materials on its website are accurate, complete,
                  or current. CodeGuard may make changes to the materials contained on its website at any time
                  without notice. However, CodeGuard does not make any commitment to update the materials.
                </p>
              </section>

              <section>
                <h3 className="text-base font-medium text-foreground mb-2">6. Links</h3>
                <p>
                  CodeGuard has not reviewed all of the sites linked to its website and is not responsible for the
                  contents of any such linked site. The inclusion of any link does not imply endorsement by
                  CodeGuard of the site. Use of any such linked website is at the user's own risk.
                </p>
              </section>

              <section>
                <h3 className="text-base font-medium text-foreground mb-2">7. Modifications</h3>
                <p>
                  CodeGuard may revise these terms of service for its website at any time without notice. By using
                  this website you are agreeing to be bound by the then current version of these terms of service.
                </p>
              </section>

              <section>
                <h3 className="text-base font-medium text-foreground mb-2">8. Governing Law</h3>
                <p>
                  These terms and conditions are governed by and construed in accordance with the laws of the
                  State of California and you irrevocably submit to the exclusive jurisdiction of the courts
                  in that State or location.
                </p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
