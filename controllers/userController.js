const bcrypt = require("bcrypt");
const _ = require("lodash");
const axios = require("axios");
const otpGenerator = require("otp-generator");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
// const twilio = require("twilio");

const { User } = require("../model/userModel");
const { Otp } = require("../model/otpModel");

// OTP Request For SignUp
module.exports.signUp = async (req, res) => {
  const user = await User.findOne({
    number: req.body.number,
  });

  if (user) {
    return res.status(400).send("User already registered!");
  }

  const OTP = otpGenerator.generate(6, {
    digits: true,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  const number = req.body.number;
  const password = req.body.password;
  console.log(OTP);

  // sending sms
  // const greenwebsms = new URLSearchParams();
  // greenwebsms.append(
  //   "token",
  //   "8229165538165745053879f2e330f24bc412f612809d26591919"
  // );
  // greenwebsms.append("to", `+88${number}`);
  // greenwebsms.append("message", `আপনার ওটিপি: ${OTP}`);
  // axios
  //   .post("http://api.greenweb.com.bd/api.php", greenwebsms)
  //   .then((response) => {
  //     console.log(response.data);
  //   });

  const otp = new Otp({ number: number, password, otp: OTP });
  const salt = await bcrypt.genSalt(10);
  otp.otp = await bcrypt.hash(otp.otp, salt);
  const result = await otp.save();
  return res.status(200).send("Otp send successfully.");
};

// Verify OTP
module.exports.verifyOtp = async (req, res) => {
  const otpHolder = await Otp.find({
    number: req.body.number,
  });
  if (otpHolder.length === 0) {
    return res.status(400).send("Your otp is expired. Please try again.");
  }
  const rightOtpFind = otpHolder[otpHolder.length - 1];
  const validUser = await bcrypt.compare(req.body.otp, rightOtpFind.otp);

  if (rightOtpFind.number === req.body.number && validUser) {
    const user = new User(_.pick(req.body, ["number", "password"]));
    const token = user.generateJWT();
    const result = await user.save();

    const OTPDelete = await Otp.deleteMany({
      number: rightOtpFind.number,
    });

    // options for cookie
    const options = {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
    // end cookie

    return res.status(200).cookie("token", token, options).send({
      message: "User Registration Successfully.",
      token: token,
      data: result,
    });
  } else {
    return res.status(400).send("Your OTP was wrong.");
  }
};

// update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  // const newUserData = {
  //   name: req.body.name,
  //   email: req.body.email,
  // };

  // if (req.body.avatar !== "") {
  //   const user = await User.findById(req.user.id);

  //   const imageId = user.avatar.public_id;

  //   await cloudinary.v2.uploader.destroy(imageId);

  //   const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
  //     folder: "avatars",
  //     width: 150,
  //     crop: "scale",
  //   });

  //   newUserData.avatar = {
  //     public_id: myCloud.public_id,
  //     url: myCloud.secure_url,
  //   };
  // }

  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});
