const { vicopsApi } = require("vicops-api");
const { Readline } = require("easy-readline");
const fs = require("fs");
let sr = new Readline();

handle();

async function handle(){
    let resp = await sr.input("text", "Введите команду: ");
    resp = resp.toLowerCase();

    if(resp==="регистрация"){

    } else if(resp==="войти"){
        let user = new vicopsApi(await sr.input("text", "Введите логин: "), await sr.input("secure", "Введите пароль: "));
        console.table((await user.getUser()).private.balances);
    }
}