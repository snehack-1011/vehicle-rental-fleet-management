const nodemailer = require('nodemailer');

/**
 * Helper to format date strings cleanly
 */
const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr);
        return d.toLocaleDateString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return String(dateStr);
    }
};

/**
 * Creates Nodemailer Transporter using environment variables
 */
const createTransporter = () => {
    const user = process.env.EMAIL_USER;
    let pass = process.env.EMAIL_APP_PASSWORD;

    if (!user || !pass) {
        return null;
    }

    // Strip any spaces if App Password was copied with spaces (e.g. "abcd efgh ijkl mnop")
    pass = String(pass).trim().replace(/\s+/g, '');

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass
        }
    });
};

/**
 * Send Booking Confirmation Email to Customer
 * @param {Object} bookingDetails
 */
const sendBookingConfirmationEmail = async (bookingDetails) => {
    const {
        bookingId,
        bookingStatus = 'CONFIRMED',
        customerName = 'Valued Customer',
        customerEmail,
        vehicleName = 'Vehicle',
        vehicleId = 'N/A',
        vehicleType = 'Standard',
        registrationNumber = 'N/A',
        fuelType = 'PETROL',
        transmission = 'AUTOMATIC',
        seats = 5,
        pickupLocation = 'Bengaluru Depot',
        pickupDate,
        pickupTime = '10:00 AM',
        returnLocation = 'Bengaluru Depot',
        returnDate,
        returnTime = '10:00 AM',
        rentalDuration = '1 day',
        basePrice = 0,
        insurance = 0,
        otherFees = 0,
        discount = 0,
        totalAmount = 0,
        paymentStatus = 'PENDING'
    } = bookingDetails;

    if (!customerEmail) {
        console.warn('[EmailService] Cannot send confirmation email: No customer email provided.');
        return { success: false, reason: 'No customer email provided' };
    }

    const transporter = createTransporter();

    if (!transporter) {
        console.warn('[EmailService] SMTP credentials missing in environment variables (EMAIL_USER / EMAIL_APP_PASSWORD). Skipping email dispatch.');
        return { success: false, reason: 'SMTP credentials missing in environment' };
    }

    const formattedPickupDate = formatDate(pickupDate);
    const formattedReturnDate = formatDate(returnDate);

    // Plain Text Version
    const textContent = `
VEHICLE RENTAL BOOKING CONFIRMATION

Hello ${customerName},

Your vehicle rental booking has been successfully confirmed.

BOOKING DETAILS
--------------------------------------------------
Booking ID:       ${bookingId}
Booking Status:   ${bookingStatus}

TRIP DETAILS
--------------------------------------------------
Pickup Location:  ${pickupLocation}
Pickup Date:      ${formattedPickupDate}
Pickup Time:      ${pickupTime}

Return Location:  ${returnLocation}
Return Date:      ${formattedReturnDate}
Return Time:      ${returnTime}

VEHICLE DETAILS
--------------------------------------------------
Vehicle:          ${vehicleName}
Vehicle ID:       ${vehicleId}
Vehicle Type:     ${vehicleType}
Registration No:  ${registrationNumber}
Fuel Type:        ${fuelType}
Transmission:     ${transmission}
Seats:            ${seats}

PAYMENT / RENTAL DETAILS
--------------------------------------------------
Rental Duration:  ${rentalDuration}
Base Price:       ₹${Number(basePrice).toLocaleString('en-IN')}
Insurance:        ₹${Number(insurance).toLocaleString('en-IN')}
Additional Fees:  ₹${Number(otherFees).toLocaleString('en-IN')}
Discount:         ₹${Number(discount).toLocaleString('en-IN')}
Total Amount:     ₹${Number(totalAmount).toLocaleString('en-IN')}
Payment Status:   ${paymentStatus}

--------------------------------------------------

Please keep this email for your records.

Thank you for choosing our Vehicle Rental Service.

Safe travels!

Vehicle Rental & Fleet Management Team
--------------------------------------------------
`;

    // Professional Responsive HTML Version
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #334155; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #1e293b, #0f172a); color: #ffffff; padding: 25px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
        .header p { margin: 6px 0 0 0; color: #94a3b8; font-size: 13px; }
        .badge { display: inline-block; background: #22c55e; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-top: 10px; }
        .body { padding: 30px; }
        .greeting { font-size: 16px; margin-bottom: 20px; color: #1e293b; }
        .section-title { font-size: 14px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.8px; margin: 25px 0 10px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
        .grid { display: table; width: 100%; table-layout: fixed; border-collapse: collapse; }
        .row { display: table-row; }
        .cell { display: table-cell; padding: 8px 0; font-size: 14px; vertical-align: top; }
        .cell-label { color: #64748b; width: 40%; font-weight: 500; }
        .cell-value { color: #0f172a; width: 60%; font-weight: 600; }
        .pricing-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .pricing-table td { padding: 10px; font-size: 14px; border-bottom: 1px dashed #e2e8f0; }
        .pricing-table .total-row td { border-bottom: none; font-size: 16px; font-weight: 700; color: #166534; background: #f0fdf4; border-radius: 6px; }
        .footer { background: #f8fafc; padding: 20px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .footer strong { color: #334155; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Vehicle Rental & Fleet Management</h1>
            <p>Booking Confirmation Notification</p>
            <span class="badge">Confirmed</span>
        </div>

        <div class="body">
            <div class="greeting">
                Hello <strong>${customerName}</strong>,
                <p style="margin-top: 6px; color: #475569; line-height: 1.5;">Your vehicle rental booking has been successfully confirmed. Below are your complete trip and vehicle details.</p>
            </div>

            <div class="section-title">Booking Information</div>
            <div class="grid">
                <div class="row">
                    <div class="cell cell-label">Booking ID</div>
                    <div class="cell cell-value">${bookingId}</div>
                </div>
                <div class="row">
                    <div class="cell cell-label">Booking Status</div>
                    <div class="cell cell-value" style="color: #166534;">${bookingStatus}</div>
                </div>
            </div>

            <div class="section-title">Trip Details</div>
            <div class="grid">
                <div class="row">
                    <div class="cell cell-label">Pickup Location</div>
                    <div class="cell cell-value">${pickupLocation}</div>
                </div>
                <div class="row">
                    <div class="cell cell-label">Pickup Date</div>
                    <div class="cell cell-value">${formattedPickupDate} (${pickupTime})</div>
                </div>
                <div class="row">
                    <div class="cell cell-label">Return Location</div>
                    <div class="cell cell-value">${returnLocation}</div>
                </div>
                <div class="row">
                    <div class="cell cell-label">Return Date</div>
                    <div class="cell cell-value">${formattedReturnDate} (${returnTime})</div>
                </div>
            </div>

            <div class="section-title">Vehicle Specifications</div>
            <div class="grid">
                <div class="row">
                    <div class="cell cell-label">Vehicle Name</div>
                    <div class="cell cell-value">${vehicleName}</div>
                </div>
                <div class="row">
                    <div class="cell cell-label">Vehicle ID</div>
                    <div class="cell cell-value">${vehicleId}</div>
                </div>
                <div class="row">
                    <div class="cell cell-label">Vehicle Type</div>
                    <div class="cell cell-value">${vehicleType}</div>
                </div>
                <div class="row">
                    <div class="cell cell-label">Registration No</div>
                    <div class="cell cell-value">${registrationNumber}</div>
                </div>
                <div class="row">
                    <div class="cell cell-label">Fuel & Transmission</div>
                    <div class="cell cell-value">${fuelType} • ${transmission}</div>
                </div>
                <div class="row">
                    <div class="cell cell-label">Seating Capacity</div>
                    <div class="cell cell-value">${seats} Seats</div>
                </div>
            </div>

            <div class="section-title">Payment & Billing Summary</div>
            <table class="pricing-table">
                <tr>
                    <td style="color: #64748b;">Rental Duration</td>
                    <td style="text-align: right; font-weight: 600;">${rentalDuration}</td>
                </tr>
                <tr>
                    <td style="color: #64748b;">Base Rental Price</td>
                    <td style="text-align: right; font-weight: 600;">₹${Number(basePrice).toLocaleString('en-IN')}</td>
                </tr>
                ${insurance > 0 ? `
                <tr>
                    <td style="color: #64748b;">Insurance Cover</td>
                    <td style="text-align: right; font-weight: 600;">₹${Number(insurance).toLocaleString('en-IN')}</td>
                </tr>` : ''}
                ${otherFees > 0 ? `
                <tr>
                    <td style="color: #64748b;">Additional Driver Fee</td>
                    <td style="text-align: right; font-weight: 600;">₹${Number(otherFees).toLocaleString('en-IN')}</td>
                </tr>` : ''}
                <tr class="total-row">
                    <td>Total Amount Paid/Due</td>
                    <td style="text-align: right;">₹${Number(totalAmount).toLocaleString('en-IN')}</td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p style="margin: 0 0 6px 0;">Please keep this email for your records.</p>
            <p style="margin: 0;">Thank you for choosing <strong>Vehicle Rental & Fleet Management</strong>. Safe travels!</p>
        </div>
    </div>
</body>
</html>
`;

    try {
        const mailOptions = {
            from: `"Vehicle Rental & Fleet Management" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `Vehicle Rental Booking Confirmation - [${bookingId}]`,
            text: textContent,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Confirmation email sent successfully to ${customerEmail} (Message ID: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`[EmailService] Failed to send confirmation email to ${customerEmail}:`, error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendBookingConfirmationEmail
};
