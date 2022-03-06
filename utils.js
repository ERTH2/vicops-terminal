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
      "обмен",
      "курс",
      "помощь",
    ];
    for (let h of help) console.log(h.blue);
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
};
