import nodemailer from "nodemailer";
const template = require("../template");

export default class EmailService {
  public emailSend({
    emails,
    subject,
    message,
    link,
  }: {
    emails: string | string[];
    subject: string;
    message: string;
    link?: string;
  }): any {
    const emailCredentials = {
      from: '"Stream Student" <noreply@streamstudent.io>',
      to: emails,
      subject: subject,
      html: link
        ? template.linkEmail(message, link)
        : template.normalMailBody(message),
    };
    // console.log(emailCredentials);

    return new Promise((resolve, reject) => {
      // const transport = nodemailer.createTransport({
      //   service: host,
      //   auth: {
      //     user: email,
      //     pass: password,
      //   },
      // });

      let transport = nodemailer.createTransport({
        host: "smtp.zeptomail.in",
        port: 587,
        auth: {
          user: "emailapikey",
          pass: "PHtE6r0KQL2+3mQs+hNSsfS7F5T3MNh/+O4yf1FPudlAXqMASk0Bo40plTTh+R8sBPQTQfWZyI065+vJtbrWcWu8NWdJCGqyqK3sx/VYSPOZsbq6x00VsVsTcETVUYbqetVt3S3Vs9bYNA==",
        },
      });
      transport
        .sendMail(emailCredentials)
        .then((info) => {
          // console.log({ info });
          return resolve(info);
        })
        .catch((err) => {
          // console.log({ err });
          return resolve(err);
        });
    });
  }
}
