var nodemailer = require("nodemailer")

module.exports.sendEmail = async (email, subject, html) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_EMAIL,
      pass: process.env.MAIL_PASSWORD,
    },
  })

  var mailOptions = {
    from: `HanFlorist ${process.env.MAIL_EMAIL}`,
    to: email,
    subject: subject,
    html: html,
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log("Email sent: " + info.response)
      return 
    }
    return
  })
  
}


