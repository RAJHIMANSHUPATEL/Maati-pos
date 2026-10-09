import { Spi as SpiClient, TransactionOptions } from "@mx51/spi-client-js";

export const spiConfiguration = () => {
  const spiSettings = {
    posVendorId: "Maati", // your POS company name/id
    posVersion: "2.2.2", // your POS version
    deviceApiKey: "M9Mg8DNcm031PEnwB8iMuLB1lP6bZP3r", // ask the integration support team for your API key
    countryCode: "AU", // if unsure check with integration support team
    secureWebSockets: window.location.protocol === "https:" ? true : false, // checks for HTTPs
    printMerchantCopyOnEftpos: false, // prints merchant receipt from terminal instead of POS
    promptForCustomerCopyOnEftpos: false, // prints customer receipt from terminal instead of POS
    signatureFlowOnEftpos: false, // signature flow and receipts on terminal instead of POS
    merchantReceiptHeader: "Maati", // custom text to be added to merchant receipt header
    merchantReceiptFooter: "Thank You", // custom text to be added to merchant receipt footer
    customerReceiptHeader: "Maati", // custom text to be added to customer receipt header
    customerReceiptFooter: "Thank You", // custom text to be added to customer receipt footer
  };

  SpiClient.GetAvailableTenants(
    spiSettings.countryCode,
    spiSettings.posVendorId,
    spiSettings.deviceApiKey
  ).then(({ Data: tenants }) => {
    localStorage.setItem("tenants", JSON.stringify(tenants));
    // store the desired tenant code
    // localStorage.setItem("tenantCode", tenants[0].code);
  });

  const pairingInput = {
    posId: "T1", // individual POS indentifier
    tenantCode: window.localStorage.getItem("tenantCode") || "gko", // this would be a dynamic value the user can select based on the GetAvailableTenants list
    serialNumber: "000-000-000", // the terminal serial number
    eftposAddress:
      JSON.parse(window.localStorage.getItem("eftposAddress")) || "192.168.0.1", // the terminal eftpos address
    autoAddressResolution: true, // this should always be set to true in order to handle IP address changes
    testMode: true, // this will be false when using Gecko Bank and true when using physical test terminals provided by payment providers
  };
  // console.log(pairingInput);

  // Retrieve the pairing secrets from local storage if they are there
  var spiSecrets = JSON.parse(window.localStorage.getItem("secrets"));

  const spi = new SpiClient(
    pairingInput.posId,
    pairingInput.serialNumber,
    pairingInput.eftposAddress,
    spiSecrets
  );

  spi.SetPosInfo(spiSettings.posVendorId, spiSettings.posVersion); // If not set, will get this error: Uncaught Error: Missing POS vendor ID and version. posVendorId and posVersion are required before starting

  return spi;
};

// spi.SetTestMode(pairingInput.testMode);

// // Set the client library to print merchant receipts on the terminal
// spi.Config.PrintMerchantCopy = spiSettings.printMerchantCopyOnEftpos;

// // Set the client library to prompt for customer receipts on the terminal
// spi.Config.PromptForCustomerCopyOnEftpos =
//     spiSettings.promptForCustomerCopyOnEftpos;

// Set the client library to handle the signature flow on the terminal (prompt for signature approval and print receipts)
// spi.Config.SignatureFlowOnEftpos = spiSettings.signatureFlowOnEftpos;

// const receiptOptions = new TransactionOptions();
// receiptOptions.SetMerchantReceiptHeader(spiSettings.merchantReceiptHeader);
// receiptOptions.SetMerchantReceiptFooter(spiSettings.merchantReceiptFooter);
// receiptOptions.SetCustomerReceiptHeader(spiSettings.customerReceiptHeader);
// receiptOptions.SetCustomerReceiptFooter(spiSettings.customerReceiptFooter);

// console.log(spi);

// spi.Start();

// export { spiSettings, spi, receiptOptions };
