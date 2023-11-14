const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name)=>{
    sgMail.send({
        to: email,
        from: 'kancheti@ualberta.ca',
        subject: 'Welcome to Task Manager App - Get Started on Your Productivity Journey!',
        text: `Hello ${name},\n\nWelcome to Task Manager App! We're thrilled to have you on board. Our app is designed to help you organize and manage your tasks efficiently, boosting your productivity. If you have any questions or need assistance, feel free to reach out. We're here to help you make the most of your experience.\n\nBest Regards,\nThe Task Manager App Team`
    })
}

const sendDeleteEmail = (email, name)=>{
    sgMail.send({
        to: email,
        from: 'kancheti@ualberta.ca',
        subject: 'Goodbye from Task Manager App - We\'re Sad to See You Go',
        text: `Hello ${name},\n\nWe're sorry to see you leave the Task Manager App. Thank you for being a part of our community. We hope we were able to add value to your daily productivity. If there was any aspect of our service that didn't meet your expectations, we'd love to hear your feedback - it will help us improve.\n\nRemember, our door is always open should you decide to return or if you have any future task management needs. Wishing you all the best in your endeavors.\n\nWarm regards,\nThe Task Manager App Team`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendDeleteEmail
}
