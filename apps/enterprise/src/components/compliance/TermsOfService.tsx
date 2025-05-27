import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function TermsOfService() {
  const currentDate = new Date().toLocaleDateString();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Terms of Service</CardTitle>
        <Button variant="outline" onClick={() => window.print()}>
          Download PDF
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[800px] pr-4">
          <div className="space-y-6 text-sm">
            <div className="text-right text-muted-foreground">
              <p>Effective Date: {currentDate}</p>
              <p>Last Updated: {currentDate}</p>
            </div>

            <p>
              These Terms of Service ("Terms") govern your access to and use of Novora's software-as-a-service platform ("Service"). By signing up, accessing, or using our Service, you ("Customer") agree to these Terms.
            </p>
            <p>
              If you are entering into this agreement on behalf of a company or organization, you represent that you have the authority to bind them to these Terms.
            </p>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">1. Who We Are</h2>
              <p>
                Novora is a business software provider helping organizations understand employee sentiment through anonymous monthly surveys sent via SMS and email.
              </p>
              <div className="pl-4">
                <p>Company Details:</p>
                <p>Novora</p>
                <p>[Insert company legal name, address, and company number]</p>
                <p>[Insert contact email]</p>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">2. Service Description</h2>
              <p>
                Novora provides a platform for conducting employee sentiment surveys through SMS and email. The Service includes:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Survey creation and distribution tools</li>
                <li>Data collection and analysis</li>
                <li>Reporting and analytics dashboard</li>
                <li>Integration capabilities with other business systems</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">3. Account Registration and Security</h2>
              <p>
                To use the Service, you must register for an account and provide accurate, complete information. You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">4. Data Protection and Privacy</h2>
              <p>
                We process personal data in accordance with our Privacy Policy and applicable data protection laws. As a data processor, we:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Process data only as instructed by you</li>
                <li>Implement appropriate security measures</li>
                <li>Assist with data subject rights requests</li>
                <li>Maintain records of processing activities</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">5. Service Level Agreement</h2>
              <p>
                We commit to maintaining the following service levels:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>99.9% uptime for the platform</li>
                <li>24/7 system monitoring</li>
                <li>Regular security updates and maintenance</li>
                <li>Technical support during business hours</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">6. Payment Terms</h2>
              <p>
                Service fees are billed in advance on a monthly or annual basis. Payment terms include:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Automatic billing through Stripe</li>
                <li>30-day payment terms for annual plans</li>
                <li>No refunds for partial months</li>
                <li>Price changes with 30 days notice</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">7. Intellectual Property</h2>
              <p>
                All rights, title, and interest in the Service, including intellectual property rights, remain with Novora. You retain rights to your data and content.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">8. Limitation of Liability</h2>
              <p>
                Our liability is limited to the amount paid by you for the Service in the 12 months preceding the claim. We are not liable for:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Indirect or consequential damages</li>
                <li>Loss of data or business interruption</li>
                <li>Third-party actions or content</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">9. Termination</h2>
              <p>
                Either party may terminate the agreement with 30 days written notice. We may suspend or terminate access immediately for:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Violation of these Terms</li>
                <li>Non-payment</li>
                <li>Illegal or harmful activities</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">10. Changes to Terms</h2>
              <p>
                We may modify these Terms at any time. We will notify you of significant changes via email or through the Service. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">11. Governing Law</h2>
              <p>
                These Terms are governed by the laws of [Insert jurisdiction]. Any disputes shall be resolved in the courts of [Insert jurisdiction].
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">12. Contact Information</h2>
              <div className="pl-4">
                <p>For questions about these Terms, contact:</p>
                <p>Email: [legal@novora.com or insert]</p>
                <p>Address: [Insert office address]</p>
              </div>
            </section>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 