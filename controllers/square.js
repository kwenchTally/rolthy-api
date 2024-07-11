const { Client, Environment, ApiError } = require("square");
const { nanoid } = require("nanoid");
const { json } = require("express");
const crypto = require("crypto");

const client = new Client({
  bearerAuthCredentials: {
    accessToken:
      process.env.SQUARE_ENVIRONMENT === "production"
        ? process.env.SQUARE_ACCESS_TOKEN
        : process.env.SANDBOX_ACCESS_TOKEN,
  },
  environment:
    process.env.SQUARE_ENVIRONMENT === "production"
      ? Environment.Production
      : Environment.Sandbox || Environment.Sandbox,
});

const { locationsApi } = client;

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

//lists
getLocations = async (req, res) => {
  try {
    let listLocationsResponse = await locationsApi.listLocations();
    let data = listLocationsResponse.result.locations;

    data.forEach(function (location) {
      console.log(location.id + ": " + location.name);
    });

    return res.status(200).json({ count: data.length, data });
  } catch (error) {
    if (error instanceof ApiError) {
      error.result.errors.forEach(function (e) {
        console.log(e.category);
        console.log(e.code);
        console.log(e.detail);
      });
    } else {
      console.log("Unexpected error occurred: ", error);
    }
    return res.status(200).json({ message: "server error" });
  }
};

getCustomers = async (req, res) => {
  try {
    const response = await client.customersApi.listCustomers();
    console.log(response.result);

    const data = JSON.parse(response.body).customers || [];
    return res.status(200).json({ count: data.length, data });
  } catch (error) {
    if (error instanceof ApiError) {
      error.result.errors.forEach(function (e) {
        console.log(e.category);
        console.log(e.code);
        console.log(e.detail);
      });
    } else {
      console.log("Unexpected error occurred: ", error);
    }
    return res.status(200).json({ message: "server error" });
  }
};

getCards = async (req, res) => {
  try {
    const response = await client.cardsApi.listCards();
    console.log(response.result);

    const data = JSON.parse(response.body).cards || [];
    return res.status(200).json({ count: data.length, data });
  } catch (error) {
    if (error instanceof ApiError) {
      error.result.errors.forEach(function (e) {
        console.log(e.category);
        console.log(e.code);
        console.log(e.detail);
      });
    } else {
      console.log("Unexpected error occurred: ", error);
    }
    return res.status(200).json({ message: "server error" });
  }
};

getPayments = async (req, res) => {
  try {
    const response = await client.paymentsApi.listPayments();
    console.log(response.result);

    const data = JSON.parse(response.body).payments || [];
    return res.status(200).json({ count: data.length, data });
  } catch (error) {
    if (error instanceof ApiError) {
      error.result.errors.forEach(function (e) {
        console.log(e.category);
        console.log(e.code);
        console.log(e.detail);
      });
    } else {
      console.log("Unexpected error occurred: ", error);
    }
    return res.status(200).json({ message: "server error" });
  }
};

getCatalogs = async (req, res) => {
  try {
    const response = await client.catalogApi.listCatalog();
    console.log(response.result);

    const data = JSON.parse(response.body).objects || [];
    return res.status(200).json({ count: data.length, data });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "server error" });
  }
};

getItems = async (req, res) => {
  try {
    const response = await client.catalogApi.listCatalog(undefined, "ITEM");
    console.log(response.result);

    const data = JSON.parse(response.body).objects || [];
    return res.status(200).json({ count: data.length, data });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "server error" });
  }
};

getPlans = async (req, res) => {
  try {
    const response = await client.catalogApi.listCatalog(
      undefined,
      "SUBSCRIPTION_PLAN"
    );
    console.log(response.result);

    const data = JSON.parse(response.body).objects || [];
    return res.status(200).json({ count: data.length, data });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "server error" });
  }
};

getSubscriptions = async (req, res) => {
  try {
    const response = await client.subscriptionsApi.searchSubscriptions({});
    console.log(response.result);

    const data = JSON.parse(response.body).objects || [];
    return res.status(200).json({ count: data.length, data });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "server error" });
  }
};

getTransactions = async (req, res) => {
  try {
    const response = await client.transactionsApi.listTransactions(locationId);
    console.log(response.result);

    const data = JSON.parse(response.body).transactions || [];
    return res.status(200).json({ count: data.length, data });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "server error" });
  }
};

//create
createCustomer = async (req, res) => {
  try {
    const { firstname, lastname, email, address, phone, note } = req.body;
    const referenceId = nanoid();

    const data = {
      givenName: firstname,
      familyName: lastname,
      emailAddress: email,
      address: {
        addressLine1: address.street,
        addressLine2: address.appartment,
        locality: address.city,
        administrativeDistrictLevel1: address.state,
        postalCode: address.zipcode,
        country: address.country,
      },
      phoneNumber: phone,
      referenceId: referenceId,
      note: note,
    };

    const response = await client.customersApi.createCustomer(data);

    console.log(response.result);
    return res.status(200).json(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
    try {
      err = JSON.parse(error.body.replaceAll()).errors;
      console.log(err);
      return res.status(200).json({ err: err });
    } catch (e) {
      return res.status(200).json({ err: "server error" });
    }
  }
};

createCard = async (req, res) => {
  try {
    const { cardHolder, billing, customer, month, expiry } = req.body;
    const idempotencyKey = crypto.randomUUID();
    const referenceId = nanoid();

    const data = {
      idempotencyKey: idempotencyKey,
      sourceId: "cnon:card-nonce-ok",

      card: {
        cardholderName: cardHolder,
        expMonth: month,
        expYear: expiry,
        billingAddress: {
          addressLine1: billing.street,
          addressLine2: billing.appartment,
          locality: billing.city,
          administrativeDistrictLevel1: billing.state,
          postalCode: billing.zipcode,
          country: billing.country,
        },
        customerId: customer,
        referenceId: referenceId,
      },
    };

    const response = await client.cardsApi.createCard(data);

    console.log(response.result);
    return res.status(200).json(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
    try {
      err = JSON.parse(error.body.replaceAll()).errors;
      console.log(err);
      return res.status(200).json({ err: err });
    } catch (e) {
      return res.status(200).json({ err: "server error" });
    }
  }
};

verifyBuyer = async (req, res) => {
  try {
    const idempotencyKey = crypto.randomUUID();
    const { card, amount, currency, billing } = req.body;

    const data = {
      buyerEmailAddress: billing.email,
      billingAddress: {
        addressLine1: billing.street,
        addressLine2: billing.appartment,
        locality: billing.city,
        administrativeDistrictLevel1: billing.state,
        postalCode: billing.postalCode,
        country: billing.country,
      },
      shippingAddress: {
        addressLine1: billing.street,
        addressLine2: billing.appartment,
        locality: billing.city,
        administrativeDistrictLevel1: billing.state,
        postalCode: billing.postalCode,
        country: billing.country,
      },
      amountMoney: {
        amount: parseInt(amount, 10),
        currencyCode: currency || "USD",
      },
      sourceId: "cnon:card-nonce-ok",
      idempotencyKey: idempotencyKey,
    };

    const response = await client.paymentsApi.createPayment(data);

    console.log(response.result);
    return res.status(200).json(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
    try {
      err = JSON.parse(error.body.replaceAll()).errors;
      console.log(err);
      return res.status(200).json({ err: err });
    } catch (e) {
      return res.status(200).json({ err: "server error" });
    }
  }
};

createPayment = async (req, res) => {
  try {
    const idempotencyKey = crypto.randomUUID();
    const referenceId = nanoid();
    const { card, amount, fee, currency, customer, note } = req.body;

    const response = await client.paymentsApi.createPayment({
      idempotencyKey: idempotencyKey,
      locationId: locationId,
      sourceId: card,
      amountMoney: {
        amount: amount,
        currency: currency || "USD",
      },
      appFeeMoney: {
        amount: fee,
        currency: currency || "USD",
      },
      autocomplete: true,
      customerId: customer,
      referenceId: referenceId,
      note: note || "",
    });

    console.log(response.result);
    return res.status(200).json(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
    try {
      err = JSON.parse(error.body.replaceAll()).errors;
      console.log(err);
      return res.status(200).json({ err: err });
    } catch (e) {
      return res.status(200).json({ err: "server error" });
    }
  }
};

//items
createItem = async (req, res) => {
  try {
    const { name, description, options } = req.body;
    const idempotencyKey = crypto.randomUUID();

    const variations = options.map((variation) => {
      return {
        type: "ITEM_VARIATION",
        id: `#${nanoid()}`,
        itemVariationData: {
          name: variation.name || "Default",
          pricingType: "FIXED_PRICING",
          priceMoney: {
            amount: variation.amount || 0,
            currency: variation.currency || "USD",
          },
        },
      };
    });

    const data = {
      idempotencyKey,
      object: {
        type: "ITEM",
        id: `#${nanoid()}`,
        itemData: {
          name,
          description,
          variations: variations,
        },
      },
    };

    const response = await client.catalogApi.upsertCatalogObject(data);
    console.log(response.result);
    return res.status(200).json(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
    try {
      err = JSON.parse(error.body.replaceAll()).errors;
      console.log(err);
      return res.status(200).json({ err: err });
    } catch (e) {
      return res.status(200).json({ err: "server error" });
    }
  }
};

createPlan = async (req, res) => {
  try {
    const { name, description, amount, currency, interval } = req.body;
    const idempotencyKey = crypto.randomUUID();

    if (!name || !amount || !currency || !interval) {
      return res.status(400).send({
        error: "Missing required fields",
      });
    }

    const data = {
      idempotencyKey: idempotencyKey,
      object: {
        type: "SUBSCRIPTION_PLAN",
        id: `#${nanoid()}`,
        subscriptionPlanData: {
          name,
          description,
          phases: [
            {
              cadence: interval,
              recurringPriceMoney: {
                amount: amount,
                currency: currency,
              },
            },
          ],
        },
      },
    };

    const response = await client.catalogApi.upsertCatalogObject(data);
    console.log(response.result);
    return res.status(200).json(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
    if (error instanceof ApiError) {
      res.status(400).json(error.errors);
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

createSubscription = async (req, res) => {
  try {
    const idempotencyKey = crypto.randomUUID();
    const { card, customer, plan, interval, amount, currency } = req.body;
    var today = new Date();

    const data = {
      idempotencyKey: idempotencyKey,
      locationId: locationId,
      planVariationId: plan,
      customerId: customer,
      startDate: today.getDate().toLocaleString(),
      endDate: today.setDate(today.getDate() + 30).toLocaleString(), //30 days
      cardId: card,
      source: {
        name: process.env.APP_NAME,
      },
      phases: [
        {
          cadence: interval || "MONTHLY",
          recurringPriceMoney: {
            amount: amount || 0,
            currency: currency || "USD",
          },
        },
      ],
    };

    const response = await client.subscriptionsApi.createSubscription(data);
    console.log(response.result);
    return res.status(200).json(JSON.parse(response.body));
  } catch (error) {
    try {
      err = JSON.parse(error.body.replaceAll()).errors;
      console.log(err);
      return res.status(200).json({ err: err });
    } catch (e) {
      return res.status(200).json({ err: "server error" });
    }
  }
};

updatePayment = async (req, res) => {
  try {
    const response = await client.paymentsApi.updatePayment(
      "1QjqpBVyrI9S4H9sTGDWU9JeiWdZY",
      {
        payment: {
          amountMoney: {
            amount: 1000,
            currency: "USD",
          },
          tipMoney: {
            amount: 100,
            currency: "USD",
          },
          versionToken: "ODhwVQ35xwlzRuoZEwKXucfu7583sPTzK48c5zoGd0g6o",
        },
        idempotencyKey: "956f8b13-e4ec-45d6-85e8-d1d95ef0c5de",
      }
    );

    console.log(response.result);
    return res.status(200).json(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
    try {
      err = JSON.parse(error.body.replaceAll()).errors;
      console.log(err);
      return res.status(200).json({ err: err });
    } catch (e) {
      return res.status(200).json({ err: "server error" });
    }
  }
};

cancelPayment = async (req, res) => {
  try {
    const response = await client.paymentsApi.cancelPayment(
      "1QjqpBVyrI9S4H9sTGDWU9JeiWdZY"
    );

    console.log(response.result);
    return res.status(200).json(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "server error" });
  }
};

completePayment = async (req, res) => {
  try {
    const response = await client.paymentsApi.completePayment(
      "bP9mAsEMYPUGjjGNaNO5ZDVyLhSZY",
      {}
    );

    console.log(response.result);
    return res.status(200).json(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
    try {
      err = JSON.parse(error.body.replaceAll()).errors;
      console.log(err);
      return res.status(200).json({ err: err });
    } catch (e) {
      return res.status(200).json({ err: "server error" });
    }
  }
};

//
payNow = async (req, res) => {
  try {
    console.log("payment...");
    const { body } = req;
    const payment = await stripe.paymentIntents.create({
      amount: body?.amount, // amount in cent
      currency: body?.currency,
    });
    console.log(payment);
    if (payment?.status !== "completed") {
      console.log("=== in");
      return res.status(200).json({
        message: "plaese confirm payment",
        client_secret: payment?.client_secret,
      });
    }
    return res.status(200).json({ message: "payment completed successfully" });
  } catch (err) {
    console.log("error: " + err);
  }
};

generatePayment = async () => {
  const payments = Square.payments(sourceId, locationId);
  const cardOptions = {
    style: {
      input: {
        backgroundColor: "white",
      },
    },
  };
  try {
    const card = await payments.card(cardOptions);
    await card.attach("#card");
    const payButton = document.getElementById("pay");
    payButton.addEventListener("click", async () => {
      const result = await card.tokenize();
      alert(JSON.stringify(result, null, 2));
    });
  } catch (e) {
    console.log(e);
  }
};
generatePaymentCard = async (req, res) => {
  res.render(
    // "payment",
    "paynow",
    {
      title: "Order Payment",
      message: "",
      sourceId: sourceId,
      locationId: locationId,
    }
  );
};

module.exports = {
  getLocations,
  getPayments,
  getCustomers,
  getCards,

  verifyBuyer,

  createPayment,
  createCustomer,
  createCard,

  payNow,

  getItems,
  getPlans,
  getSubscriptions,

  createPlan,
  createItem,
  createSubscription,

  getTransactions,
  generatePaymentCard,
};
