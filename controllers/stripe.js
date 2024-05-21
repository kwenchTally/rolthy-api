const Stripe = require("stripe");
const key = process.env.STRIPE_KEY ?? "";
const stripe = new Stripe(key);

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

// payment/create/customer
addCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      description,
      phone,
      addressline1,
      addressline2,
      city,
      state,
      postalcode,
      country,
    } = req.body;

    const data = {
      name: name,
      email: email,
      description: description,
      phone: phone,
      address: {
        line1: addressline1,
        line2: addressline2,
        city: city,
        state: state,
        postal_code: postalcode,
        country: country,
      },
    };

    const result = await stripe.customers.create(data);
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// payment/create/paymentmethod
addPaymentMethod = async (req, res) => {
  try {
    const { customer, type, number, expmonth, expyear, cvc } = req.body;

    const data = {
      type: type,
      card: {
        number: number,
        exp_month: expmonth,
        exp_year: expyear,
        cvc: cvc,
      },
    };

    const result = await stripe.paymentMethods.create(data);
    await stripe.paymentMethods.attach(result.id, {
      customer: customer,
    });
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// payment/pay
makePayment = async (req, res) => {
  try {
    const { amount, currency, paymentmethod, customer } = req.body;

    const data = {
      amount: amount,
      currency: currency,
      payment_method: paymentmethod,
      customer: customer,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      return_url: "https://localhost:5000/api/payment/success",
    };

    const result = await stripe.paymentIntents.create(data);
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

paymentSuccess = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      msg: "Payment Done",
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
paymentFailed = async (req, res) => {
  try {
    res.status(200).json({
      status: 200,
      msg: "Payment Failed",
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// payment/charge
chargePayment = async (req, res) => {
  try {
    const {
      customer,
      name,
      email,
      addressline1,
      addressline2,
      city,
      state,
      postalcode,
      country,
      description,
      phone,
      payment,
      type,
      number,
      expyear,
      expmonth,
      cvc,
      amount,
      currency,
    } = req.body;

    if (customer == "") {
      const result1 = await stripe.customers.create(customerdata);
    }

    if (payment == "") {
      const result2 = await stripe.paymentMethods.create(paymentMethods);
      await stripe.paymentMethods.attach(result2.id, {
        customer: customer,
      });
    }

    const result = await stripe.paymentIntents.create(data["payment_intent"]);
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// payment/add/card
addCard = async (req, res) => {
  try {
    const { customer, type, number, expmonth, expyear, cvc } = req.body;

    const data = {
      card: {
        number: number,
        exp_month: expmonth,
        exp_year: expyear,
        cvc: cvc,
      },
    };

    const cardToken = await stripe.tokens.create(data);
    const result = await stripe.customers.createSource(customer, {
      source: cardToken.id,
    });
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// payment/add/card
getPaymentMethods = async (req, res) => {
  try {
    const { customer, type, number, expmonth, expyear, cvc } = req.body;
    const result = await stripe.paymentMethods.list({
      customer: customer,
      type: "card",
    });
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports = {
  payNow,

  addCustomer,
  addPaymentMethod,
  makePayment,
  paymentSuccess,
  paymentFailed,
  addCard,

  getPaymentMethods,
};
