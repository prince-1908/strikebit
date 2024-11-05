import * as yup from "yup";

const emailSchema = yup.object().shape({
  email: yup.string().email().required().label("Email"),
});

const otp6Schema = yup.object().shape({
  otp: yup.string()
    .min(6)
    .max(6)
    .matches(/^[0-9]*$/)
    .required()
    .label("OTP"),
})

const confirmPasswordSchema = yup.object().shape({
  password: yup.string()
    .min(6)
    .matches(/^\S+$/)
    .required()
    .label("Password"),
  passwordConfirmation: yup.string()
    .required()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .label("Password confirmation")
});

const loginSchema = yup.object()
  .shape({
    password: yup.string().required().label("Password")
  })
  .concat(emailSchema);

const registerSchema = loginSchema
  .shape({
/*    name: yup.string()
      .matches(/^[0-9a-zA-Z_\- ]+$/, "Name can only contain alphanumeric characters, underscores, hyphens, and spaces")
      .min(6)
      .max(32)
      .required()
      .label("Name"),*/
  })
  .concat(emailSchema)
  .concat(confirmPasswordSchema);

const registerActivateSchema = otp6Schema.shape({});

const requestResetPasswordSchema = emailSchema.shape({});
const resetPasswordSchema =
  confirmPasswordSchema
    .shape({})
    .concat(otp6Schema);

export {
  loginSchema,
  registerSchema,
  requestResetPasswordSchema,
  resetPasswordSchema,
  registerActivateSchema
}