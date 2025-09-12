export interface Feature {
  id: string;
  name: string;
  description: string;
  enterprise: boolean;
  professional: boolean;
  basic: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  features: Feature[];
  limits: {
    surveys: number;
    teamMembers: number;
    storage: number;
    apiCalls: number;
  };
}

export const features: Feature[] = [
  // Core (Basic) Features
  {
    id: 'limited_surveys_basic',
    name: 'Limited Surveys',
    description: 'Create and manage up to 10 surveys',
    enterprise: true,
    professional: true,
    basic: true
  },
  {
    id: 'basic_reporting',
    name: 'Basic Reporting',
    description: 'Access to basic reporting features',
    enterprise: true,
    professional: true,
    basic: true
  },
  {
    id: 'email_support',
    name: 'Email Support',
    description: 'Email-based customer support',
    enterprise: true,
    professional: true,
    basic: true
  },
  {
    id: 'standard_templates',
    name: 'Standard Templates',
    description: 'Access to standard survey templates',
    enterprise: true,
    professional: true,
    basic: true
  },
  {
    id: 'basic_analytics',
    name: 'Basic Analytics',
    description: 'Basic analytics and insights',
    enterprise: true,
    professional: true,
    basic: true
  },

  // Professional Features
  {
    id: 'limited_surveys_pro',
    name: 'Limited Surveys',
    description: 'Create and manage up to 100 surveys',
    enterprise: false,
    professional: true,
    basic: false
  },
  {
    id: 'standard_support',
    name: 'Standard Support',
    description: 'Standard customer support during business hours',
    enterprise: false,
    professional: true,
    basic: false
  },
  {
    id: 'basic_integrations',
    name: 'Basic Integrations',
    description: 'Basic third-party integrations',
    enterprise: false,
    professional: true,
    basic: false
  },
  {
    id: 'team_management',
    name: 'Team Management',
    description: 'Manage team members and permissions',
    enterprise: true,
    professional: true,
    basic: false
  },
  {
    id: 'export_capabilities',
    name: 'Export Capabilities',
    description: 'Export data in various formats',
    enterprise: true,
    professional: true,
    basic: false
  },

  // Enterprise-only Features
  {
    id: 'unlimited_surveys',
    name: 'Unlimited Surveys',
    description: 'Create and manage unlimited surveys',
    enterprise: true,
    professional: false,
    basic: false
  },
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Access to advanced analytics and insights',
    enterprise: true,
    professional: false,
    basic: false
  },
  {
    id: 'custom_branding',
    name: 'Custom Branding',
    description: 'Customize the look and feel of your surveys',
    enterprise: true,
    professional: false,
    basic: false
  },
  {
    id: 'priority_support',
    name: 'Priority Support',
    description: '24/7 priority customer support',
    enterprise: true,
    professional: false,
    basic: false
  },
  {
    id: 'api_access',
    name: 'API Access',
    description: 'Full API access for custom integrations',
    enterprise: true,
    professional: false,
    basic: false
  },
  {
    id: 'custom_integrations',
    name: 'Custom Integrations',
    description: 'Build custom integrations with your tools',
    enterprise: true,
    professional: false,
    basic: false
  },
  {
    id: 'advanced_security',
    name: 'Advanced Security',
    description: 'Advanced security features and compliance',
    enterprise: true,
    professional: false,
    basic: false
  },
  {
    id: 'white_label',
    name: 'White Label',
    description: 'White label your surveys and reports',
    enterprise: true,
    professional: false,
    basic: false
  }
];

export const pricingTiers: PricingTier[] = [
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999,
    features: features.filter(f => f.enterprise),
    limits: {
      surveys: -1, // Unlimited
      teamMembers: -1, // Unlimited
      storage: 1000, // 1000GB
      apiCalls: -1 // Unlimited
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 299,
    features: features.filter(f => f.professional),
    limits: {
      surveys: 100,
      teamMembers: 20,
      storage: 100, // 100GB
      apiCalls: 10000
    }
  },
  {
    id: 'basic',
    name: 'Core',
    price: 49,
    features: features.filter(f => f.basic),
    limits: {
      surveys: 10,
      teamMembers: 5,
      storage: 10, // 10GB
      apiCalls: 1000
    }
  }
]; 