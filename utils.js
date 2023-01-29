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
};
