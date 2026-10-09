import { SuccessState, TransactionType } from "@mx51/spi-client-js";
import { spi } from "../pages/Setting/PairingUI";
import logger from "../utils/logger";
// Log SPI events
function log(message, event) {
  // console.log("event running");
  if (event) {
    spi?._log.info(`${message} -> `, event);
    logger.log(`${message} -> ${JSON.stringify(event)}`);
  } else {
    spi?._log.info(message);
    logger.log(`${message}`);
    localStorage.setItem("eventMessage", message);
  }
}

/**
 * Event: StatusChanged
 * This method will be called when the terminal connection status changes
 **/


let DisplayMessage = "";
let date_time
let terminalStatus
let cuurentTxFlow
let sharedState = {
  transactionMessage: "",
}
document.addEventListener("StatusChanged", (e) => {
  log("Status changed", e);
  localStorage.setItem("terminalStatus", e?.detail);
  terminalStatus=e?.detail
  // console.log(e?.detail);
  if (e?.detail === "PairedConnected") {
    // code actions
  } else if (e?.detail === "Unpaired") {
    localStorage.removeItem("secrets");
  } else {

  }
});

/**
 * Event: SecretsChanged
 * For saving secrets after terminal paired (in order to keep current terminal instance activated)
 **/
document.addEventListener("SecretsChanged", (e) => {
  log("Secrets changed", e);

  if (e?.detail) {
    window.localStorage.setItem("secrets", JSON.stringify(e.detail));
  }
});

/**
 * Event: PairingFlowStateChanged
 * To get latest updates on the pairing process
 **/
document.addEventListener("PairingFlowStateChanged", (e) => {
  log("Pairing flow state changed", e);
  log(
    e?.detail?.AwaitingCheckFromEftpos && e?.detail?.AwaitingCheckFromPos
      ? `${e?.detail?.Message}: ${e?.detail?.ConfirmationCode}`
      : e?.detail?.Message
  );

  // if paring flow state of Successful and Finished turns to true, then we call terminal back to idle status
  if (e?.detail?.Successful && e?.detail?.Finished) {
    spi?.AckFlowEndedAndBackToIdle();
  }
});

/**
 * Event: TxFlowStateChanged
 * To get latest updates on the transaction flow
 **/


document.addEventListener("TxFlowStateChanged", (e) => {


  // console.log("flvjgfuldvshj;ofjvwhluwihfjd;igdfhgmdgsfhgdhfhmdgngbfndgbz",transactionMessage);
   if(!sharedState.transactionMessage){
  localStorage.setItem("transactionMessage", "Purchase In Progress");
  sharedState.transactionMessage="Purchase In Progress"
  console.log("TxFlowStateChanged");
   }
  
  localStorage.setItem(
    "lastTxPosId",
    e?.detail?.Request?.PosId
  );

  localStorage.setItem(
    "hostResponseText",
    e?.detail?.Response?.Data?.host_response_text
  );

  if( e?.detail?.Response?.Data?.error_detail){

    localStorage.setItem(
      "errorDetail",
      e?.detail?.Response?.Data?.error_detail
    )
  }
  else{
    localStorage.setItem(
      "errorDetail",
      e?.detail?.Response?.Data?.error_reason);
 ;}

  log("Transaction flow state changed", e);



  if (e?.detail?.Response?.Data?.host_response_text === "APPROVED" ||
     e?.detail?.Response?.Data?.host_response_text === "SIGNATURE APPROVED") {
    localStorage.setItem("transactionMessage", "Transaction Successful");
    cuurentTxFlow=e?.detail?.Success
    sharedState.transactionMessage="Transaction Successful"
    //  console.log("Host response text", e?.detail?.Response?.Data?.host_response_text);

  }
  
  if (e?.detail?.Response?.Data?.host_response_text === "USER CANCELLED" || e?.detail?.Success==="Failed"  ) {
    localStorage.setItem("transactionMessage", "Transaction Failed");
    cuurentTxFlow=e?.detail?.Success
    
    sharedState.transactionMessage="Transaction Failed"
    // console.log(transactionMessage);
  }

  if(e?.detail?.Success==="Unknown" ){
    cuurentTxFlow=e?.detail?.Success
  }

  if (e.detail.AwaitingSignatureCheck) {
    localStorage.setItem(
      "AwaitingSignatureCheck",
      e?.detail?.AwaitingSignatureCheck
    );
    localStorage.setItem(
      "SignatureReceipt",
      e?.detail?.SignatureRequiredMessage?._receiptToSign
    );
    // Display the MOTO phone authentication UI
  } else if (e.detail.Finished) {
    if (
      e.detail.Response.Data.merchant_receipt &&
      !e.detail.Response.Data.merchant_receipt_printed
    ) {
      localStorage.setItem(
        "merchant_receipt",
        e.detail.Response.Data.merchant_receipt
      );
    }

    if (
      e.detail.Response.Data.customer_receipt &&
      !e.detail.Response.Data.customer_receipt_printed
    ) {
      localStorage.setItem(
        "customer_receipt",
        e.detail.Response.Data.customer_receipt
      );
      // console.log("customer_receipt", e.detail.Response.Data.customer_receipt);
      // await printCustomerReceipt(e.detail.Response.Data.customer_receipt);
    }


  

    switch (e.detail.Success) {
      case SuccessState.Success:
        // Display the successful transaction UI adding detail for user (e.detail.Response.Data.host_response_text)
        // Close the sale on the POS
        switch (e.detail.Type) {
          case TransactionType.Purchase:
            // localStorage.setItem(
            //   "tip_amount",
            //   e.detail.Response.Data.tip_amount
            // );
           
            // console.log("esvfervgfaewsfgerasgfewagrtnagsf",date_time);
            
          //  localStorage.setItem(date)
            break;
          case TransactionType.Refund:
            // Perform actions after refunds only
            // date_time= e.detail.Request.DateTimeStamp
            
            break;
          default:
           
          // Perform actions after other transaction types
        }
        break;
      case SuccessState.Failed:
        // Display the failed transaction UI adding detail for user:
        // e.detail.Response.Data.error_detail
        // e.detail.Response.Data.error_reason
        // if (e.detail.Response.Data.host_response_text) {
        //     e.detail.Response.Data.host_response_text
        // }
        break;
      case SuccessState.Unknown:
     
       
        break;
      default:
      // Throw error: invalid success state
    }
  }
  // document.dispatchEvent(new Event("TxFlowStateChanged"));
});

/**
 * Event: DeviceAddressChanged
 * To get latest updates for device address resolution
 * The EFTPOS address should be saved and updated in your store every time it changes to enable reconnection after a disconnection
 **/
document.addEventListener("DeviceAddressChanged", (e) => {
  log("Device address changed", e);

  if (e?.detail.ip) {
    window.localStorage.setItem("eftposAddress", JSON.stringify(e.detail.ip));
  } else if (e?.detail.fqdn) {
    window.localStorage.setItem("eftposAddress", JSON.stringify(e.detail.fqdn));
  }
});

/**
 * Event: TerminalConfigurationResponse
 * To get latest terminal confirmation object data
 **/
function recoverTransaction(posRefId, txType) {
  spi.InitiateRecovery(posRefId, txType);
 
  log(`Recovering ${txType}`);
}

const spiEventFunctions = () => {
  // console.log("TERMIUNAL DATA FETCHING")
  if (spi) {
    spi.TerminalConfigurationResponse = (e) => {
      log("Terminal configuration response", e);
      if (e?.Data) {
        localStorage.setItem("terminalDetails", e?.DecryptedJson);
      }
      spi.GetTerminalStatus();
    };

    /**
     * Event: TerminalStatusResponse
     * To get latest terminal status object data
     **/
    spi.TerminalStatusResponse = (e) => {
      if (e) {
        localStorage.setItem("terminalData", JSON.stringify(e));
      }
      log("Terminal status response", e);
    };

    /**
     * Event: Transaction Update Message
     * To get latest transaction updates
     **/
    spi.TransactionUpdateMessage = (e) => {
      DisplayMessage = e.Data.display_message_text;
      // console.log("DisplayMessage",DisplayMessage);
      // localStorage.setItem("date_time",e.DateTimeStamp)
      date_time=e.DateTimeStamp
      log("Transaction update", e);
    };

    /**
     * Event: BatteryLevelChanged
     * To get latest updates for terminal battery level
     **/
    // console.log("lejvsbier;ahgf'o;iqPUEFWGHREUOWFId;iwfeugrwfeoiqhdIFUG",DisplayMessage)
    spi.BatteryLevelChanged = (e) => {
      log("Battery level changed", e);
    };
  }

};

// console.log(DisplayMessage);


export { log, spiEventFunctions ,DisplayMessage,sharedState ,cuurentTxFlow,terminalStatus,date_time,recoverTransaction};
