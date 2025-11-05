import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';
import htmlToImage from 'node-html-to-image';
import { generateUserCertificate } from '../templates/certificate';

const { EMAIL_HOST, SENDER_EMAIL, EMAIL_HOST_PORT, SENDER_EMAIL_PASSWORD } = process.env;

const emailContent = fs.readFileSync(
  path.resolve(__dirname, '../templates/email-content.hbs'),
  'utf8'
);
const generalContent = fs.readFileSync(path.resolve(__dirname, '../templates/general.hbs'), 'utf8');

const emailContentTemplate = Handlebars.compile(emailContent);
const emailTemplate = Handlebars.compile(generalContent);

export const emailSender = async ({ label, receiver, subject, body, isCertificate = false }) => {
  const { fullName, courseName, dateOfCompletion, firstName } = body;
  if (isCertificate) {
    const imageHTML = generateUserCertificate({
      firstName,
      fullName,
      courseName,
      dateOfCompletion,
    });

    await htmlToImage({
      output: './image.png',
      html: imageHTML,
    });
  }

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_HOST_PORT,
    auth: {
      user: SENDER_EMAIL,
      pass: SENDER_EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: { name: label, address: SENDER_EMAIL },
    to: receiver,
    subject,
    html: isCertificate ? emailContentTemplate(body) : emailTemplate(body),
    ...(isCertificate && {
      attachments: [
        {
          filename: 'image.png',
          path: `./image.png`,
          cid: 'uniq-mailtrap.png',
        },
      ],
    }),
  };
  transporter.sendMail(mailOptions);
};
