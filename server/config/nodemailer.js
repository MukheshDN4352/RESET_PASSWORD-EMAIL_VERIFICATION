import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    secure:true,

    port: 465,
    auth: {
        user: 'add your senders email Id',
        pass: 'add your password'
    }
});



export default transporter;
