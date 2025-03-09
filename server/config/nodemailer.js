import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    secure:true,

    port: 465,
    auth: {
        user: 'mukeshdn2005@gmail.com',
        pass: 'mkirmbtkvzfwwcbi'
    }
});



export default transporter;
