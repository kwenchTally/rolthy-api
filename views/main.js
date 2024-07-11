const locationId =
  process.env.SQUARE_ENVIRONMENT === "production"
    ? process.env.SQUARE_LOCATION_ID
    : process.env.SANDBOX_LOCATION_ID;
const sourceId =
  process.env.SQUARE_ENVIRONMENT === "production"
    ? process.env.SQUARE_APP_ID
    : process.env.SANDBOX_APP_ID;
const secretId =
  process.env.SQUARE_ENVIRONMENT === "production"
    ? process.env.SQUARE_APP_SECRET
    : process.env.SANDBOX_APP_SECRET;

const App = ({ applicationId, locationId }) => {
  return (
    <div>
      <h1>Order Payment</h1>
      <PaymentModal applicationId={applicationId} locationId={locationId} />
    </div>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(
  <App applicationId={sourceId} locationId={locationId} />,
  rootElement
);
