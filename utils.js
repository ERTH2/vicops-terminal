module.exports = {
  printBal: (balances) => {
    let curr = Object.keys(balances);
    let vals = Object.values(balances);
    for (let i = 0; i < curr.length; i++) console.log(`${vals[i]} ${curr[i]}`);
  },
  printHelp: () => {
    let help = [
      "регистрация",
      "войти",
      "транзакция",
      "история",
      "баланс",
      "купить",
      "продать",
      "заявки (на продажу)",
      "все заявки (на продажу)",
      "помощь",
      "эмиссия (только для ЦБ)",
    ];
    for (let h of help) console.log(h.green);
  },
  printTrans: (transactions, name) => {
    for (let transaction of transactions) {
      if (transaction.body.recipient === name)
        console.log(
          `${
            `+ ${transaction.body.amount.toFixed(5)} ${
              transaction.body.currency
            }`.green
          } от ${transaction.body.sender}. Комментарий: ${
            transaction.body.comment
          }`
        );
      else
        console.log(
          `${
            `- ${transaction.body.amount.toFixed(5)} ${
              transaction.body.currency
            }`.red
          } отправлено ${transaction.body.recipient}. Комментарий: ${
            transaction.body.comment
          }`
        );
    }
  },
  printBids: (bids) => {
    for (let bid of bids) {
      console.log(`${"--Заявка--".green}
      Покупка: ${bid.toBuy.green}
      Продажа: ${bid.toSell.red}
      Количество для продажи: ${bid.amount} ${bid.toSell.red}
      Курс: 1 ${bid.toSell} = ${bid.course} ${bid.toBuy}
      `);
    }
  },
};
