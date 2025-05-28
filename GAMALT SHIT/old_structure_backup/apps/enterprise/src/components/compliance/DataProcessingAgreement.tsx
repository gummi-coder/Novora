import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function DataProcessingAgreement() {
  const currentDate = new Date().toLocaleDateString();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Data Processing Agreement</CardTitle>
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
              This Data Processing Agreement ("DPA") forms part of the Terms of Service between Novora ("Processor") and the Customer ("Controller") for the processing of personal data in connection with the Service.
            </p>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">1. Definitions</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>"GDPR" means the General Data Protection Regulation (EU) 2016/679</li>
                <li>"Personal Data" means any information relating to an identified or identifiable natural person</li>
                <li>"Processing" means any operation performed on Personal Data</li>
                <li>"Data Subject" means the identified or identifiable natural person</li>
                <li>"Subprocessor" means any third party engaged by the Processor to process Personal Data</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">2. Subject Matter and Duration</h2>
              <p>
                This DPA applies to all Processing of Personal Data by the Processor on behalf of the Controller. The duration of this DPA corresponds to the duration of the Service agreement.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">3. Nature and Purpose of Processing</h2>
              <p>
                The Processor processes Personal Data for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Providing the employee sentiment survey service</li>
                <li>Managing survey distribution and responses</li>
                <li>Generating analytics and reports</li>
                <li>Ensuring system security and performance</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">4. Types of Personal Data and Categories of Data Subjects</h2>
              <p>Types of Personal Data processed:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Contact information (email, phone number)</li>
                <li>Employment information (department, team, location)</li>
                <li>Survey responses (anonymous)</li>
                <li>Technical data (IP address, device information)</li>
              </ul>
              <p>Categories of Data Subjects:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Employees of the Controller</li>
                <li>Authorized users of the Service</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">5. Obligations of the Processor</h2>
              <p>The Processor shall:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Process Personal Data only on documented instructions from the Controller</li>
                <li>Ensure persons authorized to process Personal Data have committed to confidentiality</li>
                <li>Implement appropriate technical and organizational security measures</li>
                <li>Assist the Controller in responding to Data Subject requests</li>
                <li>Assist the Controller in ensuring compliance with security obligations</li>
                <li>Delete or return all Personal Data after the end of services</li>
                <li>Make available to the Controller all information necessary to demonstrate compliance</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">6. Subprocessors</h2>
              <p>
                The Controller grants general authorization for the Processor to engage Subprocessors, subject to the following conditions:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>The Processor shall inform the Controller of any intended changes</li>
                <li>The Controller shall have the right to object to such changes</li>
                <li>The Processor shall impose the same data protection obligations on Subprocessors</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">7. Data Subject Rights</h2>
              <p>
                The Processor shall assist the Controller in fulfilling Data Subject requests by:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Implementing appropriate technical and organizational measures</li>
                <li>Providing necessary information and assistance</li>
                <li>Responding to requests within required timeframes</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">8. Security Measures</h2>
              <p>
                The Processor implements the following security measures:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Encryption of Personal Data in transit and at rest</li>
                <li>Regular security testing and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Regular backup procedures</li>
                <li>Incident detection and response procedures</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">9. Data Breach Notification</h2>
              <p>
                The Processor shall notify the Controller without undue delay after becoming aware of a Personal Data breach, providing:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Description of the nature of the breach</li>
                <li>Categories and approximate number of Data Subjects concerned</li>
                <li>Likely consequences of the breach</li>
                <li>Measures taken or proposed to address the breach</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">10. Audit Rights</h2>
              <p>
                The Controller may audit the Processor's compliance with this DPA by:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Requesting information and documentation</li>
                <li>Conducting on-site inspections</li>
                <li>Requesting third-party audits</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">11. Liability</h2>
              <p>
                The Processor shall be liable for any damage caused by processing where it has not complied with obligations specifically directed to processors under the GDPR.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">12. Termination</h2>
              <p>
                This DPA shall terminate automatically upon termination of the Service agreement. The Processor shall delete or return all Personal Data after the end of services.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">13. Governing Law</h2>
              <p>
                This DPA shall be governed by the laws of [Insert jurisdiction], without regard to conflicts of law principles.
              </p>
            </section>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 