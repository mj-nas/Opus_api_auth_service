import { Seed } from '@core/sql/seeder/seeder.dto';
import { Transporter } from 'src/modules/sql/template/transporter.enum';
import { Template } from '../../modules/sql/template/entities/template.entity';

export default <Seed<Template>>{
  model: 'Template',
  action: 'once',
  data: [
    {
      name: 'forgot_password',
      title: 'Forgot Password',
      send_email: true,
      transporter: Transporter.CustomerServices,
      email_subject: 'Your Verification Code',
      email_body: `<p>Hi ##TO_NAME##,</p>
      <p><br></p>
      <p>Your verification code is: ##OTP##</p>
      <p><br></p>
      <p>Please use this code as needed. Let us know if you require any further assistance.</p>
      <p><br></p>
      <p>Best regards,</p>
      <p>Team OPUS</p>`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: '2fa_otp',
      title: '2FA OTP Verification',
      send_email: true,
      transporter: Transporter.CustomerServices,
      email_subject: 'OTP Verification',
      email_body:
        '<p>Hi ##TO_NAME##,</p><br><p>##OTP## is your OTP.</p><br><p>Thanks</p>',
      send_sms: true,
      sms_body: '##OTP## is your OTP',
    },
    {
      name: 'contact_us',
      title: 'Contact Us',
      send_email: true,
      transporter: Transporter.Info,
      email_subject: 'New Contact Query',
      email_body:
        '<p>Dear Admin, <br><br>A new contact query has been received. Please review and respond accordingly.<br><br>Thank you.<br><br>Best regards<br>Team OPUS</p>',
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'welcome_mail',
      title: 'Welcome Email',
      send_email: true,
      transporter: Transporter.CustomerServices,
      email_subject: 'Welcome to OPUS Cannaboids!',
      email_body: `Hi ##TO_NAME##,<br><br>Welcome aboard!  We're thrilled to have you join us.<br><br>Best regards,Team OPUS`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'account_status_update',
      title: 'Customer Account Status Update',
      send_email: true,
      transporter: Transporter.CustomerServices,
      email_subject: 'Account Status Update : OPUS',
      email_body: `Dear ##TO_NAME##,
<br><br>Your account has been ##STATUS## by our team. Please contact office for more details.
<br><br>Best regards,
<br>Team OPUS`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'imported_customer_welcome_mail',
      title: 'Welcome Email For Imported Customer',
      send_email: true,
      transporter: Transporter.CustomerServices,
      email_subject: 'Welcome to OPUS Cannaboids!',
      email_body: `Hi ##TO_NAME##,
<br><br>Welcome aboard!  We're thrilled to have you join us.
<br><br><b>Credentials</b>,
<br>Username: ##USERNAME##
<br>Password: ##PASSWORD##
<br><br>Best regards,
<br>Team OPUS`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'change_password_by_admin',
      title: 'Change Password By Admin',
      send_email: true,
      transporter: Transporter.CustomerServices,
      email_subject: 'Your Password Has Been Changed',
      email_body: `Dear ##TO_NAME##,
<br><br>Your password has been successfully changed by the admin.
<br><br>Your new password is: ##PASSWORD##
<br>Please log in and change it to something secure and memorable at your earliest convenience. If you have any concerns, contact our support team immediately.
<br><br>Thank you for being a valued member of Team OPUS.
<br><br>Best regards,
<br>Team OPUS`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'change_password',
      title: 'Change Password',
      send_email: true,
      transporter: Transporter.CustomerServices,
      email_subject: 'Account Password Update Confirmation: OPUS',
      email_body: `Dear ##TO_NAME##,
<br><br>We have successfully updated your account password as requested. If you did not make this change or if you encounter any issues accessing your account, please contact our office immediately for assistance.
<br><br>Thank you for taking steps to maintain the security of your account.
<br><br>Best regards,
<br>Team OPUS`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'email_verification',
      title: 'Email Verification',
      send_email: true,
      transporter: Transporter.CustomerServices,
      email_subject: 'Your Verification Code',
      email_body: `<p>Hi ##TO_NAME##,</p>
      <p><br></p>
      <p>Your verification code is: ##OTP##</p>
      <p><br></p>
      <p>Please use this code as needed. Let us know if you require any further assistance.</p>
      <p><br></p>
      <p>Best regards,</p>
      <p>Team OPUS</p>`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'email_verification_completed',
      title: 'Email Verification Completed',
      send_email: true,
      transporter: Transporter.CustomerServices,
      email_subject: 'Email verified',
      email_body: `<p>Hi ##TO_NAME##,</p><p><br></p><p>Your email verification has been completed.</p><p><br></p><p>Thanks</p>`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'order_confirm_to_customer',
      title: 'Order confirmed email to customer',
      send_email: true,
      transporter: Transporter.Orders,
      email_subject: 'Your Order ##ORDER_ID## is Confirmed!',
      email_body: `<p>Hello ##TO_NAME##,</p><p><br></p><p>Thank you for your order! Your order ID is: ##ORDER_ID##. We have successfully received your order and it is currently being processed. You can track the status of your order by visiting the My Orders section on our website.</p><p><br></p><p>Best regards,</p><p>Team OPUS</p>`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'new_order_alert_to_admin',
      title: 'New Order Alert To Admin',
      transporter: Transporter.Orders,
      send_email: true,
      email_subject: 'New Order Alert - ##ORDER_ID##',
      email_body: `<p>Hello ##TO_NAME##,</p>
<p><br /></p>
<p>We have received a new order. Here are the initial details:</p>
<p><br /></p>
<p>Customer Name: ##CUSTOMER_NAME##</p>
<p>Order ID: ##ORDER_ID##</p>
<p><br /></p>
<p>Best regards,</p>
<p>Team OPUS</p>`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'repeat_order_reminder',
      title: 'Repeat Order Reminder To Customer',
      send_email: true,
      transporter: Transporter.Orders,
      email_subject: 'Reminder: Upcoming Order Renewal',
      email_body: `<p>Hi ##TO_NAME##,</p>
<p><br /></p>
<p>We hope this message finds you well! This is a friendly reminder that your order with us is scheduled to be repeated soon. We want to make sure everything is just right for you.</p>
<p><br /></p>
<p>Order Details:</p>
<p>Order ID: ##ORDER_ID##</p>
<p>Scheduled Repeat Date: ##REPEAT_DATE##</p>
<p>If you wish to confirm this order, no action is needed. However, if you would like to make any changes, please follow the link below to update your order details:</p>
<p><a href="##ORDER_PAGE_LINK##">##ORDER_PAGE_LINK##</a></p>
<p><br /></p>
<p>Please make any changes before ##REPEAT_DATE## to ensure your preferences are met.</p>
<p>Should you require any further assistance or have questions, do not hesitate to contact us.</p>
<p><br /></p>
<p>Best regards,</p>
<p>Team OPUS</p>`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'dispenser_application_deny',
      title: 'Declined the application as a Dispenser',
      send_email: true,
      transporter: Transporter.CustomerServices,
      email_subject: 'Application Declined',
      email_body: `<p>Hi ##TO_NAME##,</p>
<br />
<p>Thank you for your interest in becoming a Dispenser with OPUS. After careful consideration, we regret to inform you that your application has not been approved at this time.</p>
<br />
<p>We appreciate the effort you put into your application and encourage you to apply again in the future should your circumstances change or if you gain additional qualifications that meet our program requirements.</p>
<br />
<p>If you have any questions or need further information regarding our decision or the application process, please feel free to contact us.</p>
<br />
<p>Thank you once again for considering this opportunity with OPUS.</p>
<br />
<p>Best regards,</p>
<p>Team OPUS</p>`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'dispenser_application_approve',
      title: 'Approved as a Dispenser',
      send_email: true,
      transporter: Transporter.CustomerServices,
      email_subject: 'Welcome to OPUS Cannaboids!',
      email_body: `<p>Hi ##TO_NAME##,</p>
<br />
<p>Congratulations and welcome to the team! Your application to become a Dispenser has been approved. Here are your details to access the Dispenser portal:</p>
<br />
<p>Click here to login - ##LOGIN_LINK##</p>
<br />
<p>Username: ##USERNAME##</p>
<p>Password: ##PASSWORD##</p>
<br />
<p>Please ensure to change your password upon your first login for security purposes. Your account is now active, and you can start accessing our resources and managing your new role.</p>
<br />
<p>If you have any questions or need further assistance, don't hesitate to reach out.</p>
<br />
<p>Best regards,</p>
<p>Team OPUS</p>`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'dispenser_account_created',
      title: 'Dispenser Account Created',
      send_email: true,
      transporter: Transporter.CustomerServices,
      email_subject: 'Welcome to OPUS Cannaboids! ',
      email_body: `<p>Dear ##TO_NAME##,</p>
<br />
<p>We're thrilled to welcome you! Your account has been successfully created by the Admin</p>
<br />
<p>Below are your login details:</p>
<br />
<p>Click here to login - ##LOGIN_LINK##</p>
<br />
<p>Username: ##USERNAME##</p>
<p>Password: ##PASSWORD##</p>
<br />
<p>Please ensure to securely store this information. When you log in for the first time, we recommend changing your password to something secure and memorable.</p>
<br />
<p>Should you encounter any difficulties or have any questions, please don't hesitate to contact our support team. We're here to help!</p>
<br />
<p>Thank you for choosing Team OPUS.</p>
<br />
<p>Best regards,</p>
<p>Team OPUS</p>`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'coupon_added_dispenser',
      title: 'Dispenser Coupon Added',
      send_email: true,
      transporter: Transporter.CustomerServices,
      email_subject: 'Your Exclusive Coupon Codes from OPUS Cannaboids!',
      email_body: `<p>Dear ##TO_NAME##,</p>
<br />
<p>We're excited to offer you exclusive coupon codes to share with others:</p>
<br />
<p><b>Coupon Code:</b></p>
<br />
<p>##COUPON_CODE##</p>
<br />
<p>Feel free to share these codes with friends and family who might enjoy our products! Explore our latest offers and products on our website.</p>
<br />
<p>Best regards,</p>
<p>Team OPUS</p>`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'dispenser_added_customer',
      title: 'Dispenser Added Customer',
      send_email: true,
      transporter: Transporter.CustomerServices,
      email_subject: 'New Dispenser Association: OPUS',
      email_body: `<p>Hi ##TO_NAME##,</p>
<br />
<p>We are pleased to inform you that your account has been associated with a new dispenser.</p>
<br />
<p><b>Dispenser Details:</b></p>
<br />
<p>Name: ##DISPENSER_NAME##</p>
<p>Contact Information: ##DISPENSER_CONTACT_INFO##</p>
<p>If you have any questions or need further assistance, please feel free to contact us.</p>
<br />
<p>Best regards,</p>
<p>Team OPUS</p>`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'customer_added_dispenser',
      title: 'Customer Added Dispenser',
      send_email: true,
      transporter: Transporter.CustomerServices,
      email_subject: 'New Customer Association: OPUS',
      email_body: `<p>Hi ##TO_NAME##,</p>
<br />
<p>We are pleased to inform you that a new customer has been associated with your account.</p>
<br />
<p><b>Customer Details:</b></p>
<br />
<p>Name: ##CUSTOMER_NAME##</p>
<p>Contact Information: ##CUSTOMER_CONTACT_INFO##</p>
<p>If you have any questions or need further assistance, please feel free to contact us.</p>
<br />
<p>Best regards,</p>
<p>Team OPUS</p>`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'e_learning_completed',
      title: 'E Learning Course Completed',
      send_email: true,
      transporter: Transporter.CustomerServices,
      email_subject: 'Congratulations!  You have Completed the Course!',
      email_body: `<p>Dear ##TO_NAME##,</p>
<br />
<p>We're happy to announce that you've successfully completed the course! </p>
<br />
<p>Your perseverance and dedication have led you to this achievement, and we're excited to celebrate with you!</p>
<br />
<p>You can now download your well-deserved certificate from the account section.</p>
<br />
<p>As you continue your journey, remember that learning is a lifelong adventure, and we're here to support you every step of the way.</p>
<br />
<p>Thank you for choosing Team OPUS. Let's toast to your success! </p>
<br />
<p>Best regards,</p>
<p>Team OPUS</p>`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'order_shipped',
      title: 'Order Shipment Notification',
      send_email: true,
      transporter: Transporter.Orders,
      email_subject: 'Order Shipment Notification',
      email_body: `<p>Hi ##TO_NAME##,</p>
<br />
<p>A notification regarding your order ##ORDER_ID## has been issued. Please find the details below:</p>
<br />
<p>Shipping Address:</p>
<p>##SHIPPING_NAME##</p>
<p>##SHIPPING_ADDRESS##</p>
<p>##SHIPPING_CITY_STATE_ZIP##</p>
<br />
<p>Track your shipment with this tracking ID: ##TRACKING_NUMBER##</p>
<br />
<p>Thank you.</p>
<br />
<p>Best regards,</p>
<p>Team OPUS</p>`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'order_delivered',
      title: 'Order Delivered Notification',
      send_email: true,
      transporter: Transporter.Orders,
      email_subject: 'Order Delivery Confirmation',
      email_body: `<p>Hi ##TO_NAME##,</p>
<br />
<p>We are pleased to inform you that your package with order ID ##ORDERID## has been delivered. We hope to hear from you again soon!</p>
<br />
<p>Thank you.</p>
<br />
<p>Best regards,</p>
<p>Team OPUS</p>`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'order_cancelled',
      title: 'Order Cancelled Notification',
      send_email: true,
      transporter: Transporter.Orders,
      email_subject: 'Order Cancellation Notification',
      email_body: `<p>Hi ##TO_NAME##,</p>
<br />
<p>We regret to inform you that your order ##ORDER_ID## placed on ##DATE## has been canceled.</p>
<br />
<p>If you have any questions or need further assistance, please contact us.</p>
<br />
<p>Best regards,</p>
<p>Team OPUS</p>`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'reorder_cancelled',
      title: 'Reorder Cancelled Notification',
      send_email: true,
      transporter: Transporter.Orders,
      email_subject: 'Reorder Cancellation Notification',
      email_body: `<p>Hi ##TO_NAME##,</p>,
<br />
<p>Please note that a recurring order has been cancelled.</p>
<br />
<p>Order Details:</p>
<p>Order ID: ##ORDER_ID##</p>
<p>Customer Name: ##CUSTOMER_NAME##</p>
<br />
<p>Best regards,</p>
<p>Team OPUS</p>`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'reorder_cycle_change',
      title: 'Reorder Cycle Change Notification',
      send_email: true,
      transporter: Transporter.Orders,
      email_subject: 'Reorder Cycle Update Notification',
      email_body: `<p>Hi ##TO_NAME##,</p>
      <br />
      <p>Please note that the recurring cycle for order ##ORDER_ID##, originally set for ##ORIGINAL_DAYS##, has been updated.</p>
      <p>The new reorder cycle is now scheduled for ##NEW_DAYS## days.</p>
      <br />
      <p>Best regards,</p>
      <p>Team OPUS</p>`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'payment_pending_reminder',
      title: 'Payment Pending Reminder',
      send_email: true,
      transporter: Transporter.Orders,
      email_subject: 'Payment Reminder for Your Order ##ORDER_ID##',
      email_body: `<p>Hi ##TO_NAME##,</p>
<br />
<p>We noticed that your order ##ORDER_ID##, placed on ##DATE##, is still in 'Payment Pending' status. Please complete your payment within the next 24 hours to avoid order cancellation.</p>
<br />
<p>You can complete your payment by clicking the link below:</p>
<p>##PAYMENT_LINK##</p>
<br />
<p>Alternatively, you can visit the My Orders page in your account to review and process the payment.</p>
<br />
<p>If the payment is not completed within the next 24 hours, your order will be automatically canceled.</p>
<br />
<p>Thank you for your prompt attention to this matter.</p>
<br />
<p>Best regards,</p>
<p>Team OPUS</p>`,
      send_sms: false,
      sms_body: '',
    },
    {
      name: 'final_payment_pending_reminder',
      title: 'Final Payment Pending Reminder',
      send_email: true,
      transporter: Transporter.Orders,
      email_subject:
        'Final Reminder: Complete Payment for Order ##ORDER_ID## to Avoid Cancellation',
      email_body: `<p>Hi ##TO_NAME##,</p>
<br />
<p>This is a final reminder to complete the payment for your order ##ORDER_ID##, which is still pending. Your order will be automatically canceled in 2 hours if the payment is not processed.</p>
<br />
<p>You can complete your payment by clicking the link below:</p>
<p><a href="##PAYMENT_LINK##">##PAYMENT_LINK##</a></p>
<br />
<p>Please visit the My Orders page in your account if you need further assistance.</p>
<br />
<p>We appreciate your prompt response to avoid the cancellation of your order.</p>
<br />
<p>Best regards,</p>
<p>Team OPUS</p>`,
      send_sms: false,
      sms_body: '',
    },
  ],
};
