import React, { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

import { FormikProps } from "formik";
import { FloatingLabel, Form, FormControlProps } from "react-bootstrap";
import { FloatingLabelProps } from "react-bootstrap/FloatingLabel";

interface FormikFormGroupProps<Values> {
  name: string,
  label?: string,
  beforeControlChildren?: ReactNode,
  formikProps: FormikProps<Values>,
  overrideIsInvalid?: boolean,
  floatingLabelsProps?: FloatingLabelProps,
  formControlProps?: FormControlProps & InputHTMLAttributes<string> & TextareaHTMLAttributes<string>
}

export function FormikFormControl<Values>(
  {
    name,
    label,
    beforeControlChildren,
    formikProps,
    overrideIsInvalid,
    floatingLabelsProps,
    formControlProps
  }: FormikFormGroupProps<Values>) {

  const {onChange: inputOnChange, ...restFormControlProps} = formControlProps as any;

  const formikValue = (formikProps.values as any)[name];
  const formikError = (formikProps.errors as any)[name];

  return <FloatingLabel label={formControlProps?.placeholder} {...floatingLabelsProps}>
    {beforeControlChildren}
    {
      label && <Form.Label>{label}</Form.Label>
    }

    <Form.Control
      name={name}
      // @ts-ignore
      value={formikValue}
      {...restFormControlProps}
      onChange={(e) => {
        inputOnChange?.(e);
        formikProps.handleChange(e);
      }}
      // @ts-ignore
      isInvalid={overrideIsInvalid !== undefined ? overrideIsInvalid : !!formikError}
    />

    <Form.Control.Feedback type="invalid">
      {formikError}
    </Form.Control.Feedback>
  </FloatingLabel>
}