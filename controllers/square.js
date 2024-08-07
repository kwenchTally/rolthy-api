const { Client, Environment, ApiError } = require("square");
const { nanoid } = require("nanoid");
const { json } = require("express");
const crypto = require("crypto");
const { subscribe } = require("diagnostics_channel");

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

const { locationsApi, customersApi, subscriptionApi } = client;

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

    const data = JSON.parse(response.body).subscriptions || [];
    return res.status(200).json({ count: data.length, data });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "server error" });
  }
};

getSubscriptionPlanVariations = async (req, res) => {
  try {
    const response = await client.catalogApi.listCatalog(
      undefined,
      "SUBSCRIPTION_PLAN"
    );
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
  res.render("paynow", {
    title: "Order Payment",
    message: "",
    sourceId: sourceId,
    locationId: locationId,
  });
};

// payment
processPayment = async (req, res) => {
  const { nonce, sourceId, amount, customerId, note } = req.body;

  try {
    const { result } = await client.paymentsApi.createPayment({
      sourceId: nonce,
      customerId: customerId,
      amountMoney: {
        // amount: parseInt(amount, 100), // Amount in cents
        amount: parseInt(amount) * 100,
        currency: "USD",
      },
      idempotencyKey: new Date().getTime().toString(),
      source: {
        name: process.env.APP_NAME || "Habitoza",
      },
      note: note,
    });

    const payment = result.payment;
    let parsed = JSON.stringify(payment, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    );
    parsed = JSON.parse(parsed);
    res.status(200).json({ success: true, payment: parsed });
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("API Error:", error.errors);
      res.status(500).json({ success: false, error: error.errors });
    } else {
      console.error("Unexpected Error:", error);
      res
        .status(500)
        .json({ success: false, error: "An unexpected error occurred" });
    }
  }
};
viewPayment = async (req, res) => {
  try {
    // Encode the String
    // var encodedStringBtoA = btoa(decodedStringBtoA);
    // Decode the String
    // var decodedStringAtoB = atob(encodedStringAtoB);

    const key = req.query.key;
    let decoded = atob(req.query.req);
    decoded = JSON.parse(decoded);
    console.log(decoded);
    const { customerId, notes, price, items, plan, subscription } = decoded;

    response = await client.cardsApi.listCards(
      undefined,
      customerId,
      undefined,
      undefined,
      "DESC"
    );
    const data1 = JSON.parse(response.body).cards || [];
    const cards = data1.map((e) => {
      return {
        id: e.id,
        token: e.id,
        number: `${e.bin}********${e.last_4}`,
        expiry: `${e.exp_month}/${e.exp_year.toString().replaceAll("20", "")}`,
        type: e.card_type.replaceAll("CARD", ""),
        brand: e.card_brand,
        enabled: e.enabled,
      };
    });

    res.render("processPayment", {
      key,
      title: "Order Payment",
      message: "",
      sourceId: sourceId,
      locationId: locationId,
      data: {
        customer: customerId,
        amount: price,
        items: items,
        cards: cards,
        plan: plan,
        subscription: subscription,
      },
      isProduction: process.env.SQUARE_ENVIRONMENT === "production",
    });
  } catch (e) {
    res.status(500).send("<p>Request Error</p>");
  }
};

// subscription
processSubscription = async (req, res) => {
  const { subscriptionDetails, cardDetails, cardNonce, customerId, cardId } =
    req.body;
  try {
    let response;
    const data = {};

    console.log("===== Customer =====");
    let customer;
    //3. Create a new customer
    if (!customerId) {
      const { result: customerResult } = await customersApi.createCustomer({
        emailAddress: cardDetails.email,
        phoneNumber: cardDetails.phone,
        givenName: cardDetails.firstname,
        familyName: cardDetails.lastname,
      });
      customer = customerResult.customer;
      data.customer = customer.id;
    } else {
      console.log("customer exists!");
      data.customer = customerId;
    }

    console.log("===== Card =====");
    let card;
    //4. Create a new card
    if (!cardId) {
      const { result: cardResult } = await client.cardsApi.createCard({
        idempotencyKey: crypto.randomUUID(),
        sourceId: cardNonce,
        card: {
          customerId: customer.id,
        },
      });
      card = cardResult.card;
      data.card = card.id;
    } else {
      console.log("card exists!");
      data.card = cardId;
    }

    const uid = `#${subscriptionDetails.category.replaceAll(" ", "_")}`;
    console.log("===== Subscription Plan =====");
    //1. create subscription plan
    response = await client.catalogApi.upsertCatalogObject({
      idempotencyKey: crypto.randomUUID(),
      object: {
        type: "SUBSCRIPTION_PLAN",
        // id: `#${uid}`,
        id: subscriptionDetails.id,
        subscriptionPlanData: {
          name: subscriptionDetails.plan,
          eligibleCategoryIds: [],
          allItems: false,
        },
      },
    });
    data.subscription_plan = response.result.catalogObject.id;
    response = JSON.parse(serializeBigInt(response.result.catalogObject));

    console.log("===== Subscription Plan Variation =====");
    //2. create subscription plan varitions
    response = await client.catalogApi.upsertCatalogObject({
      idempotencyKey: crypto.randomUUID(),
      object: {
        type: "SUBSCRIPTION_PLAN_VARIATION",
        id: `#${uid}`,
        subscriptionPlanVariationData: {
          name: subscriptionDetails.variation,
          phases: [
            {
              cadence: subscriptionDetails.type.toCamelCase(),
              periods: 1,
              ordinal: 0,
              pricing: {
                type: "STATIC",
                priceMoney: {
                  amount: double.parseInt(subscriptionDetails.amount) * 100,
                  currency: "USD",
                },
              },
            },
          ],
          subscriptionPlanId: data.subscription_plan,
        },
      },
    });
    data.subscription_plan_variation = response.result.catalogObject.id;
    response = JSON.parse(serializeBigInt(response.result.catalogObject));

    //5. create subscription
    response = await client.subscriptionsApi.createSubscription({
      idempotencyKey: crypto.randomUUID(),
      locationId: locationId,
      planVariationId: data.subscription_plan_variation,
      customerId: data.customer,
      startDate: "2027-01-01",
      customerId: data.card,
    });
    response = JSON.parse(serializeBigInt(response.result.subscription));
    res.status(200).send(response);
  } catch (error) {
    console.log("api error:");
    try {
      console.log(error.result.errors);
      res.status(200).send(error.result.errors);
    } catch (e) {
      console.log(error);
      res.status(200).send(error);
    }
  }
};

async function listSubscriptionPlans() {
  try {
    const { result } = await client.catalogApi.listCatalog(
      undefined,
      "SUBSCRIPTION_PLAN"
    );
    const plans = result.objects;

    if (plans) {
      plans.forEach((plan) => {
        console.log(
          `Plan Name: ${plan.subscriptionPlanData.name}, Plan ID: ${plan.id}`
        );
      });
    } else {
      console.log("No subscription plans found.");
    }
  } catch (error) {
    console.error("Error listing subscription plans:", error);
  }
}

addSubscriptionPlan = async (req, res) => {
  const { subscriptionDetails, cardDetails, cardNonce, customerId, cardId } =
    req.body;
  try {
    let response;
    const data = {};

    console.log("===== Subscription Plan =====");
    //1. create subscription plan
    response = await client.catalogApi.searchCatalogObjects({
      objectTypes: ["SUBSCRIPTION_PLAN"],
      query: {
        exactQuery: {
          attributeName: "name",
          attributeValue: subscriptionDetails.name,
        },
      },
    });
    response = JSON.parse(serializeBigInt(response.result)) || [];
    response = response.objects || [];
    console.log(response.length);

    if (response === undefined || response.length === 0) {
      console.log("creating...");
      response = await client.catalogApi.upsertCatalogObject({
        idempotencyKey: crypto.randomUUID(),
        object: {
          type: "SUBSCRIPTION_PLAN",
          id: `#newSubscriptionPlan`,
          subscriptionPlanData: {
            name: subscriptionDetails.name,
            eligibleCategoryIds: [],
            allItems: false,
          },
        },
      });
      data.subscription_plan = response.result.catalogObject.id;
      response = JSON.parse(serializeBigInt(response.result.catalogObject));
    } else {
      response = response[0];
      response = JSON.parse(serializeBigInt(response));
      data.subscription_plan = response.id;
    }

    console.log("===== Subscription Plan Variation =====");

    let combinedResults = [];
    const namesToSearch = subscriptionDetails.items.map((e) => e.name);
    console.log(namesToSearch);
    for (const name of namesToSearch) {
      const response = await client.catalogApi.searchCatalogObjects({
        objectTypes: ["SUBSCRIPTION_PLAN_VARIATION"],
        query: {
          exactQuery: {
            attributeName: "name",
            attributeValue: name,
          },
        },
      });
      combinedResults =
        response.result.objects === undefined
          ? []
          : combinedResults.concat(response.result.objects[0] || []);
    }
    response = combinedResults;
    response = JSON.parse(serializeBigInt(response)) || [];
    console.log(response.length);

    let updates = [];
    let i = 0;
    if (response.length === 0) {
      subscriptionDetails.items.map((e1) => {
        let j = 0;
        response.map(async (e) => {
          if (e.subscriptionPlanVariationData.name === e1.name) {
            const newPhases = e1.variations.map((e2) => {
              return {
                cadence: e2.name.toUpperCase(),
                periods: e2.period,
                PriceMoney: {
                  amount: e2.price * 100, // Amount in cents (e.g., 10000 cents = $100.00)
                  currency: "USD",
                },
              };
            });

            const planVariation = {
              idempotencyKey: crypto.randomUUID(),
              object: {
                type: "SUBSCRIPTION_PLAN_VARIATION",
                id: "#newSubscriptionPlanVariation",
                subscriptionPlanVariationData: {
                  name: subscriptionDetails.name,
                  phases: newPhases,
                  subscriptionPlanId: data.subscription_plan,
                },
              },
            };

            let val = await client.catalogApi.upsertCatalogObject(
              planVariation
            );
            val = val.result;
            updates.push(val);
          }
          j++;
        });
        i++;
      });
    } else {
      subscriptionDetails.items.map(async (e) => {
        let i = 0;
        const newPhases = e.variations.map((e2) => {
          const d = {
            cadence: e2.name.toUpperCase(),
            periods: e2.period,
            pricing: {
              type: "STATIC",
              priceMoney: {
                amount: e2.price * 100, // Amount in cents (e.g., 10000 cents = $100.00)
                currency: "USD",
              },
            },
          };
          i++;
          return d;
        });
        const planVariation = e;
        planVariation.phases = newPhases;
        let val = await client.catalogApi.upsertCatalogObject(planVariation);
        val = val.result;
      });
    }

    response = updates;
    response = JSON.parse(serializeBigInt(response)) || [];
    res.status(200).send({ count: response.length, data: response });
  } catch (error) {
    console.log("api error:");
    try {
      console.log(error.result.errors);
      res.status(200).send(error.result.errors);
    } catch (e) {
      console.log(error);
      res.status(200).send(error);
    }
  }
};
addSubscription = async (req, res) => {
  const { subscriptionDetails, cardDetails, cardNonce, customerId, cardId } =
    req.body;
  try {
    let response;
    const data = {};

    console.log("===== Customer =====");
    let customer;
    //3. Create a new customer
    if (!customerId) {
      const { result: customerResult } = await customersApi.createCustomer({
        emailAddress: cardDetails.email,
        phoneNumber: cardDetails.phone,
        givenName: cardDetails.firstname,
        familyName: cardDetails.lastname,
      });
      customer = customerResult.customer;
      data.customer = customer.id;
    } else {
      console.log("customer exists!");
      data.customer = customerId;
    }

    console.log("===== Card =====");
    let card;
    //4. Create a new card
    if (!cardId) {
      const { result: cardResult } = await client.cardsApi.createCard({
        idempotencyKey: crypto.randomUUID(),
        sourceId: cardNonce,
        card: {
          customerId: customer.id,
        },
      });
      card = cardResult.card;
      data.card = card.id;
    } else {
      console.log("card exists!");
      data.card = cardId;
    }

    console.log(`\n${data}\n`);

    //5. create subscription
    response = await client.subscriptionsApi.createSubscription({
      idempotencyKey: crypto.randomUUID(),
      locationId: locationId,
      planVariationId: data.subscription_plan_variation,
      customerId: data.customer,
      startDate: "2027-01-01",
      customerId: data.card,
    });
    response = JSON.parse(serializeBigInt(response.result.subscription));
    res.status(200).send(response);
  } catch (error) {
    console.log("api error:");
    try {
      console.log(error.result.errors);
      res.status(200).send(error.result.errors);
    } catch (e) {
      console.log(error);
      res.status(200).send(error);
    }
  }
};

subscription = async (req, res) => {
  req.query.key === "new_plan"
    ? await addSubscriptionPlan(req, res)
    : await addSubscription(req, res);
};

findCatelog = async (query) => {
  console.log("findCatelog...");
  try {
    let response = await client.catalogApi.listCatalog(
      undefined,
      // 'Category'
      query
    );
    response = JSON.parse(serializeBigInt(response.result));
    return response.objects;
  } catch (error) {
    console.log(error);
  }
};

searchCatelog = async (query, filter) => {
  console.log("searchCatelog...");
  try {
    let response = await client.catalogApi.searchCatalogObjects({
      objectTypes: [query.toUpperCase()],
      query: {
        exactQuery: {
          attributeName: "name",
          attributeValue: filter,
        },
      },
    });

    response = JSON.parse(serializeBigInt(response.result)) || [];
    response = response.objects;
  } catch (error) {
    console.log(error);
  }
};

createCatelog = async (query, data) => {
  console.log("createCatelog...");
  try {
    const response = await client.catalogApi.upsertCatalogObject({
      idempotencyKey: crypto.randomUUID(),
      object: {
        // type: 'CATEGORY',
        type: query.toUpperCase(),
        // id: '#newCategory', // Temporary ID for the category
        id: "#new", // Temporary ID
        categoryData: query.toLowerCase() === "category" ? data : {},
      },
    });
  } catch (error) {
    if (error.response && error.response.body) {
      console.error("Error details:", error.response.body.errors);
    } else {
      console.error("An unexpected error occurred:", error);
    }
  }
};

createDiscount = async (req, res) => {
  try {
    const { name, discount } = req.body;
    const referenceId = nanoid();

    const data = {
      idempotencyKey: referenceId,
      object: {
        type: "DISCOUNT",
        id: "#newDiscount", // Temporary ID for the discount
        discountData: {
          name: name,
          discountType: "FIXED_PERCENTAGE",
          percentage: discount,
        },
      },
    };

    const response = await client.catalogApi.upsertCatalogObject(data);
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
createTax = async (req, res) => {
  try {
    const { name, percentage } = req.body;
    const referenceId = nanoid();

    const data = {
      idempotencyKey: referenceId,
      object: {
        type: "TAX",
        id: "#newTax", // Temporary ID for the tax
        taxData: {
          name: name,
          percentage: percentage,
          inclusionType: "ADDITIVE", // 'ADDITIVE' or 'INCLUSIVE'
          appliesToCustomAmounts: true, // Whether the tax applies to custom amounts
          enabled: true, // Whether the tax is enabled
        },
      },
    };

    const response = await client.catalogApi.upsertCatalogObject(data);
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
createOrderWithCharge = async (req, res) => {
  try {
    const {
      orderId,
      items,
      availableAt,
      deliveryCharge,
      serviceCharge,
      discounts,
      taxs,
    } = req.body;

    const referenceId = nanoid();

    let lineItems = [];

    if (items) {
      let arr = [];
      items.map((e) => {
        arr.push({
          type: "LINE_ITEM",
          // name: "Delivery Charge",
          name: e.name,
          // quantity: "1",
          quantity: e.qty,
          basePriceMoney: {
            amount: e.price * 100,
            currency: "USD",
          },
        });
      });

      lineItems = [...lineItems, ...arr];
    }

    if (deliveryCharge) {
      lineItems.add({
        type: "LINE_ITEM",
        name: "Delivery Charge",
        quantity: "1",
        basePriceMoney: {
          amount: deliveryCharge.amount,
          currency: "USD",
        },
      });
    }

    if (serviceCharge) {
      lineItems.add({
        type: "LINE_ITEM",
        name: "Service Charge",
        quantity: "1",
        basePriceMoney: {
          // amount: 1000, // Amount in cents (e.g., 1500 cents = $15.00)
          amount: serviceCharge.amount,
          currency: "USD",
        },
      });
    }

    const data = {
      idempotencyKey: referenceId,
      orderId: orderId,
      order: {
        locationId: availableAt || locationId,
        lineItems: lineItems || [],
        discountIds: discounts || [],
        taxIds: taxs || [],
      },
    };

    const response = orderId
      ? await client.ordersApi.updateOrder(data)
      : await client.ordersApi.createOrder(data);

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

async function getSubscriptionPlan(planId) {
  try {
    const catalogApi = client.catalogApi;
    const response = await catalogApi.retrieveCatalogObject(planId);
    return response.result.object;
  } catch (error) {
    console.error(error.result);
  }
}

newSubscriptionPlan = async (req, res) => {
  try {
    const { plan, planId } = req.body;
    const idempotencyKey = crypto.randomUUID();

    let version;
    if (planId) {
      const existingPlan = await getSubscriptionPlan(planId);
      version = existingPlan.version;
    }

    let response;
    const catalogApi = client.catalogApi;

    let query;
    if (planId) {
      console.log("===== updating =====");
      query = {
        idempotencyKey: idempotencyKey,
        object: {
          type: "SUBSCRIPTION_PLAN",
          id: planId,
          subscriptionPlanData: {
            name: plan.name,
            phases: plan.frequency.map((e) => {
              return {
                cadence: e.name.toUpperCase(),
                pricing: {
                  type: "STATIC",
                  priceMoney: {
                    amount: e.price * 100,
                    currency: "USD",
                  },
                },
                ordinal: 1,
              };
            }),
          },
        },
      };
    } else {
      console.log("===== creating =====");
      query = {
        idempotencyKey: idempotencyKey,
        object: {
          type: "SUBSCRIPTION_PLAN",
          id: "#newSubscriptionPlan",
          subscriptionPlanData: {
            name: plan.name,
          },
        },
      };
    }

    setTimeout(async () => {
      try {
        response = await catalogApi.upsertCatalogObject(query);
        response = JSON.parse(serializeBigInt(response.result)) || {};
        response = response.catalogObject;
        return res.status(200).json(response);
      } catch (e) {
        return res.status(200).json(e.result);
      }
    }, 2000); // wait 2 sec
  } catch (error) {
    console.error(error);
  }
};
newSubscriptionPlanVariation = async (req, res) => {
  try {
    const { planVariation, planId, planVariationId } = req.body;
    const idempotencyKey = crypto.randomUUID();

    let version;
    if (planVariationId) {
      const existingPlan = await getSubscriptionPlan(planVariationId);
      version = existingPlan.version;
    }

    let response;
    const catalogApi = client.catalogApi;

    let query;
    if (planVariationId) {
      console.log("===== updating =====");
      query = {
        idempotencyKey: idempotencyKey,
        object: {
          type: "SUBSCRIPTION_PLAN_VARIATION",
          id: planVariationId,
          subscriptionPlanVariationData: {
            name: planVariation.name,
            phases: planVariation.frequency.map((e) => {
              return {
                cadence: e.name.toUpperCase(),
                pricing: {
                  type: "STATIC",
                  priceMoney: {
                    amount: e.price * 100,
                    currency: "USD",
                  },
                },
                periods: e.period,
              };
            }),
          },
        },
      };
    } else {
      console.log("===== creating =====");
      query = {
        idempotencyKey: idempotencyKey,
        object: {
          type: "SUBSCRIPTION_PLAN_VARIATION",
          id: "#newSubscriptionPlanVariation",
          subscriptionPlanVariationData: {
            name: planVariation.name,
            subscriptionPlanId: planId,
            phases: planVariation.frequency.map((e) => {
              return {
                cadence: e.name.toUpperCase(),
                pricing: {
                  type: "STATIC",
                  priceMoney: {
                    amount: e.price * 100,
                    currency: "USD",
                  },
                },
                periods: e.period,
              };
            }),
          },
        },
      };
    }

    setTimeout(async () => {
      try {
        response = await catalogApi.upsertCatalogObject(query);
        response = JSON.parse(serializeBigInt(response.result)) || {};
        response = response.catalogObject;
        return res.status(200).json(response);
      } catch (e) {
        return res.status(200).json(e.result);
      }
    }, 2000); // wait 2 sec
  } catch (error) {
    console.error(error.result);
  }
};
newSubscription = async (req, res) => {
  try {
    const {
      subscriptionId,
      planId,
      planVariationId,
      customerId,
      cardId,
      notes,
      price,
    } = req.body;

    const idempotencyKey = new Date().getTime().toString();
    let version;
    if (subscriptionId) {
      const existingPlan = await getSubscriptionPlan(subscriptionId);
      version = existingPlan.version;
    }

    let response;
    let query;
    if (subscriptionId) {
      console.log("===== updating =====");
      query = {
        idempotencyKey: idempotencyKey,
        object: {
          type: "SUBSCRIPTION_PLAN",
          id: subscriptionId,
          subscriptionPlanData: {
            name: plan.name,
            phases: plan.frequency.map((e) => {
              return {
                cadence: e.name.toUpperCase(),
                pricing: {
                  type: "STATIC",
                  priceMoney: {
                    amount: e.price * 100,
                    currency: "USD",
                  },
                },
                ordinal: 1,
              };
            }),
          },
        },
      };
    } else {
      console.log("===== creating =====");
      query = {
        idempotencyKey: idempotencyKey,
        locationId: locationId,
        planVariationId: planVariationId,
        customerId: customerId,
        cardId: cardId,
        note: notes,
        source: {
          name: process.env.APP_NAME || "Habitoza",
        },
      };

      if (price) {
        query.priceOverrideMoney = {
          amount: price * 100,
          currency: "USD",
        };
      }
    }

    setTimeout(async () => {
      try {
        response = await client.subscriptionsApi.createSubscription(query);
        response = JSON.parse(serializeBigInt(response.result)) || {};
        response.success = true;

        return res.status(200).json(response);
        // return res.status(200).json({
        //   success: true,
        //   response
        // });
      } catch (e) {
        // return res.status(200).json(e.result);
        return res.status(200).json({
          success: false,
          result: e.result,
        });
      }
    }, 2000); // wait 2 sec
  } catch (error) {
    return res.status(200).json({
      success: false,
      result: error,
    });
  }
};

attachCard = async (req, res) => {
  try {
    const { customerId, nounce } = req.body;
    const idempotencyKey = crypto.randomUUID();
    const referenceId = nanoid();

    let response = await client.cardsApi.createCard({
      idempotencyKey: new Date().getTime().toString(),
      sourceId: nounce,
      card: {
        customerId: customerId,
      },
    });

    response = serializeBigInt(response.result.card) || {};
    return res.status(200).json(response);
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

disableCard = async (req, res) => {
  const { cardId, customerId } = req.body;
  try {
    const response = await client.cardsApi.disableCard(cardId);
    return res.status(200).json(response.result);
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

const getDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDate1 = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}-${year}`;
};

function serializeBigInt(obj) {
  return JSON.stringify(obj, (_, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
}

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
  getSubscriptionPlanVariations,

  createPlan,
  createItem,
  createSubscription,

  getTransactions,
  generatePaymentCard,

  processPayment,
  processSubscription,
  viewPayment,

  createDiscount,
  createTax,
  createOrderWithCharge,

  addSubscriptionPlan,
  addSubscription,
  subscription,

  newSubscriptionPlan,
  newSubscriptionPlanVariation,
  newSubscription,

  attachCard,
  disableCard,
};
