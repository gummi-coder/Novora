/**
 * Frontend Integration Test Utility
 * Tests API communication from the frontend perspective
 */

import { api } from '@/lib/api';
import { apiConfig, config } from '@/config/environment';

export interface TestResult {
  test: string;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class FrontendIntegrationTester {
  private testResults: TestResult[] = [];
  private authToken: string | null = null;

  private logTest(testName: string, success: boolean, message: string, data?: any, error?: string): boolean {
    const result: TestResult = {
      test: testName,
      success,
      message,
      data,
      error
    };

    this.testResults.push(result);
    
    const status = success ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} ${testName}: ${message}`);
    
    if (error) {
      console.error(`   Error: ${error}`);
    }
    
    return success;
  }

  async testEnvironmentConfiguration(): Promise<boolean> {
    try {
      const currentEnv = config.app.environment;
      const apiUrl = apiConfig.fullUrl;
      const features = config.features;

      return this.logTest(
        "Environment Configuration",
        true,
        `Environment: ${currentEnv}, API: ${apiUrl}, Features: ${Object.keys(features).length} enabled`,
        { environment: currentEnv, apiUrl, features }
      );
    } catch (error) {
      return this.logTest(
        "Environment Configuration",
        false,
        "Failed to load environment configuration",
        undefined,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async testApiHealthCheck(): Promise<boolean> {
    try {
      const response = await api.healthCheck();
      
      if (response && response.status) {
        return this.logTest(
          "API Health Check",
          true,
          `API is healthy - Status: ${response.status}`,
          response
        );
      } else {
        return this.logTest(
          "API Health Check",
          false,
          "API health check returned invalid response",
          response
        );
      }
    } catch (error) {
      return this.logTest(
        "API Health Check",
        false,
        "Failed to connect to API health endpoint",
        undefined,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async testUserRegistration(): Promise<boolean> {
    try {
      const testEmail = `test_${Date.now()}@example.com`;
      const testPassword = "TestPassword123!";
      const testCompany = "Test Company";

      const response = await api.register(testEmail, testPassword, testCompany);
      
      if (response && response.id) {
        return this.logTest(
          "User Registration",
          true,
          `User registered successfully - ID: ${response.id}`,
          { email: testEmail, id: response.id }
        );
      } else {
        return this.logTest(
          "User Registration",
          false,
          "Registration response missing user ID",
          response
        );
      }
    } catch (error) {
      return this.logTest(
        "User Registration",
        false,
        "User registration failed",
        undefined,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async testUserLogin(): Promise<boolean> {
    try {
      const testEmail = `test_${Date.now()}@example.com`;
      const testPassword = "TestPassword123!";
      const testCompany = "Test Company";

      // First register a user
      await api.register(testEmail, testPassword, testCompany);

      // Then test login
      const response = await api.login(testEmail, testPassword);
      
      if (response && response.access_token) {
        this.authToken = response.access_token;
        return this.logTest(
          "User Login",
          true,
          "Login successful - Token received",
          { email: testEmail, hasToken: true }
        );
      } else {
        return this.logTest(
          "User Login",
          false,
          "Login successful but no access token received",
          response
        );
      }
    } catch (error) {
      return this.logTest(
        "User Login",
        false,
        "User login failed",
        undefined,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async testAuthenticatedEndpoints(): Promise<boolean> {
    try {
      if (!this.authToken) {
        return this.logTest(
          "Authenticated Endpoints",
          false,
          "No authentication token available",
          undefined,
          "Authentication token not set"
        );
      }

      // Test getting current user
      const userResponse = await api.getCurrentUser();
      
      if (userResponse && userResponse.id) {
        return this.logTest(
          "Authenticated Endpoints",
          true,
          `Authenticated access successful - User: ${userResponse.email}`,
          { email: userResponse.email, id: userResponse.id }
        );
      } else {
        return this.logTest(
          "Authenticated Endpoints",
          false,
          "Authenticated endpoint returned invalid user data",
          userResponse
        );
      }
    } catch (error) {
      return this.logTest(
        "Authenticated Endpoints",
        false,
        "Authenticated endpoint access failed",
        undefined,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async testSurveyEndpoints(): Promise<boolean> {
    try {
      if (!this.authToken) {
        return this.logTest(
          "Survey Endpoints",
          false,
          "No authentication token available for survey test",
          undefined,
          "Authentication token not set"
        );
      }

      // Test getting surveys
      const surveys = await api.getSurveys();
      
      if (Array.isArray(surveys)) {
        return this.logTest(
          "Survey Endpoints",
          true,
          `Survey endpoints accessible - Found ${surveys.length} surveys`,
          { surveyCount: surveys.length }
        );
      } else {
        return this.logTest(
          "Survey Endpoints",
          false,
          "Survey endpoints returned invalid response format",
          surveys
        );
      }
    } catch (error) {
      return this.logTest(
        "Survey Endpoints",
        false,
        "Survey endpoints test failed",
        undefined,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async testApiErrorHandling(): Promise<boolean> {
    try {
      // Test with invalid credentials
      try {
        await api.login("invalid@example.com", "wrongpassword");
        return this.logTest(
          "API Error Handling",
          false,
          "Expected error for invalid credentials but got success",
          undefined,
          "Should have thrown an error"
        );
      } catch (error) {
        // This is expected - should throw an error
        return this.logTest(
          "API Error Handling",
          true,
          "Properly handled invalid credentials error",
          { errorType: error instanceof Error ? error.constructor.name : typeof error }
        );
      }
    } catch (error) {
      return this.logTest(
        "API Error Handling",
        false,
        "Error handling test failed",
        undefined,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async testCorsCompatibility(): Promise<boolean> {
    try {
      // Test that we can make requests from the frontend
      const response = await fetch(`${apiConfig.fullUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Version': config.app.version,
          'X-Environment': config.app.environment,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return this.logTest(
          "CORS Compatibility",
          true,
          "CORS requests working properly",
          { status: response.status, data }
        );
      } else {
        return this.logTest(
          "CORS Compatibility",
          false,
          `CORS request failed with status ${response.status}`,
          { status: response.status }
        );
      }
    } catch (error) {
      return this.logTest(
        "CORS Compatibility",
        false,
        "CORS compatibility test failed",
        undefined,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async testFeatureFlags(): Promise<boolean> {
    try {
      const features = config.features;
      const enabledFeatures = Object.entries(features)
        .filter(([_, enabled]) => enabled)
        .map(([feature, _]) => feature);

      return this.logTest(
        "Feature Flags",
        true,
        `Feature flags loaded - ${enabledFeatures.length} features enabled`,
        { enabledFeatures, totalFeatures: Object.keys(features).length }
      );
    } catch (error) {
      return this.logTest(
        "Feature Flags",
        false,
        "Feature flags test failed",
        undefined,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async runAllTests(): Promise<boolean> {
    console.log("🚀 Starting Frontend Integration Tests");
    console.log("=" * 50);

    const tests = [
      this.testEnvironmentConfiguration.bind(this),
      this.testApiHealthCheck.bind(this),
      this.testUserRegistration.bind(this),
      this.testUserLogin.bind(this),
      this.testAuthenticatedEndpoints.bind(this),
      this.testSurveyEndpoints.bind(this),
      this.testApiErrorHandling.bind(this),
      this.testCorsCompatibility.bind(this),
      this.testFeatureFlags.bind(this),
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        if (await test()) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        this.logTest(
          test.name,
          false,
          `Test crashed: ${error instanceof Error ? error.message : String(error)}`
        );
        failed++;
      }
    }

    console.log("\n" + "=" * 50);
    console.log("📊 Frontend Integration Test Results");
    console.log("=" * 50);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed === 0) {
      console.log("\n🎉 All frontend integration tests passed!");
      return true;
    } else {
      console.log(`\n⚠️  ${failed} test(s) failed. Check the details above.`);
      return false;
    }
  }

  getResults(): TestResult[] {
    return this.testResults;
  }
}

// Export a function to run tests
export async function runFrontendIntegrationTests(): Promise<boolean> {
  const tester = new FrontendIntegrationTester();
  return await tester.runAllTests();
}

// Export for use in development
export const integrationTester = new FrontendIntegrationTester();
