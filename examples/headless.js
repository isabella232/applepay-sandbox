async function config() {
  return await fetch(
    "https://cors-anywhere.herokuapp.com/https://www.sandbox.paypal.com/graphql?GetApplepayConfig",
    {
      method: "POST",
      // credentials: "include",
      // mode: "no-cors", // no-cors, *cors, same-origin
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `
          query GetApplepayConfig(
            $buyerCountry: CountryCodes!
            $clientId: String!
            $merchantId: [String]!
          ) {
            applepayConfig(
              buyerCountry: $buyerCountry
              clientId: $clientId
              merchantId: $merchantId
            ) {
              merchantCountry,
              supportedNetworks
            }
          }`,
        variables: {
          buyerCountry: "US",
          clientId:
            "AdVrVyh_UduEct9CWFHsaHRXKVxbnCDleEJdVOZdb52qSjrWkKDNd6E1CNvd5BvNrGSsXzgQ238dGgZ4",
          merchantId: ["2V9L63AM2BYKC"],
        },
      }),
    }
  )
    .then((res) => res.json())
    .catch(console.error);
}

async function setupApplepay() {
  //  const applepay = paypal.Applepay();
  /*
    const {
      isApplePayEligible,
      countryCode,
      currencyCode,
      merchantCapabilities,
      supportedNetworks,
    } = await  config() //applepay.getConfiguration();
  */
  //if (!isApplePayEligible) {
   // throw new Error("applepay is not eligible");
  // }

  document.getElementById("applepay-container").innerHTML =
    '<apple-pay-button id="btn-appl" buttonstyle="black" type="buy" locale="en">';

  document.getElementById("btn-appl").addEventListener("click", onClick);

  function onClick() {
    console.log("CLICK");

    const applePayPaymentRequest = {
      countryCode: "US",
      currencyCode: "USD",
      merchantCapabilities: ["supports3DS"],
      supportedNetworks: ["masterCard", "discover", "visa", "amex"],
      requiredShippingContactFields: [
        "name",
        "phone",
        "email",
        "postalAddress",
      ],
      total: {
        label: "Demo",
        type: "final",
        amount: "99.99",
      },
    };

    var session = new ApplePaySession(4, applePayPaymentRequest);

    session.onvalidatemerchant = (event) => {
        alert(event.validationURL)
      console.log({ validationUrl: event.validationURL });
      applepay
        .validateMerchant({
          validationUrl: event.validationURL,
        })
        .then((merchantSession) => {
          const session = atob(merchantSession.session);
          session.completeMerchantValidation(merchantSession);
        })
        .catch(() => {
          session.abort();
        });
    };

    session.onshippingcontactselected = (event) => {
      const shippingContactUpdate = {};
      session.completeShippingContactSelection(shippingContactUpdate);
    };

    session.onshippingmethodselected = (event) => {
      console.log("Your shipping method is:", event.shippingMethod);
      // Update payment details.
      var shippingMethodUpdate = {}; // https://developer.apple.com/documentation/apple_pay_on_the_web/applepayshippingmethodupdate
      session.completeShippingMethodSelection(shippingMethodUpdate); // Set shippingMethodUpdate=null if there are no updates.
    };

    session.begin();
  }
}

document.addEventListener("DOMContentLoaded", (event) => {
  setupApplepay().catch(console.log);
});