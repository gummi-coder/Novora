import React, { useEffect, useState } from 'react';
import { SubscriptionPlan } from '../../types/subscription';
import { subscriptionService } from '../../services/subscription';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const PricingPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await subscriptionService.getPlans();
        setPlans(data);
      } catch (err) {
        setError('Failed to load pricing plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (isAuthenticated) {
      navigate('/checkout', { state: { plan } });
    } else {
      navigate('/register', { state: { plan } });
    }
  };

  if (loading) return <div>Loading plans...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="border rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
        >
          <h2 className="text-2xl font-bold mb-4">{plan.name.toUpperCase()}</h2>
          <div className="text-3xl font-bold mb-4">
            ${plan.price}
            <span className="text-lg text-gray-500">/{plan.interval}</span>
          </div>
          <ul className="space-y-3 mb-6">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
          <button
            onClick={() => handleSelectPlan(plan)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            {isAuthenticated ? 'Upgrade Plan' : 'Get Started'}
          </button>
        </div>
      ))}
    </div>
  );
}; 