import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface AuditResult {
  timestamp: string;
  dependencies: {
    vulnerabilities: number;
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
  snyk: {
    vulnerabilities: number;
    issues: any[];
  };
  outdated: {
    packages: string[];
    count: number;
  };
}

async function runSecurityAudit(): Promise<AuditResult> {
  const result: AuditResult = {
    timestamp: new Date().toISOString(),
    dependencies: {
      vulnerabilities: 0,
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
    },
    snyk: {
      vulnerabilities: 0,
      issues: [],
    },
    outdated: {
      packages: [],
      count: 0,
    },
  };

  try {
    // Run npm audit
    console.log('Running npm audit...');
    const auditOutput = execSync('npm audit --json').toString();
    const auditData = JSON.parse(auditOutput);

    result.dependencies = {
      vulnerabilities: auditData.vulnerabilities || 0,
      critical: auditData.critical || 0,
      high: auditData.high || 0,
      moderate: auditData.moderate || 0,
      low: auditData.low || 0,
    };

    // Run Snyk test if available
    try {
      console.log('Running Snyk test...');
      const snykOutput = execSync('snyk test --json').toString();
      const snykData = JSON.parse(snykOutput);
      result.snyk = {
        vulnerabilities: snykData.vulnerabilities?.length || 0,
        issues: snykData.vulnerabilities || [],
      };
    } catch (error) {
      console.warn('Snyk test failed or not configured:', error);
    }

    // Check for outdated packages
    console.log('Checking for outdated packages...');
    const outdatedOutput = execSync('npm outdated --json').toString();
    const outdatedData = JSON.parse(outdatedOutput);
    result.outdated = {
      packages: Object.keys(outdatedData),
      count: Object.keys(outdatedData).length,
    };

    // Generate report
    const reportPath = join(process.cwd(), 'security-audit-report.json');
    writeFileSync(reportPath, JSON.stringify(result, null, 2));

    console.log(`Security audit completed. Report saved to ${reportPath}`);

    // Print summary
    console.log('\nSecurity Audit Summary:');
    console.log('----------------------');
    console.log(`Total vulnerabilities: ${result.dependencies.vulnerabilities}`);
    console.log(`Critical: ${result.dependencies.critical}`);
    console.log(`High: ${result.dependencies.high}`);
    console.log(`Moderate: ${result.dependencies.moderate}`);
    console.log(`Low: ${result.dependencies.low}`);
    console.log(`Snyk vulnerabilities: ${result.snyk.vulnerabilities}`);
    console.log(`Outdated packages: ${result.outdated.count}`);

    // Exit with error if critical vulnerabilities found
    if (result.dependencies.critical > 0) {
      console.error('Critical vulnerabilities found!');
      process.exit(1);
    }

    return result;
  } catch (error) {
    console.error('Security audit failed:', error);
    process.exit(1);
  }
}

// Run the audit
runSecurityAudit(); 