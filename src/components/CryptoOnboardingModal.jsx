import React from "react";

// Placeholder component for CryptoOnboardingModal
// This is a temporary placeholder to resolve import errors
const CryptoOnboardingModal = ({
  isOpen,
  onClose,
  agentName,
  agentFee,
  ...props
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Crypto Onboarding</h2>
        <p className="mb-4">Setting up crypto payment for {agentName}</p>
        <p className="mb-4">Fee: {agentFee}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CryptoOnboardingModal;
