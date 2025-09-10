import React, { useEffect, useState } from 'react';
import { SubscriptionStatus } from '../../types/subscription';
import { subscriptionService } from '../../services/subscription';
import { useNavigate } from 'react-router-dom';

export const SubscriptionDetails: React.FC = () => {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const data = await subscriptionService.getCurrentSubscription();
        setSubscription(data);
      } catch (err) {
        setError('Failed to load subscription details');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        await subscriptionService.cancelSubscription();
        // Refresh subscription details
        const data = await subscriptionService.getCurrentSubscription();
        setSubscription(data);
      } catch (err) {
        setError('Failed to cancel subscription');
      }
    }
  };

  if (loading) return <div>Loading subscription details...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!subscription) return <div>No active subscription</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Subscription Details</h2>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Current Plan</h3>
            <p className="mt-1 text-lg font-semibold">{subscription.plan.name.toUpperCase()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="mt-1 text-lg font-semibold capitalize">{subscription.status}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Next Billing Date</h3>
            <p className="mt-1 text-lg font-semibold">
              {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Price</h3>
            <p className="mt-1 text-lg font-semibold">
              ${subscription.plan.price}/{subscription.plan.interval}
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Plan Features</h3>
          <ul className="space-y-2">
            {subscription.plan.features.map((feature, index) => (
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
        </div>

        <div className="border-t pt-6 mt-6 flex justify-end space-x-4">
          <button
            onClick={handleUpgrade}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Upgrade Plan
          </button>
          <button
            onClick={handleCancel}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  );
}; 