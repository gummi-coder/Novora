import React, { useState } from 'react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { formatCurrency } from '../../utils/format';

export const BillingPortal: React.FC = () => {
  const {
    subscription,
    invoices,
    paymentMethods,
    loading,
    error,
    createBillingPortalSession,
    removePaymentMethod,
    setDefaultPaymentMethod,
  } = useSubscription();

  const [processing, setProcessing] = useState(false);

  const handleManageBilling = async () => {
    try {
      setProcessing(true);
      const session = await createBillingPortalSession(window.location.href);
      window.location.href = session.url;
    } catch (err) {
      console.error('Failed to open billing portal:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      try {
        await removePaymentMethod(paymentMethodId);
      } catch (err) {
        console.error('Failed to remove payment method:', err);
      }
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      await setDefaultPaymentMethod(paymentMethodId);
    } catch (err) {
      console.error('Failed to set default payment method:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Subscription</h2>
        {subscription ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium">
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </h3>
                <p className="text-gray-600">
                  Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={handleManageBilling}
                disabled={processing}
                className="btn btn-primary"
              >
                {processing ? 'Opening...' : 'Manage Subscription'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No active subscription</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Payment Methods</h2>
        <div className="bg-white rounded-lg shadow">
          {paymentMethods.length > 0 ? (
            <div className="divide-y">
              {paymentMethods.map((method) => (
                <div key={method.id} className="p-6 flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium">
                        {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} ending in {method.last4}
                      </span>
                      {method.isDefault && (
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600">
                      Expires {method.expMonth}/{method.expYear}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefaultPaymentMethod(method.id)}
                        className="btn btn-secondary"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleRemovePaymentMethod(method.id)}
                      className="btn btn-danger"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="p-6 text-gray-600">No payment methods added</p>
          )}
          <div className="p-6 border-t">
            <button
              onClick={handleManageBilling}
              disabled={processing}
              className="btn btn-primary"
            >
              Add Payment Method
            </button>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Billing History</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {invoices.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.hostedInvoiceUrl ? (
                        <a
                          href={invoice.hostedInvoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Invoice
                        </a>
                      ) : (
                        <span className="text-gray-500">Not available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-6 text-gray-600">No billing history available</p>
          )}
        </div>
      </div>
    </div>
  );
}; 