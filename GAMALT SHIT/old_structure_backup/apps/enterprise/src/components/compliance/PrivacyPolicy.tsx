import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function PrivacyPolicy() {
  const currentDate = new Date().toLocaleDateString();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Privacy Policy</CardTitle>
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
              Novora ("we", "our", "us") is committed to protecting the privacy of the individuals whose data we process on behalf of our business customers. This Privacy Policy explains how we collect, use, and protect personal data when providing our B2B services.
            </p>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">1. Who We Are</h2>
              <p>
                Novora is a business-to-business software-as-a-service (SaaS) provider. We help companies measure how their employees feel at work through monthly anonymous surveys sent via SMS or email.
              </p>
              <div className="pl-4">
                <p>Controller Information:</p>
                <p>Novora</p>
                <p>[Insert company legal name, address, and registration number]</p>
                <p>[Insert email address for privacy contact]</p>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">2. Whose Data We Process</h2>
              <p>
                We primarily process data on behalf of our customers (employers) and their employees (data subjects). In doing so, we act as a data processor, and our customers are the data controllers.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">3. What Data We Collect</h2>
              <p>We may process the following categories of personal data, depending on customer configuration:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Contact Data (e.g., phone number, email address – for sending survey links)</li>
                <li>Employment Data (e.g., department, team, location – if provided by the employer)</li>
                <li>Survey Responses (anonymous, sentiment-based answers)</li>
                <li>Technical Data (e.g., IP address, device/browser type – limited and anonymized for security)</li>
              </ul>
              <p className="text-muted-foreground">
                Note: While surveys are designed to be anonymous, some indirect identifiers may be provided depending on how the customer configures their survey distribution.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">4. Legal Basis for Processing</h2>
              <p>We process personal data based on:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Contractual necessity – to provide our services to our customers.</li>
                <li>Legitimate interest – to ensure service functionality and improve user experience.</li>
                <li>Legal obligations – compliance with EU data protection laws.</li>
              </ul>
              <p>Our customers must ensure they have the appropriate lawful basis for collecting and sharing employee data with us.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">5. Use of Personal Data</h2>
              <p>We use the data we process solely to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Distribute and collect employee sentiment surveys</li>
                <li>Generate anonymous reports and analytics for our customers</li>
                <li>Improve our services and ensure system security</li>
              </ul>
              <p>We do not use employee data for marketing, profiling, or resell it to third parties.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">6. Data Sharing and Subprocessors</h2>
              <p>We only share data with trusted third-party subprocessors necessary to provide our service. These include:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>SMS/Email delivery providers</li>
                <li>Stripe (for customer billing)</li>
                <li>Hosting/Infrastructure providers (e.g., AWS, Google Cloud – specify when implemented)</li>
              </ul>
              <p>All subprocessors are GDPR-compliant and under contractual data protection obligations.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">7. Data Retention</h2>
              <p>We retain personal data:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>For the duration of our customer contract</li>
                <li>Up to [XX months] afterward, as needed for legal or support reasons</li>
                <li>Survey response data is anonymized and retained in aggregate form only</li>
              </ul>
              <p>You may request deletion of your data at any time.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">8. Data Subject Rights (under GDPR)</h2>
              <p>Employees (data subjects) have the right to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Access their personal data</li>
                <li>Correct or delete their data</li>
                <li>Restrict or object to processing</li>
                <li>Lodge a complaint with a data protection authority</li>
              </ul>
              <p>To exercise any rights, please contact your employer (the data controller), or contact us if your employer has authorized it.</p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">9. International Data Transfers</h2>
              <p>
                If we transfer data outside the EU/EEA, we use appropriate safeguards, such as Standard Contractual Clauses (SCCs), to ensure data protection.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">10. Security Measures</h2>
              <p>
                We implement strong technical and organizational security measures, including encryption, access controls, and secure hosting. For more, see our [Security Policy].
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">11. Contact Us</h2>
              <p>For privacy-related inquiries, contact:</p>
              <div className="pl-4">
                <p>Email: [privacy@novora.com or insert]</p>
                <p>Address: [Insert office address]</p>
                <p>DPO (if appointed): [Insert name/contact if required]</p>
              </div>
            </section>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 