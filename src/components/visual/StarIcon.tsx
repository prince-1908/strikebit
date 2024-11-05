import Image, { ImageProps } from "next/image";
import StarImage from "@/assets/images/Star.svg";
import React from "react";

export function StarIcon(props: Partial<ImageProps>) {
  return <></>;

  const { style, ...restProps} = props;
  return <Image
    src={StarImage}
    alt=""
    style={{
      width: "2rem",
      height: "2rem",
      marginRight: "0.5rem",
      marginBottom: "0.5rem",
      ...style
    }}
    {...restProps}
  />;
}