"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const template = require("../template");
class EmailService {
    emailSend({ emails, subject, message, link, }) {
        const emailCredentials = {
            from: '"Stream Student" <noreply@streamstudent.io>',
            to: emails,
            subject: subject,
            html: link
                ? template.linkEmail(message, link)
                : template.normalMailBody(message),
        };
        return new Promise((resolve, reject) => {
            let transport = nodemailer_1.default.createTransport({
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
                return resolve(info);
            })
                .catch((err) => {
                return resolve(err);
            });
        });
    }
}
exports.default = EmailService;
