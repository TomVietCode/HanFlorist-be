const crypto = require("crypto");
const QRCode = require("qrcode");

// Cấu hình VNPay Sandbox
const vnp_Config = {
  vnp_TmnCode: process.env.VNP_TMNCODE, 
  vnp_HashSecret: process.env.VNP_HASHSECRET, 
  vnp_Url: process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_ReturnUrl: "http://localhost:3001/v1/orders/vnpay-return",
};

// Hàm tạo URL thanh toán VNPay
const createVNPayPaymentUrl = (order) => {
  const params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnp_Config.vnp_TmnCode,
    vnp_Amount: order.totalAmount * 100, // VND * 100
    vnp_CurrCode: "VND",
    vnp_TxnRef: order.orderCode,
    vnp_OrderInfo: `Thanh toán đơn hàng ${order.orderCode}`,
    vnp_Locale: "vn",
    vnp_ReturnUrl: vnp_Config.vnp_ReturnUrl,
    vnp_IpAddr: "127.0.0.1", // Có thể thay bằng req.ip trong controller
    vnp_CreateDate: new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14),
    vnp_OrderType: "250000", // Loại giao dịch QR
  };

  const sortedParams = Object.keys(params)
    .sort()
    .reduce((obj, key) => {
      obj[key] = params[key];
      return obj;
    }, {});

  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac("sha512", vnp_Config.vnp_HashSecret);
  const vnp_SecureHash = hmac.update(signData).digest("hex");

  sortedParams.vnp_SecureHash = vnp_SecureHash;
  return `${vnp_Config.vnp_Url}?${new URLSearchParams(sortedParams).toString()}`;
};

// Hàm tạo mã QR từ URL thanh toán
const generateQRCode = async (paymentUrl) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(paymentUrl);
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error("Failed to generate QR code: " + error.message);
  }
};

// Hàm xử lý thanh toán VNPay (tạo URL và QR)
const processVNPayPayment = async (order) => {
  const paymentUrl = createVNPayPaymentUrl(order);
  const qrCode = await generateQRCode(paymentUrl);
  return { paymentUrl, qrCode };
};

const verifyVNPayResponse = (params) => {
  const secureHash = params.vnp_SecureHash;
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const sortedParams = Object.keys(params).sort().reduce((obj, key) => {
    obj[key] = params[key];
    return obj;
  }, {});
  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac("sha512", vnp_Config.vnp_HashSecret);
  const checkHash = hmac.update(signData).digest("hex");

  return checkHash === secureHash;
};

module.exports = {
  processVNPayPayment,
  createVNPayPaymentUrl, 
  generateQRCode,  
  verifyVNPayResponse     
}