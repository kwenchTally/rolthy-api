document.addEventListener("DOMContentLoaded", (event) => {
  const modal = document.getElementById("paymentModal");
  const btn = document.getElementById("openModal");
  const span = document.getElementsByClassName("close")[0];

  btn.onclick = function () {
    modal.style.display = "block";
  };

  span.onclick = function () {
    modal.style.display = "none";
  };

  window.onclick = (function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  })(
    // Square Payment Form
    async () => {
      const sourceId = "<%= sourceId %>";
      const locationId = "<%= locationId %>";

      const payments = Square.payments(sourceId, locationId);
      const cardOptions = {
        style: {
          input: {
            // backgroundColor: "white",
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
    }
  )();
});
