const { SquarePaymentsForm, CreditCard } = window.ReactSquareWebPaymentsSdk;

const SquarePaymentForm = ({ applicationId, locationId }) => {
  const handlePayment = async (tokenResult) => {
    if (tokenResult.token) {
      console.log("Payment token:", tokenResult.token);
      alert("Payment successful!");
    } else {
      console.error("Payment tokenization failed:", tokenResult.errors);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <SquarePaymentsForm
      applicationId={applicationId}
      locationId={locationId}
      cardTokenizeResponseReceived={handlePayment}
    >
      <CreditCard />
      <button>Pay</button>
    </SquarePaymentsForm>
  );
};

window.SquarePaymentForm = SquarePaymentForm;
