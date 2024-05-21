const { Client, Environment, ApiError } = require("square");

const { nanoid } = require("nanoid");
const { json } = require("express");
// const { nanoid }  = require("nanoid-esm")
// console.log(nanoid())

const crypto = require("crypto");

const client = new Client({
  bearerAuthCredentials: {
    accessToken: process.env.SANDBOX_ACCESS_TOKEN,
  },
  environment: Environment.Sandbox,
});

const { locationsApi } = client;

//lists
getLocations = async (req, res) => {
  try {
    let listLocationsResponse = await locationsApi.listLocations();

    let locations = listLocationsResponse.result.locations;

    locations.forEach(function (location) {
      console.log(
        location.id +
          ": " +
          location.name +
          ", " +
          location.address.addressLine1 +
          ", " +
          location.address.locality
      );
    });

    return res.status(200).json({
      cnt: locations.length,
      locations,
    });
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

    // return res.status(200).json({
    //     cnt: locations.length,
    //     locations
    // })
    return res.status(200).json(JSON.parse(response.body));
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
    // const response = await client.paymentsApi.listPayments()
    // const response = await client.paymentsApi.listPayments({limit: 50})
    // const response = await client.cardsApi.listCards({limit: 50})
    const response = await client.cardsApi.listCards();
    console.log(response.result);

    // return res.status(200).json({
    //     cnt: locations.length,
    //     locations
    // })
    // return res.status(200).json({
    //     response
    // })
    return res.status(200).json(JSON.parse(response.body));
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
    // const response = await client.paymentsApi.listPayments()
    // const response = await client.paymentsApi.listPayments({limit: 50})
    const response = await client.paymentsApi.listPayments();
    console.log(response.result);

    // return res.status(200).json({
    //     cnt: locations.length,
    //     locations
    // })
    // return res.status(200).json({
    //     response
    // })
    return res.status(200).json(JSON.parse(response.body));
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
    return res.status(200).json(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "server error" });
  }
};

getSubscriptions = async (req, res) => {
  try {
    const response = await client.subscriptionsApi.searchSubscriptions();

    console.log(response.result);
    return res.status(200).json(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "server error" });
  }
};

//create

createCustomer = async (req, res) => {
  try {
    const response = await client.customersApi.createCustomer({
      givenName: "Amelia",
      familyName: "Earhart",
      emailAddress: "Amelia.Earhart@example.com",
      address: {
        addressLine1: "500 Electric Ave",
        addressLine2: "Suite 600",
        locality: "New York",
        administrativeDistrictLevel1: "NY",
        postalCode: "10003",
        country: "US",
      },
      phoneNumber: "+1-212-555-4240",
      referenceId: "YOUR_REFERENCE_ID",
      note: "a customer",
    });

    console.log(response.result);
    return res.status(200).json(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "server error" });
  }
};

createCard = async (req, res) => {
  try {
    const idempotencyKey = crypto.randomUUID();
    const sourceId = process.env.SANDBOX_APP_ID;
    const locationId = process.env.SANDBOX_LOCATION_ID;

    const referenceId = nanoid();

    const token = process.env.SANDBOX_APP_ID;

    const data = {
      // idempotencyKey: '4935a656-a929-4792-b97c-8848be85c27c',
      idempotencyKey: idempotencyKey,
      // sourceId: 'cnon:uIbfJXhXETSP197M3GB',
      sourceId: "cnon:card-nonce-ok",
      //cnon:card-nonce-ok [card, digital payments]
      //bnon:bank-nonce-ok [bank ach]
      //ccof:customer-card-id-ok

      card: {
        cardholderName: "Amelia Earhart",
        billingAddress: {
          addressLine1: "500 Electric Ave",
          addressLine2: "Suite 600",
          locality: "New York",
          administrativeDistrictLevel1: "NY",
          postalCode: "10003",
          country: "US",
        },
        // customerId: 'VDKXEEKPJN48QDG3BGGFAK05P8',
        customerId: "FA40CZHXMH3W34ARJS8V5FQKW8",
        // referenceId: 'user-id-1'
        referenceId: referenceId,
      },
    };

    // const payment = Square.payments()

    const response = await client.cardsApi.createCard(data);

    console.log(response.result);
    return res.status(200).json(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "server error" });
  }
};

verifyBuyer = async (req, res) => {
  try {
    const idempotencyKey = crypto.randomUUID();
    const sourceId = process.env.SANDBOX_APP_ID;
    const locationId = process.env.SANDBOX_LOCATION_ID;

    const referenceId = nanoid();

    // const token = process.env.SANDBOX_APP_ID
    const token = "ccof:CA4SEN6gZWTdNrxbJihe-9LrQ6coAg";

    // const data = {
    //   // idempotencyKey: '4935a656-a929-4792-b97c-8848be85c27c',
    //   idempotencyKey: idempotencyKey,
    //   // sourceId: 'cnon:uIbfJXhXETSP197M3GB',
    //   sourceId: "cnon:card-nonce-ok",
    //   //cnon:card-nonce-ok [card, digital payments]
    //   //bnon:bank-nonce-ok [bank ach]
    //   //ccof:customer-card-id-ok

    //   card: {
    //     cardholderName: 'Amelia Earhart',
    //     billingAddress: {
    //       addressLine1: '500 Electric Ave',
    //       addressLine2: 'Suite 600',
    //       locality: 'New York',
    //       administrativeDistrictLevel1: 'NY',
    //       postalCode: '10003',
    //       country: 'US'
    //     },
    //     // customerId: 'VDKXEEKPJN48QDG3BGGFAK05P8',
    //     customerId: 'FA40CZHXMH3W34ARJS8V5FQKW8',
    //     // referenceId: 'user-id-1'
    //     referenceId: referenceId
    //   }
    // }
    const data = {
      amount: "1.00",
      /* collected from the buyer */
      billingContact: {
        addressLines: ["123 Main Street", "Apartment 1"],
        familyName: "Doe",
        givenName: "John",
        email: "jondoe@gmail.com",
        countryCode: "GB",
        phone: "3214563987",
        state: "LND",
        city: "London",
      },
      currencyCode: "GBP",
      intent: "CHARGE",
    };

    // const payment = Square.payments()

    // const response = await client.cardsApi.createCard(data);
    const response = await client.cardsApi.verifyBuyer({
      token,
      // verificationDetails
      data,
    });

    console.log(response.result);
    return res.status(200).json(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "server error" });
  }
};

createPayment = async (req, res) => {
  try {
    // const payload = await json(req)

    // const idempotencyKey = req.body.idempotencyKey || nanoid()
    // const idempotencyKey = payload.idempotencyKey || nanoid()
    const idempotencyKey = crypto.randomUUID();
    // const sourceId = req.body.sourceId
    // const locationId = req.body.locationId
    // const sourceId = payload.sourceId
    // const locationId = payload.locationId
    // const sourceId = process.env.SANDBOX_APP_ID
    const locationId = process.env.SANDBOX_LOCATION_ID;

    const referenceId = nanoid();

    const token = "ccof:CA4SEN6gZWTdNrxbJihe-9LrQ6coAg";

    // console.log(JSON.stringify(payload))
    // console.log(JSON.stringify(req))
    console.log(idempotencyKey);
    // console.log(sourceId)
    console.log(locationId);
    console.log(referenceId);
    console.log(token);

    // const response = await client.paymentsApi.createPayment({
    //   // sourceId: 'ccof:GaJGNaZa8x4OgDJn4GB',
    //   sourceId: sourceId,
    // //   idempotencyKey: '7b0f3ec5-086a-4871-8f13-3c81b3875218',
    //   idempotencyKey: idempotencyKey,
    //   amountMoney: {
    //     amount: 1000,
    //     currency: 'USD'
    //   },
    //   appFeeMoney: {
    //     amount: 10,
    //     currency: 'USD'
    //   },
    //   autocomplete: true,
    //   customerId: 'W92WH6P11H4Z77CTET0RNTGFW8',
    //   locationId: 'L88917AVBK2S5',
    //   referenceId: '123456',
    //   note: 'Brief description'
    // });

    // get the currency for the location
    // const locationResponse = await locationsApi.retrieveLocation(process.env.SQUARE_LOCATION_ID);
    const locationResponse = await locationsApi.retrieveLocation(locationId);
    const currency = locationResponse.result.location.currency;
    console.log(currency);

    // const response1 = await client.cardsApi.createCard(

    // );

    const response = await client.paymentsApi.createPayment({
      //   idempotencyKey: '7b0f3ec5-086a-4871-8f13-3c81b3875218',
      idempotencyKey: idempotencyKey,
      locationId: locationId,

      // sourceId: 'ccof:GaJGNaZa8x4OgDJn4GB',
      sourceId: "ccof:CA4SEN6gZWTdNrxbJihe-9LrQ6coAg",
      // sourceId: sourceId,
      // sourceId: token,
      amountMoney: {
        amount: 1000,
        // currency: 'USD'
        currency: currency,
      },
      appFeeMoney: {
        amount: 10,
        // currency: 'USD'
        currency: currency,
      },
      autocomplete: true,
      // customerId: 'W92WH6P11H4Z77CTET0RNTGFW8',
      customerId: "FA40CZHXMH3W34ARJS8V5FQKW8",
      // locationId: 'L88917AVBK2S5',
      // referenceId: '123456',
      referenceId: referenceId,
      note: "Brief description",
    });

    console.log(response.result);
    return res.status(200).json(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "server error" });
  }
};

//items
createCatalog = async (req, res) => {
  try {
    const idempotencyKey = crypto.randomUUID();
    const locationId = process.env.SANDBOX_LOCATION_ID;
    const referenceId = nanoid();
    // const cardId = "ccof:CA4SEN6gZWTdNrxbJihe-9LrQ6coAg"
    // const customerId = 'FA40CZHXMH3W34ARJS8V5FQKW8'

    const data = {
      // idempotencyKey: '3160f000-e09f-4c69-acd8-8b4a822a9772',
      idempotencyKey: idempotencyKey,
      object: {
        type: "ITEM",
        id: "#coffee",
        itemData: {
          name: "Coffee",
          description: "Coffee Drink",
          abbreviation: "Co",
          variations: [
            {
              type: "ITEM_VARIATION",
              id: "#small_coffee",
              itemVariationData: {
                itemId: "#coffee",
                name: "Small",
                pricingType: "FIXED_PRICING",
                priceMoney: {
                  amount: 300,
                  currency: "USD",
                },
              },
            },
            {
              type: "ITEM_VARIATION",
              id: "#medium_coffee",
              itemVariationData: {
                itemId: "#coffee",
                name: "Medium",
                pricingType: "FIXED_PRICING",
                priceMoney: {
                  amount: 325,
                  currency: "USD",
                },
              },
            },
            {
              type: "ITEM_VARIATION",
              id: "#large_coffee",
              itemVariationData: {
                itemId: "#coffee",
                name: "Large",
                pricingType: "FIXED_PRICING",
                priceMoney: {
                  amount: 350,
                  currency: "USD",
                },
              },
            },
          ],
        },
      },
    };

    // const data = {
    //   // idempotencyKey: '{UNIQUE_KEY}',
    //   idempotencyKey: idempotencyKey,
    //   object: {
    //     // type: 'SUBSCRIPTION_PLAN',
    //     id: '#1',
    //     subscriptionPlanData: {
    //       // name: 'Coffee Subscription',
    //       name: 'Rolthy\'s Coffee Subscription',
    //       eligibleCategoryIds: [
    //         '2CJLFP5C6G74W3U3HD5YAE5W'
    //       ],
    //       allItems: false
    //     }
    //   }
    // }

    // const data = {
    //   // idempotencyKey: '{UNIQUE_KEY}',
    //   idempotencyKey: idempotencyKey,
    //   object: {
    //     type: 'SUBSCRIPTION_PLAN_VARIATION',
    //     id: '#1',
    //     subscriptionPlanVariationData: {
    //       name: 'Coffee of the Month Club',
    //       phases: [
    //         {
    //           cadence: 'MONTHLY',
    //           periods: 1,
    //           ordinal: 0,
    //           pricing: {
    //             type: 'STATIC'
    //           }
    //         },
    //         {
    //           cadence: 'MONTHLY',
    //           ordinal: 1,
    //           pricing: {
    //             type: 'RELATIVE',
    //             discountIds: [
    //               '5PFBH6YH5SB2F63FOIHJ7HWR'
    //             ]
    //           }
    //         }
    //       ],
    //       subscriptionPlanId: 'VVH3YXQSQATSL3XR4LIKD3QM'
    //     }
    //   }
    // }

    // const data = {
    //   // idempotencyKey: '{UNIQUE_KEY}',
    //   idempotencyKey: idempotencyKey,
    //   object: {
    //     type: 'SUBSCRIPTION_PLAN',
    //     id: 'VVH3YXQSQATSL3XR4LIKD3QM',
    //     version: 1668025692208,
    //     subscriptionPlanData: {
    //       name: 'Unlimited refills',
    //       subscriptionPlanVariations: [
    //         {
    //           type: 'SUBSCRIPTION_PLAN_VARIATION',
    //           id: 'CUPS23SKJ7J4FD4F3IMVAEOH',
    //           updatedAt: '2022-11-09T20:52:58.857Z',
    //           version: 1668027178857,
    //           presentAtAllLocations: true,
    //           subscriptionPlanVariationData: {
    //             name: 'Coffee of the Month Club',
    //             phases: [
    //               {
    //                 uid: 'CR7TS35JYEVXC5BSDV5N7Z4Y',
    //                 cadence: 'MONTHLY',
    //                 periods: 1,
    //                 ordinal: 0,
    //                 pricing: {
    //                   type: 'STATIC'
    //                 }
    //               },
    //               {
    //                 uid: 'AW9ES43NVGRFC8AQRK8J5X1S',
    //                 cadence: 'MONTHLY',
    //                 ordinal: 1,
    //                 pricing: {
    //                   type: 'RELATIVE',
    //                   discountIds: [
    //                     '5PFBH6YH5SB2F63FOIHJ7HWR'
    //                   ]
    //                 }
    //               }
    //             ],
    //             subscriptionPlanId: 'VVH3YXQSQATSL3XR4LIKD3QM'
    //           }
    //         }
    //       ],
    //       eligibleCategoryIds: [
    //         '2CJLFP5C6G74W3U3HD5YAE5W'
    //       ],
    //       allItems: false
    //     }
    //   }
    // }

    const response = await client.catalogApi.upsertCatalogObject(data);
    console.log(response.result);
    return res.status(200).json(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "server error" });
  }
};

createSubscrition = async (req, res) => {
  try {
    const idempotencyKey = crypto.randomUUID();
    const locationId = process.env.SANDBOX_LOCATION_ID;
    const referenceId = nanoid();
    const cardId = "ccof:CA4SEN6gZWTdNrxbJihe-9LrQ6coAg";
    const customerId = "FA40CZHXMH3W34ARJS8V5FQKW8";

    const data = {
      // idempotencyKey: '8193148c-9586-11e6-99f9-28cfe92138cf',
      idempotencyKey: idempotencyKey,
      // locationId: 'S8GWD5R9QB376',
      locationId: locationId,
      planVariationId: "6JHXF3B2CW3YKHDV4XEM674H",
      // customerId: 'CHFGVKYY8RSV93M5KCYTG4PN0G',
      customerId: customerId,
      startDate: "2023-06-20",
      // canceled_date: '2023-06-20',
      // cardId: 'ccof:qy5x8hHGYsgLrp4Q4GB',
      cardId: cardId,
      // tax_percentage: 7.5, //7.5%
      timezone: "America/Los_Angeles",
      source: {
        // name: 'My Application'
        name: process.env.APP_NAME,
      },
      phases: [
        {
          ordinal: 0,
          orderTemplateId: "U2NaowWxzXwpsZU697x7ZHOAnCNZY",
        },
      ],
    };

    const response = await client.subscriptionsApi.createSubscription(data);
    console.log(response.result);
    return res.status(200).json(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "server error" });
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
    return res.status(200).json({ message: "server error" });
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
    return res.status(200).json({ message: "server error" });
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

  // addCustomer,
  // addPaymentMethod,
  // makePayment,
  // paymentSuccess,
  // paymentFailed,
  // addCard,

  // getPaymentMethods,
};
