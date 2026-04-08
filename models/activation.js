import email from "infra/email.js";

async function sendEmailToUser(user) {
  await email.send({
    from: "TabRacing <contato@tabracing.com.br>",
    to: user.email,
    subject: "Ative seu cadastro no TabRacing",
    text: `Olá ${user.username},\n\nAtive seu cadastro no TabRacing clicando no link abaixo:\n\nhttp://localhost:3000/activate?token=some-activation-token\n\nObrigado por se cadastrar!`,
  });
}

const activation = {
  sendEmailToUser,
};

export default activation;
