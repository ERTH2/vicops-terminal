module.exports = {
  printBal: (balances) => {
    let curr = Object.keys(balances);
    let vals = Object.values(balances);
    for (let i = 0; i < curr.length; i++) console.log(`${vals[i]} ${curr[i]}`);
  },
  printUserData: (data) => {
    console.log(data.name, data.second_name, `(${data._id})`);
    console.log("Страна:", data.country);
    if (data.confirmed !== true) {
      console.log(
        "Ваш аккаунт не подтвержден, ждите подтверждения. Без подтверждения невозможно совершать транзакции."
          .red.bgWhite
      );
    }
    if (data.blocked === true) {
      console.log("Ваш аккаунт заблокирован в vicops".bgRed.white);
    }
  },
  printTrans: (transactions, name) => {
    for (let transaction of transactions) {
      if (transaction.recipient_id === name)
        console.log(
          `${
            `+ ${transaction.amount.toFixed(5)} ${transaction.currency_id}`
              .green
          } от ${transaction.sender_id}. (${
            transaction.comment || "комментария нет"
          })`
        );
      else
        console.log(
          `${
            `- ${transaction.amount.toFixed(5)} ${transaction.currency_id}`.red
          } отправлено ${transaction.recipient_id}. (${
            transaction.comment || "комментария нет"
          })`
        );
    }
  },
};
