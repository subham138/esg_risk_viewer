// const accessToken = require('../googleAccessToken.json'),
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.PORT,
  secure: false,
  auth: {
    user: process.env.USER,
    pass: process.env.PASSWORD
  },
  tls: {
    rejectUnauthorized: true
  }
});

const project_url = 'https://platform.esgriskviewer.com/';
// const project_url = 'https://localhost:3000/';

// const SendUserEmail = (emailId) => {
const SendUserEmail = (emailId, user_name, enc_dt) => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: process.env.EMAIL,
      to: `${emailId}`,
      subject: "ESG Risk Viewer | Password Reset",
        html: `<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-top: 10px solid #1a636e;
            /* Brand Teal */
        }

        .content {
            padding: 40px 30px;
            color: #333333;
            line-height: 1.6;
        }

        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }

        .instruction-text {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-top: 40px;
            margin-bottom: 25px;
            color: #000000;
        }

        .button-container {
            text-align: center;
            margin-bottom: 20px;
        }

        .reset-button {
            background-color: #1a636e;
            color: #ffffff !important;
            padding: 12px 35px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
            font-size: 18px;
        }

        .validity-text {
            text-align: center;
            font-size: 16px;
            margin-bottom: 40px;
        }

        .footer {
            background-color: #f0f0f0;
            padding: 25px 30px;
            border-top: 1px solid #e0e0e0;
        }

        .logo-text {
            font-size: 24px;
            font-weight: bold;
            color: #1a636e;
            display: flex;
            align-items: center;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="content">
            <div class="greeting">Hi <strong>${user_name}</strong>,</div>

            <div>
                We’ve received a request to reset your password. If this wasn’t you, you can safely ignore this email.
            </div>

            <div class="instruction-text">
                To reset your password please click the link below.
            </div>

            <div class="button-container">
                <a href="${project_url}reset_pass?enc_dt=${enc_dt}" class="reset-button">Reset Password</a>
            </div>

            <div class="validity-text">
                This link is valid for 15 minutes.
            </div>

            <div style="margin-top: 30px; font-size: 15px;">
                You can request a new link by returning to the login page and following the forgotten password or reset
                password process.
            </div>
        </div>

        <div class="footer">
            <div class="logo-text">
                <a href="${project_url}"><img class="img-fluid" src="https://platform.esgriskviewer.com/images/logo_col.png" alt="" style=" width: 200px; height: auto; "></a>
            </div>
        </div>
    </div>
</body>
</html>`,
    //   html: `<!DOCTYPE html>
    //         <head>
    //         <meta charset="utf-8">
    //         <title>Index</title>
            
    //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
            
                
    //         <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet"> 
                
    //         </head>
    //         <style>
    //             body{ width: 650px; font-family: 'IBM Plex Sans', sans-serif; background-color: #f6f7fb; display: block; }
    //             a{ text-decoration: none; }
    //             span { font-size: 14px; }
    //             p { font-size: 13px; line-height: 1.7; letter-spacing: 0.7px; margin-top: 0; }
    //             .text-center{ text-align: center }
    //             h6 { font-size: 16px; margin: 0 0 18px 0; }
    //             .btn-custom { background: none; color: #000; border: 2px solid #7030A0; }
    //             .btn-custom:hover { background: #7030A0; color: #fff; }
    //         </style>    
            
    //         <body style="margin: 30px auto;">
    //             <table style="width: 100%; border: 1px solid #24695c;">
    //                 <tbody>
    //                     <tr>
    //                         <td>
    //                             <table style="background-color: #f6f7fb; width: 100%">
    //                                 <tbody>
    //                                     <tr>
    //                                         <td>
    //                                             <table style="width: 650px; margin: 0 auto;">
    //                                                 <tbody>
    //                                                     <tr>
    //                                                         <td style="text-align: start;"><a href="${project_url}"><img class="img-fluid"
    //                                                                     src="https://platform.esgriskviewer.com/images/logo_col.png" alt=""
    //                                                                     style=" width: 290px; height: auto; "></a></td>
    //                                                         <!-- <td style="text-align: right; color:#999"><span>Password Reset</span>
    //                                                         </td> -->
    //                                                     </tr>
    //                                                 </tbody>
    //                                             </table>
    //                                         </td>
    //                                     </tr>
    //                                 </tbody>
    //                             </table>
    //                             <table style="width: 650px; margin: 0 auto; background-color: #fff; border-radius: 8px">
    //                                 <tbody>
    //                                     <tr>
    //                                         <td style="padding: 30px;">
    //                                             <h6 style="font-weight: 600; font-size: 18px;">Hi ${user_name},</h6>
    //                                             <p>You have requested a new password.</p>
    //                                             <p>Click on this link to reset your password:</p>
    //                                             <p style="text-align: start;"><a class="btn-custom" href="${project_url}reset_pass?enc_dt=${enc_dt}"
    //                                                     style="padding: 10px; display: inline-block; border-radius: 4px;font-weight:600;">Reset
    //                                                     Password</a></p>
    //                                             <p>This link will expire in 2 hours.</p>
    //                                             <p>Your new password must contain:</p>
    //                                             <ul>
    //                                                 <li><p>8 characters or more</p></li>
    //                                                 <li><p>At least 1 number</p></li>
    //                                                 <li><p>At least 1 special character</p></li>
    //                                             </ul>
    //                                             <p>If you haven't requested a password and believe this email has been sent in error, please contact us.</p>
    //                                             <p style="margin-bottom: 0">
    //                                                 ESG Risk Viewer</p>
    //                                         </td>
    //                                     </tr>
    //                                 </tbody>
    //                             </table>
    //                             <table style="width: 650px; margin: 0 auto; margin-top: 30px">
    //                                 <tbody>
    //                                     <tr style="text-align: center">
    //                                         <td>
    //                                             <p style="color: #999; margin-bottom: 0">Powered By ESG Risk Viewer</p>
    //                                         </td>
    //                                     </tr>
    //                                 </tbody>
    //                             </table>
    //                         </td>
    //                     </tr>
    //                 </tbody>
    //             </table>
    //         </body>
    //     </html>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        resolve({ suc: 0, msg: error })
      } else {
        console.log('Email sent:', info.response);
        resolve({ suc: 1, msg: info.response })
      }
    });
  })
}

const sendOtp = (emailId, user_name, otp) => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: process.env.EMAIL,
      to: `${emailId}`,
      subject: "ESG Risk Viewer | Access Code",
        html: `<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }

        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-top: 10px solid #006666;
            /* Matching the top teal bar */
        }

        .content {
            padding: 40px 30px;
            color: #333333;
            line-height: 1.6;
        }

        .greeting {
            font-size: 18px;
            margin-bottom: 30px;
        }

        .code-title {
            text-align: center;
            font-size: 20px;
            margin-bottom: 10px;
        }

        .verification-code {
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 2px;
            margin: 20px 0;
            color: #000000;
        }

        .expiry-text {
            font-size: 14px;
            color: #555555;
            margin-top: 30px;
        }

        .footer {
            background-color: #f0f0f0;
            padding: 20px 30px;
            border-top: 1px solid #e0e0e0;
        }

        .logo-section {
            display: flex;
            align-items: center;
        }

        .support-link {
            color: #0066cc;
            text-decoration: underline;
        }

        .disclaimer {
            font-size: 12px;
            color: #888888;
            margin-top: 20px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="content">
            <div class="greeting">Hi <strong>${user_name}</strong>,</div>

            <div class="code-title">Your verification code is:</div>
            <div class="verification-code">${otp}</div>

            <div class="expiry-text">
                This code will expire in 60 minutes. If you did not request this code, you can safely ignore this email.
            </div>

            <div style="margin-top: 20px;">
                If you have any questions, please <a href="mailto:support@esgriskviewer.com"
                    class="support-link">contact Support</a>.
            </div>

            <div class="disclaimer">
                This email is automated. Please do not reply.
            </div>
        </div>

        <div class="footer">
            <div style="font-size: 24px; font-weight: bold; color: #004d4d;">
                <a href="${project_url}"><img class="img-fluid" src="https://platform.esgriskviewer.com/images/logo_col.png" alt="" style=" width: 200px; height: auto; "></a>
            </div>
        </div>
    </div>
</body>
</html>`,
    //   html: `<!DOCTYPE html>
    //     <head>
    //     <meta charset="utf-8">
    //     <title>Index</title>
        
    //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
            
    //     <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet"> 
            
    //     </head>
    //     <style>
    //         body{ width: 650px; font-family: 'IBM Plex Sans', sans-serif; background-color: #f6f7fb; display: block; }
    //         a{ text-decoration: none; }
    //         span { font-size: 14px; }
    //         p { font-size: 13px; line-height: 1.7; letter-spacing: 0.7px; margin-top: 0; }
    //         .text-center{ text-align: center }
    //         h6 { font-size: 16px; margin: 0 0 18px 0; }
    //     </style>    
        
    //     <body style="margin: 30px auto;">
    //         <table style="width: 100%; border: 1px solid #24695c;">
    //             <tbody>
    //                 <tr>
    //                     <td>
    //                         <table style="background-color: #f6f7fb; width: 100%">
    //                             <tbody>
    //                                 <tr>
    //                                     <td>
    //                                         <table style="width: 650px; margin: 0 auto;">
    //                                             <tbody>
    //                                                 <tr>
    //                                                     <td style="text-align: start;"><a href="${project_url}"><img class="img-fluid"
    //                                                                 src="https://platform.esgriskviewer.com/images/logo_col.png" alt=""
    //                                                                 style=" width: 290px; height: auto; "></a></td>
    //                                                     <!-- <td style="text-align: right; color:#999"><span>Password Reset</span>
    //                                                     </td> -->
    //                                                 </tr>
    //                                             </tbody>
    //                                         </table>
    //                                     </td>
    //                                 </tr>
    //                             </tbody>
    //                         </table>
    //                         <table style="width: 650px; margin: 0 auto; background-color: #fff; border-radius: 8px">
    //                             <tbody>
    //                                 <tr>
    //                                     <td style="padding: 30px;">
    //                                         <h6 style="font-weight: 600; font-size: 18px;">Dear ${user_name},</h6>
    //                                         <p>You have requested an access code to login to ESG Risk Viewer.</p>
    //                                         <p>Your access code is:</p>
    //                                         <p style="font-size: 20px; font-weight: 600; text-align: start;">${otp}</p>
                                            
    //                                         <p>This code will expire in 60 minutes.</p>
    //                                         <p>If you did not request this code, you can safely ignore this email.</p>
    //                                         <p>This email is automated. Please do not reply.</p>
                                            
    //                                         <p style="margin-bottom: 0">ESG Risk Viewer</p>
    //                                     </td>
    //                                 </tr>
    //                             </tbody>
    //                         </table>
    //                         <!-- <table style="width: 650px; margin: 0 auto; margin-top: 30px">
    //                             <tbody>
    //                                 <tr style="text-align: center">
    //                                     <td>
    //                                         <p style="color: #999; margin-bottom: 0">Powered By ESG Risk Viewer</p>
    //                                     </td>
    //                                 </tr>
    //                             </tbody>
    //                         </table> -->
    //                     </td>
    //                 </tr>
    //             </tbody>
    //         </table>
    //     </body>
    // </html>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        resolve({ suc: 0, msg: error })
      } else {
        console.log('Email sent:', info.response);
        resolve({ suc: 1, msg: info.response })
      }
    });
  })
}

module.exports = { SendUserEmail, sendOtp }