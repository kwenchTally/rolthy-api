const PaymentModal = ({ applicationId, locationId }) => {
  const [isModalOpen, setModalOpen] = React.useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <>
      <button onClick={openModal}>Open Payment Modal</button>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <h2>Payment Form</h2>
            <SquarePaymentForm
              applicationId={applicationId}
              locationId={locationId}
            />
          </div>
        </div>
      )}
    </>
  );
};

window.PaymentModal = PaymentModal;
