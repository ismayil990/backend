const otpStore = {};

function saveOtp(contact, otp) {
  otpStore[contact] = otp;
}

function verifyOtp(contact, otp) {
  return otpStore[contact] && otpStore[contact] === otp;
}

function deleteOtp(contact) {
  delete otpStore[contact];
}

module.exports = {
  saveOtp,
  verifyOtp,
  deleteOtp,
};
