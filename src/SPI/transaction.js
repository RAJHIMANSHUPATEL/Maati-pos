import { v4 as uuid } from "uuid";

import { TransactionOptions } from "@mx51/spi-client-js";
// import { log } from "./events";
import { spi, spiSettings } from "../pages/Setting/PairingUI";

const receiptOptions = new TransactionOptions();
receiptOptions.SetMerchantReceiptHeader(spiSettings.merchantReceiptHeader);
receiptOptions.SetMerchantReceiptFooter(spiSettings.merchantReceiptFooter);
receiptOptions.SetCustomerReceiptHeader(spiSettings.customerReceiptHeader);
receiptOptions.SetCustomerReceiptFooter(spiSettings.customerReceiptFooter);

// This generates a unique posRefId for each transaction request
function posRefIdGenerator(type) {
  return new Date().toISOString() + "-" + type + uuid();
}

/*
 * Initiates a purchase transaction
 * Be subscribed to TxFlowStateChanged event to get updates on the process
 * Tip and cashout are not allowed simultaneously
 *
 * @param posRefId - A unique identifier for your Order/Purchase
 * @param purchaseAmount - The Purchase amount in cents
 * @param tipAmount - The Tip amount in cents
 * @param cashoutAmount - The Cashout amount in cents
 * @param promptForCashout - Whether to prompt your customer for cashout on the Eftpos
 * @param options - Set custom Header and Footer text for the Receipt
 * @param surchargeAmount - The Surcharge amount in cents
 */
let reference_id;
function purchase(
  purchaseAmount,
  tipAmount,
  cashoutAmount,
  promptForCashout,
  surchargeAmount
) {
  spi.AckFlowEndedAndBackToIdle();
  reference_id = posRefIdGenerator("purchase");
  // console.log(reference_id);

  spi.InitiatePurchaseTxV2(
    reference_id, // posRefId
    purchaseAmount,
    tipAmount,
    cashoutAmount,
    promptForCashout,
    receiptOptions, // options
    surchargeAmount
  );
}

/*
 * Initiates a refund transaction
 * Be subscribed to TxFlowStateChanged event to get updates on the process
 *
 * @param posRefId - A unique identifier for your Refund
 * @param amountCents - The amount in cents
 * @param options - Set custom Header and Footer text for the Receipt
 */

function cancelTransaction() {
  // console.log("cancelTransaction");
  const data = spi.CancelTransaction();
  // console.log(data);
}

export {
  purchase,cancelTransaction,reference_id
};
